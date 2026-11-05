import { create } from 'zustand';
import { PriorityWeights } from '@/types';
import { DEFAULT_PRIORITY_WEIGHTS } from '@/utils/constants';

interface OptimizationState {
  weights: PriorityWeights;
  setWeight: (key: keyof PriorityWeights, value: number) => void;
  setAllWeights: (weights: PriorityWeights) => void;
  resetWeights: () => void;
  getNormalizedWeights: () => Record<keyof PriorityWeights, number>;
}

export const useOptimizationStore = create<OptimizationState>((set, get) => ({
  weights: { ...DEFAULT_PRIORITY_WEIGHTS },

  setWeight: (key, value) => {
    set((state) => ({
      weights: {
        ...state.weights,
        [key]: Math.max(0, Math.min(100, Math.round(value))),
      },
    }));
  },

  setAllWeights: (weights) => set({ weights }),

  resetWeights: () => set({ weights: { ...DEFAULT_PRIORITY_WEIGHTS } }),

  getNormalizedWeights: () => {
    const { weights } = get();
    const sum =
      weights.time + weights.fuel + weights.co2 + weights.cost + weights.risk;
    if (sum === 0) {
      return { time: 0.2, fuel: 0.2, co2: 0.2, cost: 0.2, risk: 0.2 };
    }
    return {
      time: Number((weights.time / sum).toFixed(3)),
      fuel: Number((weights.fuel / sum).toFixed(3)),
      co2: Number((weights.co2 / sum).toFixed(3)),
      cost: Number((weights.cost / sum).toFixed(3)),
      risk: Number((weights.risk / sum).toFixed(3)),
    };
  },
}));

