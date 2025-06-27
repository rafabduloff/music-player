import React from 'react';
import { Play, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { formatTime } from '../../utils/formatters';

interface TrackCardProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  onPlay?: () => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  index, 
  showIndex = true, 
  onPlay 
}) => {
  const { setCurrentTrack, currentTrack, isPlaying } = usePlayerStore();
  const { toggleLikeTrack } = useLibraryStore();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      setCurrentTrack(track);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800 group cursor-pointer transition-colors"
      onClick={handlePlay}
    >
      {/* Index/Play Button */}
      {showIndex && (
        <div className="w-8 flex items-center justify-center">
          {isCurrentTrack && isPlaying ? (
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-primary-400 animate-pulse rounded-full"></div>
              <div className="w-1 h-4 bg-primary-400 animate-pulse rounded-full animation-delay-75"></div>
              <div className="w-1 h-2 bg-primary-400 animate-pulse rounded-full animation-delay-150"></div>
            </div>
          ) : (
            <>
              <span className={`text-sm ${isCurrentTrack ? 'text-primary-400' : 'text-dark-400'} group-hover:hidden`}>
                {index}
              </span>
              <Play 
                size={16} 
                className="hidden group-hover:block text-white" 
                fill="white" 
              />
            </>
          )}
        </div>
      )}
      
      {/* Cover Image */}
      <img
        src={track.coverUrl}
        alt={track.title}
        className="w-12 h-12 rounded object-cover"
      />
      
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-primary-400' : 'text-white'}`}>
          {track.title}
        </h4>
        <p className="text-sm text-dark-400 truncate">{track.artist}</p>
      </div>
      
      {/* Album */}
      <div className="hidden md:block flex-1 min-w-0">
        <p className="text-sm text-dark-400 truncate">{track.album}</p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-colors ${
            track.liked ? 'text-accent-400' : 'text-dark-400 hover:text-white'
          }`}
        >
          <Heart size={16} fill={track.liked ? 'currentColor' : 'none'} />
        </button>
        <button className="p-2 rounded-full text-dark-400 hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      {/* Duration */}
      <div className="text-sm text-dark-400 w-12 text-right">
        <span className="group-hover:hidden">
          {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
        </span>
        <Clock size={16} className="hidden group-hover:inline" />
      </div>
    </div>
  );
};