import React, { useEffect, useRef, useState } from 'react';
import maplibregl, {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  LngLatBounds,
} from 'maplibre-gl';
import { RouteCandidate, LocationItem } from '@/types';
import { MapLegend } from './MapLegend';
import { updateRouteLayers, cleanupRouteLayers } from './RouteLayer';
import { updateRiskHeatLayer } from './RiskHeatLayer';
import { Maximize2, RotateCcw } from 'lucide-react';

interface MapViewProps {
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  recommendedRouteId: string | null;
  origin: LocationItem | null;
  destination: LocationItem | null;
  onSelectRoute: (id: string) => void;
  className?: string;
}

const DEFAULT_MAP_STYLE =
  import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/dark';

export const MapView: React.FC<MapViewProps> = ({
  routes,
  selectedRouteId,
  recommendedRouteId,
  origin,
  destination,
  onSelectRoute,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Default center around Pune - Mumbai Ghat corridor
    const initialCenter: [number, number] = [73.4000, 18.7800];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: DEFAULT_MAP_STYLE,
      center: initialCenter,
      zoom: 9.2,
      attributionControl: false,
    });

    map.addControl(
      new NavigationControl({ showCompass: true, showZoom: true }),
      'bottom-right'
    );

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers for Origin and Destination
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Origin Marker
    if (origin) {
      const el = document.createElement('div');
      el.className = 'origin-marker';
      el.innerHTML = `
        <div style="background: #1a5c47; border: 2px solid #3ec99f; color: #ffffff; padding: 5px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; box-shadow: 0 0 14px rgba(62, 201, 159, 0.6); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#3ec99f;"></span>
          ${origin.name.split(',')[0]}
        </div>
      `;
      const marker = new Marker({ element: el })
        .setLngLat([origin.lon, origin.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    // Add Destination Marker
    if (destination) {
      const el = document.createElement('div');
      el.className = 'destination-marker';
      el.innerHTML = `
        <div style="background: #2f8a9d; border: 2px solid #42a7bc; color: #ffffff; padding: 5px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; box-shadow: 0 0 14px rgba(47, 138, 157, 0.6); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#eff9f5;"></span>
          ${destination.name.split(',')[0]}
        </div>
      `;
      const marker = new Marker({ element: el })
        .setLngLat([destination.lon, destination.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [origin, destination, mapLoaded]);

  // Update Route Layers and Risk Heatmap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (routes.length > 0) {
      updateRouteLayers(
        map,
        routes,
        selectedRouteId,
        recommendedRouteId,
        onSelectRoute
      );
      updateRiskHeatLayer(map, routes, selectedRouteId, showRiskHeatmap);
    } else {
      cleanupRouteLayers(map, routes);
    }
  }, [routes, selectedRouteId, recommendedRouteId, showRiskHeatmap, mapLoaded, onSelectRoute]);

  // Fit Bounds on Selected Route or All Routes
  const handleFitBounds = () => {
    const map = mapRef.current;
    if (!map || routes.length === 0) return;

    const targetRoute =
      routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (!targetRoute || !targetRoute.geometry.coordinates) return;

    const bounds = new LngLatBounds();
    targetRoute.geometry.coordinates.forEach((coord) => {
      bounds.extend(coord as [number, number]);
    });

    if (origin) bounds.extend([origin.lon, origin.lat]);
    if (destination) bounds.extend([destination.lon, destination.lat]);

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 12,
      duration: 1000,
    });
  };

  useEffect(() => {
    if (routes.length > 0 && mapLoaded) {
      handleFitBounds();
    }
  }, [routes, selectedRouteId, mapLoaded]);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-forest-750/80 shadow-2xl bg-[#0c1815] ${className}`}
    >
      {/* Map Container Element */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend Overlay */}
      {routes.length > 0 && (
        <MapLegend
          routes={routes}
          selectedRouteId={selectedRouteId}
          recommendedRouteId={recommendedRouteId}
          showRiskHeatmap={showRiskHeatmap}
          onToggleRiskHeatmap={setShowRiskHeatmap}
          onSelectRoute={onSelectRoute}
        />
      )}

      {/* Floating Map Action Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        {routes.length > 0 && (
          <button
            onClick={handleFitBounds}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-900/90 hover:bg-forest-850 text-forest-200 hover:text-white text-xs font-medium border border-forest-750 shadow-lg backdrop-blur-md transition"
            title="Fit map view to corridor"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Fit Corridor
          </button>
        )}
        <button
          onClick={() => {
            const map = mapRef.current;
            if (map) {
              map.flyTo({ center: [73.4000, 18.7800], zoom: 9.2, duration: 800 });
            }
          }}
          className="p-1.5 rounded-lg bg-forest-900/90 hover:bg-forest-850 text-forest-300 hover:text-white border border-forest-750 shadow-lg backdrop-blur-md transition"
          title="Reset Western Ghats Overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Vector Tile Attribution Watermark */}
      <div className="absolute bottom-1 right-16 z-10 text-[9px] text-forest-500 font-mono pointer-events-none select-none">
        OpenFreeMap Vector Tiles · Western Ghats DEM
      </div>
    </div>
  );
};

