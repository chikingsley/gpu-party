# Leva Color Picker Issue Summary

## Issue Overview
- **Title**: Leva 0.9.35 color picker error: Cannot read properties of null (reading 'getBoundingClientRect')
- **Issue Number**: #508
- **Status**: Open
- **Affected Version**: Leva 0.9.35
- **Environment**: React 18.2.0+, React DOM 18.2.0+

## Problem Description
When pressing the color picker colored square in Leva 0.9.35, a JavaScript error occurs. The error manifests differently in various browsers:

### Chrome/Edge Error
```javascript
Uncaught TypeError: Cannot read properties of null (reading 'getBoundingClientRect')
    at leva.esm.js:137:30
```

### Firefox Error
```javascript
Uncaught TypeError: wrapperRef.current is null
    usePopin leva.esm.js:137
```

## Reproduction Steps
1. Create a minimal React application using Leva 0.9.35
2. Implement a basic color control
3. Click on the color picker square in the Leva panel
4. Check browser console for errors

### Minimal Reproduction Code
```javascript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { useControls } from 'leva'

function App() {
    const color = useControls({
        value: 'lime'
    })

    return (
        <div style={{ backgroundColor: color.value }}>
            <h1>Hello, world!</h1>
            <h2>Time is {new Date().toLocaleTimeString('en-US')}.</h2>
        </div>
    )
}

createRoot(document.getElementById('root')).render(<App />)
```

## Workaround Solutions

### NPM Solution
Add the following to `package.json`:
```json
{
  "overrides": {
    "leva": {
      "@radix-ui/react-portal": "1.0.2"
    }
  }
}
```

### PNPM Solution
Add to `package.json`:
```json
{
  "pnpm": {
    "overrides": {
      "leva>@radix-ui/react-portal": "1.0.2"
    }
  }
}
```

### Yarn Solution
Add to `package.json`:
```json
{
  "resolutions": {
    "@radix-ui/react-portal": "1.0.2"
  }
}
```

After adding the override, run the appropriate package manager install command (`npm install`, `pnpm install`, or `yarn`).

## Alternative Solutions
1. Use Leva version 0.9.34 instead
2. Apply the package override to downgrade @radix-ui/react-portal

## Current Status
- Issue remains open
- Multiple users have confirmed the bug
- Temporary workaround available using package overrides
- No official fix released yet

## Related Information
- Issue appears across multiple bundlers (Vite, React-Scripts, R3F-Pack, Webpack)
- Problem occurs in newer CodeSandbox DevBox IDE but not in legacy Sandbox IDE
- The root cause appears to be related to @radix-ui/react-portal version compatibility