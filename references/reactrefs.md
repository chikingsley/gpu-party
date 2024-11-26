# React Refs Guide: Referencing Values and DOM Manipulation

## Introduction to Refs

Refs provide a way to "remember" information in React components without triggering re-renders, and to access DOM elements directly. They serve as an "escape hatch" from React's typical data flow.

## Working with Refs

### Adding a Ref to Your Component

```javascript
import { useRef } from 'react';

function MyComponent() {
  const ref = useRef(0);
  // ref.current = 0 initially
  
  return (
    // Your JSX here
  );
}
```

### Understanding Ref Structure

A ref is an object with a single mutable `current` property:
```javascript
{ 
  current: initialValue
}
```

### Key Characteristics of Refs vs State

| Feature | Refs | State |
|---------|------|-------|
| Creation | `useRef(initialValue)` | `useState(initialValue)` |
| Updates | Doesn't trigger re-render | Triggers re-render |
| Mutability | Mutable - modify `current` directly | Immutable - must use setter function |
| Access Timing | Shouldn't read/write during rendering | Can read anytime |
| Update Timing | Updates immediately | Updates after re-render |

## DOM Manipulation with Refs

### Getting a Reference to DOM Elements

1. Import useRef:
```javascript
import { useRef } from 'react';
```

2. Create the ref:
```javascript
const myRef = useRef(null);
```

3. Attach to DOM element:
```javascript
<div ref={myRef}>Content</div>
```

### Common Use Cases

#### 1. Focus Management

```javascript
function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </>
  );
}
```

#### 2. Scroll Control

```javascript
function ScrollExample() {
  const elementRef = useRef(null);

  function handleScroll() {
    elementRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  return (
    <div ref={elementRef}>
      {/* Content */}
    </div>
  );
}
```

### Working with Other Components' DOM Nodes

To access DOM nodes of custom components, you need to use `forwardRef`:

```javascript
import { forwardRef, useRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />;
});

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
    </>
  );
}
```

## Best Practices

### When to Use Refs

Refs are ideal for:
- Storing timeout IDs
- Storing and manipulating DOM elements
- Storing objects that don't affect rendering
- Managing focus, text selection, or media playback
- Integrating with third-party DOM libraries

### Guidelines for Safe Ref Usage

1. **Avoid During Render**
   - Don't read or write `ref.current` during rendering
   - Exception: One-time initialization like `if (!ref.current) ref.current = new Thing()`

2. **DOM Manipulation Safety**
   - Avoid modifying DOM nodes managed by React
   - Safe to modify parts React doesn't update
   - Focus on non-destructive actions (focus, scroll, etc.)

3. **Timing Considerations**
   - React sets `ref.current` during the commit phase
   - Initially `null` during first render
   - Set to `null` before DOM updates
   - Updated to DOM nodes after updates

### Example: Building a Stopwatch

```javascript
import { useState, useRef } from 'react';

export default function Stopwatch() {
  const [startTime, setStartTime] = useState(null);
  const [now, setNow] = useState(null);
  const intervalRef = useRef(null);

  function handleStart() {
    setStartTime(Date.now());
    setNow(Date.now());

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  }

  function handleStop() {
    clearInterval(intervalRef.current);
  }

  let secondsPassed = 0;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }

  return (
    <>
      <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </>
  );
}
```

## Common Pitfalls and Solutions

1. **Component Not Re-rendering with Ref Updates**
   ```javascript
   // ❌ Won't update display
   countRef.current = countRef.current + 1;

   // ✅ Use state for values that should trigger re-renders
   setCount(count + 1);
   ```

2. **Accessing Refs Too Early**
   ```javascript
   // ❌ May be null during first render
   useEffect(() => {
     myRef.current.focus();
   }, []); // Runs too early

   // ✅ Check for existence first
   useEffect(() => {
     if (myRef.current) {
       myRef.current.focus();
     }
   }, []);
   ```

## React Refs and Leva Panel Solution

### Issue
The `getBoundingClientRect` error occurs when Leva tries to measure DOM elements before they're fully mounted in React.

### Solution

1. Use React refs to ensure DOM access:
```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [dimensions, setDimensions] = useState({ width: 320, height: '100%' });

useEffect(() => {
  if (!containerRef.current) return;
  
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    setDimensions({ width, height: `${height}px` });
  });
  
  resizeObserver.observe(containerRef.current);
  return () => resizeObserver.disconnect();
}, []);
```

2. Proper mounting sequence:
```tsx
const [isMounted, setIsMounted] = useState(false);
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  setIsMounted(true);
  // Wait for next frame to ensure DOM is ready
  requestAnimationFrame(() => {
    setIsReady(true);
  });
  return () => setIsReady(false);
}, []);
```

3. Responsive panel implementation:
```tsx
<div ref={containerRef} className="fixed top-0 right-0 z-50 h-screen">
  {isReady && (
    <LevaRoot
      fill
      titleBar={{
        title: 'Visualization Controls',
        drag: true,
        filter: false
      }}
      theme={{
        sizes: {
          rootWidth: dimensions.width,
          controlWidth: '100%'
        },
        space: {
          rowGap: 4
        }
      }}
    />
  )}
</div>
```

4. Resizable panel:
```css
.leva-container {
  resize: horizontal;
  overflow: auto;
  min-width: 280px;
  max-width: 500px;
}
```

### Implementation Steps

1. Add refs and state for dimensions
2. Implement ResizeObserver for responsive sizing
3. Use proper mounting sequence
4. Add CSS for resizable panel
5. Ensure panel stays within viewport bounds

### Benefits

- Prevents getBoundingClientRect errors
- Makes panel responsive to window size
- Allows user resizing
- Maintains proper mounting sequence
- Improves overall stability

## Conclusion

Refs are powerful tools for handling side effects and DOM manipulation in React, but should be used sparingly. They're best suited for non-rendering operations and direct DOM interactions that can't be achieved through React's standard rendering flow.