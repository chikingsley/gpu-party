import { type WebGPURenderer } from './types';

export class Renderer {
  private gpu: WebGPURenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;

  async initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('No appropriate GPUAdapter found');
    }

    this.gpu = await adapter.requestDevice();
    
    // More initialization to be added
  }

  dispose() {
    this.gpu?.destroy();
    this.gpu = null;
    this.canvas = null;
  }
}
