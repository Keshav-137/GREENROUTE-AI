import { useMutation } from '@tanstack/react-query';
import { tripService } from '@/services/tripService';
import { PlanRequest, PlanResponse } from '@/types';
import { useRouteStore } from '@/store/routeStore';

export function usePlan() {
  const setPlanResult = useRouteStore((state) => state.setPlanResult);

  return useMutation<PlanResponse, Error, PlanRequest>({
    mutationFn: (request: PlanRequest) => tripService.planTrip(request),
    onSuccess: (data) => {
      setPlanResult(data);
    },
  });
}

