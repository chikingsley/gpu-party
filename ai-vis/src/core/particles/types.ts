export interface ParticleState {
  position: [number, number, number];
  velocity: [number, number, number];
  color: [number, number, number, number];
  size: number;
  life: number;
  maxLife: number;
}

export interface ParticleOptions {
  maxParticles: number;
  particleSize: number;
  spawnRate: number;
  lifeRange: [number, number];
  velocityRange: [number, number];
  colorRange: {
    start: [number, number, number, number];
    end: [number, number, number, number];
  };
  sizeRange: [number, number];
}

export interface ParticleBuffer {
  vertex: GPUBuffer;
  index: GPUBuffer;
  uniform: GPUBuffer;
}
