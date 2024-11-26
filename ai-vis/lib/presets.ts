export const presets = {
  'Smooth Swirl': {
    motion: {
      speed: 0.3,
      swirlIntensity: 0.8,
      flowSpeed: 0.15,
      cohesion: 0.9,
      turbulence: 0.1
    },
    audio: {
      bassResponse: 0.4,
      midResponse: 0.3,
      highResponse: 0.2,
      smoothing: 0.9,
      pulseStrength: 0.4
    },
    appearance: {
      particleSize: 0.02,
      glowIntensity: 0.6,
      trailLength: 0.9,
      colorBlending: 0.8
    },
    shape: {
      attractorStrength: 0.7,
      shapeType: 'sphere',
      morphSpeed: 0.2
    }
  },
  'Dynamic Cube': {
    motion: {
      speed: 0.6,
      swirlIntensity: 0.4,
      flowSpeed: 0.3,
      cohesion: 0.5,
      turbulence: 0.3
    },
    audio: {
      bassResponse: 0.8,
      midResponse: 0.6,
      highResponse: 0.4,
      smoothing: 0.7,
      pulseStrength: 0.7
    },
    appearance: {
      particleSize: 0.025,
      glowIntensity: 0.5,
      trailLength: 0.7,
      colorBlending: 0.6
    },
    shape: {
      attractorStrength: 0.8,
      shapeType: 'cube',
      morphSpeed: 0.4
    }
  },
  'Spiral Galaxy': {
    motion: {
      speed: 0.4,
      swirlIntensity: 0.9,
      flowSpeed: 0.25,
      cohesion: 0.8,
      turbulence: 0.15
    },
    audio: {
      bassResponse: 0.6,
      midResponse: 0.5,
      highResponse: 0.3,
      smoothing: 0.85,
      pulseStrength: 0.6
    },
    appearance: {
      particleSize: 0.015,
      glowIntensity: 0.7,
      trailLength: 0.95,
      colorBlending: 0.9
    },
    shape: {
      attractorStrength: 0.6,
      shapeType: 'spiral',
      morphSpeed: 0.3
    }
  },
  'Bass Pulse': {
    motion: {
      speed: 0.5,
      swirlIntensity: 0.3,
      flowSpeed: 0.4,
      cohesion: 0.6,
      turbulence: 0.4
    },
    audio: {
      bassResponse: 1.0,
      midResponse: 0.4,
      highResponse: 0.2,
      smoothing: 0.6,
      pulseStrength: 0.9
    },
    appearance: {
      particleSize: 0.03,
      glowIntensity: 0.8,
      trailLength: 0.8,
      colorBlending: 0.7
    },
    shape: {
      attractorStrength: 0.9,
      shapeType: 'sphere',
      morphSpeed: 0.5
    }
  },
  'Ethereal Flow': {
    motion: {
      speed: 0.2,
      swirlIntensity: 0.6,
      flowSpeed: 0.1,
      cohesion: 0.95,
      turbulence: 0.05
    },
    audio: {
      bassResponse: 0.3,
      midResponse: 0.4,
      highResponse: 0.5,
      smoothing: 0.95,
      pulseStrength: 0.3
    },
    appearance: {
      particleSize: 0.01,
      glowIntensity: 0.9,
      trailLength: 0.98,
      colorBlending: 0.95
    },
    shape: {
      attractorStrength: 0.4,
      shapeType: 'torus',
      morphSpeed: 0.15
    }
  },
  'Smooth Sphere': {
    shape: {
      shapeType: 'sphere',
      irregularity: 0.1,
      morphSpeed: 0.1,
      rotationType: 'spin'
    },
    motion: {
      speed: 0.3,
      swirlIntensity: 0.2,
      flowSpeed: 0.4,
      cohesion: 0.9,
      turbulence: 0.1
    },
    appearance: {
      particleSize: 0.02,
      glowIntensity: 0.5,
      trailLength: 0.8,
      particleDensity: 0.8
    }
  },
  'Irregular Sphere': {
    shape: {
      shapeType: 'sphere',
      irregularity: 0.4,
      morphSpeed: 0.2,
      rotationType: 'wobble'
    },
    motion: {
      speed: 0.4,
      swirlIntensity: 0.3,
      flowSpeed: 0.5,
      cohesion: 0.7,
      turbulence: 0.3
    },
    appearance: {
      particleSize: 0.02,
      glowIntensity: 0.6,
      trailLength: 0.7,
      particleDensity: 0.7
    }
  },
  'Swirling Sphere': {
    shape: {
      shapeType: 'sphere',
      irregularity: 0.2,
      morphSpeed: 0.15,
      rotationType: 'flow'
    },
    motion: {
      speed: 0.5,
      swirlIntensity: 0.6,
      flowSpeed: 0.7,
      cohesion: 0.8,
      turbulence: 0.2
    },
    appearance: {
      particleSize: 0.02,
      glowIntensity: 0.7,
      trailLength: 0.85,
      particleDensity: 0.75
    }
  },
  'Abstract Form': {
    shape: {
      shapeType: 'abstract',
      irregularity: 0.6,
      morphSpeed: 0.1,
      rotationType: 'static'
    },
    motion: {
      speed: 0.2,
      swirlIntensity: 0.2,
      flowSpeed: 0.3,
      cohesion: 0.9,
      turbulence: 0.15
    },
    appearance: {
      particleSize: 0.02,
      glowIntensity: 0.5,
      trailLength: 0.7,
      particleDensity: 0.85
    }
  }
} as const;

export type PresetName = keyof typeof presets;

export interface AIState {
  isListening: boolean;
  isSpeaking: boolean;
  mood: 'neutral' | 'active' | 'thinking' | 'responding';
}

export const aiStateColors = {
  listening: '#4287f5',  // Blue
  speaking: '#f542e6',   // Pink
  thinking: '#42f5a7',   // Mint
  neutral: '#f5f542'     // Yellow
};
