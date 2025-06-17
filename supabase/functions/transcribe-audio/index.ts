import { serve } from "https_deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SpeechClient } from "npm:@google-cloud/speech";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

serve(async (req) => {
  // 1. Validate request and environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({
        error: "Missing Supabase environment variables.",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }

  const googleCredentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  if (!googleCredentialsJson) {
    return new Response(
      JSON.stringify({
        error: "Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }

  let audio_file_url: string | undefined;
  let podcast_id: string | undefined;

  try {
    const body = await req.json();
    audio_file_url = body.audio_file_url;
    podcast_id = body.podcast_id;

    if (!audio_file_url || !podcast_id) {
      throw new Error("Missing audio_file_url or podcast_id in request body.");
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Invalid request body: ${error.message}`,
      }),
      { headers: { "Content-Type": "application/json" }, status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: req.headers.get("Authorization")! },
    },
  });

  try {
    // 2. Initialize Google Speech Client
    //    We need to write the credentials to a temporary file for the SpeechClient
    //    as it expects a file path for GOOGLE_APPLICATION_CREDENTIALS.
    //    Deno doesn't have a straightforward way to set env vars for a child process it seems,
    //    and the library might not pick up Deno.env.
    const tempCredsPath = await Deno.makeTempFile({ prefix: "gcp-creds-", suffix: ".json" });
    await Deno.writeTextFile(tempCredsPath, googleCredentialsJson);
    Deno.env.set("GOOGLE_APPLICATION_CREDENTIALS", tempCredsPath);

    const speechClient = new SpeechClient();

    // 3. Download audio or prepare for streaming
    //    For simplicity, let's assume public URLs that the Google API can fetch directly.
    //    If not, we'd download it first:
    //    const audioResponse = await fetch(audio_file_url);
    //    if (!audioResponse.ok) {
    //        throw new Error(`Failed to download audio file: ${audioResponse.statusText}`);
    //    }
    //    const audioBytes = new Uint8Array(await audioResponse.arrayBuffer());
    //    const audioBase64 = btoa(String.fromCharCode(...audioBytes));

    // 4. Configure Speech-to-Text request
    const audio = {
      uri: audio_file_url, // Use URI directly if public and accessible by Google
      // content: audioBase64, // Use this if sending bytes
    };
    const config = {
      encoding: 'MP3', // Assuming MP3, adjust as needed or detect
      sampleRateHertz: 16000, // Adjust as needed
      languageCode: 'en-US', // Default, consider making this configurable
      enableAutomaticPunctuation: true,
    };
    const request = {
      audio: audio,
      config: config,
    };

    // 5. Perform transcription
    console.log(`Starting transcription for podcast_id: ${podcast_id}, audio_url: ${audio_file_url}`);
    const [operation] = await speechClient.longRunningRecognize(request);
    const [response] = await operation.promise();

    await Deno.remove(tempCredsPath); // Clean up temp credentials file

    if (!response.results || response.results.length === 0) {
      throw new Error("No transcription results returned from Google Speech-to-Text API.");
    }

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`Transcription successful for podcast_id: ${podcast_id}. Length: ${transcription.length}`);

    // 6. Update Podcast Record in Supabase
    const { data: updateData, error: updateError } = await supabase
      .from('podcasts')
      .update({
        transcript: transcription,
        original_language: config.languageCode, // Store the language used for transcription
        status: 'transcribed', // Or 'transcription_complete'
      })
      .eq('id', podcast_id)
      .select()
      .single();

    if (updateError) {
      console.error(`Error updating podcast record for ${podcast_id}:`, updateError);
      throw new Error(`Failed to update podcast record: ${updateError.message}`);
    }

    console.log(`Podcast record updated successfully for ${podcast_id}:`, updateData);

    return new Response(
      JSON.stringify({
        message: "Audio transcribed and podcast updated successfully.",
        podcast_id: podcast_id,
        transcript_length: transcription.length,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );

  } catch (error) {
    console.error(`Error in transcribe-audio function for podcast_id ${podcast_id}:`, error);
    // Clean up temp file in case of error too
    const tempCredsPath = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS");
    if (tempCredsPath && await Deno.stat(tempCredsPath).then(s => s.isFile).catch(() => false)) {
        await Deno.remove(tempCredsPath).catch(e => console.error("Error removing temp creds file on error:", e));
    }
    Deno.env.delete("GOOGLE_APPLICATION_CREDENTIALS");


    // Attempt to update podcast status to 'transcription_failed'
    try {
        await supabase
          .from('podcasts')
          .update({ status: 'transcription_failed' })
          .eq('id', podcast_id);
    } catch (dbError) {
        console.error(`Failed to update podcast status to 'transcription_failed' for ${podcast_id}:`, dbError);
    }

    return new Response(
      JSON.stringify({
        error: `Transcription failed: ${error.message}`,
        podcast_id: podcast_id,
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
