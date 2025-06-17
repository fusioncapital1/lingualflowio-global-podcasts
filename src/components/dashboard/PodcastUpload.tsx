import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileAudio, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import LanguageSelector from '../LanguageSelector';
import VoiceSelector from './VoiceSelector';
import TranslationProcessor from './TranslationProcessor';

const PodcastUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPodcastId, setUploadedPodcastId] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedVoices, setSelectedVoices] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !title.trim()) return;

    setUploading(true);
    try {
      // Upload audio file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('podcast-audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the file URL
      const { data: { publicUrl } } = supabase.storage
        .from('podcast-audio')
        .getPublicUrl(fileName);

      // Create podcast record
      const { data, error: dbError } = await supabase
        .from('podcasts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          audio_file_url: publicUrl,
          audio_file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadedPodcastId(data.id);
      
      // Call the transcribe-audio function
      try {
        console.log(`Invoking transcribe-audio for podcast ${data.id} with URL ${publicUrl}`);
        const { error: functionError } = await supabase.functions.invoke('transcribe-audio', {
          body: { podcast_id: data.id, audio_file_url: publicUrl },
        });

        if (functionError) {
          // Log the error and show a toast, but don't block the rest of the upload success flow
          console.error("Error invoking transcribe-audio function:", functionError);
          toast({
            title: "Transcription Warning",
            description: `Could not start transcription automatically: ${functionError.message}. You might need to trigger it manually.`,
            variant: "destructive", // Or "warning" if you have one
          });
        } else {
          toast({
            title: "Transcription Started",
            description: "Audio transcription is now in progress.",
          });
        }
      } catch (error) {
        console.error("Error invoking transcribe-audio function:", error);
        toast({
          title: "Transcription Error",
          description: `Failed to start transcription: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }

      toast({
        title: "Upload Success!",
        description: "Your podcast is uploaded. Proceed to select languages for translation.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload podcast",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLanguagesSelected = (languages: string[]) => {
    setSelectedLanguages(languages);
    setShowLanguageSelector(false);
    toast({
      title: "Languages Selected",
      description: `Selected ${languages.length} languages for translation.`,
    });
  };

  const handleVoiceSelect = (voiceName: string, languageCode: string) => {
    setSelectedVoices(prev => ({
      ...prev,
      [languageCode]: voiceName
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Podcast
          </CardTitle>
          <CardDescription>
            Upload your podcast and we'll help you reach a global audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedPodcastId ? (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Input
                  placeholder="Podcast Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    {file ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileAudio className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> audio file
                        </p>
                        <p className="text-xs text-gray-400">MP3, WAV, M4A (MAX. 100MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!file || !title.trim() || uploading}
              >
                {uploading ? "Uploading..." : "Upload Podcast"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">✓ Podcast uploaded successfully!</div>
              <Button 
                onClick={() => setShowLanguageSelector(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Globe className="mr-2 h-4 w-4" />
                Select Translation Languages
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLanguages.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedLanguages.map((language) => (
            <VoiceSelector
              key={language}
              selectedLanguage={language}
              onVoiceSelect={handleVoiceSelect}
            />
          ))}
        </div>
      )}

      {uploadedPodcastId && selectedLanguages.length > 0 && (
        <TranslationProcessor
          podcastId={uploadedPodcastId}
          selectedLanguages={selectedLanguages}
          selectedVoices={selectedVoices}
        />
      )}

      <LanguageSelector 
        isOpen={showLanguageSelector} 
        onClose={() => setShowLanguageSelector(false)}
        onLanguagesSelected={handleLanguagesSelected}
      />
    </div>
  );
};

export default PodcastUpload;
