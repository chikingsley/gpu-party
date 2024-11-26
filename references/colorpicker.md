# Leva Color Picker Troubleshooting Guide

## Issue Overview

- **Status**: Active Issue
- **Version**: Leva 0.9.35
- **Environment**: React 18.2.0+
- **Error**: `Cannot read properties of null (reading 'getBoundingClientRect')`

## Quick Fix Solutions

### NPM Projects

```json
{
  "overrides": {
    "leva": {
      "@radix-ui/react-portal": "1.0.2"
    }
  }
}
```

### PNPM Projects

```json
{
  "pnpm": {
    "overrides": {
      "leva>@radix-ui/react-portal": "1.0.2"
    }
  }
}
```

### Yarn Projects

```json
{
  "resolutions": {
    "@radix-ui/react-portal": "1.0.2"
  }
}
```

## Detailed Problem Description

The color picker component fails when clicking the color square, producing different errors in various browsers:

- **Chrome/Edge**: `Uncaught TypeError: Cannot read properties of null (reading 'getBoundingClientRect')`
- **Firefox**: `Uncaught TypeError: wrapperRef.current is null`

## Root Cause

The issue stems from a compatibility problem with `@radix-ui/react-portal` versions above 1.0.2.

## Alternative Solutions

1. Downgrade to Leva 0.9.34
2. Use package overrides (recommended)
3. Wait for official fix

## Testing & Verification

After applying the fix:

1. Install dependencies
2. Clear cache if needed
3. Test color picker functionality
4. Verify no console errors

## Additional Notes

- Issue affects all major bundlers
- Problem is environment-independent
- Fix is temporary until official patch
