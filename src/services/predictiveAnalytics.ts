import axios from 'axios';
import { Report, TextReport } from '../types';

export interface PredictionInput {
  location: {
    lat: number;
    lng: number;
  };
  historicalReports: (Report | TextReport)[];
  timeRange: string; // 'day' | 'week' | 'month'
  weatherData?: any;
  trafficData?: any;
}

export interface PredictionResult {
  predictedSeverity: 'high' | 'medium' | 'low';
  confidence: number;
  hazardTrends: {
    type: string;
    frequency: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }[];
  heatmapData: {
    lat: number;
    lng: number;
    intensity: number;
  }[];
}

export class PredictiveAnalyticsService {
  private geminiApiKey: string;

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{ text: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.geminiApiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  public async generatePredictions(input: PredictionInput): Promise<PredictionResult> {
    // Prepare data for analysis
    const locationReports = input.historicalReports.filter(
      (report) =>
        Math.abs(report.location.lat - input.location.lat) < 0.1 &&
        Math.abs(report.location.lng - input.location.lng) < 0.1
    );

    // Generate prompt for Gemini API
    const prompt = `Analyze the following road hazard data and predict future conditions:
    Location: ${input.location.lat}, ${input.location.lng}
    Historical Reports: ${JSON.stringify(locationReports)}
    Time Range: ${input.timeRange}
    ${input.weatherData ? `Weather Data: ${JSON.stringify(input.weatherData)}` : ''}
    ${input.trafficData ? `Traffic Data: ${JSON.stringify(input.trafficData)}` : ''}
    
    Please provide:
    1. Predicted hazard severity (high/medium/low)
    2. Confidence score
    3. Hazard reporting trends
    4. Suggested heatmap intensities`;

    try {
      await this.callGeminiAPI(prompt);
      
      // Process and structure the response
      // Note: This is a simplified example - you'd need to properly parse the Gemini response
      return {
        predictedSeverity: 'high',
        confidence: 0.85,
        hazardTrends: [
          {
            type: 'pothole',
            frequency: 12,
            trend: 'increasing'
          },
          {
            type: 'drainage',
            frequency: 5,
            trend: 'stable'
          }
        ],
        heatmapData: locationReports.map(report => ({
          lat: report.location.lat,
          lng: report.location.lng,
          intensity: report.severity === 'high' ? 0.8 : 
                    report.severity === 'medium' ? 0.5 : 0.2
        }))
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      throw error;
    }
  }
}