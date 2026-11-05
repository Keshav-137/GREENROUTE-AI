import { VehiclePreset, PriorityWeights } from '@/types';

export const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: 'veh-heavy-diesel-1',
    name: 'Tata Signa 4825.TK (Multi-Axle)',
    type: 'heavy_duty_diesel',
    categoryLabel: 'Heavy-Duty Diesel',
    maxPayloadTons: 28.0,
    fuelType: 'Diesel',
    baseConsumptionRate: '34.2 L/100km',
    emptyWeightTons: 14.5,
    emissionFactorKgPerUnit: 2.68, // kg CO2 per liter diesel
    description: '48-tonne GVW heavy rigid truck with Cummins ISBe 6.7L engine for intercity freight.',
  },
  {
    id: 'veh-medium-diesel-1',
    name: 'Eicher Pro 3019 (Medium Freight)',
    type: 'medium_duty_diesel',
    categoryLabel: 'Medium-Duty Diesel',
    maxPayloadTons: 12.5,
    fuelType: 'Diesel',
    baseConsumptionRate: '21.5 L/100km',
    emptyWeightTons: 6.2,
    emissionFactorKgPerUnit: 2.68,
    description: '19-tonne GVW fuel-efficient multi-utility truck with high thermal efficiency.',
  },
  {
    id: 'veh-cng-freight-1',
    name: 'Tata Prima 2830.K Dual-Fuel CNG',
    type: 'cng_freight',
    categoryLabel: 'CNG Freight Carrier',
    maxPayloadTons: 18.0,
    fuelType: 'CNG',
    baseConsumptionRate: '24.8 kg/100km',
    emptyWeightTons: 9.8,
    emissionFactorKgPerUnit: 2.15, // kg CO2 per kg CNG
    description: 'Compressed Natural Gas dedicated freight tractor offering 22% lower operational GHG.',
  },
  {
    id: 'veh-electric-truck-1',
    name: 'Rhino 5536e Heavy EV Hauler',
    type: 'electric_truck',
    categoryLabel: 'Battery Electric (Heavy EV)',
    maxPayloadTons: 22.0,
    fuelType: 'Electric',
    baseConsumptionRate: '1.25 kWh/km',
    emptyWeightTons: 12.0,
    emissionFactorKgPerUnit: 0.72, // kg CO2 per kWh (Grid average)
    description: 'Zero direct tailpipe emissions tractor with regenerative descent braking on Ghat descents.',
  },
];

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  time: 25,
  fuel: 30,
  co2: 25,
  cost: 10,
  risk: 10,
};

export const COMMON_LOCATIONS = [
  {
    name: 'Pune Freight Hub, Bhosari MIDC',
    lat: 18.6275,
    lon: 73.8443,
    address: 'Bhosari Industrial Area, Pune, Maharashtra 411026',
  },
  {
    name: 'JNPT Container Port, Navi Mumbai',
    lat: 18.9482,
    lon: 72.9514,
    address: 'Jawaharlal Nehru Port Trust, Navi Mumbai, Maharashtra 400707',
  },
  {
    name: 'Chakan Auto Corridor, Phase II, Pune',
    lat: 18.7610,
    lon: 73.8560,
    address: 'Chakan Industrial Zone, Pune, Maharashtra 410501',
  },
  {
    name: 'Bhiwandi Logistics Park, Thane',
    lat: 19.2980,
    lon: 73.0640,
    address: 'Bhiwandi Warehousing Hub, Mumbai MMR, Maharashtra 421302',
  },
  {
    name: 'Swargate Multimodal Depot, Pune',
    lat: 18.5089,
    lon: 73.8643,
    address: 'Swargate Hub, Pune, Maharashtra 411042',
  },
  {
    name: 'Mumbai Port Trust (MbPT), Wadala',
    lat: 19.0125,
    lon: 72.8710,
    address: 'MbPT Docks, South Mumbai, Maharashtra 400037',
  },
];

