import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Maximize2, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { audioController } from '../../services/AudioController';
import { formatTime } from '../../utils/formatters';

export const PlayerBar: React.FC = () => {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    shuffleMode,
    play,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const { toggleMiniPlayer } = useUIStore();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrack) {
      audioController.setTrack(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    audioController.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    const updateTime = (time: number) => setCurrentTime(time);
    const updateDuration = (dur: number) => setDuration(dur);
    const handleTrackEnd = () => {
      if (repeatMode === 'one') {
        audioController.seek(0);
        audioController.play();
      } else {
        playNext();
      }
    };

    audioController.addTimeUpdateListener(updateTime);
    audioController.addLoadedMetadataListener(updateDuration);
    audioController.addEndedListener(handleTrackEnd);
  }, [setCurrentTime, setDuration, repeatMode, playNext]);

  useEffect(() => {
    if (isPlaying) {
      audioController.play();
    } else {
      audioController.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      setCurrentTime(newTime);
      audioController.seek(newTime);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      setVolume(percentage);
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat size={18} className="text-primary-400" />;
      case 'all':
        return <Repeat size={18} className="text-primary-400" />;
      default:
        return <Repeat size={18} className="text-dark-400" />;
    }
  };

  const cycleRepeatMode = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  if (!currentTrack) {
    return (
      <div className="h-24 bg-dark-900 border-t border-dark-700 flex items-center justify-center">
        <p className="text-dark-400">No track selected</p>
      </div>
    );
  }

  return (
    <div className="h-24 bg-dark-900 border-t border-dark-700 px-6 flex items-center gap-6">
      {/* Track Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1 max-w-sm">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-14 h-14 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <h4 className="font-medium truncate">{currentTrack.title}</h4>
          <p className="text-sm text-dark-400 truncate">{currentTrack.artist}</p>
        </div>
        <button className="text-dark-400 hover:text-white transition-colors">
          <Heart size={18} />
        </button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffleMode ? 'text-primary-400' : 'text-dark-400 hover:text-white'}`}
          >
            <Shuffle size={18} />
          </button>
          
          <button
            onClick={playPrevious}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} className="text-black" />
            ) : (
              <Play size={20} className="text-black ml-1" fill="black" />
            )}
          </button>
          
          <button
            onClick={playNext}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>
          
          <button
            onClick={cycleRepeatMode}
            className="transition-colors"
          >
            {getRepeatIcon()}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-dark-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-dark-700 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-white rounded-full relative group-hover:bg-primary-400 transition-colors"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <span className="text-xs text-dark-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center gap-4 min-w-0 flex-1 max-w-sm justify-end">
        <button className="text-dark-400 hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-dark-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div
            ref={volumeBarRef}
            onClick={handleVolumeClick}
            className="w-24 h-1 bg-dark-700 rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-primary-400 transition-colors"
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>
        
        <button
          onClick={toggleMiniPlayer}
          className="text-dark-400 hover:text-white transition-colors"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
};