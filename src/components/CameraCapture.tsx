import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X } from 'lucide-react';
import { Detection } from '../types';

import usePotholeDetection from '../hooks/usePotholeDetection';

interface CameraCaptureProps {
  onCapture: (photo: string, detections: Detection[], severity: 'high' | 'medium' | 'low') => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { checkHealth } = usePotholeDetection();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      const healthy = await checkHealth();
      setApiHealthy(healthy);
      if (!healthy) {
        console.warn('Flask API error');
      }
    };

    checkApiHealth();
  }, [checkHealth]);

  // No real-time detection needed - Flask API will handle detection

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // No mock detections - let the Flask API handle real detection
        onCapture(imageSrc, [], 'medium');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full animate-pop-in">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <h2 className="text-lg font-semibold">Pothole Detection Camera</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "environment"
            }}
            onUserMedia={() => setIsCameraReady(true)}
            className="w-full"
          />
          
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        
        <div className="p-4 flex justify-between items-center">
          <div className="text-sm">
            {apiHealthy === false && (
              <div className="text-orange-500 mb-1">API offline error</div>
            )}
            <span className="text-gray-500">Show me the Potholes!!</span>
          </div>
          
          <button
            onClick={handleCapture}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full flex items-center"
            disabled={!isCameraReady}
          >
            <Camera size={20} className="mr-2" />
            Capture
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;