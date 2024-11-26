export interface ParticleSettings {
  count: number;
  size: number;
  speed: number;
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  background: string;
}

export interface EffectSettings {
  bloom: boolean;
  motionBlur: boolean;
}

export interface ControlSettings {
  particles: ParticleSettings;
  colors: ColorSettings;
  effects: EffectSettings;
}

export type PresetName = 'Smooth Sphere' | 'Abstract Flow' | 'Energetic Burst' | 'Calm Waves';

export type AudioResponseType = 'color' | 'brightness' | 'both' | 'none';
export type ShapeType = 'sphere' | 'abstract';
export type RotationType = 'static' | 'spin' | 'wobble' | 'flow';
export type QualityType = 'low' | 'medium' | 'high' | 'auto';
