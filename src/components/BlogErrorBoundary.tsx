import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BlogErrorBoundary caught an error:', error, errorInfo);
    
    // Log to console for debugging
    console.error('Blog system error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <div className="text-orange-500 text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Blog System Error</h2>
            <p className="text-gray-600 mb-4">
              Something went wrong with the blog system. Please try refreshing the page or contact support if the problem persists.
            </p>
            {this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Technical Details
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="font-semibold mb-1">Error:</div>
                  <div>{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="font-semibold mt-2 mb-1">Stack:</div>
                      <div className="text-xs">{this.state.error.stack.split('\n').slice(0, 5).join('\n')}</div>
                    </>
                  )}
                </div>
              </details>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BlogErrorBoundary;
