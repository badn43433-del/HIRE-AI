/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "An unexpected interface error occurred.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("HireShield AI ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-3xl p-7 text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-rose-300">Application Recovery</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
