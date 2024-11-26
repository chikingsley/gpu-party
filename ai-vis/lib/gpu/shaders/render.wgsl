// Import utility functions and structures
#include "utils.wgsl"

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
};

struct CameraUniforms {
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    modelView: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;

// Vertex shader
@vertex
fn vertex_main(
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32,
) -> VertexOutput {
    // Generate quad vertices
    let quadVertices = array<vec2<f32>, 4>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0,  1.0)
    );
    
    let particle = particles[instanceIndex];
    let quadSize = 0.02; // Adjust particle size here
    
    // Calculate particle position in view space
    let viewPos = camera.modelView * vec4<f32>(particle.position.xyz, 1.0);
    
    // Billboard calculation
    let right = vec3<f32>(camera.view[0].x, camera.view[1].x, camera.view[2].x);
    let up = vec3<f32>(camera.view[0].y, camera.view[1].y, camera.view[2].y);
    
    // Calculate quad position
    let vertexPos = viewPos.xyz + 
                    (right * quadVertices[vertexIndex].x + up * quadVertices[vertexIndex].y) * quadSize;
    
    var output: VertexOutput;
    output.position = camera.projection * vec4<f32>(vertexPos, 1.0);
    output.color = particle.color;
    output.uv = (quadVertices[vertexIndex] + vec2<f32>(1.0)) * 0.5;
    
    return output;
}

// Fragment shader
@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4<f32> {
    // Calculate circular particle shape
    let center = vec2<f32>(0.5);
    let dist = distance(input.uv, center);
    let radius = 0.5;
    let smoothWidth = 0.01;
    
    // Smooth circle
    let alpha = 1.0 - smoothstep(radius - smoothWidth, radius, dist);
    
    // Apply color with smooth edges
    return vec4<f32>(input.color.rgb, input.color.a * alpha);
}
