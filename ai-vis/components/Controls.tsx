'use client';

import { useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted && values) {
      onSettingsChange(values as ControlSettings);
    }
  }, [mounted, values, onSettingsChange]);

  if (!mounted) return null;

  return (
    <div className="fixed right-4 top-4 z-50">
      <LevaStoreProvider store={store}>
        <LevaPanel />
      </LevaStoreProvider>
    </div>
  );
}

export function Controls() {
  const handleSettingsChange = useCallback((settings: ControlSettings) => {
    console.log('Settings changed:', settings);
  }, []);

  return <ControlPanel onSettingsChange={handleSettingsChange} />;
}
