import React, { useEffect } from 'react';
import { Play, Clock, TrendingUp } from 'lucide-react';
import { TrackCard } from '../Common/TrackCard';
import { AlbumCard } from '../Common/AlbumCard';
import { PlaylistCard } from '../Common/PlaylistCard';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../utils/formatters';

export const HomeView: React.FC = () => {
  const { tracks, albums, playlists, recentlyPlayed, likedTracks } = useLibraryStore();
  const { setCurrentTrack, addToQueue } = usePlayerStore();

  const featuredAlbums = albums.slice(0, 6);
  const recommendedTracks = tracks.slice(0, 10);
  const topPlaylists = playlists.slice(0, 4);

  const handlePlayTrack = (track: any) => {
    setCurrentTrack(track);
    // Add remaining tracks to queue
    const trackIndex = recommendedTracks.findIndex(t => t.id === track.id);
    const remainingTracks = recommendedTracks.slice(trackIndex + 1);
    remainingTracks.forEach(t => addToQueue(t));
  };

  const sections = [
    {
      title: 'Good morning',
      subtitle: 'Jump back in',
      items: topPlaylists.slice(0, 6),
      type: 'quickplay' as const,
    },
    {
      title: 'Made for you',
      subtitle: 'Based on your recent listening',
      items: recommendedTracks,
      type: 'tracks' as const,
    },
    {
      title: 'Recently played',
      subtitle: 'Pick up where you left off',
      items: recentlyPlayed.slice(0, 10),
      type: 'tracks' as const,
    },
    {
      title: 'Featured albums',
      subtitle: 'New and noteworthy',
      items: featuredAlbums,
      type: 'albums' as const,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {new Date().getHours() < 12 ? 'Good morning' : 
             new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
          </h1>
          <p className="text-dark-400">
            Welcome back to your music
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Clock size={16} />
            <span>Last played: {formatTime(Date.now() - 1800000)}</span>
          </div>
        </div>
      </div>

      {/* Quick Play Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topPlaylists.slice(0, 6).map((playlist) => (
          <div
            key={playlist.id}
            className="bg-gradient-to-r from-dark-800 to-dark-700 rounded-lg p-4 flex items-center gap-4 hover:from-dark-700 hover:to-dark-600 transition-all duration-200 cursor-pointer group"
          >
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold truncate">{playlist.name}</h3>
              <p className="text-sm text-dark-400">{playlist.tracks.length} songs</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200">
              <Play size={16} fill="white" />
            </button>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      {sections.map((section, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p className="text-dark-400">{section.subtitle}</p>
            </div>
            <button className="text-primary-400 hover:text-primary-300 font-medium">
              Show all
            </button>
          </div>

          {section.type === 'tracks' && (
            <div className="space-y-2">
              {section.items.slice(0, 5).map((track: any, trackIndex) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800 group cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="w-8 text-center">
                    <span className="text-dark-400 group-hover:hidden">{trackIndex + 1}</span>
                    <Play size={16} className="hidden group-hover:block text-white" fill="white" />
                  </div>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{track.title}</h4>
                    <p className="text-sm text-dark-400">{track.artist}</p>
                  </div>
                  <div className="text-sm text-dark-400">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.type === 'albums' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {section.items.map((album: any) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-dark-800">
        <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-primary-400" size={24} />
            <div>
              <h3 className="font-semibold">Total Tracks</h3>
              <p className="text-2xl font-bold text-primary-400">{tracks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="text-accent-400" size={24} />
            <div>
              <h3 className="font-semibold">Hours Played</h3>
              <p className="text-2xl font-bold text-accent-400">2,847</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Play className="text-secondary-400" size={24} />
            <div>
              <h3 className="font-semibold">Playlists</h3>
              <p className="text-2xl font-bold text-secondary-400">{playlists.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};