
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileAudio } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PodcastUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
      const { error: dbError } = await supabase
        .from('podcasts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          audio_file_url: publicUrl,
          audio_file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Your podcast has been uploaded successfully",
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

  return (
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
      </CardContent>
    </Card>
  );
};

export default PodcastUpload;
