import React, { useState, useEffect } from 'react';

interface DetectionProgressBarProps {
  isActive: boolean;
  currentStep: 'capturing' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  onComplete?: () => void;
}

const DetectionProgressBar: React.FC<DetectionProgressBarProps> = ({
  isActive,
  currentStep,
  progress,
  message,
  onComplete
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(0);
    }
  }, [progress, isActive]);

  useEffect(() => {
    if (currentStep === 'complete' && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  if (!isActive) return null;

  const steps = [
    { key: 'capturing', label: 'Image Captured' },
    { key: 'uploading', label: 'Uploaded' },
    { key: 'processing', label: 'Processed' },
    { key: 'analyzing', label: 'AI Analysis' },
    { key: 'complete', label: 'Complete' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (currentStep === 'error') return 'error';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <span className={`text-2xl ${currentStep === 'error' ? 'text-red-500' : 'text-blue-500'} ${
              currentStep === 'processing' || currentStep === 'analyzing' ? 'animate-pulse' : ''
            }`}>
              {currentStep === 'error' ? '⚠️' : '🔍'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStep === 'error' ? 'Detection Error' : 'AI Pothole Detection'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {message || 'Processing your images with our ML model...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                currentStep === 'error' 
                  ? 'bg-red-500' 
                  : currentStep === 'complete'
                  ? 'bg-green-500'
                  : 'bg-black'
              }`}
              style={{ width: `${animatedProgress}%` }}
            >
              {(currentStep === 'processing' || currentStep === 'analyzing') && (
                <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(index);

            return (
              <div key={step.key} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  status === 'complete'
                    ? 'bg-green-100 text-green-600'
                    : status === 'active'
                    ? 'bg-blue-100 text-blue-600'
                    : status === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {status === 'complete' ? '✓' : status === 'error' ? '✗' : index + 1}
                </div>
                <span className={`text-sm ${
                  status === 'complete'
                    ? 'text-green-600 font-medium'
                    : status === 'active'
                    ? 'text-blue-600 font-medium'
                    : status === 'error'
                    ? 'text-red-600 font-medium'
                    : 'text-gray-500'
                }`}>
                  {step.label}
                  {status === 'active' && (
                    <span className="ml-2 inline-flex">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {currentStep === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {message || 'Failed to process image. Please try again.'}
            </p>
          </div>
        )}

        {/* Success Message */}
        {currentStep === 'complete' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Detection complete! Results are ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionProgressBar;
