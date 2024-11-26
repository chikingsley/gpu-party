# Leva Input Types Guide

## Basic Inputs

### Number

```typescript
const { value } = useControls({
  value: 4,
  // or with options
  value: {
    value: 4,
    min: 0,
    max: 10,
    step: 0.1
  }
})
```

**Features**:

- Arrow key controls (±1)
- Modifier keys: Alt (±0.1), Shift (±10)
- Drag label for value changes
- Smart step calculation

### Range Slider

```typescript
const { value } = useControls({
  value: {
    value: 4,
    min: 0,
    max: 10,
    step: 1
  }
})
```

### Color

```typescript
const { color } = useControls({
  // Hex format
  color: '#ff0000',
  // RGB(A) format
  color: { r: 255, g: 0, b: 0, a: 1 }
})
```

### Boolean Toggle

```typescript
const { enabled } = useControls({
  enabled: true
})
```

## Advanced Inputs

### Vector2

```typescript
const { position } = useControls({
  // Object notation
  position: { x: 0, y: 0 },
  // Array notation
  position: [0, 0],
  // With options
  position: {
    value: { x: 0, y: 0 },
    joystick: 'invertY',
    step: 0.1
  }
})
```

### Vector3

```typescript
const { position } = useControls({
  position: {
    x: 0,
    y: 0,
    z: 0,
    step: 0.1
  }
})
```

### Interval

```typescript
const { range } = useControls({
  range: {
    min: 0,
    max: 100,
    value: [25, 75]
  }
})
```

## Best Practices

1. **Type Safety**:

```typescript
interface Controls {
  value: number
  color: string
  enabled: boolean
}

const controls = useControls<Controls>({...})
```

2. **Grouping**:

```typescript
const controls = useControls({
  'Group Name': folder({
    value: 0,
    color: '#ff0000'
  })
})
```

3. **Performance**:

- Use `transient` for frequently changing values
- Group related controls
- Consider using presets for complex configurations
