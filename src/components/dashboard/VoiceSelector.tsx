
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Play, Pause } from 'lucide-react';

interface VoiceSelectorProps {
  selectedLanguage: string;
  onVoiceSelect: (voiceName: string, languageCode: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedLanguage, onVoiceSelect }) => {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const voices = {
    'en-US': [
      { name: 'en-US-Standard-A', displayName: 'Female (Standard A)' },
      { name: 'en-US-Standard-B', displayName: 'Male (Standard B)' },
      { name: 'en-US-Wavenet-A', displayName: 'Female (WaveNet A)' },
      { name: 'en-US-Wavenet-B', displayName: 'Male (WaveNet B)' },
    ],
    'es-ES': [
      { name: 'es-ES-Standard-A', displayName: 'Female (Standard A)' },
      { name: 'es-ES-Standard-B', displayName: 'Male (Standard B)' },
      { name: 'es-ES-Wavenet-A', displayName: 'Female (WaveNet A)' },
      { name: 'es-ES-Wavenet-B', displayName: 'Male (WaveNet B)' },
    ],
    'fr-FR': [
      { name: 'fr-FR-Standard-A', displayName: 'Female (Standard A)' },
      { name: 'fr-FR-Standard-B', displayName: 'Male (Standard B)' },
      { name: 'fr-FR-Wavenet-A', displayName: 'Female (WaveNet A)' },
      { name: 'fr-FR-Wavenet-B', displayName: 'Male (WaveNet B)' },
    ],
    'de-DE': [
      { name: 'de-DE-Standard-A', displayName: 'Female (Standard A)' },
      { name: 'de-DE-Standard-B', displayName: 'Male (Standard B)' },
      { name: 'de-DE-Wavenet-A', displayName: 'Female (WaveNet A)' },
      { name: 'de-DE-Wavenet-B', displayName: 'Male (WaveNet B)' },
    ]
  };

  const availableVoices = voices[selectedLanguage as keyof typeof voices] || voices['en-US'];

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    onVoiceSelect(voiceName, selectedLanguage);
  };

  const previewVoice = async () => {
    if (!selectedVoice) return;

    setIsPlaying(true);
    try {
      // Call our Google TTS function for preview
      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, this is a preview of the selected voice.',
          languageCode: selectedLanguage,
          voiceName: selectedVoice
        })
      });

      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
        audio.onended = () => setIsPlaying(false);
      }
    } catch (error) {
      console.error('Voice preview error:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 3000);
    }
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
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice..." />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
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
