export type WebGPURenderer = GPUDevice;

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  antialias?: boolean;
  alpha?: boolean;
}

export interface ShaderModule {
  vertex: GPUShaderModule;
  fragment: GPUShaderModule;
}

export interface RenderPipeline {
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
}
