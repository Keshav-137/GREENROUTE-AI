import { create } from 'zustand';
import { LocationItem, VehiclePreset } from '@/types';
import { VEHICLE_PRESETS, COMMON_LOCATIONS } from '@/utils/constants';

interface TripState {
  origin: LocationItem | null;
  destination: LocationItem | null;
  selectedVehicle: VehiclePreset;
  cargoLoadTons: number;
  departureTime: string;
  deadline: string;
  departureWindowHours: number;
  whatIfRain: boolean;

  setOrigin: (origin: LocationItem | null) => void;
  setDestination: (dest: LocationItem | null) => void;
  setVehicle: (vehicle: VehiclePreset) => void;
  setCargoLoadTons: (tons: number) => void;
  setDepartureTime: (time: string) => void;
  setDeadline: (deadline: string) => void;
  setDepartureWindowHours: (hours: number) => void;
  setWhatIfRain: (enabled: boolean) => void;
  swapLocations: () => void;
  loadDemoScenario: () => void;
  resetTrip: () => void;
}

const getDefaultDepartureTime = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
};

const getDefaultDeadline = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 6);
  return d.toISOString().slice(0, 16);
};

export const useTripStore = create<TripState>((set, get) => ({
  origin: COMMON_LOCATIONS[0],
  destination: COMMON_LOCATIONS[1],
  selectedVehicle: VEHICLE_PRESETS[0],
  cargoLoadTons: 18.5,
  departureTime: getDefaultDepartureTime(),
  deadline: getDefaultDeadline(),
  departureWindowHours: 4,
  whatIfRain: false,

  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setVehicle: (selectedVehicle) => {
    // Clamp cargo load if it exceeds new vehicle payload
    const currentCargo = get().cargoLoadTons;
    const clampedCargo = Math.min(currentCargo, selectedVehicle.maxPayloadTons);
    set({ selectedVehicle, cargoLoadTons: clampedCargo });
  },
  setCargoLoadTons: (cargoLoadTons) => set({ cargoLoadTons }),
  setDepartureTime: (departureTime) => set({ departureTime }),
  setDeadline: (deadline) => set({ deadline }),
  setDepartureWindowHours: (departureWindowHours) => set({ departureWindowHours }),
  setWhatIfRain: (whatIfRain) => set({ whatIfRain }),

  swapLocations: () => {
    const { origin, destination } = get();
    set({ origin: destination, destination: origin });
  },

  loadDemoScenario: () => {
    set({
      origin: COMMON_LOCATIONS[0],
      destination: COMMON_LOCATIONS[1],
      selectedVehicle: VEHICLE_PRESETS[0],
      cargoLoadTons: 18.5,
      departureTime: getDefaultDepartureTime(),
      deadline: getDefaultDeadline(),
      departureWindowHours: 4,
      whatIfRain: false,
    });
  },

  resetTrip: () => {
    set({
      origin: null,
      destination: null,
      selectedVehicle: VEHICLE_PRESETS[0],
      cargoLoadTons: 10,
      departureTime: getDefaultDepartureTime(),
      deadline: getDefaultDeadline(),
      departureWindowHours: 4,
      whatIfRain: false,
    });
  },
}));
