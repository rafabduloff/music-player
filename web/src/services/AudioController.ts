import { AudioController } from '../types';
import { Track } from '../types';

export class MockAudioController implements AudioController {
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;

  async play(): Promise<void> {
    if (this.audio) {
      try {
        await this.audio.play();
      } catch (error) {
        console.error('Playback failed:', error);
      }
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  setVolume(level: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, level));
    }
  }

  seek(position: number): void {
    if (this.audio) {
      this.audio.currentTime = position;
    }
  }

  getCurrentPosition(): number {
    return this.audio?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.audio?.duration ?? 0;
  }

  async setTrack(track: Track): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    // In a real implementation, this would load the actual audio file
    // For now, we'll create a mock audio element with a sine wave
    this.currentTrack = track;
    
    // Mock audio URL - in reality this would be the track's audio URL
    const mockAudioUrl = this.generateMockAudioUrl(track);
    
    this.audio = new Audio(mockAudioUrl);
    this.audio.preload = 'metadata';
    
    return new Promise((resolve, reject) => {
      if (!this.audio) return reject(new Error('Audio element not created'));
      
      this.audio.addEventListener('loadedmetadata', () => resolve(), { once: true });
      this.audio.addEventListener('error', reject, { once: true });
    });
  }

  private generateMockAudioUrl(track: Track): string {
    // Generate a data URL for a short sine wave audio
    // This is just for demo purposes
    const sampleRate = 44100;
    const duration = track.duration;
    const frequency = 440; // A4 note
    
    // For demo purposes, we'll just return a silent audio data URL
    // In a real app, this would be the actual track URL
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LHciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LKeSoGLILN8teSNAgWaLrr55dNDAhPpuPstWQcAD';
  }

  // Event listeners for integration with player store
  addTimeUpdateListener(callback: (currentTime: number) => void): void {
    if (this.audio) {
      this.audio.addEventListener('timeupdate', () => {
        callback(this.getCurrentPosition());
      });
    }
  }

  addEndedListener(callback: () => void): void {
    if (this.audio) {
      this.audio.addEventListener('ended', callback);
    }
  }

  addLoadedMetadataListener(callback: (duration: number) => void): void {
    if (this.audio) {
      this.audio.addEventListener('loadedmetadata', () => {
        callback(this.getDuration());
      });
    }
  }
}

// Singleton instance
export const audioController = new MockAudioController();