import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class VisualizerErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Visualizer error:', error, errorInfo);
  }

  attemptRecovery = () => {
    // Try to recover by resetting state and reinitializing
    this.setState({ hasError: false, error: null });
    // Additional recovery logic
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={this.attemptRecovery}>Try Again</button>
          {/* Show fallback visualization */}
        </div>
      );
    }

    return this.props.children;
  }
} 