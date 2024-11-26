'use client';

import { useControls, folder } from 'leva';
import { presets } from '../lib/presets';

export function Controls() {
  const { preset } = useControls({
    preset: {
      options: Object.keys(presets),
      value: 'Smooth Swirl',
      label: 'Visualization Preset'
    }
  });

  const values = useControls(
    {
      colors: folder({
        baseColor: { value: '#4287f5', label: 'Primary Color' },
        activeColor: { value: '#f542e6', label: 'Active Color' },
        colorMode: {
          value: 'blend',
          options: ['blend', 'flash', 'pulse', 'rainbow'],
          label: 'Color Mode'
        },
        colorIntensity: {
          value: 0.7,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Color Intensity'
        }
      }),
      motion: folder({
        speed: {
          value: 0.5,
          min: 0,
          max: 2,
          step: 0.1,
        },
        swirlIntensity: {
          value: 0.3,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Swirl Intensity'
        },
        flowSpeed: {
          value: 0.2,
          min: 0,
          max: 1,
          step: 0.05,
          label: 'Flow Speed'
        },
        cohesion: {
          value: 0.7,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Group Cohesion'
        },
        turbulence: {
          value: 0.2,
          min: 0,
          max: 1,
          step: 0.1,
        },
        rotationSpeed: {
          value: 0,
          min: -1,
          max: 1,
          step: 0.1,
          label: 'Rotation Speed'
        }
      }),
      audio: folder({
        bassResponse: {
          value: 0.6,
          min: 0,
          max: 2,
          step: 0.1,
          label: 'Bass Response'
        },
        midResponse: {
          value: 0.4,
          min: 0,
          max: 2,
          step: 0.1,
          label: 'Mid Response'
        },
        highResponse: {
          value: 0.3,
          min: 0,
          max: 2,
          step: 0.1,
          label: 'High Response'
        },
        smoothing: {
          value: 0.8,
          min: 0,
          max: 0.95,
          step: 0.05,
          label: 'Audio Smoothing'
        },
        pulseStrength: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Pulse Strength'
        }
      }),
      appearance: folder({
        particleSize: {
          value: 0.03,
          min: 0.001,
          max: 0.1,
          step: 0.001,
        },
        glowIntensity: {
          value: 0.4,
          min: 0,
          max: 1,
          step: 0.1,
        },
        trailLength: {
          value: 0.8,
          min: 0,
          max: 0.99,
          step: 0.01,
          label: 'Trail Length'
        },
        colorBlending: {
          value: 0.7,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Color Blending'
        }
      }),
      shape: folder({
        shapeType: {
          value: 'sphere',
          options: ['sphere', 'cube', 'torus', 'spiral'],
          label: 'Base Shape'
        },
        attractorStrength: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Attractor Strength'
        },
        morphSpeed: {
          value: 0.3,
          min: 0,
          max: 1,
          step: 0.1,
          label: 'Morph Speed'
        },
        rotationType: {
          value: 'none',
          options: ['none', 'spin', 'wobble', 'chaos'],
          label: 'Rotation Type'
        }
      }),
      behavior: folder({
        startState: {
          value: 'normal',
          options: ['dim', 'bright', 'scattered', 'compact'],
          label: 'Start State'
        },
        activeState: {
          value: 'energetic',
          options: ['energetic', 'calm', 'chaotic', 'flowing'],
          label: 'Active State'
        }
      })
    },
    {
      value: presets[preset]
    }
  );

  // Make values globally available
  (window as any).visualizerConfig = values;

  return null;
}
