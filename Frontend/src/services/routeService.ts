import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import mockRoutesJson from '@/mocks/mock_routes.json';

const isMockMode = () => import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export interface RouteCatalogItem {
  id: string;
  name: string;
  type: string;
  distance_km: number;
  base_duration_hours: number;
  avg_toll_inr: number;
  road_grade_class: string;
}

export interface RouteCatalogResponse {
  corridor_id: string;
  origin_city: string;
  destination_city: string;
  available_routes_count: number;
  last_updated: string;
  routes: RouteCatalogItem[];
}

export const routeService = {
  async getRoutes(): Promise<RouteCatalogResponse> {
    if (isMockMode()) {
      return mockRoutesJson as RouteCatalogResponse;
    }
    return apiClient<RouteCatalogResponse>(ENDPOINTS.ROUTES);
  },
};
