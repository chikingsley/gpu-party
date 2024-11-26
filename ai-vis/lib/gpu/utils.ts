export async function createShaderModule(
  device: GPUDevice,
  code: string,
  type: 'vertex' | 'fragment' | 'compute'
): Promise<GPUShaderModule> {
  const module = device.createShaderModule({
    code,
    label: `${type} shader`
  });

  // This helps catch shader compilation errors early
  const compilationInfo = await module.getCompilationInfo();
  if (compilationInfo.messages.some(msg => msg.type === 'error')) {
    console.error('Shader compilation errors:', compilationInfo.messages);
    throw new Error(`${type} shader compilation failed`);
  }

  return module;
}

export function createBuffer(
  device: GPUDevice,
  data: Float32Array | Uint32Array,
  usage: GPUBufferUsageFlags,
  label: string
): GPUBuffer {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
    label
  });

  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();

  return buffer;
}

export function createBindGroupLayout(
  device: GPUDevice,
  entries: GPUBindGroupLayoutEntry[]
): GPUBindGroupLayout {
  return device.createBindGroupLayout({
    entries,
    label: 'Custom bind group layout'
  });
}

export function createPipelineLayout(
  device: GPUDevice,
  bindGroupLayouts: GPUBindGroupLayout[]
): GPUPipelineLayout {
  return device.createPipelineLayout({
    bindGroupLayouts,
    label: 'Custom pipeline layout'
  });
}

// Helper for creating uniform buffers
export function createUniformBuffer<T extends { [key: string]: number | Float32Array }>(
  device: GPUDevice,
  data: T,
  label: string
): GPUBuffer {
  const uniformArray = new Float32Array(Object.values(data).reduce((acc: number, val: number | Float32Array) => {
    return acc + (val instanceof Float32Array ? val.length : 1);
  }, 0));

  let offset = 0;
  Object.values(data).forEach(value => {
    if (value instanceof Float32Array) {
      uniformArray.set(value, offset);
      offset += value.length;
    } else {
      uniformArray[offset] = value;
      offset += 1;
    }
  });

  return createBuffer(
    device,
    uniformArray,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label
  );
}
