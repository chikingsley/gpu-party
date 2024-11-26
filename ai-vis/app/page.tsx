'use client';

import { GPUEngine } from '@/lib/gpu/core';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Controls = dynamic(() => import('@/components/Controls'), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [engine, setEngine] = useState<GPUEngine | null>(null);

  const initGPU = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (!navigator.gpu) {
        throw new Error('WebGPU not supported - Coming soon! For now, please use Chrome Canary or Chrome with WebGPU enabled.');
      }
      const gpuEngine = await GPUEngine.getInstance();
      await gpuEngine.initialize(canvas);
      setEngine(gpuEngine);
      setIsInitialized(true);

    } catch (error) {
      console.error('Failed to initialize GPU:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize visualization');
    }
  };

  useEffect(() => {
    initGPU();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      engine?.destroy();
    };
  }, []);

  const handleStart = async () => {
    if (engine) {
      await engine.initializeAudio();
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Controls />
      
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-red-900 p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-white mb-4">{error}</p>
            <p className="text-gray-300 text-sm">
              We're working on a WebGL fallback for wider browser support.
            </p>
          </div>
        </div>
      )}
      
      {!error && (
        !isInitialized ? (
          <p className="absolute inset-0 flex items-center justify-center text-white">Initializing WebGPU...</p>
        ) : (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Start Audio Visualization
            </button>
          </div>
        )
      )}
    </div>
  );
}
