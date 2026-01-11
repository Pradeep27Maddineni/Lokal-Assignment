import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
    currentTrack: Song | null;
    isPlaying: boolean;
    isBuffering: boolean;
    position: number; // in milliseconds
    duration: number; // in milliseconds
    setCurrentTrack: (track: Song | null) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setIsBuffering: (isBuffering: boolean) => void;
    setPosition: (position: number) => void;
    setDuration: (duration: number) => void;
    reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentTrack: null,
    isPlaying: false,
    isBuffering: false,
    position: 0,
    duration: 0,
    setCurrentTrack: (track) => set({ currentTrack: track }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setIsBuffering: (isBuffering) => set({ isBuffering }),
    setPosition: (position) => set({ position }),
    setDuration: (duration) => set({ duration }),
    reset: () => set({
        currentTrack: null,
        isPlaying: false,
        isBuffering: false,
        position: 0,
        duration: 0
    }),
}));
