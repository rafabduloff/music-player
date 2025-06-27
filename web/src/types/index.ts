export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  sourceId: string;
  genre?: string;
  year?: number;
  liked?: boolean;
  playCount?: number;
  addedAt?: Date;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year?: number;
  tracks: Track[];
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  owner?: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
  albums: Album[];
  topTracks: Track[];
  followers?: number;
}

export interface MusicSource {
  id: string;
  name: string;
  icon: string;
  color: string;
  isAuthenticated: boolean;
  authenticate(): Promise<void>;
  search(query: string): Promise<SearchResults>;
  getPlaylists(): Promise<Playlist[]>;
  getAlbums(): Promise<Album[]>;
  getTopTracks(): Promise<Track[]>;
  getRecommendations(): Promise<Track[]>;
}

export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
  queue: Track[];
  history: Track[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  borderRadius: number;
  animations: boolean;
}

export interface UserSettings {
  theme: string;
  volume: number;
  playbackQuality: 'low' | 'medium' | 'high';
  crossfade: boolean;
  showNotifications: boolean;
  language: string;
  interfaceMode: 'simple' | 'advanced';
  autoPlayNext: boolean;
}

export interface AudioController {
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  setVolume(level: number): void;
  seek(position: number): void;
  getCurrentPosition(): number;
  getDuration(): number;
  setTrack(track: Track): Promise<void>;
}

export interface ConfigManager {
  loadTheme(themeId: string): Promise<ThemeConfig>;
  saveTheme(theme: ThemeConfig): Promise<void>;
  loadUserSettings(): Promise<UserSettings>;
  saveUserSettings(settings: UserSettings): Promise<void>;
  exportConfig(): Promise<string>;
  importConfig(config: string): Promise<void>;
}