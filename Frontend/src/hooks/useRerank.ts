import { useMutation } from '@tanstack/react-query';
import { tripService } from '@/services/tripService';
import { RerankRequest, RerankResponse } from '@/types';
import { useRouteStore } from '@/store/routeStore';

export function useRerank() {
  const setRecommendedRouteId = useRouteStore(
    (state) => state.setRecommendedRouteId
  );
  const planResult = useRouteStore((state) => state.planResult);
  const setPlanResult = useRouteStore((state) => state.setPlanResult);

  return useMutation<RerankResponse, Error, RerankRequest>({
    mutationFn: (request: RerankRequest) => tripService.rerank(request),
    onSuccess: (data) => {
      setRecommendedRouteId(data.recommended_route_id);
      if (planResult) {
        setPlanResult({
          ...planResult,
          recommended_route_id: data.recommended_route_id,
          explainability: {
            ...planResult.explainability,
            recommendation_narrative: data.recommendation_narrative,
          },
        });
      }
    },
  });
}

