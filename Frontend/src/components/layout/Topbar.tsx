import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DataStatusChip } from '@/components/common/DataStatusChip';
import { useRouteStore } from '@/store/routeStore';
import { tripService } from '@/services/tripService';
import { RefreshCw, Server } from 'lucide-react';
import { Fuel } from 'lucide-react';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const planResult = useRouteStore((state) => state.planResult);
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    is_live: boolean;
  }>({ status: 'checking...', is_live: false });
  const [fuelPrice, setFuelPrice] = useState<Awaited<ReturnType<typeof tripService.getFuelPrice>> | null>(null);

  useEffect(() => {
    tripService.checkHealth().then(setBackendHealth);
    tripService.getFuelPrice().then(setFuelPrice).catch(() => setFuelPrice(null));
  }, []);

  // Determine title and description based on current pathname
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'System Dashboard',
          description:
            'Operational climate logistics overview, fleet baseline & active corridor telemetry.',
        };
      case '/planner':
        return {
          title: 'Route Optimizer',
          description:
            'Multi-objective freight routing balancing travel duration, fuel drag, and Western Ghats hazard risk.',
        };
      case '/analytics':
        return {
          title: 'Decision Analytics & Explainability',
          description:
            'Pareto efficiency frontier, SHAP feature importance vectors, and departure slot sensitivity.',
        };
      case '/reports':
        return {
          title: 'Carbon & GHG Compliance Audit',
          description:
            'Comprehensive Scope-1 emissions assessment, fuel uncertainty bounds & auditable trip logs.',
        };
      default:
        return {
          title: 'GreenRoute AI Platform',
          description: 'Climate-aware freight route optimization platform.',
        };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <header className="min-h-18 px-4 md:px-6 py-3 bg-[#12231e]/90 backdrop-blur-md border-b border-forest-750/70 flex items-center justify-between gap-3 z-20 sticky top-0">
      {/* Title & Description */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white tracking-tight leading-snug">
          {title}
        </h1>
        <p className="text-xs text-forest-300 hidden md:block">
          {description}
        </p>
      </div>

      {/* Right Controls: Fuel Price, Data Status, Backend Health, Utility */}
      <div className="flex items-center gap-2 md:gap-3">
        {fuelPrice && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30"
            title={`Today's ${fuelPrice.fuel_type} price in ${fuelPrice.city}. Source: ${fuelPrice.source}.`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span className="font-semibold">Diesel</span>
            <span className="font-mono">₹{fuelPrice.price_inr_per_litre.toFixed(2)}/L</span>
            <span className="hidden lg:inline text-[10px] opacity-70">
              {fuelPrice.source === 'live' ? 'LIVE' : fuelPrice.source.toUpperCase()}
            </span>
          </div>
        )}
        {/* Data Status Chip */}
        <DataStatusChip
          status={planResult?.data_status}
          showDetails={true}
        />

        {/* Backend Connectivity Status */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
            backendHealth.is_live
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-forest-850 text-forest-300 border-forest-750'
          }`}
          title={`Backend status: ${backendHealth.status}`}
        >
          {backendHealth.is_live ? (
            <>
              <Server className="w-3 h-3 text-emerald-400" />
              <span className="font-medium text-[11px]">Backend Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-[11px]">System Ready</span>
            </>
          )}
        </div>

        {/* Re-check Health Button */}
        <button
          onClick={() => {
            setBackendHealth({ status: 'checking...', is_live: false });
            tripService.checkHealth().then(setBackendHealth);
          }}
          title="Re-check Backend Service Health"
          className="p-2 rounded-lg bg-forest-850 hover:bg-forest-800 text-forest-300 hover:text-white border border-forest-750 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
