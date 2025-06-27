import { MusicSource, SearchResults, Playlist, Album, Track } from '../../types';
import { mockTracks, mockPlaylists, mockAlbums } from '../../mocks/data';

export class SoundCloudSource implements MusicSource {
  id = 'soundcloud';
  name = 'SoundCloud';
  icon = 'Radio';
  color = '#FF5500';
  isAuthenticated = false;

  async authenticate(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.isAuthenticated = true;
  }

  async search(query: string): Promise<SearchResults> {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const lowercaseQuery = query.toLowerCase();
    
    return {
      tracks: mockTracks.filter(track => 
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 30),
      albums: mockAlbums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 8),
      artists: [],
      playlists: mockPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 12),
    };
  }

  async getPlaylists(): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 450));
    return mockPlaylists.slice(1, 8);
  }

  async getAlbums(): Promise<Album[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAlbums.slice(0, 12);
  }

  async getTopTracks(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTracks.slice(3, 53);
  }

  async getRecommendations(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTracks.slice(20, 40);
  }
}