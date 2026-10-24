import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="w-full max-w-2xl bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">
                  Uygulama Hatası Yakalandı
                </h1>
                <p className="text-xs text-slate-400">
                  Beklenmeyen bir kod hatası oluştu. Beyaz sayfa oluşması engellendi.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left overflow-hidden">
              <div className="text-xs font-mono text-rose-300 font-bold mb-1 break-words">
                {this.state.error?.toString() || 'Bilinmeyen Hata'}
              </div>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-slate-400 font-mono overflow-x-auto max-h-48 p-2 bg-slate-900/60 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sayfayı Yenile</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Yerel önbellek verilerini temizleyip sayfayı baştan başlatır"
              >
                <Trash2 className="w-4 h-4" />
                <span>Önbelleği Sıfırla</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
