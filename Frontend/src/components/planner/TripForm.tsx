import React, { useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import { useOptimizationStore } from '@/store/optimizationStore';
import { usePlan } from '@/hooks/usePlan';
import { LocationAutocomplete } from './LocationAutocomplete';
import { VehicleSelector } from './VehicleSelector';
import {
  ArrowUpDown,
  Sparkles,
  Calendar,
  Clock,
  Weight,
  Compass,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface TripFormProps {
  onSuccess?: () => void;
}

export const TripForm: React.FC<TripFormProps> = ({ onSuccess }) => {
  const {
    origin,
    destination,
    selectedVehicle,
    cargoLoadTons,
    departureTime,
    deadline,
    departureWindowHours,
    whatIfRain,
    setOrigin,
    setDestination,
    setVehicle,
    setCargoLoadTons,
    setDepartureTime,
    setDeadline,
    setDepartureWindowHours,
    setWhatIfRain,
    swapLocations,
    loadDemoScenario,
  } = useTripStore();

  const weights = useOptimizationStore((state) => state.weights);
  const planMutation = usePlan();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!origin) {
      setValidationError('Please specify origin location.');
      return;
    }
    if (!destination) {
      setValidationError('Please specify destination location.');
      return;
    }
    if (cargoLoadTons > selectedVehicle.maxPayloadTons) {
      setValidationError(
        `Cargo load (${cargoLoadTons}t) exceeds vehicle capacity (${selectedVehicle.maxPayloadTons}t).`
      );
      return;
    }

    planMutation.mutate(
      {
        origin,
        destination,
        vehicle_type: selectedVehicle.type,
        cargo_load_tons: cargoLoadTons,
        departure_time: new Date(departureTime).toISOString(),
        deadline: new Date(deadline).toISOString(),
        priority_weights: weights,
        what_if_rain: whatIfRain,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick Demonstration Preset Action */}
      <div className="flex items-center justify-between pb-1 border-b border-forest-750/50">
        <span className="text-[11px] uppercase tracking-wider text-forest-300 font-semibold">
          Corridor Configuration
        </span>
        <button
          type="button"
          onClick={loadDemoScenario}
          className="inline-flex items-center gap-1.5 text-xs text-[#d8993a] hover:text-[#eab055] font-medium transition"
        >
          Load Pune-Mumbai Demo
        </button>
      </div>

      {/* Origin & Destination Autocomplete with Swap Button */}
      <div className="space-y-3 relative">
        <LocationAutocomplete
          label="Origin Dispatch Hub"
          placeholder="e.g. Pune Logistics Hub, Bhosari"
          value={origin}
          onChange={setOrigin}
          iconColor="text-[#3ec99f]"
          required
        />

        {/* Swap Origin/Dest Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={swapLocations}
            title="Swap Origin and Destination"
            className="p-1.5 rounded-full bg-forest-800 hover:bg-forest-750 text-forest-300 hover:text-white border border-forest-700 shadow-sm transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <LocationAutocomplete
          label="Destination Terminal / Port"
          placeholder="e.g. JNPT Container Port, Navi Mumbai"
          value={destination}
          onChange={setDestination}
          iconColor="text-[#2f8a9d]"
          required
        />
      </div>

      {/* Vehicle Preset Selector */}
      <VehicleSelector
        selectedVehicle={selectedVehicle}
        onSelect={setVehicle}
      />

      {/* Cargo Load Slider */}
      <div className="space-y-1.5 p-3 rounded-xl bg-forest-850/80 border border-forest-750/70">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-forest-200 flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-[#d8993a]" />
            Cargo Payload Weight
          </label>
          <span className="font-mono text-white font-bold">
            {cargoLoadTons.toFixed(1)} / {selectedVehicle.maxPayloadTons} t
          </span>
        </div>

        <input
          type="range"
          min="1"
          max={selectedVehicle.maxPayloadTons}
          step="0.5"
          value={cargoLoadTons}
          onChange={(e) => setCargoLoadTons(parseFloat(e.target.value))}
          className="w-full"
        />

        <div className="flex justify-between text-[10px] text-forest-400">
          <span>Light (1.0t)</span>
          <span>
            {((cargoLoadTons / selectedVehicle.maxPayloadTons) * 100).toFixed(0)}% payload
          </span>
          <span>Max GVW ({selectedVehicle.maxPayloadTons}t)</span>
        </div>
      </div>

      {/* Departure Time & Delivery Deadline */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-forest-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-forest-400" />
            Departure Time
          </label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-forest-850/80 border border-forest-750/70 text-xs text-forest-100 focus:outline-none focus:border-[#2f8a9d] transition font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-forest-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-forest-400" />
            Delivery Deadline
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-forest-850/80 border border-forest-750/70 text-xs text-forest-100 focus:outline-none focus:border-[#2f8a9d] transition font-mono"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
        <input
          type="checkbox"
          checked={whatIfRain}
          onChange={(e) => setWhatIfRain(e.target.checked)}
          className="mt-0.5 accent-amber-500"
        />
        <span>
          <strong>What-if rain replay</strong>
          <span className="block text-[10px] text-amber-300/80">
            Backup scenario: apply heavy rain to the route when historical weather is unavailable.
          </span>
        </span>
      </label>

      {/* Departure Window Slider */}
      <div className="space-y-1 p-2.5 rounded-xl bg-forest-850/60 border border-forest-750/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-forest-300 text-[11px]">Departure Flexibility Window</span>
          <span className="font-mono text-forest-200 text-xs">±{departureWindowHours} hrs</span>
        </div>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={departureWindowHours}
          onChange={(e) => setDepartureWindowHours(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Validation or API Error Alert */}
      {(validationError || planMutation.error) && (
        <div className="p-3 rounded-xl bg-greenroute-riskRed/15 border border-greenroute-riskRed/40 text-xs text-[#eff9f5] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-greenroute-riskRed flex-shrink-0 mt-0.5" />
          <p>{validationError || planMutation.error?.message}</p>
        </div>
      )}

      {/* Plan Route Submit Button */}
      <button
        type="submit"
        disabled={planMutation.isPending}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1a5c47] to-[#2f8a9d] hover:from-[#267b5e] hover:to-[#42a7bc] text-white font-semibold text-sm shadow-lg shadow-[#1a5c47]/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {planMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Calculating Multi-Objective Optimum...</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>Plan & Optimize Route</span>
          </>
        )}
      </button>
    </form>
  );
};
