import { Map as MapLibreMap } from 'maplibre-gl';
import { RouteCandidate } from '@/types';
import { ROUTE_COLORS } from './MapLegend';

export function updateRouteLayers(
  map: MapLibreMap,
  routes: RouteCandidate[],
  selectedRouteId: string | null,
  recommendedRouteId: string | null,
  onSelectRoute?: (id: string) => void
) {
  if (!map.isStyleLoaded()) return;

  routes.forEach((route, idx) => {
    const sourceId = `source-route-${route.id}`;
    const lineLayerId = `layer-route-line-${route.id}`;
    const casingLayerId = `layer-route-casing-${route.id}`;
    const isSelected = route.id === selectedRouteId;
    const isRecommended = route.id === recommendedRouteId;
    const baseColor =
      ROUTE_COLORS[route.id] || ROUTE_COLORS[`fallback_${idx % 3}`] || '#2f8a9d';

    const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {
        id: route.id,
        name: route.name,
        isSelected,
        isRecommended,
      },
      geometry: route.geometry,
    };

    // Update or add GeoJSON source
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (existingSource) {
      existingSource.setData(geojsonData);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
      });
    }

    // Add casing layer (for glow / selection border)
    if (!map.getLayer(casingLayerId)) {
      map.addLayer({
        id: casingLayerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': isSelected ? '#ffffff' : '#000000',
          'line-width': isSelected ? 8 : 5,
          'line-opacity': isSelected ? 0.6 : 0.3,
        },
      });
    } else {
      map.setPaintProperty(
        casingLayerId,
        'line-color',
        isSelected ? '#ffffff' : '#000000'
      );
      map.setPaintProperty(casingLayerId, 'line-width', isSelected ? 8 : 5);
      map.setPaintProperty(casingLayerId, 'line-opacity', isSelected ? 0.6 : 0.3);
    }

    // Add primary line layer
    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': baseColor,
          'line-width': isSelected ? 5.5 : 3.5,
          'line-opacity': isSelected ? 1.0 : 0.6,
        },
      });

      // Interactive click to select route
      if (onSelectRoute) {
        map.on('click', lineLayerId, () => {
          onSelectRoute(route.id);
        });
        map.on('mouseenter', lineLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', lineLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    } else {
      map.setPaintProperty(lineLayerId, 'line-color', baseColor);
      map.setPaintProperty(lineLayerId, 'line-width', isSelected ? 5.5 : 3.5);
      map.setPaintProperty(lineLayerId, 'line-opacity', isSelected ? 1.0 : 0.6);
    }

    // Keep the active recommendation visible above the other alternatives.
    if (isSelected || isRecommended) {
      if (map.getLayer(casingLayerId)) map.moveLayer(casingLayerId);
      if (map.getLayer(lineLayerId)) map.moveLayer(lineLayerId);
    }
  });
}

export function cleanupRouteLayers(map: MapLibreMap, routes: RouteCandidate[]) {
  routes.forEach((route) => {
    const sourceId = `source-route-${route.id}`;
    const lineLayerId = `layer-route-line-${route.id}`;
    const casingLayerId = `layer-route-casing-${route.id}`;

    if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
    if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  });
}

export const RouteLayer: React.FC = () => null;
