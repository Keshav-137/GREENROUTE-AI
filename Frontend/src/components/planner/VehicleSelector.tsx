import React from 'react';
import { VehiclePreset } from '@/types';
import { VEHICLE_PRESETS } from '@/utils/constants';
import { Truck, Fuel, Gauge, Weight } from 'lucide-react';

interface VehicleSelectorProps {
  selectedVehicle: VehiclePreset;
  onSelect: (vehicle: VehiclePreset) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-forest-200">
          Commercial Freight Vehicle
        </label>
        <span className="text-[11px] text-[#2f8a9d] font-medium">
          {selectedVehicle.categoryLabel}
        </span>
      </div>

      {/* Vehicle Grid Selectors */}
      <div className="grid grid-cols-2 gap-2">
        {VEHICLE_PRESETS.map((v) => {
          const isSelected = selectedVehicle.id === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={`p-2.5 rounded-xl text-left border transition-all relative ${
                isSelected
                  ? 'bg-[#1a5c47]/30 border-[#2f8a9d] shadow-sm shadow-[#2f8a9d]/20 text-white'
                  : 'bg-forest-850/60 border-forest-750/60 text-forest-300 hover:border-forest-600 hover:bg-forest-850'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Truck
                  className={`w-4 h-4 flex-shrink-0 ${
                    isSelected ? 'text-[#3ec99f]' : 'text-forest-400'
                  }`}
                />
                <span className="text-xs font-semibold truncate leading-tight">
                  {v.name.split(' (')[0]}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-forest-300 pt-1 border-t border-forest-750/40">
                <span>Max {v.maxPayloadTons}t</span>
                <span className="font-mono text-forest-200">
                  {v.fuelType}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Vehicle Spec Banner */}
      <div className="p-3 rounded-xl bg-forest-850/80 border border-forest-750/70 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-forest-100 truncate">
            {selectedVehicle.name}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-forest-800 text-forest-200 font-mono">
            GVW: {(selectedVehicle.emptyWeightTons + selectedVehicle.maxPayloadTons).toFixed(1)}t
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] text-forest-300">
          <div className="flex items-center gap-1">
            <Weight className="w-3.5 h-3.5 text-forest-400" />
            <span>Pay: <strong>{selectedVehicle.maxPayloadTons}t</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-forest-400" />
            <span>Base: <strong>{selectedVehicle.baseConsumptionRate}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-forest-400" />
            <span>EF: <strong>{selectedVehicle.emissionFactorKgPerUnit} kg/L</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

