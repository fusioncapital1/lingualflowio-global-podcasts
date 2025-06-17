import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string | null;
  title: string | null;
}

const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ isOpen, onClose, audioUrl, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // When the modal opens and a new URL is provided, load and play
    // When it closes, pause.
    if (isOpen && audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // Load the new source
      audioRef.current.play().catch(error => console.error("Error attempting to play audio:", error));
    } else if (!isOpen && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isOpen, audioUrl]);

  // Additional effect to handle source changes while modal is already open
  useEffect(() => {
    if (isOpen && audioUrl && audioRef.current && audioRef.current.currentSrc !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(error => console.error("Error attempting to play new audio src:", error));
    }
  }, [audioUrl, isOpen]);


  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title || 'Audio Player'}</DialogTitle>
          {audioUrl ? (
            <DialogDescription>Playing audio. Adjust controls as needed.</DialogDescription>
          ) : (
            <DialogDescription>No audio URL provided or loading...</DialogDescription>
          )}
        </DialogHeader>
        <div className="my-4">
          {audioUrl ? (
            <audio ref={audioRef} controls className="w-full">
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p className="text-center text-gray-500">Loading audio...</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlayerModal;
