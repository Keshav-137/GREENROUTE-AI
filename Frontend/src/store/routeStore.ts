import { create } from 'zustand';
import { RouteCandidate, PlanResponse } from '@/types';

interface RouteState {
  planResult: PlanResponse | null;
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  recommendedRouteId: string | null;

  setPlanResult: (result: PlanResponse) => void;
  setSelectedRouteId: (id: string) => void;
  setRecommendedRouteId: (id: string) => void;
  applyRerank: (id: string, narrative?: string) => void;
  getSelectedRoute: () => RouteCandidate | undefined;
  getRecommendedRoute: () => RouteCandidate | undefined;
  clearRoutes: () => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  planResult: null,
  routes: [],
  selectedRouteId: null,
  recommendedRouteId: null,

  setPlanResult: (result) => {
    set({
      planResult: result,
      routes: result.routes,
      recommendedRouteId: result.recommended_route_id,
      selectedRouteId: result.recommended_route_id,
    });
  },

  setSelectedRouteId: (id) => set({ selectedRouteId: id }),

  setRecommendedRouteId: (id) => set({ recommendedRouteId: id }),

  applyRerank: (id, narrative) =>
    set((state) => ({
      recommendedRouteId: id,
      selectedRouteId: state.routes.some((route) => route.id === id)
        ? id
        : state.selectedRouteId,
      planResult: state.planResult
        ? {
            ...state.planResult,
            recommended_route_id: id,
            explainability: narrative
              ? {
                  ...state.planResult.explainability,
                  recommendation_narrative: narrative,
                }
              : state.planResult.explainability,
          }
        : null,
    })),

  getSelectedRoute: () => {
    const { routes, selectedRouteId } = get();
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  },

  getRecommendedRoute: () => {
    const { routes, recommendedRouteId } = get();
    return routes.find((r) => r.id === recommendedRouteId) || routes[0];
  },

  clearRoutes: () => {
    set({
      planResult: null,
      routes: [],
      selectedRouteId: null,
      recommendedRouteId: null,
    });
  },
}));
