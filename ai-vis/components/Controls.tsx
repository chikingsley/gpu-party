'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
<<<<<<< HEAD
import { folder, useControls, useCreateStore, LevaStoreProvider } from 'leva';
import type { ControlSettings } from '@/lib/types/controls';
=======
import { folder, useControls, LevaPanel, useCreateStore } from 'leva';
>>>>>>> parent of f88da56 (works now - will try the big push next)

const LevaPanel = dynamic(
  () => import('leva').then(mod => mod.LevaPanel),
  { ssr: false }
);

<<<<<<< HEAD
interface ControlValue<T = unknown> {
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

function ControlPanel({ onSettingsChange }: { onSettingsChange: (settings: ControlSettings) => void }) {
  const [mounted, setMounted] = useState(false);
  const store = useCreateStore();

  const values = useControls({
    particles: folder({
      count: { value: 10000, min: 1000, max: 100000, step: 1000 },
      size: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
      speed: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 }
    }),
    colors: folder({
      primary: { value: '#ffffff' },
      secondary: { value: '#000000' },
      background: { value: '#1a1a1a' }
    }),
    effects: folder({
      bloom: { value: true },
      motionBlur: { value: true }
=======
function ControlPanel() {
  const [currentPreset, setCurrentPreset] = useState<PresetName>('Smooth Sphere');
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 320 });
  const store = useCreateStore();
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
  const controls = {
    'State Colors': folder({
      idle: folder({
        idleColor: { value: '#2f3542' },
        idleBrightness: { value: 0.4, min: 0, max: 1, step: 0.1 },
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
        value: 'both',
        options: ['color', 'brightness', 'both', 'none'],
        label: 'Response Type',
        onChange: (v) => updateVisualizerConfig('audioResponseType', v)
      },
      colorShift: { 
        value: 0.2, 
        min: 0, 
        max: 1, 
        step: 0.1,
        onChange: (v) => updateVisualizerConfig('audioColorShift', v)
      },
      brightnessBoost: { 
        value: 0.3, 
        min: 0, 
        max: 1, 
        step: 0.1,
        onChange: (v) => updateVisualizerConfig('audioBrightnessBoost', v)
      },
      transitionSpeed: { 
        value: 0.3, 
        min: 0.1, 
        max: 1, 
        step: 0.1,
        onChange: (v) => updateVisualizerConfig('audioTransitionSpeed', v)
      }
    }),
    'Shape': folder({
      shapeType: {
        value: presets[currentPreset].shape.shapeType,
        options: ['sphere', 'abstract'],
        label: 'Base Shape',
        onChange: (v) => updateVisualizerConfig('shapeType', v)
      },
      irregularity: {
        value: presets[currentPreset].shape.irregularity,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v) => updateVisualizerConfig('irregularity', v)
      },
      morphSpeed: {
        value: presets[currentPreset].shape.morphSpeed,
        min: 0,
        max: 1,
        step: 0.1,
        onChange: (v) => updateVisualizerConfig('morphSpeed', v)
      },
      rotationType: {
        value: presets[currentPreset].shape.rotationType,
        options: ['static', 'spin', 'wobble', 'flow'],
        onChange: (v) => updateVisualizerConfig('rotationType', v)
      }
>>>>>>> parent of f88da56 (works now - will try the big push next)
    })
  }, { store });

<<<<<<< HEAD
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
=======
  const data = useControls(() => ({
    'Preset': {
      value: currentPreset,
      options: Object.keys(presets),
      onChange: (v) => {
        setCurrentPreset(v as PresetName);
        updateVisualizerConfig('preset', v);
      }
    },
    ...controls
  }), { store });

  const updateVisualizerConfig = useCallback((key: string, value: any) => {
    if (typeof window !== 'undefined') {
      const config = (window as any).visualizerConfig || {};
      (window as any).visualizerConfig = {
        ...config,
        [key]: value
      };
    }
>>>>>>> parent of f88da56 (works now - will try the big push next)
  }, []);

  useEffect(() => {
    if (mounted && values) {
      onSettingsChange(values as ControlSettings);
    }
<<<<<<< HEAD
  }, [mounted, values, onSettingsChange]);
=======
  }, [mounted, currentPreset, data, updateVisualizerConfig]);
>>>>>>> parent of f88da56 (works now - will try the big push next)

  if (!mounted) return null;

  return (
<<<<<<< HEAD
    <div className="fixed right-4 top-4 z-50">
      <LevaStoreProvider store={store}>
        <LevaPanel />
      </LevaStoreProvider>
=======
    <div 
      ref={panelRef}
      className="fixed top-0 right-0 z-50 h-screen"
      style={{ 
        width: dimensions.width,
        minWidth: '280px',
        maxWidth: '400px',
        resize: 'horizontal',
        overflow: 'hidden auto',
        cursor: 'col-resize',
        borderLeft: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <LevaRoot 
        fill
        flat={false}
        titleBar={{
          title: 'Visualization Controls',
          drag: false,
          filter: true
        }}
        store={store}
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
>>>>>>> parent of f88da56 (works now - will try the big push next)
    </div>
  );
}

export function Controls() {
  const handleSettingsChange = useCallback((settings: ControlSettings) => {
    console.log('Settings changed:', settings);
  }, []);

  return <ControlPanel onSettingsChange={handleSettingsChange} />;
}
