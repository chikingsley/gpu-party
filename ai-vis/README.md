# AI State Visualization

A real-time WebGPU-powered visualization system for AI state and interactions. This project provides a dynamic, GPU-accelerated visual representation of AI states including listening, thinking, speaking, and processing.

## Features

- Real-time WebGPU-based particle system
- Dynamic state transitions with smooth animations
- Audio-reactive visualization
- Customizable presets and controls
- Fallback support for WebGL2 and WebGL
- Performance optimization with automatic quality adjustments

## Demo

[Add demo video/gif here]

## Requirements

- Modern browser with WebGPU support (Chrome Canary or Chrome with WebGPU flag enabled)
- Node.js 18+ and npm/yarn/pnpm

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Start the development server
2. Click "Start Audio Visualization" to begin
3. Use the control panel to adjust:
   - State Colors
   - Audio Response
   - Shape Properties
   - Performance Settings

## Controls

The visualization can be customized using the control panel:

- **State Colors**: Customize colors and animations for different AI states
  - Idle
  - Listening
  - Speaking
  - Thinking
  - Active

- **Audio Response**: Adjust how the visualization reacts to audio
  - Response Type (color/brightness/both)
  - Color Shift
  - Brightness Boost
  - Transition Speed

- **Shape**: Modify the base visualization
  - Shape Type (sphere/abstract)
  - Irregularity
  - Morph Speed
  - Rotation Type

- **Performance**: Fine-tune rendering quality
  - Quality Level
  - Antialiasing
  - Particle Count

## Browser Support

- Primary: Chromium-based browsers with WebGPU enabled
- Fallback: Browsers with WebGL2/WebGL support
- For WebGPU, enable `chrome://flags/#enable-unsafe-webgpu`

## Development

The project uses:

- Next.js for the framework
- WebGPU for primary rendering
- Leva for controls
- WGSL for shaders
- TypeScript for type safety

## License

[Add license information]
