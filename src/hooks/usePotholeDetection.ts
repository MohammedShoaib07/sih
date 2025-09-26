// hooks/usePotholeDetection.ts
import { useState, useCallback, useMemo } from 'react';
import PotholeDetectionAPI, { PotholeDetectionResponse, DetectionOptions } from '../services/potholeAPI';
import { Detection } from '../types';

interface PotholeDetectionResult {
  detections: Detection[];
  severity: 'high' | 'medium' | 'low';
  confidence: number;
  annotatedImageUrl?: string;
  originalResponse: PotholeDetectionResponse;
}

const usePotholeDetection = (apiKey: string | null = null) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PotholeDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const api = useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return new PotholeDetectionAPI(baseUrl, apiKey);
  }, [apiKey]);

  // Convert API response to internal format
  const convertApiResponse = useCallback((response: PotholeDetectionResponse): PotholeDetectionResult => {
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Detection failed');
    }

    const detections: Detection[] = response.data.detections.map(det => ({
      box: {
        x: det.bbox.x1 / response.data!.image_info.width, // Normalize to 0-1
        y: det.bbox.y1 / response.data!.image_info.height,
        width: det.bbox.width / response.data!.image_info.width,
        height: det.bbox.height / response.data!.image_info.height
      },
      class: det.class,
      confidence: det.confidence
    }));

    // Convert severity to lowercase
    const severity = response.data.detections.length > 0 
      ? response.data.detections[0].severity.toLowerCase() as 'high' | 'medium' | 'low'
      : 'low';

    // Calculate average confidence
    const confidence = detections.length > 0
      ? detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length
      : 0;

    return {
      detections,
      severity,
      confidence,
      annotatedImageUrl: response.data.annotated_image_url 
        ? api.getAnnotatedImageUrl(response.data.annotated_image_url)
        : undefined,
      originalResponse: response
    };
  }, [api]);

  const detectPotholes = useCallback(async (imageFile: File, options: DetectionOptions = {}): Promise<PotholeDetectionResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.detectPotholes(imageFile, {
        ...options,
        includeImage: true // Always include annotated image
      });

      const result = convertApiResponse(response);
      setResults(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, convertApiResponse]);

  const batchDetect = useCallback(async (imageFiles: File[]): Promise<PotholeDetectionResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.batchDetect(imageFiles);
      const result = convertApiResponse(response);
      setResults(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch detection failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, convertApiResponse]);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  }, [api]);

  // Convert base64 image to File for API
  const detectFromBase64 = useCallback(async (base64Image: string, options: DetectionOptions = {}): Promise<PotholeDetectionResult> => {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();

    // Create File from blob
    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

    return detectPotholes(file, options);
  }, [detectPotholes]);

  return {
    loading,
    results,
    error,
    detectPotholes,
    detectFromBase64,
    batchDetect,
    checkHealth,
    clearResults: () => setResults(null),
    clearError: () => setError(null)
  };
};

export default usePotholeDetection;
