import { useMutation } from '@tanstack/react-query';
import { tripService } from '@/services/tripService';
import { RerankRequest, RerankResponse } from '@/types';
import { useRouteStore } from '@/store/routeStore';

export function useRerank() {
  const applyRerank = useRouteStore((state) => state.applyRerank);

  return useMutation<RerankResponse, Error, RerankRequest>({
    mutationFn: (request: RerankRequest) => tripService.rerank(request),
    onSuccess: (data) => {
      applyRerank(data.recommended_route_id, data.recommendation_narrative);
    },
  });
}
