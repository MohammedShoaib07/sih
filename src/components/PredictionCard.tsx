import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface PredictionCardProps {
  prediction: {
    predictedSeverity: 'high' | 'medium' | 'low';
    confidence: number;
    trends: {
      statistical: {
        trend: 'increasing' | 'stable' | 'decreasing';
        frequency: number;
        prediction: string;
      };
      ai?: {
        description: string;
        recommendations: string[];
      };
    };
  };
  location: { lat: number; lng: number };
  className?: string;
}

const severityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, location, className = '' }) => {
  return (
    <div className={`rounded-lg border bg-white p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Hazard Prediction</h3>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5" />
          <span>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
        </div>
      </div>

      {/* Severity Prediction */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Predicted Severity</span>
          <span className="text-sm text-gray-500">
            {(prediction.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
        <div className={`px-3 py-2 rounded-md border ${
          severityColors[prediction.predictedSeverity]
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium capitalize">
              {prediction.predictedSeverity} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">Trend Analysis</h4>
        <div className="space-y-2">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Reporting Trend</span>
              <span className={`text-sm ${
                prediction.trends.statistical.trend === 'increasing' ? 'text-red-600' :
                prediction.trends.statistical.trend === 'decreasing' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {prediction.trends.statistical.trend.charAt(0).toUpperCase() + 
                 prediction.trends.statistical.trend.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              ~{prediction.trends.statistical.frequency.toFixed(1)} reports/week
            </div>
          </div>

          {/* AI Insights */}
          {prediction.trends.ai && (
            <div className="bg-purple-50 p-3 rounded-md">
              <span className="text-sm font-medium text-purple-700 mb-1 block">
                AI Insights
              </span>
              <p className="text-sm text-purple-600 mb-2">
                {prediction.trends.ai.description}
              </p>
              {prediction.trends.ai.recommendations.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-purple-700 mb-1 block">
                    Recommendations:
                  </span>
                  <ul className="list-disc list-inside text-xs text-purple-600 space-y-1">
                    {prediction.trends.ai.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;