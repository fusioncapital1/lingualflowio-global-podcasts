import { serve } from "https_deno.land/std@0.168.0/http/server.ts";
import { TextToSpeechClient, protos } from "npm:@google-cloud/text-to-speech";

// Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set
// and the service account has permissions for Google Cloud Text-to-Speech API.

// Helper to generate a more user-friendly display name
function createDisplayName(voice: protos.google.cloud.texttospeech.v1.IVoice): string {
  let displayName = "";
  const gender = voice.ssmlGender === protos.google.cloud.texttospeech.v1.SsmlVoiceGender.FEMALE ? "Female" :
                 voice.ssmlGender === protos.google.cloud.texttospeech.v1.SsmlVoiceGender.MALE ? "Male" :
                 voice.ssmlGender === protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL ? "Neutral" : "Unknown";

  // Extract the part after the language code and hyphen, e.g., "Wavenet-A" from "en-US-Wavenet-A"
  // or "Standard-A" from "en-US-Standard-A"
  const nameParts = voice.name?.split('-');
  let voiceType = nameParts && nameParts.length > 2 ? nameParts.slice(2).join('-') : voice.name;
  // Fallback to full name if parsing is tricky

  displayName = `${gender} (${voiceType})`;

  // Further refinement could be added here if needed, e.g. identifying "WaveNet" or "Standard" explicitly
  // For example, if nameParts.includes('Wavenet'), we can say "WaveNet" instead of just the letter.
  if (voice.name?.includes("Wavenet")) {
    displayName = `${gender} (WaveNet ${nameParts?.[nameParts.length -1]})`;
  } else if (voice.name?.includes("Standard")) {
     displayName = `${gender} (Standard ${nameParts?.[nameParts.length -1]})`;
  } else if (voice.name?.includes("News")) {
     displayName = `${gender} (News ${nameParts?.[nameParts.length -1]})`;
  } else if (voice.name?.includes("Studio")) {
     displayName = `${gender} (Studio ${nameParts?.[nameParts.length -1]})`;
  }


  return displayName;
}


serve(async (req) => {
  const googleCredentialsJson = Deno.env.get("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  if (!googleCredentialsJson) {
    console.error("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON env variable.");
    return new Response(JSON.stringify({ error: "Missing Google Cloud credentials." }),
      { headers: { "Content-Type": "application/json" }, status: 500 });
  }

  let language_code: string | undefined;
  try {
    const body = await req.json();
    language_code = body.language_code;
    if (!language_code || typeof language_code !== 'string') {
      throw new Error("Missing or invalid language_code in request body.");
    }
  } catch (error) {
    console.error("Error parsing request body for list-voices:", error.message);
    return new Response(JSON.stringify({ error: `Invalid request: ${error.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 400 });
  }

  let tempCredsPath: string | undefined;
  try {
    tempCredsPath = await Deno.makeTempFile({ prefix: "gcp-tts-list-creds-", suffix: ".json" });
    await Deno.writeTextFile(tempCredsPath, googleCredentialsJson);

    const ttsClient = new TextToSpeechClient({ keyFilename: tempCredsPath });

    console.log(`Listing voices for language_code: ${language_code}`);
    const [response] = await ttsClient.listVoices({ languageCode: language_code });

    if (!response.voices) {
      console.log("No voices returned from API for language:", language_code);
      return new Response(JSON.stringify({ voices: [] }),
        { headers: { "Content-Type": "application/json" }, status: 200 });
    }

    const formattedVoices = response.voices.map(voice => ({
      name: voice.name,
      displayName: createDisplayName(voice),
      ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender[voice.ssmlGender!], // "FEMALE", "MALE", "NEUTRAL"
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
    }));

    console.log(`Found ${formattedVoices.length} voices for ${language_code}.`);

    return new Response(JSON.stringify({ voices: formattedVoices }),
      { headers: { "Content-Type": "application/json" }, status: 200 });

  } catch (error) {
    console.error("Error listing Google TTS voices:", error);
    return new Response(JSON.stringify({ error: `Failed to list voices: ${error.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 500 });
  } finally {
    if (tempCredsPath) {
      await Deno.remove(tempCredsPath).catch(e => console.error("Error removing temp creds file:", e));
    }
  }
});
