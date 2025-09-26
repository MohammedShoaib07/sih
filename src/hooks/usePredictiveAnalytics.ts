import { useState, useEffect } from 'react';
import { PredictiveAnalyticsService, PredictionResult } from '../services/predictiveAnalytics';
import { useAppStore } from '../store';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const usePredictiveAnalytics = (
  location: { lat: number; lng: number } | null,
  timeRange: string = 'week'
) => {
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reports, textReports } = useAppStore();

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!location) return;

      setIsLoading(true);
      setError(null);

      try {
        const service = new PredictiveAnalyticsService(GEMINI_API_KEY);
        const result = await service.generatePredictions({
          location,
          historicalReports: [...reports, ...textReports],
          timeRange,
        });

        setPredictions(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate predictions');
        console.error('Prediction error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [location, timeRange, reports, textReports]);

  return { predictions, isLoading, error };
};

export default usePredictiveAnalytics;