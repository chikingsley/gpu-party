'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { folder, useControls, useCreateStore, LevaStoreProvider } from 'leva';
import type { ControlSettings } from '@/lib/types/controls';

const LevaPanel = dynamic(
  () => import('leva').then(mod => mod.LevaPanel),
  { ssr: false }
);

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
  const panelRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 320 });

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
    })
  }, { store });

  // Effect to handle settings changes
  useEffect(() => {
    if (mounted && onSettingsChange) {
      onSettingsChange(values as ControlSettings);
    }
  }, [values, mounted, onSettingsChange]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <div ref={panelRef}>
      <LevaStoreProvider store={store}>
        <LevaPanel />
      </LevaStoreProvider>
    </div>
  );
}

export { ControlPanel as Controls };
