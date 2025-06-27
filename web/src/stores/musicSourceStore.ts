import { create } from 'zustand';
import { MusicSource } from '../types';
import { SpotifySource } from '../services/musicSources/SpotifySource';
import { YouTubeMusicSource } from '../services/musicSources/YouTubeMusicSource';
import { SoundCloudSource } from '../services/musicSources/SoundCloudSource';
import { LocalFilesSource } from '../services/musicSources/LocalFilesSource';

interface MusicSourceStore {
  sources: MusicSource[];
  activeSource: string;
  
  // Actions
  setActiveSource: (sourceId: string) => void;
  authenticateSource: (sourceId: string) => Promise<void>;
}

const musicSources = [
  new SpotifySource(),
  new YouTubeMusicSource(),
  new SoundCloudSource(),
  new LocalFilesSource(),
];

export const useMusicSourceStore = create<MusicSourceStore>((set, get) => ({
  sources: musicSources,
  activeSource: 'local',

  setActiveSource: (sourceId) => set({ activeSource: sourceId }),

  authenticateSource: async (sourceId) => {
    const source = get().sources.find(s => s.id === sourceId);
    if (source) {
      await source.authenticate();
    }
  },
}));