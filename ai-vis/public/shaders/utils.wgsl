// Constants
const PI: f32 = 3.1415926538;

// Utility structs
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

// Rotation matrix function
fn rotation3d(axis: vec3<f32>, angle: f32) -> mat4x4<f32> {
    let s = sin(angle);
    let c = cos(angle);
    let oc = 1.0 - c;
    let normalized_axis = normalize(axis);
    
    return mat4x4<f32>(
        vec4<f32>(oc * normalized_axis.x * normalized_axis.x + c,
                  oc * normalized_axis.x * normalized_axis.y - normalized_axis.z * s,
                  oc * normalized_axis.z * normalized_axis.x + normalized_axis.y * s,
                  0.0),
        vec4<f32>(oc * normalized_axis.x * normalized_axis.y + normalized_axis.z * s,
                  oc * normalized_axis.y * normalized_axis.y + c,
                  oc * normalized_axis.y * normalized_axis.z - normalized_axis.x * s,
                  0.0),
        vec4<f32>(oc * normalized_axis.z * normalized_axis.x - normalized_axis.y * s,
                  oc * normalized_axis.y * normalized_axis.z + normalized_axis.x * s,
                  oc * normalized_axis.z * normalized_axis.z + c,
                  0.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0)
    );
}

// Curl noise implementation
fn curlNoise(p: vec3<f32>) -> vec3<f32> {
    let e = vec2<f32>(0.0001, 0.0);
    let dx = vec3<f32>(e.x, 0.0, 0.0);
    let dy = vec3<f32>(0.0, e.x, 0.0);
    let dz = vec3<f32>(0.0, 0.0, e.x);
    
    let p_x0 = noise3d(p - dx);
    let p_x1 = noise3d(p + dx);
    let p_y0 = noise3d(p - dy);
    let p_y1 = noise3d(p + dy);
    let p_z0 = noise3d(p - dz);
    let p_z1 = noise3d(p + dz);
    
    let x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    let y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    let z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    
    return normalize(vec3<f32>(x, y, z) / (2.0 * e.x));
}

// 3D noise function
fn noise3d(p: vec3<f32>) -> vec3<f32> {
    let i = floor(p);
    let f = fract(p);
    
    // Cubic interpolation
    let u = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(
            mix(hash33(i + vec3<f32>(0.0, 0.0, 0.0)), 
                hash33(i + vec3<f32>(1.0, 0.0, 0.0)), u.x),
            mix(hash33(i + vec3<f32>(0.0, 1.0, 0.0)),
                hash33(i + vec3<f32>(1.0, 1.0, 0.0)), u.x),
            u.y),
        mix(
            mix(hash33(i + vec3<f32>(0.0, 0.0, 1.0)),
                hash33(i + vec3<f32>(1.0, 0.0, 1.0)), u.x),
            mix(hash33(i + vec3<f32>(0.0, 1.0, 1.0)),
                hash33(i + vec3<f32>(1.0, 1.0, 1.0)), u.x),
            u.y),
        u.z
    );
}

// Hash function for noise
fn hash33(p: vec3<f32>) -> vec3<f32> {
    var p3 = fract(p * vec3<f32>(.1031, .1030, .0973));
    p3 = p3 + dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}
