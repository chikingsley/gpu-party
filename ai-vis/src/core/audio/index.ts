import type { AudioOptions, AudioAnalysis } from './types';

export class AudioProcessor {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private options: AudioOptions;

  constructor(options: AudioOptions) {
    this.options = options;
  }

  async initialize() {
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = this.options.fftSize;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.context.createMediaStreamSource(stream);
      source.connect(this.analyser);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  analyze(): AudioAnalysis {
    if (!this.analyser) {
      throw new Error('AudioProcessor not initialized');
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    return {
      frequencies: Array.from(dataArray),
      timestamp: Date.now()
    };
  }

  dispose() {
    this.context?.close();
    this.context = null;
    this.analyser = null;
  }
}
