import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import {
  PlanRequest,
  PlanResponse,
  RerankRequest,
  RerankResponse,
} from '@/types';
import mockPlanJson from '@/mocks/mock_plan.json';
import mockRerankJson from '@/mocks/mock_rerank.json';

export interface FuelPrice {
  fuel_type: 'diesel';
  city: string;
  price_inr_per_litre: number;
  source: 'live' | 'cached' | 'simulated';
  as_of: string;
}

const isMockMode = () => {
  // Demo mode is the safe default when no .env file is present.
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
};

function transformMockGeometry(
  coordinates: [number, number][],
  origin: { lat: number; lon: number },
  destination: { lat: number; lon: number }
): [number, number][] {
  const sourceOrigin = { lat: 18.6275, lon: 73.8443 };
  const sourceDestination = { lat: 18.9482, lon: 72.9514 };
  const sourceVector = {
    lat: sourceDestination.lat - sourceOrigin.lat,
    lon: sourceDestination.lon - sourceOrigin.lon,
  };
  const targetVector = {
    lat: destination.lat - origin.lat,
    lon: destination.lon - origin.lon,
  };
  const sourceLengthSquared =
    sourceVector.lat ** 2 + sourceVector.lon ** 2;
  const sourceLength = Math.sqrt(sourceLengthSquared);
  const targetLength = Math.sqrt(targetVector.lat ** 2 + targetVector.lon ** 2);
  const scale = sourceLength > 0 ? targetLength / sourceLength : 1;
  const sourcePerpendicular = {
    lat: -sourceVector.lon / sourceLength,
    lon: sourceVector.lat / sourceLength,
  };
  const targetPerpendicular = {
    lat: -targetVector.lon / (targetLength || 1),
    lon: targetVector.lat / (targetLength || 1),
  };

  return coordinates.map(([lon, lat]) => {
    const relative = { lat: lat - sourceOrigin.lat, lon: lon - sourceOrigin.lon };
    const progress =
      (relative.lat * sourceVector.lat + relative.lon * sourceVector.lon) /
      sourceLengthSquared;
    const crossTrack =
      relative.lat * sourcePerpendicular.lat +
      relative.lon * sourcePerpendicular.lon;

    return [
      origin.lon +
        targetVector.lon * progress +
        targetPerpendicular.lon * crossTrack * scale,
      origin.lat +
        targetVector.lat * progress +
        targetPerpendicular.lat * crossTrack * scale,
    ];
  });
}

export const tripService = {
  isMockConfigured: isMockMode,

  async getFuelPrice(city = 'Mumbai'): Promise<FuelPrice> {
    if (isMockMode()) {
      return {
        fuel_type: 'diesel',
        city,
        price_inr_per_litre: 94,
        source: 'simulated',
        as_of: new Date().toISOString(),
      };
    }

    return apiClient<FuelPrice>(
      `${ENDPOINTS.FUEL_PRICE}?city=${encodeURIComponent(city)}`
    );
  },

  async planTrip(request: PlanRequest): Promise<PlanResponse> {
    if (isMockMode()) {
      // Simulate realistic network roundtrip
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Clone mock data and dynamically tailor to requested cargo and coordinates
      const mockData = JSON.parse(
        JSON.stringify(mockPlanJson)
      ) as PlanResponse;

      mockData.trip_id = `trip_demo_${Date.now().toString(36)}`;
      mockData.origin = request.origin;
      mockData.destination = request.destination;
      mockData.cargo_load_tons = request.cargo_load_tons;
      const originLabel = request.origin.name.split(',')[0];
      const destinationLabel = request.destination.name.split(',')[0];
      mockData.routes.forEach((route) => {
        route.name = `${route.name.split(' · ')[0]} · ${originLabel} to ${destinationLabel}`;
        route.geometry.coordinates = transformMockGeometry(
          route.geometry.coordinates as [number, number][],
          request.origin,
          request.destination
        );
        route.segments.forEach((segment) => {
          segment.start_coord = transformMockGeometry(
            [segment.start_coord as [number, number]],
            request.origin,
            request.destination
          )[0];
          segment.end_coord = transformMockGeometry(
            [segment.end_coord as [number, number]],
            request.origin,
            request.destination
          )[0];
        });
      });

      // Dynamically adjust fuel & CO2 slightly based on cargo load
      const payloadRatio = request.cargo_load_tons / 18.5;
      mockData.routes.forEach((r) => {
        const adjustedFuel = Number((r.fuel_liters * (0.7 + 0.3 * payloadRatio)).toFixed(1));
        r.fuel_liters = adjustedFuel;
        r.co2_kg = Number((adjustedFuel * 2.68).toFixed(1));
      });

      return mockData;
    }

    return apiClient<PlanResponse>(ENDPOINTS.PLAN, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async rerank(request: RerankRequest): Promise<RerankResponse> {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const weights = request.weights;
      const sum =
        weights.time + weights.fuel + weights.co2 + weights.cost + weights.risk || 1;
      const normTime = weights.time / sum;
      const normFuel = weights.fuel / sum;
      const normCost = weights.cost / sum;
      const normRisk = weights.risk / sum;

      // Multi-criteria scoring
      // Route 1: Best time, lowest risk, moderate toll
      // Route 2: High risk, high fuel, low toll
      // Route 3: Lowest toll, moderate time, good fuel
      const s1 = 0.95 * normTime + 0.89 * normFuel + 0.70 * normCost + 0.92 * normRisk;
      const s2 = 0.65 * normTime + 0.58 * normFuel + 0.85 * normCost + 0.36 * normRisk;
      const s3 = 0.78 * normTime + 0.85 * normFuel + 0.95 * normCost + 0.80 * normRisk;

      const scored = [
        { id: 'route-opt-1', score: s1 },
        { id: 'route-opt-2', score: s2 },
        { id: 'route-opt-3', score: s3 },
      ].sort((a, b) => b.score - a.score);

      const mockResponse = JSON.parse(
        JSON.stringify(mockRerankJson)
      ) as RerankResponse;

      mockResponse.trip_id = request.trip_id;
      mockResponse.recommended_route_id = scored[0].id;
      mockResponse.rankings = scored.map((s, idx) => ({
        route_id: s.id,
        rank: idx + 1,
        total_score: Number(s.score.toFixed(3)),
        score_breakdown: weights,
      }));

      const topRouteName =
        scored[0].id === 'route-opt-1'
          ? 'Expressway (NH 48) / Yashwantrao Chavan'
          : scored[0].id === 'route-opt-3'
          ? 'SH 54 via Karjat-Panvel'
          : 'Old NH 48 Highway';

      mockResponse.recommendation_narrative = `With the current priority weights (${weights.time}% Time, ${weights.fuel}% Fuel, ${weights.co2}% CO2, ${weights.cost}% Cost, ${weights.risk}% Risk), ${topRouteName} is ranked #1 with an optimal multi-objective score of ${scored[0].score.toFixed(3)}.`;

      return mockResponse;
    }

    return apiClient<RerankResponse>(ENDPOINTS.RERANK, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async checkHealth(): Promise<{ status: string; is_live: boolean }> {
    if (isMockMode()) {
      return { status: 'healthy (demo mode)', is_live: false };
    }
    try {
      const res = await apiClient<{ status: string }>(ENDPOINTS.HEALTH);
      return { status: res.status, is_live: true };
    } catch {
      return { status: 'disconnected', is_live: false };
    }
  },
};
