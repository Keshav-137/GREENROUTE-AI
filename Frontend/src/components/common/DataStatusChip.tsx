import React from 'react';
import { DataStatus } from '@/types';
import { Activity, ShieldAlert } from 'lucide-react';

interface DataStatusChipProps {
  status?: DataStatus | null;
  className?: string;
  showDetails?: boolean;
}

export const DataStatusChip: React.FC<DataStatusChipProps> = ({
  status,
  className = '',
  showDetails = false,
}) => {
  const isMock = status ? status.is_mock : import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Do not display the demo mode badge
  if (isMock) {
    return null;
  }

  const routesStatus = status?.routes || 'live';
  const weatherStatus = status?.weather || 'live';
  const fuelModel = status?.fuel_model || 'calibrated';

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium ${className}`}>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
        <span className="font-semibold uppercase tracking-wider text-[10px]">Live Connected</span>
        <span className="text-forest-400">|</span>
        <span className="text-forest-300">
          Routes: {routesStatus} · Weather: {weatherStatus} · Model: {fuelModel}
        </span>
      </div>

      {showDetails && (
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-forest-300">
          <ShieldAlert className="w-3 h-3 text-forest-400" />
          <span>Real-world physics calibrated</span>
        </div>
      )}
    </div>
  );
};

