import winnerSoundUrl from '../assets/sounds/winner.mp3';

class SoundManager {
  private audioContext: AudioContext | null = null;
  public isMuted: boolean = false;

  private currentWinAudio: HTMLAudioElement | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTick() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  stopWin() {
    if (this.currentWinAudio) {
      this.currentWinAudio.pause();
      this.currentWinAudio.currentTime = 0;
    }
  }

  playWin() {
    if (this.isMuted) return;
    this.stopWin();
    try {
      this.currentWinAudio = new Audio(winnerSoundUrl);
      this.currentWinAudio.volume = 1.0;
      this.currentWinAudio.play().catch(() => {});
    } catch {}
  }
}

export const soundManager = new SoundManager();
