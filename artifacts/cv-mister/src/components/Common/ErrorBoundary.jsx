import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Render Error caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 border-2 border-dashed border-red-200 rounded-xl m-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong in the preview</h2>
          <p className="text-red-600 mb-4 max-w-md">
            The resume renderer encountered a terminal error: <br/>
            <code className="bg-red-100 px-2 py-1 rounded text-sm">{this.state.error?.message}</code>
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Platform
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
