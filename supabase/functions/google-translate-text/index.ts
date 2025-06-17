import { serve } from "https_deno.land/std@0.168.0/http/server.ts";
import { Translate } from "npm:@google-cloud/translate@7"; // Using v2 via @google-cloud/translate

// Ensure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in Supabase function environment variables
// and that the service account has permissions for Google Cloud Translation API.

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
  let text_to_translate: string | undefined;
  let target_language_code: string | undefined;
  let source_language_code: string | undefined;

  try {
    const body = await req.json();
    text_to_translate = body.text_to_translate;
    target_language_code = body.target_language_code;
    source_language_code = body.source_language_code;

    if (!text_to_translate || !target_language_code || !source_language_code) {
      throw new Error("Missing required fields: text_to_translate, target_language_code, or source_language_code.");
    }
    if (typeof text_to_translate !== 'string' || typeof target_language_code !== 'string' || typeof source_language_code !== 'string') {
      throw new Error("All fields (text_to_translate, target_language_code, source_language_code) must be strings.");
    }
    if (text_to_translate.trim() === "") {
        throw new Error("text_to_translate cannot be empty.");
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
    // 3. Initialize Google Translate Client
    //    Write credentials to a temp file for the Translate client.
    tempCredsPath = await Deno.makeTempFile({ prefix: "gcp-translate-creds-", suffix: ".json" });
    await Deno.writeTextFile(tempCredsPath, googleCredentialsJson);

    const translate = new Translate({ keyFilename: tempCredsPath });

    console.log(`Attempting to translate text from ${source_language_code} to ${target_language_code}. Text length: ${text_to_translate.length}`);

    // 4. Perform Translation
    //    The v2 API takes the target language as a string, and options for source.
    const [translations, metadata] = await translate.translate(text_to_translate, {
        from: source_language_code,
        to: target_language_code,
    });

    const translatedText = Array.isArray(translations) ? translations[0] : translations;

    if (!translatedText) {
        console.error("Translation returned undefined or empty result:", metadata);
        throw new Error("Translation failed to return text.");
    }

    console.log(`Translation successful. Translated text length: ${translatedText.length}`);

    // 5. Return translated text
    return new Response(
      JSON.stringify({
        translated_text: translatedText,
        source_language: source_language_code,
        target_language: target_language_code,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );

  } catch (error) {
    console.error("Error during translation process:", error);
    return new Response(
      JSON.stringify({
        error: `Translation API call failed: ${error.message}`,
        details: error.errors // Google API often includes an errors array
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  } finally {
    if (tempCredsPath) {
      await Deno.remove(tempCredsPath).catch(e => console.error("Error removing temp credentials file:", e));
    }
  }
});
