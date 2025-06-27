import React from 'react';
import { Play, Lock } from 'lucide-react';
import { Playlist } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const { setCurrentTrack, addToQueue } = usePlayerStore();

  const handlePlay = () => {
    if (playlist.tracks.length > 0) {
      setCurrentTrack(playlist.tracks[0]);
      playlist.tracks.slice(1).forEach(track => addToQueue(track));
    }
  };

  return (
    <div className="bg-dark-800 p-4 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer group">
      <div className="relative mb-4">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full aspect-square rounded-lg object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 shadow-lg"
        >
          <Play size={16} fill="white" className="text-white ml-0.5" />
        </button>
        {!playlist.isPublic && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-dark-900/80 rounded-full flex items-center justify-center">
            <Lock size={12} className="text-dark-400" />
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold truncate mb-1">{playlist.name}</h3>
        <p className="text-sm text-dark-400 truncate">
          {playlist.description || `${playlist.tracks.length} songs`}
        </p>
        <p className="text-xs text-dark-500 mt-1">
          {playlist.owner} • {playlist.tracks.length} songs
        </p>
      </div>
    </div>
  );
};