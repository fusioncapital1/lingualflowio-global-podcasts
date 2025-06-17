
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mic, Globe, PlayIcon, MoreHorizontalIcon, Trash2Icon, DownloadIcon, Loader2, XCircle, ExternalLinkIcon
} from 'lucide-react'; // Using PlayIcon to avoid conflict
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

import AudioPlayerModal from './AudioPlayerModal'; // Import the new modal
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';


type PodcastRow = Tables<'podcasts'>['Row'] & { audio_file_url: string }; // Ensure audio_file_url is part of type
type TranslatedEpisodeRow = Tables<'translated_episodes'>['Row'];

const BUCKET_PODCAST_AUDIO = 'podcast-audio';
const BUCKET_TRANSLATED_AUDIO = 'translated-audio';

// Helper function to parse storage path from Supabase URL
const getPathFromSupabaseUrl = (url: string, bucketName: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    // Path is usually /storage/v1/object/public/bucket_name/path/to/file.mp3
    // or for authenticated: /storage/v1/object/authenticated/bucket_name/path/to/file.mp3
    const pathSegments = parsedUrl.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(bucketName);

    if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
      return pathSegments.slice(bucketIndex + 1).join('/');
    }
    console.warn("Could not parse path from Supabase URL:", url, "for bucket:", bucketName);
    return null;
  } catch (e) {
    console.error("Invalid URL for parsing path:", e);
    return null;
  }
};


const PodcastList = () => {
  const [podcasts, setPodcasts] = useState<PodcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Audio Player Modal State
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string | null>(null);
  const [currentPlayingTitle, setCurrentPlayingTitle] = useState<string | null>(null);
  const [generatingSignedUrl, setGeneratingSignedUrl] = useState<string | null>(null); // podcastId or episodeId

  // Translations Modal State
  const [showTranslationsModal, setShowTranslationsModal] = useState(false);
  const [selectedPodcastForTranslations, setSelectedPodcastForTranslations] = useState<PodcastRow | null>(null);
  const [currentTranslationsList, setCurrentTranslationsList] = useState<TranslatedEpisodeRow[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  // Delete Confirmation Modal State
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<PodcastRow | null>(null);
  const [isDeletingPodcastId, setIsDeletingPodcastId] = useState<string | null>(null);


  const fetchPodcasts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select<string, PodcastRow>('*') // Ensure selected type includes audio_file_url
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast({ title: "Fetch Error", description: "Could not fetch your podcasts.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);


  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    // Improved status badge logic
    if (status.includes('failed')) return <Badge variant="destructive">{status}</Badge>;
    if (status === 'completed' || status === 'transcribed') return <Badge variant="success">{status}</Badge>;
    if (status.includes('processing') || status.includes('transcribing') || status.includes('pending')) {
      return <Badge variant="secondary" className="animate-pulse">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  // Play Original Audio
  const handlePlayOriginalAudio = async (podcast: PodcastRow) => {
    if (!podcast.audio_file_url) {
      toast({ title: "No Audio", description: "This podcast has no audio file URL.", variant: "destructive" });
      return;
    }
    setGeneratingSignedUrl(podcast.id);
    try {
      const path = getPathFromSupabaseUrl(podcast.audio_file_url, BUCKET_PODCAST_AUDIO);
      if (!path) throw new Error("Could not determine audio file path.");

      const { data, error } = await supabase.storage.from(BUCKET_PODCAST_AUDIO).createSignedUrl(path, 300); // 5 min expiry
      if (error) throw error;
      setCurrentPlayingUrl(data.signedUrl);
      setCurrentPlayingTitle(podcast.title);
      setShowPlayerModal(true);
    } catch (error) {
      console.error("Error getting signed URL for original audio:", error);
      toast({ title: "Playback Error", description: `Could not play original audio: ${error.message}`, variant: "destructive" });
    } finally {
      setGeneratingSignedUrl(null);
    }
  };

  // Open Translations Modal
  const handleOpenTranslationsModal = async (podcast: PodcastRow) => {
    setSelectedPodcastForTranslations(podcast);
    setShowTranslationsModal(true);
    setLoadingTranslations(true);
    try {
      const { data, error } = await supabase
        .from('translated_episodes')
        .select('*')
        .eq('podcast_id', podcast.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCurrentTranslationsList(data || []);
    } catch (error) {
      console.error("Error fetching translations:", error);
      toast({ title: "Load Error", description: `Could not load translations: ${error.message}`, variant: "destructive" });
      setCurrentTranslationsList([]);
    } finally {
      setLoadingTranslations(false);
    }
  };

  const handleClosePlayerModal = () => {
    setShowPlayerModal(false);
    setCurrentPlayingUrl(null);
    setCurrentPlayingTitle(null);
  }

  // Play Translated Audio
  const handlePlayTranslatedAudio = async (episode: TranslatedEpisodeRow) => {
    setGeneratingSignedUrl(episode.id);
    try {
      // Path is already direct path, not full URL
      const { data, error } = await supabase.storage.from(BUCKET_TRANSLATED_AUDIO).createSignedUrl(episode.audio_storage_path, 300);
      if (error) throw error;
      setCurrentPlayingUrl(data.signedUrl);
      setCurrentPlayingTitle(`${selectedPodcastForTranslations?.title} - ${episode.language_code} (${episode.voice_name})`);
      setShowPlayerModal(true); // This will open the main player modal
    } catch (error) {
      console.error("Error getting signed URL for translated audio:", error);
      toast({ title: "Playback Error", description: `Could not play translated audio: ${error.message}`, variant: "destructive" });
    } finally {
      setGeneratingSignedUrl(null);
    }
  };

  // Download Translated Audio
  const handleDownloadTranslatedAudio = async (episode: TranslatedEpisodeRow) => {
     setGeneratingSignedUrl(episode.id + "_download"); // Differentiate loading state
    try {
      const { data, error } = await supabase.storage.from(BUCKET_TRANSLATED_AUDIO).createSignedUrl(episode.audio_storage_path, 300);
      if (error) throw error;
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = episode.audio_storage_path.split('/').pop() || `${selectedPodcastForTranslations?.title}_${episode.language_code}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({title: "Download Started", description: `Downloading ${link.download}`, variant: "default"});
    } catch (error) {
      console.error("Error creating signed URL for download:", error);
      toast({ title: "Download Failed", description: error.message, variant: "destructive" });
    } finally {
        setGeneratingSignedUrl(null);
    }
  };


  // Delete Podcast
  const handleOpenDeleteDialog = (podcast: PodcastRow) => {
    setPodcastToDelete(podcast);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!podcastToDelete || !user) return;
    setIsDeletingPodcastId(podcastToDelete.id);
    try {
      // 1. Fetch translated_episodes for the podcast_id
      const { data: episodes, error: fetchEpisodesError } = await supabase
        .from('translated_episodes')
        .select('id, audio_storage_path')
        .eq('podcast_id', podcastToDelete.id);
      if (fetchEpisodesError) throw fetchEpisodesError;

      // 2. For each translated episode, delete its audio file
      if (episodes && episodes.length > 0) {
        const filesToDelete = episodes.map(ep => ep.audio_storage_path).filter(path => !!path);
        if (filesToDelete.length > 0) {
          const { error: deleteStorageError } = await supabase.storage
            .from(BUCKET_TRANSLATED_AUDIO)
            .remove(filesToDelete);
          if (deleteStorageError) {
             // Log error but attempt to continue deletion of DB records
            console.error("Error deleting translated audio files from storage:", deleteStorageError);
            toast({ title: "Storage Cleanup Warning", description: `Could not delete some translated audio files: ${deleteStorageError.message}`, variant: "destructive" });
          }
        }
      }

      // 3. Delete all records for this podcast_id from translated_episodes table (handled by CASCADE if set up, but explicit is safer)
      // The ON DELETE CASCADE on podcast_id in translated_episodes table should handle this.
      // If not, uncomment:
      // const { error: deleteEpisodesError } = await supabase
      //   .from('translated_episodes')
      //   .delete()
      //   .eq('podcast_id', podcastToDelete.id);
      // if (deleteEpisodesError) throw deleteEpisodesError;


      // 4. Delete the original audio file
      if (podcastToDelete.audio_file_url) {
        const originalAudioPath = getPathFromSupabaseUrl(podcastToDelete.audio_file_url, BUCKET_PODCAST_AUDIO);
        if (originalAudioPath) {
          const { error: deleteOriginalAudioError } = await supabase.storage
            .from(BUCKET_PODCAST_AUDIO)
            .remove([originalAudioPath]);
          if (deleteOriginalAudioError) {
            console.error("Error deleting original audio file from storage:", deleteOriginalAudioError);
            toast({ title: "Storage Cleanup Warning", description: `Could not delete original audio file: ${deleteOriginalAudioError.message}`, variant: "destructive" });
          }
        }
      }

      // 5. Delete the podcast record itself
      const { error: deletePodcastError } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastToDelete.id)
        .eq('user_id', user.id); // Ensure user owns it
      if (deletePodcastError) throw deletePodcastError;

      toast({ title: "Podcast Deleted", description: `"${podcastToDelete.title}" and its translations have been deleted.` });
      fetchPodcasts(); // Refresh list
    } catch (error) {
      console.error("Error deleting podcast:", error);
      toast({ title: "Delete Failed", description: `Could not delete podcast: ${error.message}`, variant: "destructive" });
    } finally {
      setIsDeletingPodcastId(null);
      setShowDeleteConfirmModal(false);
      setPodcastToDelete(null);
    }
  };

  if (loading && podcasts.length === 0) { // Show main loading spinner only if no podcasts are shown yet
    return (
      <Card>
        <CardHeader><CardTitle>Your Podcasts</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" />Your Podcasts</CardTitle>
          <CardDescription>Manage, play, and translate your uploaded podcasts.</CardDescription>
        </CardHeader>
        <CardContent>
          {podcasts.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No podcasts uploaded yet.</p>
              <p className="text-sm text-gray-400">Upload your first podcast to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className={`border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${isDeletingPodcastId === podcast.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 for text truncation if needed */}
                      <h3 className="font-semibold text-lg truncate" title={podcast.title}>{podcast.title}</h3>
                      {podcast.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 truncate">{podcast.description}</p>
                      )}
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        {getStatusBadge(podcast.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(podcast.created_at).toLocaleDateString()}
                        </span>
                        {podcast.original_language && <Badge variant="outline">Original: {podcast.original_language}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2"> {/* Reduced gap */}
                      <Button variant="ghost" size="icon" onClick={() => handlePlayOriginalAudio(podcast)} disabled={!podcast.audio_file_url || !!generatingSignedUrl}>
                        {generatingSignedUrl === podcast.id && !generatingSignedUrl.endsWith("_download") ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenTranslationsModal(podcast)}>
                        <Globe className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeletingPodcastId === podcast.id}>
                            {isDeletingPodcastId === podcast.id ? <Loader2 className="h-4 w-4 animate-spin" /> :<MoreHorizontalIcon className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {/* Future: Edit metadata */ toast({title: "Info", description: "Edit functionality coming soon!"})}}>
                            Edit Details
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => { window.open(`/podcast/${podcast.id}/translate`, '_blank') /* Placeholder for a dedicated translation page */}}>
                            <ExternalLinkIcon className="mr-2 h-4 w-4" /> Go to Translation Page
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(podcast)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                            <Trash2Icon className="mr-2 h-4 w-4" /> Delete Podcast
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Player Modal */}
      <AudioPlayerModal
        isOpen={showPlayerModal}
        onClose={handleClosePlayerModal}
        audioUrl={currentPlayingUrl}
        title={currentPlayingTitle}
      />

      {/* Translations Modal */}
      {selectedPodcastForTranslations && (
        <Dialog open={showTranslationsModal} onOpenChange={(open) => !open && setShowTranslationsModal(false)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Translations for: {selectedPodcastForTranslations.title}</DialogTitle>
              <DialogDescription>Manage and play translated versions of your podcast.</DialogDescription>
            </DialogHeader>
            {loadingTranslations ? (
              <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : currentTranslationsList.length === 0 ? (
              <p className="text-center py-4">No translations found for this podcast yet.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto py-4">
                {currentTranslationsList.map(ep => (
                  <div key={ep.id} className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <p className="font-medium">{ep.language_code} <span className="text-sm text-gray-500">({ep.voice_name})</span></p>
                      {getStatusBadge(ep.status)}
                    </div>
                    {ep.status === 'completed' && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handlePlayTranslatedAudio(ep)} disabled={!!generatingSignedUrl}>
                           {generatingSignedUrl === ep.id && !generatingSignedUrl.endsWith("_download") ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadTranslatedAudio(ep)} disabled={!!generatingSignedUrl}>
                          {generatingSignedUrl === ep.id + "_download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                    {ep.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTranslationsModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {podcastToDelete && (
        <AlertDialog open={showDeleteConfirmModal} onOpenChange={(open) => !open && setShowDeleteConfirmModal(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the podcast titled
                <span className="font-semibold"> "{podcastToDelete.title}"</span>,
                all its associated translations, and their audio files from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPodcastToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeletingPodcastId === podcastToDelete.id}
              >
                {isDeletingPodcastId === podcastToDelete.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, delete podcast
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default PodcastList;
