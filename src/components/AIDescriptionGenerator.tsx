import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface AIDescriptionGeneratorProps {
  imageFile: File | null;
  location: { lat: number; lng: number; address?: string } | null;
  onDescriptionGenerated: (description: string) => void;
  currentDescription: string;
  onClearDescription: () => void;
}

const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  imageFile,
  location,
  onDescriptionGenerated,
  currentDescription,
  onClearDescription
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = async () => {
    if (!imageFile) {
      setError('Please capture an image first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (location) {
        formData.append('location', JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          address: location.address || 'Location detected'
        }));
      }

      const response = await fetch('http://localhost:5000/api/v1/generate-description', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onDescriptionGenerated(data.description);
        setError(null);
      } else {
        // Handle specific error types
        const errorType = data.error_type;
        let errorMessage = data.error || 'Failed to generate description';

        switch (errorType) {
          case 'overloaded':
            errorMessage = 'AI is busy right now. Please wait a moment and try again.';
            break;
          case 'timeout':
            errorMessage = 'AI took too long to respond. Please try again.';
            break;
          case 'quota_exceeded':
            errorMessage = 'Daily AI limit reached. Please try again tomorrow.';
            break;
          default:
            errorMessage = `❌ ${errorMessage}`;
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error generating description:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    onClearDescription();
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* AI Description Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={generateDescription}
          disabled={!imageFile || isGenerating}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${!imageFile || isGenerating 
              ? 'bg-black text-white cursor-not-allowed' 
              : 'text-sm bg-gradient-to-r from-pink-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }
          `}
          variant="primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Write with AI
            </>
          )}
        </Button>

        {currentDescription && (
          <Button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 bg-black text-white hover:bg-black rounded-lg transition-colors duration-200"
            variant="secondary"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            {imageFile && (
              <button
                onClick={generateDescription}
                disabled={isGenerating}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors duration-200"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Generated Description Display */}
      {currentDescription && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI Generated Description</span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {currentDescription}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDescriptionGenerator;
