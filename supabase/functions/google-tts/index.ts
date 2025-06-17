
import { serve } from "https_deno.land/std@0.168.0/http/server.ts";
import { TextToSpeechClient } from "npm:@google-cloud/text-to-speech";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { decode } from "https_deno.land/std@0.203.0/encoding/base64.ts"; // For JWT parsing

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET_NAME = 'translated-audio'; // Ensure this bucket exists

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let tempCredsPath: string | undefined;
  let user_id: string | undefined; // To be extracted from JWT

  try {
    // 0. Extract user_id from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header.");
    }
    const token = authHeader.replace("Bearer ", "");
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid JWT format.");
    }
    const payload = JSON.parse(new TextDecoder().decode(decode(tokenParts[1])));
    user_id = payload.sub; // 'sub' usually holds the user ID in Supabase JWTs
    if (!user_id) {
      throw new Error("User ID (sub) not found in JWT payload.");
    }

    // 1. Validate environment variables for Google Cloud and Supabase
    const googleCredentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!googleCredentialsJson) throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON.");
    if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Missing Supabase URL or Service Role Key.");

    // 2. Parse request body
    const {
      podcast_id,
      // user_id is now from JWT, but could be passed as fallback if needed: original_user_id,
      text,
      language_code,
      voice_name,
    } = await req.json();

    if (!podcast_id || !text || !language_code || !voice_name || !user_id) {
      let missingParams = [];
      if (!podcast_id) missingParams.push("podcast_id");
      if (!text) missingParams.push("text");
      if (!language_code) missingParams.push("language_code");
      if (!voice_name) missingParams.push("voice_name");
      if (!user_id) missingParams.push("user_id (from JWT)"); // Should be caught by JWT check earlier
      throw new Error(`Missing required fields: ${missingParams.join(', ')}.`);
    }
    if (text.length > 5000) { // Google TTS has limits (5000 bytes per request)
        console.warn("Text length exceeds typical limits for single TTS request, might fail or be truncated by API.");
    }

    // 3. Initialize Google TextToSpeech Client
    tempCredsPath = await Deno.makeTempFile({ prefix: "gcp-tts-creds-", suffix: ".json" });
    await Deno.writeTextFile(tempCredsPath, googleCredentialsJson);
    const ttsClient = new TextToSpeechClient({ keyFilename: tempCredsPath });

    // 4. Construct TTS Request
    const ttsRequest = {
      input: { text: text },
      voice: { languageCode: language_code, name: voice_name },
      audioConfig: { audioEncoding: "MP3" },
    };

    // 5. Perform TTS API call
    console.log(`Requesting TTS for lang: ${language_code}, voice: ${voice_name}, podcast: ${podcast_id}.`);
    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    if (!ttsResponse.audioContent || !(ttsResponse.audioContent instanceof Uint8Array)) {
      throw new Error("TTS synthesis failed to return valid audio content.");
    }
    const audioBuffer = ttsResponse.audioContent;
    console.log(`TTS successful. Audio content length (bytes): ${audioBuffer.length}`);

    // 6. Initialize Supabase Admin Client
    const supabaseAdminClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 7. Upload to Supabase Storage
    const storagePath = `users/${user_id}/podcasts/${podcast_id}/translations/${language_code}_${voice_name}.mp3`;

    console.log(`Uploading to Supabase Storage at path: ${storagePath}`);
    const { error: storageError } = await supabaseAdminClient.storage
      .from(BUCKET_NAME)
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true, // Overwrite if file already exists for this combination
      });

    if (storageError) {
      console.error("Supabase Storage upload error:", storageError);
      throw new Error(`Failed to upload audio to storage: ${storageError.message}`);
    }
    console.log("Upload to Supabase Storage successful.");

    // 8. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        storage_path: storagePath,
        file_size: audioBuffer.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in google-tts function:", error.message, error.stack);
    // Ensure user_id is logged if available, for context
    const errorMsg = user_id ? `User ${user_id}: ${error.message}` : error.message;
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: error.message.includes("Authorization") || error.message.includes("JWT") ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } finally {
    if (tempCredsPath) {
      await Deno.remove(tempCredsPath).catch(e => console.error("Error removing temp TTS creds file:", e));
    }
  }
});
