import { Report, TextReport } from './index';

export interface Hotspot {
  lat: number;
  lng: number;
  intensity: number;
  count: number;
}

export interface PredictionResult {
  predictedSeverity: 'high' | 'medium' | 'low';
  confidence: number;
  hotspots: Hotspot[];
  trends: {
    ai?: {
      description: string;
      recommendations: string[];
    };
    statistical: {
      trend: 'increasing' | 'stable' | 'decreasing';
      frequency: number;
      prediction: 'high' | 'medium' | 'low';
    };
  };
}

export interface HazardTrend {
  type: string;
  frequency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface PredictionInput {
  location: {
    lat: number;
    lng: number;
  };
  historicalReports: Array<Report | TextReport>;
  timeRange: string;
  weatherData?: any;
  trafficData?: any;
}