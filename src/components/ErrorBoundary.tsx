import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="max-w-md w-full space-y-8 p-8 bg-base-100 rounded-lg shadow-xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-error mb-4">Something went wrong</h2>
              <p className="text-sm opacity-70 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 