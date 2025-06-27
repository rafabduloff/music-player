import { create } from 'zustand';
import { Track, PlaybackState } from '../types';

interface PlayerStore extends PlaybackState {
  setCurrentTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToHistory: (track: Track) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  repeatMode: 'none',
  shuffleMode: false,
  queue: [],
  history: [],

  setCurrentTrack: (track) => {
    const state = get();
    set({ 
      currentTrack: track,
      isPlaying: true,
      currentTime: 0
    });
    if (state.currentTrack) {
      state.addToHistory(state.currentTrack);
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, currentTime: 0 }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => {
    const { isMuted, volume } = get();
    set({ 
      isMuted: !isMuted,
      volume: isMuted ? (volume === 0 ? 0.8 : volume) : 0
    });
  },

  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => set((state) => ({ shuffleMode: !state.shuffleMode })),

  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),

  removeFromQueue: (trackId) => set((state) => ({
    queue: state.queue.filter(track => track.id !== trackId)
  })),

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue, repeatMode, currentTrack, shuffleMode } = get();
    
    if (queue.length === 0) return;
    
    let nextTrack: Track;
    
    if (shuffleMode) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      nextTrack = queue[randomIndex];
    } else {
      const currentIndex = queue.findIndex(track => track.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      nextTrack = queue[nextIndex];
    }
    
    get().setCurrentTrack(nextTrack);
  },

  playPrevious: () => {
    const { history } = get();
    if (history.length > 0) {
      const previousTrack = history[history.length - 1];
      set((state) => ({
        currentTrack: previousTrack,
        history: state.history.slice(0, -1),
        isPlaying: true
      }));
    }
  },

  addToHistory: (track) => set((state) => ({
    history: [...state.history.slice(-19), track] // Keep last 20 tracks
  })),
}));