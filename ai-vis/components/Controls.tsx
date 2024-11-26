'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { presets, PresetName } from '@/lib/presets';
import dynamic from 'next/dynamic';
import { folder, useControls, LevaPanel, useCreateStore, LevaStoreProvider } from 'leva';
import { LevaStore, StoreType } from '@/lib/types/leva';
import type { LevaInputs } from 'leva';

const LevaRoot = dynamic(
  () => import('leva').then(mod => mod.Leva),
  { ssr: false }
);

interface ControlValue<T = any> {
  value: T;
  onChange?: (value: T) => void;
  options?: T[];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

type ControlSchema = {
  [key: string]: ControlValue | Record<string, ControlValue>;
};

const isControlValue = (value: any): value is ControlValue => {
  return typeof value === 'object' && 'value' in value;
};

const isControlSchema = (value: any): value is ControlSchema => {
  return typeof value === 'object' && Object.values(value).every(v => 
    isControlValue(v) || isControlSchema(v)
  );
};

// Use type guards when processing controls
const processControls = (schema: ControlSchema) => {
  return Object.entries(schema).reduce((acc, [key, value]) => {
    if (isControlSchema(value)) {
      acc[key] = folder(processControls(value));
    } else if (isControlValue(value)) {
      acc[key] = value;
    }
    return acc;
  }, {} as ControlSchema);
};

// Add type definitions for control values
type AudioResponseType = 'color' | 'brightness' | 'both' | 'none';
type ShapeType = 'sphere' | 'abstract';
type RotationType = 'static' | 'spin' | 'wobble' | 'flow';
type QualityType = 'low' | 'medium' | 'high' | 'auto';

function ControlPanel() {
  const [currentPreset, setCurrentPreset] = useState<PresetName>('Smooth Sphere');
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 320 });
  const store = useCreateStore() as unknown as LevaStore;
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle resize observer
  useEffect(() => {
    if (!panelRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions(prev => ({
          ...prev,
          width: Math.max(280, Math.min(400, width))
        }));
      }
    });
    
    resizeObserver.observe(panelRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Ensure proper mounting sequence
  useEffect(() => {
    let isMounted = false;
    const timer = setTimeout(() => {
      isMounted = true;
      setMounted(true);
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Move store configuration outside of the render conditions
  const controls: ControlSchema = {
    'State Colors': folder({
      idle: folder({
        idleColor: { value: '#2f3542' },
        idleBrightness: { 
          value: 0.4, 
          min: 0, 
          max: 1, 
          step: 0.1,
          onChange: (value: number) => updateVisualizerConfig('idleBrightness', value)
        },
        idlePulseAmount: { value: 0.1, min: 0, max: 0.5, step: 0.05 }
      }),
      listening: folder({
        listeningColor: { value: '#4287f5' },
        listeningBrightness: { value: 0.7, min: 0, max: 1, step: 0.1 },
        listeningPulseSpeed: { value: 0.3, min: 0, max: 1, step: 0.1 }
      }),
      speaking: folder({
        speakingColor: { value: '#f542e6' },
        speakingBrightness: { value: 0.8, min: 0, max: 1, step: 0.1 },
        speakingPulseSpeed: { value: 0.5, min: 0, max: 1, step: 0.1 }
      }),
      thinking: folder({
        thinkingColor: { value: '#42f5a7' },
        thinkingBrightness: { value: 0.6, min: 0, max: 1, step: 0.1 },
        thinkingPulseSpeed: { value: 0.2, min: 0, max: 1, step: 0.1 }
      }),
      active: folder({
        activeColor: { value: '#f5f542' },
        activeBrightness: { value: 0.9, min: 0, max: 1, step: 0.1 },
        activePulseSpeed: { value: 0.7, min: 0, max: 1, step: 0.1 }
      })
    }),
    'Audio Response': folder({
      responseType: {
        value: 'both' as AudioResponseType,
        options: ['color', 'brightness', 'both', 'none'],
        label: 'Response Type',
        onChange: (v: AudioResponseType) => updateVisualizerConfig('audioResponseType', v)
      },
      colorShift: { 
        value: 0.2, 
        min: 0, 
        max: 1, 
        step: 0.1,
        onChange: (v: number) => updateVisualizerConfig('audioColorShift', v)
      },
      brightnessBoost: { 
        value: 0.3, 
        min: 0, 
        max: 1, 
        step: 0.1,
        onChange: (v: number) => updateVisualizerConfig('audioBrightnessBoost', v)
      },
      transitionSpeed: { 
        value: 0.3, 
        min: 0.1, 
        max: 1, 
        step: 0.1,
        onChange: (v: number) => updateVisualizerConfig('audioTransitionSpeed', v)
      }
    }),
    'Shape': folder({
      shapeType: {
        value: presets[currentPreset].shape.shapeType as ShapeType,
        options: ['sphere', 'abstract'],
        label: 'Base Shape',
        onChange: (v: ShapeType) => updateVisualizerConfig('shapeType', v)
      },
      irregularity: {
        value: presets[currentPreset].shape.irregularity,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v: number) => updateVisualizerConfig('irregularity', v)
      },
      morphSpeed: {
        value: presets[currentPreset].shape.morphSpeed,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v: number) => updateVisualizerConfig('morphSpeed', v)
      },
      rotationType: {
        value: presets[currentPreset].shape.rotationType as RotationType,
        options: ['static', 'spin', 'wobble', 'flow'],
        onChange: (v: RotationType) => updateVisualizerConfig('rotationType', v)
      }
    }),
    'Performance': folder({
      quality: {
        value: 'auto' as QualityType,
        options: ['low', 'medium', 'high', 'auto'],
        onChange: (v: QualityType) => updateVisualizerConfig('quality', v)
      },
      antialiasing: {
        value: true,
        onChange: (v: boolean) => updateVisualizerConfig('antialiasing', v)
      },
      particleCount: {
        value: 1000,
        min: 100,
        max: 10000,
        step: 100,
        onChange: (v: number) => updateVisualizerConfig('particleCount', v)
      }
    })
  };

  const processedControls = processControls(controls);

  const data = useControls(
    () => ({
      'Preset': {
        value: currentPreset,
        options: Object.keys(presets),
        onChange: (v: string) => {
          setCurrentPreset(v as PresetName);
          updateVisualizerConfig('preset', v);
        }
      },
      ...processedControls
    }),
    { store: store as any }
  );

  const updateVisualizerConfig = useCallback((key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      const config = (window as any).visualizerConfig || {};
      (window as any).visualizerConfig = {
        ...config,
        [key]: value
      };
    }
  }, []);

  useEffect(() => {
    if (mounted && data) {
      updateVisualizerConfig('preset', currentPreset);
      updateVisualizerConfig('controls', data);
    }
  }, [mounted, currentPreset, data, updateVisualizerConfig]);

  // Add presets management
  const presetManager = {
    save: (name: string) => {
      const currentSettings = (store as any).getData();
      localStorage.setItem(`preset_${name}`, JSON.stringify(currentSettings));
    },
    load: (name: string) => {
      const settings = localStorage.getItem(`preset_${name}`);
      if (settings) {
        const data = JSON.parse(settings);
        Object.entries(data).forEach(([path, value]) => {
          (store as any).setValueAtPath(path.split('.'), value, true);
        });
      }
    }
  };

  // Add more advanced controls
  const advancedControls = {
    'Performance': folder({
      quality: {
        value: 'auto',
        options: ['low', 'medium', 'high', 'auto'],
        onChange: (v: QualityType) => updateVisualizerConfig('quality', v)
      },
      antialiasing: {
        value: true,
        onChange: (v: boolean) => updateVisualizerConfig('antialiasing', v)
      },
      particleCount: {
        value: 1000,
        min: 100,
        max: 10000,
        step: 100,
        onChange: (v: number) => updateVisualizerConfig('particleCount', v)
      }
    })
  };

  if (!mounted) return null;

  return (
    <LevaStoreProvider store={store as any}>
      <LevaPanel 
        fill
        flat={false}
        titleBar={{
          title: 'Visualization Controls',
          drag: false,
          filter: true
        }}
        theme={{
          sizes: {
            rootWidth: '100%',
            controlWidth: '100%'
          },
          space: {
            sm: '6px',
            md: '10px',
            rowGap: '7px',
            colGap: '7px'
          },
          radii: {
            xs: '2px',
            sm: '3px',
            lg: '4px'
          }
        }}
      />
    </LevaStoreProvider>
  );
}

export default function Controls() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ControlPanel />;
}
