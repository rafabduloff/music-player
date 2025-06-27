import { create } from 'zustand';
import { Track, Playlist, Album, Artist } from '../types';
import { mockTracks, mockPlaylists, mockAlbums, mockArtists } from '../mocks/data';

interface LibraryStore {
  tracks: Track[];
  playlists: Playlist[];
  albums: Album[];
  artists: Artist[];
  likedTracks: Track[];
  recentlyPlayed: Track[];
  searchQuery: string;
  searchResults: {
    tracks: Track[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  };
  
  // Actions
  setSearchQuery: (query: string) => void;
  searchLibrary: (query: string) => void;
  toggleLikeTrack: (trackId: string) => void;
  addToRecentlyPlayed: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  tracks: mockTracks,
  playlists: mockPlaylists,
  albums: mockAlbums,
  artists: mockArtists,
  likedTracks: [],
  recentlyPlayed: [],
  searchQuery: '',
  searchResults: {
    tracks: [],
    albums: [],
    artists: [],
    playlists: [],
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchLibrary: (query) => {
    const { tracks, albums, artists, playlists } = get();
    const lowercaseQuery = query.toLowerCase();

    const searchResults = {
      tracks: tracks.filter(track => 
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery) ||
        track.album.toLowerCase().includes(lowercaseQuery)
      ),
      albums: albums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artist.toLowerCase().includes(lowercaseQuery)
      ),
      artists: artists.filter(artist =>
        artist.name.toLowerCase().includes(lowercaseQuery)
      ),
      playlists: playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery) ||
        playlist.description?.toLowerCase().includes(lowercaseQuery)
      ),
    };

    set({ searchResults, searchQuery: query });
  },

  toggleLikeTrack: (trackId) => {
    const { likedTracks, tracks } = get();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const isLiked = likedTracks.some(t => t.id === trackId);
    
    if (isLiked) {
      set({
        likedTracks: likedTracks.filter(t => t.id !== trackId)
      });
    } else {
      set({
        likedTracks: [...likedTracks, { ...track, liked: true }]
      });
    }
  },

  addToRecentlyPlayed: (track) => {
    set((state) => ({
      recentlyPlayed: [
        track,
        ...state.recentlyPlayed.filter(t => t.id !== track.id).slice(0, 49)
      ]
    }));
  },

  createPlaylist: (name, description = '') => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverUrl: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      owner: 'user',
    };

    set((state) => ({
      playlists: [...state.playlists, newPlaylist]
    }));

    return newPlaylist;
  },

  addTrackToPlaylist: (playlistId, track) => {
    set((state) => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId
          ? {
              ...playlist,
              tracks: [...playlist.tracks, track],
              updatedAt: new Date()
            }
          : playlist
      )
    }));
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    set((state) => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId
          ? {
              ...playlist,
              tracks: playlist.tracks.filter(t => t.id !== trackId),
              updatedAt: new Date()
            }
          : playlist
      )
    }));
  },

  deletePlaylist: (playlistId) => {
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== playlistId)
    }));
  },

  updatePlaylist: (playlistId, updates) => {
    set((state) => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId
          ? { ...playlist, ...updates, updatedAt: new Date() }
          : playlist
      )
    }));
  },
}));