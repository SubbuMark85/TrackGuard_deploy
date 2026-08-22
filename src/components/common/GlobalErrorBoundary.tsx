import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TrackGuard Global Error Boundary caught exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#0D1527] border border-red-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Application Exception Caught</h2>
            <p className="text-xs text-slate-300">
              An unhandled runtime error occurred in the TrackGuard dashboard view.
            </p>
            {this.state.error && (
              <div className="bg-[#162036] p-3 rounded-xl text-[11px] font-mono text-red-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
