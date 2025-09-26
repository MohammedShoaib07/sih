import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import usePredictiveAnalytics from '../hooks/usePredictiveAnalytics';
import { Hotspot } from '../types/predictive';

declare module 'leaflet' {
  export function heatLayer(latlngs: Array<[number, number, number]>, options?: any): any;
}

interface PredictiveHeatmapProps {
  location: { lat: number; lng: number };
}

const PredictiveHeatmap: React.FC<PredictiveHeatmapProps> = ({ location }) => {
  const map = useMap();
  const [heatLayer, setHeatLayer] = useState<any>(null);
  const { predictions, isLoading } = usePredictiveAnalytics(location, 'week');

  useEffect(() => {
    if (!predictions || isLoading) return;

    // Remove existing heat layer
    if (heatLayer) {
      map.removeLayer(heatLayer);
    }

    // Convert hotspots to heatmap points
    const hotspots: Hotspot[] = Array.isArray(predictions) ? predictions : [];
    const points = hotspots.map((spot: Hotspot): [number, number, number] => [
      spot.lat,
      spot.lng,
      spot.intensity * 100 // Scale up intensity for better visualization
    ]);

    // Create new heat layer
    const newHeatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.2: '#fef3c7', // Yellow-100
        0.4: '#fcd34d', // Yellow-300
        0.6: '#f59e0b', // Yellow-500
        0.8: '#ea580c', // Orange-600
        1.0: '#dc2626'  // Red-600
      }
    });

    newHeatLayer.addTo(map);
    setHeatLayer(newHeatLayer);

    return () => {
      if (newHeatLayer) {
        map.removeLayer(newHeatLayer);
      }
    };
  }, [map, predictions, isLoading]);

  return null;
};

export default PredictiveHeatmap;