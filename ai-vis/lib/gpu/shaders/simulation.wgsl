// Import utility functions and structures
#include "utils.wgsl"

struct Uniforms {
  time: f32,
  speed: f32,
  curlFreq: f32,
  deltaTime: f32,
  bass: f32,
  mid: f32,
  high: f32,
  average: f32,
};

struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> particlesA: array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesB: array<Particle>;

// Curl noise functions from utils.wgsl
// ...

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  if (index >= arrayLength(&particlesB)) {
    return;
  }

  var particle = particlesA[index];
  
  // Apply curl noise with frequency affected by bass
  let curlNoise = curl(particle.position.xyz * uniforms.curlFreq);
  
  // Scale velocity by audio levels
  let bassForce = uniforms.bass * 2.0;
  let midForce = uniforms.mid * 1.5;
  let highForce = uniforms.high * 1.0;
  
  // Update velocity based on audio-reactive forces
  particle.velocity.xyz += curlNoise * uniforms.speed * uniforms.deltaTime;
  particle.velocity.xyz *= 0.98; // Damping
  
  // Add audio-reactive forces
  particle.velocity.xyz += normalize(particle.velocity.xyz) * bassForce * uniforms.deltaTime;
  particle.velocity.xyz += vec3<f32>(0.0, 1.0, 0.0) * midForce * uniforms.deltaTime;
  particle.velocity.xyz += vec3<f32>(1.0, 0.0, 1.0) * highForce * uniforms.deltaTime;
  
  // Update position
  particle.position.xyz += particle.velocity.xyz * uniforms.deltaTime;
  
  // Keep particles within bounds
  let bounds = 5.0 + uniforms.average * 2.0; // Dynamic bounds based on volume
  if (any(abs(particle.position.xyz) > vec3<f32>(bounds))) {
    particle.position.xyz = normalize(particle.position.xyz) * bounds;
    particle.velocity.xyz *= -0.5;
  }
  
  // Update color based on audio frequencies
  particle.color = vec4<f32>(
    uniforms.bass * 1.2,  // Red channel influenced by bass
    uniforms.mid * 0.8,   // Green channel influenced by mids
    uniforms.high,        // Blue channel influenced by highs
    length(particle.velocity.xyz) * 0.5 // Alpha based on velocity
  );
  
  // Write updated particle
  particlesB[index] = particle;
}

// Helper function to convert HSV to RGB
fn hsv2rgb(hsv: vec3<f32>) -> vec3<f32> {
  let h = hsv.x;
  let s = hsv.y;
  let v = hsv.z;
  
  let c = v * s;
  let x = c * (1.0 - abs(fract(h * 6.0) - 0.5) * 2.0);
  let m = v - c;
  
  var rgb: vec3<f32>;
  
  if (h < 1.0/6.0) {
    rgb = vec3<f32>(c, x, 0.0);
  } else if (h < 2.0/6.0) {
    rgb = vec3<f32>(x, c, 0.0);
  } else if (h < 3.0/6.0) {
    rgb = vec3<f32>(0.0, c, x);
  } else if (h < 4.0/6.0) {
    rgb = vec3<f32>(0.0, x, c);
  } else if (h < 5.0/6.0) {
    rgb = vec3<f32>(x, 0.0, c);
  } else {
    rgb = vec3<f32>(c, 0.0, x);
  }
  
  return rgb + m;
}
