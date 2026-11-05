import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onEnableDemo?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Communication Error',
  message,
  onRetry,
  onEnableDemo,
  className = '',
}) => {
  return (
    <div
      className={`p-6 rounded-xl bg-forest-850/90 border border-greenroute-riskRed/40 text-center space-y-4 shadow-lg ${className}`}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-greenroute-riskRed/10 border border-greenroute-riskRed/30 flex items-center justify-center text-greenroute-riskRedLight">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-forest-100">{title}</h3>
        <p className="text-sm text-forest-300 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-750 text-forest-100 text-xs font-medium border border-forest-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Request
          </button>
        )}

        {onEnableDemo && (
          <button
            onClick={onEnableDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/40 transition"
          >
            Switch to Demo Mode
          </button>
        )}
      </div>
    </div>
  );
};

