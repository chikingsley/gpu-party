// Import utility functions and structures
#include "utils.wgsl"

// Overridable constants
override WORKGROUP_SIZE: u32 = 64;

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(
    @builtin(global_invocation_id) global_id: vec3<u32>
) {
    let index = global_id.x;
    if (index >= arrayLength(&particles)) {
        return;
    }

    // Load particle data
    var particle = particles[index];

    // Update particle based on audio reactivity
    let bass_influence = uniforms.bass * 0.5;
    let mid_influence = uniforms.mid * 0.3;
    let high_influence = uniforms.high * 0.2;

    // Apply curl noise for organic movement
    let curl = curlNoise(particle.position.xyz * uniforms.curlFreq);
    let audio_velocity = vec3<f32>(
        curl.x * bass_influence,
        curl.y * mid_influence,
        curl.z * high_influence
    );

    // Update velocity with full vector assignment
    particle.velocity = vec4<f32>(
        particle.velocity.xyz * 0.98 + audio_velocity * uniforms.deltaTime,
        particle.velocity.w
    );

    // Update position with full vector assignment
    particle.position = vec4<f32>(
        particle.position.xyz + particle.velocity.xyz * uniforms.speed,
        particle.position.w
    );

    // Keep particles within bounds
    let bounds = 2.0;
    if (any(abs(particle.position.xyz) > vec3<f32>(bounds))) {
        let normalized_pos = normalize(particle.position.xyz);
        particle.position = vec4<f32>(normalized_pos * bounds, particle.position.w);
        particle.velocity = vec4<f32>(
            reflect(particle.velocity.xyz, -normalized_pos),
            particle.velocity.w
        );
    }

    // Update color based on audio
    particle.color = vec4<f32>(
        bass_influence,
        mid_influence,
        high_influence,
        1.0
    );

    // Write back to buffer
    particles[index] = particle;
}
