import { MusicSource, SearchResults, Playlist, Album, Track } from '../../types';
import { mockTracks, mockPlaylists, mockAlbums } from '../../mocks/data';

export class LocalFilesSource implements MusicSource {
  id = 'local';
  name = 'Local Files';
  icon = 'HardDrive';
  color = '#6B7280';
  isAuthenticated = true;

  async authenticate(): Promise<void> {
    // Local files don't need authentication
    this.isAuthenticated = true;
  }

  async search(query: string): Promise<SearchResults> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const lowercaseQuery = query.toLowerCase();
    
    return {
      tracks: mockTracks.filter(track => 
        track.title.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery) ||
        track.album.toLowerCase().includes(lowercaseQuery)
      ),
      albums: mockAlbums.filter(album =>
        album.title.toLowerCase().includes(lowercaseQuery) ||
        album.artist.toLowerCase().includes(lowercaseQuery)
      ),
      artists: [],
      playlists: mockPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(lowercaseQuery) ||
        playlist.description?.toLowerCase().includes(lowercaseQuery)
      ),
    };
  }

  async getPlaylists(): Promise<Playlist[]> {
    return mockPlaylists;
  }

  async getAlbums(): Promise<Album[]> {
    return mockAlbums;
  }

  async getTopTracks(): Promise<Track[]> {
    return mockTracks.slice(0, 50);
  }

  async getRecommendations(): Promise<Track[]> {
    return mockTracks.slice(25, 50);
  }
}