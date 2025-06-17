
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Play, Pause, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoiceSelectorProps {
  selectedLanguage: string;
  onVoiceSelect: (voiceName: string, languageCode: string) => void;
}

interface VoiceOption {
  name: string;
  displayName: string;
  // ssmlGender?: string; // Optional, if needed for display or logic
  // naturalSampleRateHertz?: number; // Optional
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedLanguage, onVoiceSelect }) => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [availableVoicesList, setAvailableVoicesList] = useState<VoiceOption[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedLanguage) {
      setAvailableVoicesList([]);
      setSelectedVoice('');
      return;
    }

    const fetchVoices = async () => {
      setLoadingVoices(true);
      setSelectedVoice(''); // Reset selected voice when language changes
      setAvailableVoicesList([]); // Clear previous list
      // onVoiceSelect('', selectedLanguage); // Notify parent that voice selection is reset

      try {
        const { data, error } = await supabase.functions.invoke('list-google-tts-voices', {
          body: { language_code: selectedLanguage },
        });

        if (error) {
          throw error;
        }

        if (data && data.voices) {
          setAvailableVoicesList(data.voices);
          // Optionally, select the first voice by default:
          // if (data.voices.length > 0) {
          //   setSelectedVoice(data.voices[0].name);
          //   onVoiceSelect(data.voices[0].name, selectedLanguage);
          // }
        } else {
          setAvailableVoicesList([]);
        }
      } catch (error) {
        console.error(`Error fetching voices for ${selectedLanguage}:`, error);
        toast({
          title: "Voice Loading Failed",
          description: `Could not load voices for ${selectedLanguage}. ${error.message}`,
          variant: "destructive",
        });
        setAvailableVoicesList([]);
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [selectedLanguage]); // Removed onVoiceSelect from deps array to avoid potential loops if parent isn't memoizing it

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    onVoiceSelect(voiceName, selectedLanguage);
  };

  const previewVoice = async () => {
    if (!selectedVoice) return;

    if (!selectedVoice) return;

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      const { data, error } = await supabase.functions.invoke('preview-google-tts', {
        body: {
          text: 'Hello, this is a preview of the selected voice.',
          language_code: selectedLanguage,
          voice_name: selectedVoice,
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.audioContent) {
        if (audioRef.current) { // Reuse existing audio element
          audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        } else {
          audioRef.current = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        }

        audioRef.current.play().catch(playError => {
          console.error("Error playing audio:", playError);
          toast({ title: "Playback Error", description: "Could not play audio preview.", variant: "destructive" });
          setIsPlaying(false); // Reset if playback fails immediately
        });

        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e);
          toast({ title: "Audio Error", description: "An error occurred during audio playback.", variant: "destructive" });
          setIsPlaying(false);
        };

      } else {
        throw new Error("No audio content received from preview function.");
      }
    } catch (error) {
      console.error('Voice preview error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Preview Failed",
        description: errorMessage,
        variant: "destructive",
        action: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
      setIsPlaying(false); // Ensure isPlaying is reset on error
    }
    // Removed the setTimeout in finally as onended/onerror should handle setIsPlaying
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="mr-2 h-5 w-5" />
          Voice Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Choose Voice for {selectedLanguage}</label>
          <Select
            value={selectedVoice}
            onValueChange={handleVoiceChange}
            disabled={loadingVoices || availableVoicesList.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingVoices
                    ? "Loading voices..."
                    : availableVoicesList.length === 0
                    ? "No voices available"
                    : "Select a voice..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Simpler display using the function-generated displayName */}
               {availableVoicesList.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedVoice && (
          <Button 
            variant="outline" 
            onClick={previewVoice}
            disabled={isPlaying}
            className="w-full"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Playing Preview...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Preview Voice
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceSelector;
