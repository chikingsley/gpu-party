export interface GPUConfiguration {
  devicePixelRatio: number;
  preferredFormat: GPUTextureFormat;
  size: {
    width: number;
    height: number;
  };
}

export interface ComputeUniforms {
  deltaTime: number;
  time: number;
}

export interface RenderUniforms {
  viewMatrix: Float32Array;
  projectionMatrix: Float32Array;
  modelMatrix: Float32Array;
}

export interface ParticleData {
  position: Float32Array;
  velocity: Float32Array;
  color: Float32Array;
}

export interface ShaderModule {
  vertex: GPUShaderModule;
  fragment: GPUShaderModule;
  compute?: GPUShaderModule;
}
