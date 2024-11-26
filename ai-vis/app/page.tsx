'use client';

import { GPUEngine } from '@/lib/gpu/core';
import { initWebGL2Fallback, initWebGL1Fallback, getDetailedErrorMessage } from '@/lib/fallbacks/webgl';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Controls = dynamic(() => import('@/components/Controls').then(mod => mod.Controls), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [engine, setEngine] = useState<GPUEngine | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Initialize GPU engine
  useEffect(() => {
    const initGPU = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        if (!navigator.gpu) {
          const gl = canvas.getContext('webgl2');
          if (gl) {
            await initWebGL2Fallback(gl);
            return;
          }
          const gl1 = canvas.getContext('webgl');
          if (gl1) {
            await initWebGL1Fallback(gl1);
            return;
          }
          throw new Error('No compatible graphics API found');
        }

        const gpuEngine = await GPUEngine.getInstance();
        setEngine(gpuEngine);
        await gpuEngine.initialize(canvas);
        setIsInitialized(true);

      } catch (error) {
        setError(getDetailedErrorMessage(error));
      }
    };

    initGPU();

    return () => {
      engine?.destroy();
    };
  }, []); // Empty dependency array since this should only run once

  // Handle resize
  useEffect(() => {
    if (!engine || !canvasRef.current) return;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        engine.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [engine]); // Only re-run if engine changes

  const handleStart = async () => {
    if (engine) {
      try {
        await engine.initializeAudio();
        setIsAudioInitialized(true);
        setAudioError(null);
      } catch (error) {
        setAudioError(error instanceof Error ? error.message : 'Failed to initialize audio');
      }
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Controls />
      
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          opacity: isInitialized ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-white">Initializing...</div>
        </div>
      )}

      {isInitialized && !isAudioInitialized && !audioError && (
        <button
          onClick={handleStart}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Start Audio
        </button>
      )}

      {audioError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg max-w-md text-center">
          <p className="mb-2">{audioError}</p>
          <button
            onClick={handleStart}
            className="bg-white text-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-red-900 text-white p-4 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Initialization Error</h2>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
