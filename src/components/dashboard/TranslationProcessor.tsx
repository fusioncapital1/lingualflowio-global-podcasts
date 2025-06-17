
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Download, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types'; // Import the types

// Define TranslatedEpisodeRow based on your types.ts, assuming it's exported as Tables<'translated_episodes'>['Row']
type TranslatedEpisodeRow = Tables<'translated_episodes'>['Row'];

interface TranslationProcessorProps {
  podcastId: string;
  selectedLanguages: string[];
  selectedVoices: Record<string, string>;
}

const TranslationProcessor: React.FC<TranslationProcessorProps> = ({ 
  podcastId, 
  selectedLanguages, 
  selectedVoices 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [originalTranscript, setOriginalTranscript] = useState<string | null>(null);
  const [podcastStatus, setPodcastStatus] = useState<string | null>(null);
  const [originalLanguageCode, setOriginalLanguageCode] = useState<string | null>(null);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState<boolean>(true);
  const [translatedEpisodesList, setTranslatedEpisodesList] = useState<TranslatedEpisodeRow[]>([]);

  const fetchTranslatedEpisodes = useCallback(async () => {
    if (!podcastId) return;
    console.log("Fetching translated episodes for podcast:", podcastId);
    setCurrentStep('Loading available translations...');
    try {
      const { data, error } = await supabase
        .from('translated_episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setTranslatedEpisodesList(data || []);
      if (data && data.length > 0) {
        setCurrentStep(`Loaded ${data.length} translated episode(s).`);
      } else {
        setCurrentStep('No translated episodes found yet.');
      }
    } catch (error) {
      console.error('Error fetching translated episodes:', error);
      toast({
        title: "Load Failed",
        description: `Could not fetch translated episodes: ${error.message}`,
        variant: "destructive",
      });
      setCurrentStep('Failed to load translated episodes.');
    }
  }, [podcastId]);

  useEffect(() => {
    if (!podcastId) return;

    let isActive = true; // To prevent state updates on unmounted component
    let पोलिंगIntervalId: number | undefined;

    const fetchPodcastData = async () => {
      if (!isActive) return;
      setIsFetchingTranscript(true);

      try {
        const { data: podcast, error } = await supabase
          .from('podcasts')
          .select('transcript, status, original_language')
          .eq('id', podcastId)
          .single();

        if (!isActive) return;

        if (error) {
          console.error('Error fetching podcast data:', error);
          setCurrentStep('Error loading transcript data.');
          toast({ title: "Error", description: `Failed to load podcast data: ${error.message}`, variant: "destructive" });
          setPodcastStatus('error'); // Custom status for UI
          return;
        }

        if (podcast) {
          setOriginalTranscript(podcast.transcript);
          setPodcastStatus(podcast.status);
          setOriginalLanguageCode(podcast.original_language);

          if (podcast.status === 'transcribed' && podcast.transcript) {
            if (!podcast.original_language) {
              setCurrentStep('Transcript loaded, but original language is missing. Cannot proceed.');
              toast({ title: "Data Missing", description: "Original language not found for the podcast. Translation cannot proceed.", variant: "destructive"});
            } else {
              setCurrentStep('Transcript loaded. Ready for translation.');
              toast({ title: "Transcript Loaded", description: `Original transcript and language (${podcast.original_language}) are ready.` });
            }
            if (पोलिंगIntervalId) clearInterval(पोलिंगIntervalId);
          } else if (podcast.status === 'transcribing') {
            setCurrentStep('Transcription in progress... Please wait. This will update automatically.');
            if (!पोलिंगIntervalId) {
              पोलिंगIntervalId = setInterval(fetchPodcastData, 7000); // Poll every 7 seconds
            }
          } else if (podcast.status === 'transcription_failed') {
            setCurrentStep('Transcription failed. Cannot proceed with translation.');
            toast({ title: "Transcription Failed", description: "The audio transcription failed. Please check the podcast details or try re-uploading.", variant: "destructive" });
            if (पोलिंगIntervalId) clearInterval(पोलिंगIntervalId);
          } else if (!podcast.transcript && podcast.status !== 'transcribing' && podcast.status !== 'pending_transcription') {
            // Assuming 'pending_transcription' could be another initial status
            setCurrentStep('Transcript not yet available. Status: ' + podcast.status);
            // Potentially start polling here too if it's an intermediate state
            if (!पोलिंगIntervalId && (podcast.status === null || podcast.status === 'uploaded')) { // If status is null or just uploaded, start polling
                 setCurrentStep('Waiting for transcription to start...');
                 पोलिंगIntervalId = setInterval(fetchPodcastData, 7000);
            }
          } else {
             setCurrentStep('Current status: ' + podcast.status);
          }
        } else {
          setCurrentStep('Podcast data not found. Cannot load transcript.');
          toast({ title: "Not Found", description: "Could not load podcast data for transcript.", variant: "destructive" });
          setPodcastStatus('not_found'); // Custom status
        }
      } catch (err) {
        if (!isActive) return;
        console.error('Exception while fetching podcast data:', err);
        setCurrentStep('Exception occurred while loading transcript.');
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        toast({ title: "Loading Error", description: `Exception: ${errorMessage}`, variant: "destructive" });
        setPodcastStatus('error'); // Custom status
      } finally {
        if (isActive) setIsFetchingTranscript(false);
      }
    };

    fetchPodcastData();

    return () => {
      isActive = false;
      if (पोलिंगIntervalId) {
        clearInterval(पोलिंगIntervalId);
      }
    };
  }, [podcastId]);

  // Effect to fetch episodes when processing is complete
  useEffect(() => {
    if (!isProcessing && progress === 100) {
      fetchTranslatedEpisodes();
    }
  }, [isProcessing, progress, fetchTranslatedEpisodes]);


  const startTranslation = async () => {
    setTranslatedEpisodesList([]); // Clear previous list when starting new processing
    if (!originalTranscript) {
      toast({ title: "Cannot Start", description: "Original transcript is not available.", variant: "destructive" });
      return;
    }
    if (!originalLanguageCode) {
      toast({ title: "Cannot Start", description: "Original language code is missing.", variant: "destructive" });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Initializing translation sequence...');
    console.log(`Starting full translation sequence for podcastId: ${podcastId}`);
    console.log(`Original transcript length: ${originalTranscript.length}, Original language: ${originalLanguageCode}`);

    const totalSteps = selectedLanguages.length * 2; // 1 for translation, 1 for TTS per language
    let completedSteps = 0;
    let successfulLanguages = 0;
    const errors: string[] = [];

    for (const targetLang of selectedLanguages) {
      let translatedTextForLanguage: string | null = null;

      // Step 1: Text Translation
      try {
        setCurrentStep(`Translating to ${targetLang}...`);
        console.log(`Translating to ${targetLang} from ${originalLanguageCode}`);
        
        const { data: translateData, error: translateError } = await supabase.functions.invoke('google-translate-text', {
          body: {
            text_to_translate: originalTranscript,
            target_language_code: targetLang,
            source_language_code: originalLanguageCode,
          },
        });

        if (translateError) {
          throw new Error(`Function error: ${translateError.message || JSON.stringify(translateError.details || translateError)}`);
        }
        if (!translateData || !translateData.translated_text) {
          throw new Error("No translated text returned from function.");
        }

        translatedTextForLanguage = translateData.translated_text;
        console.log(`Successfully translated to ${targetLang}. Translated text length: ${translatedTextForLanguage.length}`);
        completedSteps++;
        setProgress(Math.round((completedSteps / totalSteps) * 100));

      } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error);
        errors.push(`Translation to ${targetLang} failed: ${error.message}`);
        toast({ title: `Translation Failed for ${targetLang}`, description: error.message, variant: "destructive" });
        // Skip TTS for this language by not incrementing completedSteps for TTS part
        // and keeping translatedTextForLanguage as null
        completedSteps++; // Still count this as a "completed" (failed) step for progress
        setProgress(Math.round((completedSteps / totalSteps) * 100));
        // Continue to next language
      }

      // Step 2: Text-to-Speech (only if translation was successful)
      if (translatedTextForLanguage) {
        try {
          setCurrentStep(`Generating voice for ${targetLang}...`);
          const voiceName = selectedVoices[targetLang];
          console.log(`Requesting TTS for ${targetLang}, voice: ${voiceName}`);

          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('google-tts', {
            body: {
              text: translatedTextForLanguage,
              language_code: targetLang, // Ensure consistency with function params
              voice_name: voiceName,
              podcast_id: podcastId,
              // user_id will be extracted from JWT by the function
            }
          });

          if (ttsError || (ttsData && ttsData.success === false)) {
            const errMsg = ttsError?.message || ttsData?.error || "Unknown TTS error";
            throw new Error(`TTS function error: ${errMsg}`);
          }

          if (ttsData && ttsData.success && ttsData.storage_path) {
            console.log(`Generated audio for ${targetLang}, path: ${ttsData.storage_path}, size: ${ttsData.file_size}`);
            successfulLanguages++;

            // Insert into translated_episodes table
            const { error: dbInsertError } = await supabase
              .from('translated_episodes')
              .insert({
                podcast_id: podcastId,
                language_code: targetLang,
                voice_name: voiceName,
                audio_storage_path: ttsData.storage_path,
                file_size: ttsData.file_size,
                status: 'completed',
                // user_id is set by RLS default or a trigger if not passed;
                // or can be passed if available client-side and policy allows
              })
              .select() // Important to get data back if needed, or just check error
              .single(); // Assuming unique constraint means we expect one row or conflict

            if (dbInsertError) {
                // Check for unique constraint violation (already processed)
                if (dbInsertError.code === '23505') { // PostgreSQL unique violation code
                    console.warn(`Episode for ${targetLang} with voice ${voiceName} likely already exists:`, dbInsertError.message);
                    toast({ title: `Already Exists`, description: `Translated episode for ${targetLang} (${voiceName}) already recorded.`, variant: "default" });
                } else {
                    console.error(`Error saving translated episode for ${targetLang}:`, dbInsertError);
                    errors.push(`DB save for ${targetLang} failed: ${dbInsertError.message}`);
                    toast({ title: `DB Save Failed for ${targetLang}`, description: dbInsertError.message, variant: "destructive" });
                }
            } else {
                console.log(`Successfully recorded translated episode for ${targetLang} in DB.`);
            }
          } else {
             // Should be caught by ttsError check, but as a safeguard
            throw new Error("TTS function did not return success or storage_path.");
          }

        } catch (error) {
          console.error(`Error generating or saving TTS for ${targetLang}:`, error);
          errors.push(`TTS/Save for ${targetLang} failed: ${error.message}`);
          toast({ title: `TTS/Save Failed for ${targetLang}`, description: error.message, variant: "destructive" });
        }
      }
      completedSteps++;
      setProgress(Math.round((completedSteps / totalSteps) * 100));
    } // End of loop

    setCurrentStep(errors.length === 0 ? 'All processing complete!' : 'Processing complete with some errors.');
    if (errors.length > 0) {
      toast({
        title: "Processing Completed with Errors",
        description: `Generated audio for ${successfulLanguages} of ${selectedLanguages.length} languages. ${errors.length} errors occurred. Check console for details.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Processing Complete!",
        description: `Successfully generated audio for all ${selectedLanguages.length} languages.`,
      });

    } catch (error) {
      console.error('Translation process error:', error);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to process translation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          AI Translation Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Languages: {selectedLanguages.length}</span>
            <span>Voices: {Object.keys(selectedVoices).length}</span>
          </div>
          
          {selectedLanguages.map((lang) => (
            <div key={lang} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                <span>{lang}</span>
              </div>
              <span className="text-sm text-gray-600">
                {selectedVoices[lang] || 'Default voice'}
              </span>
            </div>
          ))}
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
            <span>
              {isFetchingTranscript ? 'Loading transcript...' : currentStep}
            </span>
            {isProcessing && <span>{progress}%</span>}
            </div>
          {(isProcessing || isFetchingTranscript) && <Progress value={isFetchingTranscript ? undefined : progress} className={isFetchingTranscript ? "animate-pulse" : ""} />}
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={startTranslation}
          disabled={
            isProcessing ||
            isFetchingTranscript ||
            !originalTranscript ||
            selectedLanguages.length === 0 ||
            podcastStatus === 'transcription_failed' ||
            podcastStatus === 'transcribing' || // Disable if still transcribing
            !originalLanguageCode // Disable if original language is not set
          }
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
          {isProcessing
            ? 'Processing Translation...'
            : isFetchingTranscript
            ? 'Loading Transcript...'
            : !originalTranscript && podcastStatus !== 'transcription_failed'
            ? 'Waiting for Transcript...'
            : !originalLanguageCode && originalTranscript && podcastStatus === 'transcribed'
            ? 'Original Language Missing'
            : podcastStatus === 'transcription_failed'
            ? 'Transcription Failed'
            : podcastStatus === 'transcribing'
            ? 'Transcription in Progress...'
            : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start AI Translation
              </>
            )}
          </Button>
        </div>

        {/* Download Section */}
        {translatedEpisodesList.length > 0 && !isProcessing && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Available Translations
              </CardTitle>
              <CardDescription>
                Download your translated audio files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {translatedEpisodesList.map((episode) => (
                <div key={episode.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Language: {episode.language_code}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Voice: {episode.voice_name}
                    </p>
                    {episode.file_size && (
                       <p className="text-xs text-gray-500 dark:text-gray-500">
                         Size: {(episode.file_size / (1024 * 1024)).toFixed(2)} MB
                       </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        toast({ title: "Preparing Download...", description: `Fetching URL for ${episode.language_code}...`});
                        const { data: urlData, error: urlError } = await supabase
                          .storage
                          .from(BUCKET_NAME) // Ensure BUCKET_NAME is defined, e.g. 'translated-audio'
                          .createSignedUrl(episode.audio_storage_path, 300); // 5 minutes validity

                        if (urlError) throw urlError;

                        const link = document.createElement('a');
                        link.href = urlData.signedUrl;
                        // Extract filename from path, or create one
                        const fileName = episode.audio_storage_path.split('/').pop() || `${podcastId}_${episode.language_code}_${episode.voice_name}.mp3`;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast({ title: "Download Started", description: `Downloading ${fileName}`, variant: "default", icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> });
                      } catch (error) {
                        console.error("Error creating signed URL or triggering download:", error);
                        toast({ title: "Download Failed", description: error.message, variant: "destructive", icon: <AlertTriangle className="h-5 w-5 text-red-500" /> });
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationProcessor;

// Define BUCKET_NAME - should match the one used in google-tts function
const BUCKET_NAME = 'translated-audio';
