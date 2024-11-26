import { audioManager } from '../audio/manager';

interface UniformData {
  time: number;
  speed: number;
  curlFreq: number;
  deltaTime: number;
  bass: number;
  mid: number;
  high: number;
  average: number;
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

declare global {
  interface Window {
    performance: ExtendedPerformance;
  }
}

// Define a base interface for GPU binding resources
interface BaseGPUBindingResource {
  buffer?: GPUBuffer;
  offset?: number;
  size?: number;
}

// Extend both the base interface and GPUBindingResource
interface GPUBindingResourceWithBuffer extends BaseGPUBindingResource {
  buffer: GPUBuffer;
  offset?: number;
  size?: number;
}

interface GPUBufferBinding {
  buffer: GPUBuffer;
  offset?: number;
  size?: number;
}

function isGPUBufferBinding(resource: GPUBindingResource): resource is GPUBufferBinding {
  return 'buffer' in resource;
}

export class GPUEngine {
  private static instance: GPUEngine | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: GPUCanvasContext | null = null;
  private device: GPUDevice | null = null;
  private adapter: GPUAdapter | null = null;
  
  // Configuration
  private readonly config = {
    preferredFormat: typeof window !== 'undefined' ? 
      navigator.gpu?.getPreferredCanvasFormat() || 'bgra8unorm' : 
      'bgra8unorm',
    devicePixelRatio: typeof window !== 'undefined' ? 
      Math.min(window.devicePixelRatio || 1, 2) : 
      1,
    size: { width: 0, height: 0 }
  };

  private visualizerConfig = {
    // Shape controls
    shapeType: 'sphere' as 'sphere' | 'torus' | 'cube' | 'spiral' | 'wave' | 'abstract',
    morphSpeed: 0.2,
    irregularity: 0.3,
    rotationType: 'spin' as 'static' | 'spin' | 'wobble' | 'flow',
    size: 1.0,
    complexity: 0.5,
    
    // Color controls
    baseColor: { h: 0.5, s: 0.8, v: 0.9 },
    colorMode: 'single' as 'single' | 'gradient' | 'rainbow' | 'audio',
    colorSpeed: 0.3,
    colorSpread: 0.5,
    brightness: 0.8,
    contrast: 0.5,
    
    // Audio response
    audioResponseType: 'both' as 'color' | 'brightness' | 'both' | 'none',
    audioColorShift: 0.2,
    audioBrightnessBoost: 0.3,
    audioTransitionSpeed: 0.3,
    
    // Performance
    particleCount: 100000,
    quality: 'auto' as 'low' | 'medium' | 'high' | 'auto',
    antialiasing: true
  };

  // Pipeline states and resources
  private computePipeline: GPUComputePipeline | null = null;
  private renderPipeline: GPURenderPipeline | null = null;

  // Buffers for particle system
  private particleBuffer: GPUBuffer | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private cameraUniformBuffer: GPUBuffer | null = null;

  // Bind groups
  private computeBindGroup: GPUBindGroup | null = null;
  private renderBindGroup: GPUBindGroup | null = null;

  // Simulation state
  private time: number = 0;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  // Particle system configuration
  private readonly particleCount = 100000; // Adjust based on performance
  private readonly workgroupSize = 64;

  // Depth texture
  private depthTexture: GPUTexture | null = null;

  private performanceStats = {
    fps: [] as number[],
    frameTime: [] as number[],
    gpuTime: [] as number[],
    memoryUsage: [] as number[]
  };

  // Make constructor private to enforce singleton pattern
  protected constructor() {
    console.log('Creating GPU Engine instance...');
    if (!this.checkWebGPUSupport()) {
      throw new Error('WebGPU is not supported in this browser');
    }
  }

  public static async getInstance(): Promise<GPUEngine> {
    if (!GPUEngine.instance) {
      GPUEngine.instance = new GPUEngine();
    }
    return GPUEngine.instance;
  }

  private async checkWebGPUSupport(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    console.log('Checking WebGPU support...');
    console.log('navigator.gpu available:', !!navigator.gpu);

    if (!navigator.gpu) {
      console.error('WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag.');
      return false;
    }

    try {
      console.log('Requesting adapter...');
      this.adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      console.log('Adapter received:', !!this.adapter);

      if (!this.adapter) {
        console.error('No appropriate GPUAdapter found.');
        return false;
      }

      console.log('Requesting device...');
      this.device = await this.adapter.requestDevice();
      console.log('Device received:', !!this.device);
      return true;
    } catch (error) {
      console.error('WebGPU device initialization failed:', error);
      return false;
    }
  }

  private async initializeDevice(): Promise<void> {
    // Get WebGPU adapter
    this.adapter = await navigator.gpu?.requestAdapter({
      powerPreference: 'high-performance',
    });

    if (!this.adapter) {
      throw new Error('No appropriate GPUAdapter found');
    }

    // Get WebGPU device
    this.device = await this.adapter.requestDevice();

    // Set up error handling
    this.device.lost.then((info) => {
      console.error(`WebGPU device was lost: ${info.message}`);
      this.device = null;
    });
  }

  public async initialize(canvas: HTMLCanvasElement): Promise<void> {
    console.log('Initializing GPU Engine...');
    
    await this.initGPU(canvas);
    await this.initializeResources();
    
    console.log('Initialization complete!');
    this.startRenderLoop();
  }

  public async initializeAudio(): Promise<void> {
    console.log('Initializing audio...');
    try {
      await audioManager.initialize();
      console.log('Audio initialization complete!');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw error;
    }
  }

  private async initGPU(canvas: HTMLCanvasElement): Promise<void> {
    console.log('Getting WebGPU context...');
    this.canvas = canvas;
    
    try {
      await this.initializeDevice();
      
      // Get context
      this.context = this.canvas.getContext('webgpu');
      console.log('Context received:', !!this.context);
      
      if (!this.context) {
        throw new Error('Failed to get WebGPU context');
      }
      
      // Configure context
      console.log('Configuring context...');
      this.configureContext();

      // Create pipelines
      console.log('Creating compute pipeline...');
      await this.createComputePipeline();
      console.log('Creating render pipeline...');
      await this.createRenderPipeline();
      
    } catch (error) {
      console.error('Error initializing GPU engine:', error);
      throw error;
    }
  }

  private async initializeResources(): Promise<void> {
    // Initialize buffers and other resources
    await this.createBuffers();
  }

  private configureContext(): void {
    if (!this.context || !this.device) return;

    this.updateSize();
    this.createDepthTexture();

    this.context.configure({
      device: this.device,
      format: this.config.preferredFormat,
      alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
    });
  }

  private createDepthTexture(): void {
    if (!this.device || !this.canvas) return;

    // Destroy existing depth texture if it exists
    this.depthTexture?.destroy();

    this.depthTexture = this.device.createTexture({
      size: {
        width: this.canvas.width,
        height: this.canvas.height,
        depthOrArrayLayers: 1
      },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      label: 'Depth texture'
    });
  }

  private async createComputePipeline(): Promise<void> {
    if (!this.device) {
      throw new Error('GPU Device not initialized');
    }

    const shaderModule = await this.loadShaderModule('simulation.wgsl', 'Particle simulation compute shader');

    // Create pipeline layout
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'uniform',
            hasDynamicOffset: false,
            minBindingSize: 8 * 4 // 8 f32 values
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: 'storage',
            hasDynamicOffset: false,
            minBindingSize: this.particleCount * 3 * 4 * 4 // position, velocity, color (vec4s)
          }
        }
      ]
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });

    // Create compute pipeline
    this.computePipeline = this.device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: 'main',
        constants: {
          WORKGROUP_SIZE: this.workgroupSize
        }
      },
      label: 'Particle simulation pipeline'
    });

    // Create uniform buffer
    this.uniformBuffer = this.device.createBuffer({
      size: 8 * 4, // 8 f32 values
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'Particle simulation uniforms',
    });

    // Initialize uniforms
    const uniformData = new Float32Array([
      0.0,  // time
      1.0,  // speed
      0.5,  // curlFreq
      0.016, // deltaTime (1/60)
      0.0,  // bass
      0.0,  // mid
      0.0,  // high
      0.0,  // average
    ]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);

    // Create particle buffer
    const particleBufferSize = this.particleCount * 3 * 4 * 4; // position, velocity, color (vec4s)
    this.particleBuffer = this.device.createBuffer({
      size: particleBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
      label: 'Particle buffer',
    });

    // Initialize particles
    const initialParticleData = new Float32Array(this.particleCount * 12); // 3 vec4s per particle
    for (let i = 0; i < this.particleCount; i++) {
      const baseIndex = i * 12;
      // Position (vec4)
      initialParticleData[baseIndex] = (Math.random() - 0.5) * 2;     // x
      initialParticleData[baseIndex + 1] = (Math.random() - 0.5) * 2; // y
      initialParticleData[baseIndex + 2] = (Math.random() - 0.5) * 2; // z
      initialParticleData[baseIndex + 3] = 1;                         // w
      // Velocity (vec4)
      initialParticleData[baseIndex + 4] = 0;
      initialParticleData[baseIndex + 5] = 0;
      initialParticleData[baseIndex + 6] = 0;
      initialParticleData[baseIndex + 7] = 0;
      // Color (vec4)
      initialParticleData[baseIndex + 8] = Math.random();
      initialParticleData[baseIndex + 9] = Math.random();
      initialParticleData[baseIndex + 10] = Math.random();
      initialParticleData[baseIndex + 11] = 1;
    }
    this.device.queue.writeBuffer(this.particleBuffer, 0, initialParticleData);

    // Create compute bind group
    this.computeBindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer }
        },
        {
          binding: 1,
          resource: { buffer: this.particleBuffer }
        }
      ],
      label: 'Compute bind group'
    });
  }

  private async createRenderPipeline(): Promise<void> {
    if (!this.device) {
      throw new Error('GPU Device not initialized');
    }

    const shaderModule = await this.loadShaderModule('render.wgsl', 'Particle render shader');

    // Create pipeline layout
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {
            type: 'uniform',
            hasDynamicOffset: false,
            minBindingSize: 2 * 16 * 4 // 2 4x4 matrices
          }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {
            type: 'read-only-storage',
            hasDynamicOffset: false,
            minBindingSize: this.particleCount * 3 * 4 * 4
          }
        }
      ]
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });

    this.renderPipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex_main',
        buffers: [], // Using storage buffer for vertices
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragment_main',
        targets: [
          {
            format: navigator.gpu.getPreferredCanvasFormat(),
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
    });

    // Create camera uniform buffer
    this.cameraUniformBuffer = this.device.createBuffer({
      size: 2 * 16 * 4, // 2 4x4 matrices (view and projection)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      label: 'Camera uniforms',
    });

    // Create render bind group
    this.renderBindGroup = this.createBindGroup(bindGroupLayout, [
      {
        binding: 0,
        resource: {
          buffer: this.cameraUniformBuffer!,
          size: 2 * 16 * 4
        }
      },
      {
        binding: 1,
        resource: {
          buffer: this.particleBuffer!,
          size: this.particleCount * 3 * 4 * 4
        }
      }
    ]);
  }

  private async createBuffers(): Promise<void> {
    // No-op
  }

  public setConfig(key: string, value: unknown): void {
    if (key in this.visualizerConfig) {
      const oldValue = (this.visualizerConfig as any)[key];
      (this.visualizerConfig as any)[key] = value;
      
      // Handle specific updates
      switch (key) {
        case 'shapeType':
          this.updateShape(value as string);
          break;
        case 'baseColor':
        case 'colorMode':
        case 'colorSpeed':
        case 'colorSpread':
          this.updateColors();
          break;
        case 'particleCount':
          this.updateParticleCount(value as number);
          break;
        case 'quality':
          this.updateQuality(value as string);
          break;
        case 'antialiasing':
          this.updateAntialiasing(value as boolean);
          break;
      }
      
      // Force a re-render
      if (this.canvas) {
        this.render();
      }
    }
  }

  private updateShape(shapeType: string): void {
    // Implementation for updating shape
    console.log('Updating shape to:', shapeType);
    // Here we would update the simulation shader uniforms and/or particle positions
  }

  private updateColors(): void {
    // Implementation for updating colors
    console.log('Updating colors with config:', {
      baseColor: this.visualizerConfig.baseColor,
      colorMode: this.visualizerConfig.colorMode,
      colorSpeed: this.visualizerConfig.colorSpeed,
      colorSpread: this.visualizerConfig.colorSpread
    });
    // Here we would update the color uniforms in the shaders
  }

  private updateParticleCount(count: number): void {
    // Implementation for updating particle count
    console.log('Updating particle count to:', count);
  }

  private updateQuality(quality: string): void {
    // Implementation for updating quality
    console.log('Updating quality to:', quality);
  }

  private updateAntialiasing(enabled: boolean): void {
    // Implementation for updating antialiasing
    console.log('Updating antialiasing to:', enabled);
  }

  private updateSize(): void {
    if (!this.canvas) return;
    
    const width = this.canvas.clientWidth * this.config.devicePixelRatio;
    const height = this.canvas.clientHeight * this.config.devicePixelRatio;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.config.size = { width, height };
  }

  public resize(): void {
    this.updateSize();
    this.createDepthTexture();
    this.configureContext();
    this.updateCameraUniforms(); // Update camera matrices on resize
  }

  public render(): void {
    if (!this.device || !this.context || !this.computePipeline || !this.renderPipeline || !this.depthTexture) return;

    // Update camera uniforms
    this.updateCameraUniforms();

    // Get current texture view
    const view = this.context.getCurrentTexture().createView();
    const depthView = this.depthTexture.createView();

    // Create command encoder
    const commandEncoder = this.device.createCommandEncoder();

    // Compute pass
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(this.particleCount / this.workgroupSize));
    computePass.end();

    // Render pass
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: view,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      }
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.renderBindGroup);
    renderPass.draw(4, this.particleCount, 0, 0); // 4 vertices per particle
    renderPass.end();

    // Submit command buffer
    this.device.queue.submit([commandEncoder.finish()]);

    // Update time and request next frame
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1); // Cap delta time at 0.1s
    this.time += deltaTime;
    this.lastFrameTime = currentTime;

    // Update uniforms with more dynamic values
    const audioData = audioManager.getAudioData();
    const uniformData = new Float32Array([
      this.time,
      1.0 + audioData.average * 2.0,  // speed affected by overall volume
      0.5 + audioData.bass * 0.5,     // curl frequency affected by bass
      deltaTime,
      audioData.bass * 2.0,           // amplified bass
      audioData.mid * 1.5,            // amplified mids
      audioData.high,                 // regular highs
      audioData.average * 1.5         // amplified average
    ]);
    this.writeUniformBuffer(uniformData);

    // Request next frame
    requestAnimationFrame(() => this.render());
  }

  public startRenderLoop(): void {
    this.lastFrameTime = performance.now();
    this.render();
  }

  public destroy(): void {
    audioManager.destroy();
    this.device?.destroy();
    this.context = null;
    this.device = null;
  }

  private async loadShaderModule(name: string, label: string): Promise<GPUShaderModule> {
    if (!this.device) {
      throw new Error('GPU Device not initialized');
    }
    
    console.log(`Loading shader: ${name}`);
    const response = await fetch(`/shaders/${name}`);
    let shaderCode = await response.text();
    
    // Handle includes
    if (shaderCode.includes('#include')) {
      const includeRegex = /#include\s+"([^"]+)"/g;
      const matches = [...shaderCode.matchAll(includeRegex)];
      
      for (const match of matches) {
        const includePath = match[1];
        const includeResponse = await fetch(`/shaders/${includePath}`);
        const includeCode = await includeResponse.text();
        
        // Replace include directive with actual code
        shaderCode = shaderCode.replace(match[0], includeCode);
      }
    }
    
    console.log(`Shader ${name} loaded, length: ${shaderCode.length}`);
    return this.device.createShaderModule({
      label,
      code: shaderCode,
    });
  }

  private monitorPerformance() {
    // Track FPS
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.performanceStats.fps.push(1000 / frameTime);
    this.performanceStats.frameTime.push(frameTime);
    
    // Type-safe memory check
    const perf = window.performance as ExtendedPerformance;
    if (perf.memory) {
      this.performanceStats.memoryUsage.push(perf.memory.usedJSHeapSize);
    }

    this.trimPerformanceStats();
    this.analyzePerformance();
  }

  private analyzePerformance() {
    const avgFPS = this.getAverageFPS();
    if (avgFPS < 30) {
      this.reduceQuality();
    } else if (avgFPS > 58 && this.canIncreaseQuality()) {
      this.increaseQuality();
    }
  }

  private trimPerformanceStats() {
    const maxSamples = 60; // Keep last second at 60fps
    if (this.performanceStats.fps.length > maxSamples) {
      this.performanceStats.fps = this.performanceStats.fps.slice(-maxSamples);
      this.performanceStats.frameTime = this.performanceStats.frameTime.slice(-maxSamples);
      this.performanceStats.gpuTime = this.performanceStats.gpuTime.slice(-maxSamples);
      this.performanceStats.memoryUsage = this.performanceStats.memoryUsage.slice(-maxSamples);
    }
  }

  private getAverageFPS(): number {
    const samples = this.performanceStats.fps;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }

  private reduceQuality() {
    // Implement quality reduction logic
  }

  private increaseQuality() {
    // Implement quality increase logic
  }

  private canIncreaseQuality(): boolean {
    // Implement quality check logic
    return true;
  }

  private createBindGroup(layout: GPUBindGroupLayout, entries: GPUBindGroupEntry[]): GPUBindGroup {
    if (!this.device) {
      throw new Error('GPU Device not initialized');
    }

    return this.device.createBindGroup({
      layout,
      entries: entries.map(entry => ({
        ...entry,
        resource: isGPUBufferBinding(entry.resource) ? {
          buffer: entry.resource.buffer,
          offset: entry.resource.offset || 0,
          size: entry.resource.size
        } : entry.resource
      }))
    });
  }

  private writeUniformBuffer(data: Float32Array) {
    if (!this.device || !this.uniformBuffer) {
      throw new Error('Device or uniform buffer not initialized');
    }
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
  }

  private updateCameraUniforms(): void {
    if (!this.device || !this.cameraUniformBuffer || !this.canvas) return;

    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    
    // Create perspective projection matrix
    const fov = (60 * Math.PI) / 180; // 60 degrees in radians
    const near = 0.1;
    const far = 100.0;
    
    // Perspective matrix
    const f = 1.0 / Math.tan(fov / 2);
    projectionMatrix[0] = f / aspect;
    projectionMatrix[5] = f;
    projectionMatrix[10] = (far + near) / (near - far);
    projectionMatrix[11] = -1.0;
    projectionMatrix[14] = (2 * far * near) / (near - far);
    
    // View matrix (camera at (0, 0, -5) looking at origin)
    viewMatrix[0] = 1;
    viewMatrix[5] = 1;
    viewMatrix[10] = 1;
    viewMatrix[11] = 0;
    viewMatrix[14] = -5;
    viewMatrix[15] = 1;
    
    // Upload both matrices
    const cameraData = new Float32Array([...viewMatrix, ...projectionMatrix]);
    this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraData);
  }
}

// Singleton instance
let gpuEngine: Promise<GPUEngine> | null = null;

if (typeof window !== 'undefined') {
  console.log('Creating GPU Engine instance...');
  gpuEngine = GPUEngine.getInstance();
}

export { gpuEngine };
