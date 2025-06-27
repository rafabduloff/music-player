import { MusicSource, SearchResults, Playlist, Album, Track } from '../../types';
import { mockTracks, mockPlaylists, mockAlbums } from '../../mocks/data';

export class SpotifySource implements MusicSource {
  id = 'spotify';
  name = 'Spotify';
  icon = 'Music';
  color = '#1DB954';
  isAuthenticated = false;

  async authenticate(): Promise<void> {
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isAuthenticated = true;
  }

  async search(query: string): Promise<SearchResults> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowercaseQuery = query.toLowerCase();
    
    return {
      tracks: mockTracks.filter(track => 
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 20),
      albums: mockAlbums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 10),
      artists: [],
      playlists: mockPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 10),
    };
  }

  async getPlaylists(): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPlaylists.slice(0, 10);
  }

  async getAlbums(): Promise<Album[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAlbums.slice(0, 15);
  }

  async getTopTracks(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTracks.slice(0, 50);
  }

  async getRecommendations(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTracks.slice(10, 30);
  }
}