import { create, StateCreator } from 'zustand';
import { Quality, AudioConfig, VisualConfig, PerformanceStats } from '../types';

interface VisualizerState {
  isPlaying: boolean;
  currentPreset: string;
  quality: Quality;
  audioConfig: AudioConfig;
  visualConfig: VisualConfig;
  performance: PerformanceStats;
  setConfig: (config: Partial<VisualConfig>) => void;
  setAudioConfig: (config: Partial<AudioConfig>) => void;
  setQuality: (quality: Quality) => void;
  updatePerformance: (stats: Partial<PerformanceStats>) => void;
}

type SetState = (
  partial: VisualizerState | Partial<VisualizerState> | ((state: VisualizerState) => VisualizerState | Partial<VisualizerState>),
  replace?: boolean
) => void;

const storeCreator: StateCreator<VisualizerState> = (set) => ({
  isPlaying: false,
  currentPreset: 'default',
  quality: 'auto',
  audioConfig: {
    sensitivity: 1.0,
    smoothing: 0.8,
    fftSize: 2048
  },
  visualConfig: {
    particleCount: 1000,
    particleSize: 2,
    colorScheme: 'default',
    blendMode: 'normal'
  },
  performance: {
    fps: 0,
    frameTime: 0,
    gpuMemory: 0,
    particleCount: 0
  },
  setConfig: (config: Partial<VisualConfig>) => set((state: VisualizerState) => ({ 
    visualConfig: { ...state.visualConfig, ...config } 
  })),
  setAudioConfig: (config: Partial<AudioConfig>) => set((state: VisualizerState) => ({ 
    audioConfig: { ...state.audioConfig, ...config } 
  })),
  setQuality: (quality: Quality) => set({ quality }),
  updatePerformance: (stats: Partial<PerformanceStats>) => set((state: VisualizerState) => ({ 
    performance: { ...state.performance, ...stats } 
  }))
});

export const useStore = create(storeCreator); 