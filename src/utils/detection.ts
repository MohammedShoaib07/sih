import { Detection } from '../types';

// Legacy model loading for backward compatibility
// Now just returns a resolved promise since we use Flask API
export const loadModel = async (): Promise<boolean> => {
  console.log('Model loading is now handled by Flask API');
  return Promise.resolve(true);
};

// Legacy function for backward compatibility
// Now returns mock detections for components that still use this directly
export const detectPotholes = async (): Promise<Detection[]> => {
  console.warn('detectPotholes is deprecated. Use usePotholeDetection hook instead.');

  // Return mock detections for backward compatibility
  return getMockDetections();
};

// Mock function to generate random detections (kept for backward compatibility)
const getMockDetections = (): Detection[] => {
  const numDetections = Math.floor(Math.random() * 3) + 1; // 1 to 3 detections
  const detections: Detection[] = [];

  for (let i = 0; i < numDetections; i++) {
    detections.push({
      box: {
        x: Math.random() * 0.7, // Normalized coordinates (0-1)
        y: Math.random() * 0.7,
        width: Math.random() * 0.3 + 0.1,
        height: Math.random() * 0.3 + 0.1
      },
      class: 'pothole',
      confidence: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
    });
  }

  return detections;
};

// Determine severity based on detection data
export const determineSeverity = (detections: Detection[]): 'high' | 'medium' | 'low' => {
  if (detections.length === 0) return 'low';
  
  // Calculate average confidence
  const avgConfidence = detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length;
  
  // Calculate average size (area) - only for detections with box property
  const detectionsWithBox = detections.filter(det => det.box);
  const avgSize = detectionsWithBox.length > 0
    ? detectionsWithBox.reduce((sum, det) => sum + (det.box!.width * det.box!.height), 0) / detectionsWithBox.length
    : 0;
  
  // Combine factors to determine severity
  const severityScore = avgConfidence * 0.6 + avgSize * 0.4;
  
  if (severityScore > 0.7) return 'high';
  if (severityScore > 0.4) return 'medium';
  return 'low';
};

// Draw detection boxes on a canvas
export const drawDetections = (
  canvas: HTMLCanvasElement,
  detections: Detection[],
  videoWidth: number,
  videoHeight: number
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw each detection
  detections.forEach(detection => {
    // Skip detections without box property
    if (!detection.box) return;

    // Convert normalized coordinates to pixel coordinates
    const x = detection.box.x * videoWidth;
    const y = detection.box.y * videoHeight;
    const width = detection.box.width * videoWidth;
    const height = detection.box.height * videoHeight;
    
    // Set styles based on confidence
    const alpha = Math.min(detection.confidence + 0.2, 1);
    
    // Draw bounding box
    ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw background for text
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.7})`;
    const textPadding = 2;
    const textWidth = ctx.measureText(`Pothole: ${Math.round(detection.confidence * 100)}%`).width;
    ctx.fillRect(x, y - 20, textWidth + textPadding * 2, 20);
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Pothole: ${Math.round(detection.confidence * 100)}%`, x + textPadding, y - 5);
  });
};