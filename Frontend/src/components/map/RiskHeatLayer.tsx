import { Map as MapLibreMap, Popup } from 'maplibre-gl';
import { RouteCandidate } from '@/types';

export function updateRiskHeatLayer(
  map: MapLibreMap,
  routes: RouteCandidate[],
  selectedRouteId: string | null,
  enabled: boolean
) {
  if (!map.isStyleLoaded()) return;

  const sourceId = 'source-risk-segments';
  const layerId = 'layer-risk-segments';

  if (!enabled) {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
    return;
  }

  // Find relevant route (selected route or all routes)
  const targetRoute =
    routes.find((r) => r.id === selectedRouteId) || routes[0];
  if (!targetRoute || !targetRoute.segments || targetRoute.segments.length === 0) {
    return;
  }

  const features: GeoJSON.Feature<GeoJSON.LineString>[] = targetRoute.segments.map(
    (seg) => ({
      type: 'Feature',
      properties: {
        id: seg.id,
        risk_score: seg.risk_score,
        risk_level: seg.risk_level,
        hazard_type: seg.hazard_type || 'Standard segment',
        distance_km: seg.distance_km,
        gradient_pct: seg.gradient_pct || 0,
        elevation_change_m: seg.elevation_change_m || 0,
        color:
          seg.risk_level === 'high'
            ? '#c0504d'
            : seg.risk_level === 'medium'
            ? '#d8993a'
            : '#3ec99f',
      },
      geometry: {
        type: 'LineString',
        coordinates: [seg.start_coord, seg.end_coord],
      },
    })
  );

  const featureCollection: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
    type: 'FeatureCollection',
    features,
  };

  const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (existingSource) {
    existingSource.setData(featureCollection);
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: featureCollection,
    });
  }

  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 7,
        'line-opacity': 0.85,
        'line-dasharray': [1, 0.5],
      },
    });

    // Segment Hover Popup
    let popup: Popup | null = null;

    map.on('mouseenter', layerId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features || !e.features[0]) return;
      const props = e.features[0].properties;

      const html = `
        <div style="font-family: Inter, sans-serif; font-size: 11px;">
          <div style="font-weight: 700; color: ${props.color}; text-transform: uppercase; margin-bottom: 3px;">
            ${props.risk_level} Climate Hazard (Score: ${Number(props.risk_score).toFixed(2)})
          </div>
          <div style="color: #daf0e8; font-weight: 500; margin-bottom: 2px;">
            ${props.hazard_type}
          </div>
          <div style="color: #8ba89f; font-size: 10px;">
            Length: ${Number(props.distance_km).toFixed(1)} km | Grade: ${props.gradient_pct}% (${props.elevation_change_m}m)
          </div>
        </div>
      `;

      popup = new Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      if (popup) {
        popup.remove();
        popup = null;
      }
    });
  }
}

export const RiskHeatLayer: React.FC = () => null;

