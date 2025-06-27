import { MusicSource, SearchResults, Playlist, Album, Track } from '../../types';
import { mockTracks, mockPlaylists, mockAlbums } from '../../mocks/data';

export class YouTubeMusicSource implements MusicSource {
  id = 'youtube-music';
  name = 'YouTube Music';
  icon = 'Play';
  color = '#FF0000';
  isAuthenticated = false;

  async authenticate(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    this.isAuthenticated = true;
  }

  async search(query: string): Promise<SearchResults> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const lowercaseQuery = query.toLowerCase();
    
    return {
      tracks: mockTracks.filter(track => 
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 25),
      albums: mockAlbums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artist.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 12),
      artists: [],
      playlists: mockPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery)
      ).slice(0, 8),
    };
  }

  async getPlaylists(): Promise<Playlist[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockPlaylists.slice(2, 12);
  }

  async getAlbums(): Promise<Album[]> {
    await new Promise(resolve => setTimeout(resolve, 550));
    return mockAlbums.slice(1, 16);
  }

  async getTopTracks(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 350));
    return mockTracks.slice(5, 55);
  }

  async getRecommendations(): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 450));
    return mockTracks.slice(15, 35);
  }
}