import { serve } from "https_deno.land/std@0.168.0/http/server.ts";
import { TextToSpeechClient } from "npm:@google-cloud/text-to-speech";

// Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in Supabase function environment variables
// and that the service account has permissions for Google Cloud Text-to-Speech API.

serve(async (req) => {
  // 1. Validate environment variables
  const googleCredentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  if (!googleCredentialsJson) {
    console.error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.");
    return new Response(
      JSON.stringify({ error: "Missing Google Cloud credentials configuration." }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }

  // 2. Parse request body
  let text: string | undefined;
  let language_code: string | undefined;
  let voice_name: string | undefined;

  try {
    const body = await req.json();
    text = body.text;
    language_code = body.language_code;
    voice_name = body.voice_name;

    if (!text || !language_code || !voice_name) {
      throw new Error("Missing required fields: text, language_code, or voice_name.");
    }
    if (typeof text !== 'string' || typeof language_code !== 'string' || typeof voice_name !== 'string') {
      throw new Error("All fields (text, language_code, voice_name) must be strings.");
    }
    if (text.trim() === "") {
        throw new Error("Text for preview cannot be empty.");
    }
     if (text.length > 250) { // Google TTS has limits, good to have a sanity check here
        throw new Error("Text for preview is too long (max 250 characters).");
    }


  } catch (error) {
    console.error("Error parsing request body:", error.message);
    return new Response(
      JSON.stringify({ error: `Invalid request body: ${error.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 400 },
    );
  }

  let tempCredsPath: string | undefined;
  try {
    // 3. Initialize Google TextToSpeech Client
    tempCredsPath = await Deno.makeTempFile({ prefix: "gcp-tts-creds-", suffix: ".json" });
    await Deno.writeTextFile(tempCredsPath, googleCredentialsJson);

    const ttsClient = new TextToSpeechClient({ keyFilename: tempCredsPath });

    console.log(`Requesting TTS preview for lang: ${language_code}, voice: ${voice_name}. Text: "${text}"`);

    // 4. Construct TTS Request
    const ttsRequest = {
      input: { text: text },
      voice: { languageCode: language_code, name: voice_name },
      audioConfig: { audioEncoding: "MP3" },
    };

    // 5. Perform TTS API call
    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);

    if (!ttsResponse.audioContent) {
        console.error("TTS synthesis returned no audio content.");
        throw new Error("TTS synthesis failed to return audio content.");
    }

    console.log(`TTS preview successful. Audio content length (bytes): ${ttsResponse.audioContent.length}`);

    // 6. Return audio content (Base64 encoded)
    // The audioContent from the client library is already a Uint8Array or Buffer that can be base64 encoded.
    // In Node.js, Buffer.from(ttsResponse.audioContent).toString('base64')
    // In Deno, we can use a helper or convert Uint8Array to string then btoa.
    // For Deno, if audioContent is Uint8Array:
    let base64AudioContent: string;
    if (ttsResponse.audioContent instanceof Uint8Array) {
        base64AudioContent = btoa(String.fromCharCode(...ttsResponse.audioContent));
    } else if (typeof ttsResponse.audioContent === 'string') { // Should not happen with Node client, but good check
        base64AudioContent = btoa(ttsResponse.audioContent);
    } else { // If it's a buffer like object from Node.js context (less likely in Deno pure)
        base64AudioContent = btoa(String.fromCharCode.apply(null, ttsResponse.audioContent));
    }


    return new Response(
      JSON.stringify({ audioContent: base64AudioContent }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );

  } catch (error) {
    console.error("Error during TTS preview generation:", error);
    return new Response(
      JSON.stringify({
        error: `TTS preview generation failed: ${error.message}`,
        details: error.details || error.stack // Include more details if available
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  } finally {
    if (tempCredsPath) {
      await Deno.remove(tempCredsPath).catch(e => console.error("Error removing temp TTS credentials file:", e));
    }
  }
});
