export interface ShapeConfig {
  attractorStrength: number;
  shapeType: string;
  morphSpeed: number;
  irregularity?: number;
  rotationType?: 'static' | 'spin' | 'wobble' | 'flow';
}

export const presets = {
  'Smooth Sphere': {
    shape: {
      attractorStrength: 0.7,
      shapeType: 'sphere',
      morphSpeed: 0.2,
      irregularity: 0.3,
      rotationType: 'spin'
    }
  }
  // ... other presets
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
