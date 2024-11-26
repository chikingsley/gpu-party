export interface ParticleConfig {
  particleCount: number;
  speed: number;
  curlFrequency: number;
  particleSize: number;
  glowIntensity: number;
  audioReactivity: number;
  initialShape: 'sphere' | 'cube' | 'random';
  colorMode: 'audio' | 'rainbow' | 'monochrome';
}

export const defaultConfig: ParticleConfig = {
  particleCount: 100000,
  speed: 1.0,
  curlFrequency: 0.5,
  particleSize: 0.015,
  glowIntensity: 0.3,
  audioReactivity: 1.0,
  initialShape: 'sphere',
  colorMode: 'audio',
};

export let config = { ...defaultConfig };
