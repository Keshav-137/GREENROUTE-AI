import React, { useEffect } from 'react';
import { useRouteStore } from '@/store/routeStore';
import { useTripStore } from '@/store/tripStore';
import { usePlan } from '@/hooks/usePlan';
import { TripForm } from '@/components/planner/TripForm';
import { MapView } from '@/components/map/MapView';
import { RouteCard } from '@/components/routes/RouteCard';
import { RouteComparison } from '@/components/routes/RouteComparison';
import { PrioritySliders } from '@/components/optimization/PrioritySliders';
import { RouteCardsSkeleton } from '@/components/common/LoadingSkeleton';
import { Sparkles, Layers, SlidersHorizontal, Map as MapIcon } from 'lucide-react';

export const Planner: React.FC = () => {
  const { routes, selectedRouteId, recommendedRouteId, setSelectedRouteId, planResult } =
    useRouteStore();
  const { origin, destination, selectedVehicle, cargoLoadTons, departureTime, deadline } =
    useTripStore();
  const planMutation = usePlan();

  // On initial mount, if no plan is loaded yet, run initial plan for the default Pune-Mumbai corridor
  useEffect(() => {
    if (!planResult && origin && destination) {
      planMutation.mutate({
        origin,
        destination,
        vehicle_type: selectedVehicle.type,
        cargo_load_tons: cargoLoadTons,
        departure_time: new Date(departureTime).toISOString(),
        deadline: new Date(deadline).toISOString(),
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form, Sliders & Route Alternatives (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Trip Form Card */}
          <div className="p-5 rounded-2xl bg-forest-850/90 border border-forest-750/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-forest-750/50 pb-2">
              <MapIcon className="w-4 h-4 text-[#2f8a9d]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Corridor & Freight Parameters
              </h2>
            </div>

            <TripForm />
          </div>

          {/* Section 2: Priority Sliders Card (Interactive Re-ranking) */}
          {planResult && (
            <div className="transition-all">
              <PrioritySliders />
            </div>
          )}

          {/* Section 3: Route Alternatives Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3ec99f]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Evaluated Alternatives ({routes.length})
                </h3>
              </div>
              <span className="text-[11px] text-forest-300">
                Click a card to inspect on map
              </span>
            </div>

            {planMutation.isPending ? (
              <RouteCardsSkeleton />
            ) : routes.length > 0 ? (
              <div className="space-y-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={route.id === selectedRouteId}
                    isRecommended={route.id === recommendedRouteId}
                    onSelect={() => setSelectedRouteId(route.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-forest-850/60 border border-forest-750/50 text-center text-xs text-forest-400">
                Submit dispatch parameters above to calculate route candidates.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map & Detailed Trade-Off Matrix (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-24">
          {/* Interactive MapView */}
          <div className="h-[520px] w-full">
            <MapView
              routes={routes}
              selectedRouteId={selectedRouteId}
              recommendedRouteId={recommendedRouteId}
              origin={origin}
              destination={destination}
              onSelectRoute={setSelectedRouteId}
              className="h-full"
            />
          </div>

          {/* Full Trade-Off Matrix Below Map */}
          {routes.length > 0 && (
            <RouteComparison
              routes={routes}
              selectedRouteId={selectedRouteId}
              recommendedRouteId={recommendedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

