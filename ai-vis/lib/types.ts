export type Quality = 'low' | 'medium' | 'high' | 'auto';

export interface AudioConfig {
  sensitivity: number;
  smoothing: number;
  fftSize: number;
}

export interface VisualConfig {
  particleCount: number;
  particleSize: number;
  colorScheme: string;
  blendMode: string;
}

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  gpuMemory: number;
  particleCount: number;
}

export interface EQNode extends AudioNode {
  frequency: AudioParam;
  gain: AudioParam;
  Q: AudioParam;
} 