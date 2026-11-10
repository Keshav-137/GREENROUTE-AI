export const ENDPOINTS = {
  PLAN: '/api/v1/plan',
  ROUTES: '/api/v1/routes',
  RERANK: '/api/v1/rerank',
  REPORT: (tripId: string) => `/api/v1/report/${encodeURIComponent(tripId)}`,
  HEALTH: '/api/v1/health',
  FUEL_PRICE: '/api/v1/fuel-price',
} as const;
