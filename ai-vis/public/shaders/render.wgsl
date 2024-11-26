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
    let quadSize = 0.015; // Much smaller particle size
    
    // Calculate particle position in view space
    let viewPos = camera.view * vec4<f32>(particle.position.xyz, 1.0);
    
    // Billboard calculation
    let right = vec3<f32>(camera.view[0].x, camera.view[1].x, camera.view[2].x);
    let up = vec3<f32>(camera.view[0].y, camera.view[1].y, camera.view[2].y);
    
    // Calculate quad position with size based on distance
    let distanceScale = 1.0 - clamp(length(viewPos.xyz) / 10.0, 0.0, 0.9); // Particles shrink with distance
    let vertexPos = viewPos.xyz + 
                    (right * quadVertices[vertexIndex].x + up * quadVertices[vertexIndex].y) * 
                    quadSize * (1.0 + distanceScale * 0.5); // Reduced distance scaling effect
    
    var output: VertexOutput;
    output.position = camera.projection * vec4<f32>(vertexPos, 1.0);
    output.color = particle.color;
    output.uv = (quadVertices[vertexIndex] + vec2<f32>(1.0)) * 0.5;
    
    return output;
}

// Fragment shader
@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4<f32> {
    // Calculate circular particle shape with soft edges
    let center = vec2<f32>(0.5);
    let dist = distance(input.uv, center);
    let radius = 0.5;
    let smoothWidth = 0.05; // Reduced glow
    
    // Smooth circle with subtle glow
    let circleAlpha = 1.0 - smoothstep(radius - smoothWidth, radius, dist);
    let glowAlpha = 0.3 * (1.0 - smoothstep(radius, radius + smoothWidth, dist));
    let alpha = max(circleAlpha, glowAlpha);
    
    // Subtle color enhancement
    let enhancedColor = input.color.rgb * (1.0 + 0.2 * circleAlpha);
    
    // Apply color with smooth edges and subtle glow
    return vec4<f32>(enhancedColor, alpha * input.color.a);
}
