
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Download, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [currentStep, setCurrentStep] = useState('');

  const startTranslation = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Step 1: Get podcast text (placeholder - you'd implement transcription)
      setCurrentStep('Transcribing audio...');
      setProgress(20);
      
      // Step 2: Translate text for each language
      setCurrentStep('Translating text...');
      setProgress(40);
      
      // Step 3: Generate speech for each language
      setCurrentStep('Generating voice translations...');
      setProgress(60);
      
      for (const language of selectedLanguages) {
        const voiceName = selectedVoices[language];
        
        // Call Google TTS for each language
        const response = await supabase.functions.invoke('google-tts', {
          body: {
            text: `This is a translated podcast in ${language}`, // Replace with actual translated text
            languageCode: language,
            voiceName: voiceName
          }
        });

        if (response.error) {
          throw new Error(`Translation failed for ${language}: ${response.error.message}`);
        }

        console.log(`Generated audio for ${language}`);
      }
      
      setProgress(100);
      setCurrentStep('Translation complete!');
      
      toast({
        title: "Translation Complete!",
        description: `Your podcast has been translated into ${selectedLanguages.length} languages.`,
      });

    } catch (error) {
      console.error('Translation error:', error);
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
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={startTranslation}
            disabled={isProcessing || selectedLanguages.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isProcessing ? (
              'Processing Translation...'
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start AI Translation
              </>
            )}
          </Button>

          {progress === 100 && (
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Translated Episodes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationProcessor;
