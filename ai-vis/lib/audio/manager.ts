export class AudioManager {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;

  // Audio analysis configuration
  private readonly fftSize = 2048;
  private readonly smoothingTimeConstant = 0.8;

  // Frequency bands for different effects
  private readonly bands = {
    bass: { low: 20, high: 140 },
    mid: { low: 140, high: 2000 },
    high: { low: 2000, high: 20000 }
  };

  constructor() {}

  public async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

      // Create data arrays
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect nodes
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }

  public getAudioData(): {
    bass: number,
    mid: number,
    high: number,
    average: number
  } {
    if (!this.analyser || !this.frequencyData) {
      return { bass: 0, mid: 0, high: 0, average: 0 };
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.frequencyData);

    // Calculate frequency ranges
    const nyquist = this.audioContext!.sampleRate / 2;
    const getBinForFrequency = (freq: number) => 
      Math.round((freq / nyquist) * this.analyser!.frequencyBinCount);

    // Calculate average amplitude for each frequency band
    const getAverageForRange = (low: number, high: number) => {
      const lowBin = getBinForFrequency(low);
      const highBin = getBinForFrequency(high);
      let sum = 0;
      for (let i = lowBin; i <= highBin; i++) {
        sum += this.frequencyData![i];
      }
      return sum / (highBin - lowBin + 1) / 255; // Normalize to 0-1
    };

    const bass = getAverageForRange(this.bands.bass.low, this.bands.bass.high);
    const mid = getAverageForRange(this.bands.mid.low, this.bands.mid.high);
    const high = getAverageForRange(this.bands.high.low, this.bands.high.high);
    const average = (bass + mid + high) / 3;

    return { bass, mid, high, average };
  }

  public destroy(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.analyser = null;
    this.mediaStream = null;
    this.dataArray = null;
    this.frequencyData = null;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
