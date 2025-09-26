// utils/apiTest.ts
import PotholeDetectionAPI from '../services/potholeAPI';

export const testFlaskAPIConnection = async (): Promise<boolean> => {
  const api = new PotholeDetectionAPI();
  
  try {
    console.log('Testing Flask API connection...');
    const healthResponse = await api.healthCheck();
    
    if (healthResponse.success) {
      console.log('✅ Flask API is running and healthy');
      return true;
    } else {
      console.log('❌ Flask API health check failed:', healthResponse.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to Flask API:', error);
    console.log('Make sure the Flask API is running on http://localhost:5000');
    return false;
  }
};

export const createTestImageFile = (): Promise<File> => {
  return new Promise((resolve) => {
    // Create a simple test image as a File object
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a road-like background
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, 0, 640, 480);

      // Draw road lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 480);
      ctx.stroke();

      // Draw mock "potholes" (dark irregular shapes)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(200, 300, 40, 25, 0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(450, 200, 35, 30, Math.PI/4, 0, 2 * Math.PI);
      ctx.fill();

      // Add some texture
      ctx.fillStyle = '#606060';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 640;
        const y = Math.random() * 480;
        ctx.fillRect(x, y, 2, 2);
      }

      // Add text
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText('Test Image for Pothole Detection', 180, 50);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'test-pothole-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }
    }, 'image/jpeg', 0.8);
  });
};

export const testPotholeDetection = async (): Promise<void> => {
  const api = new PotholeDetectionAPI();

  try {
    console.log('Creating test image...');
    const testFile = await createTestImageFile();

    console.log('Testing pothole detection...');
    const result = await api.detectPotholes(testFile, {
      includeImage: true,
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    });

    if (result.success && result.data) {
      console.log('✅ Detection successful!');
      console.log(`Found ${result.data.detection_count} pothole(s)`);
      console.log('Detections:', result.data.detections);

      if (result.data.annotated_image_url) {
        console.log('Annotated image URL:', `http://localhost:5000${result.data.annotated_image_url}`);
      }
    } else {
      console.log('❌ Detection failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Detection test failed:', error);
  }
};

// Function to run all tests
export const runAPITests = async (): Promise<void> => {
  console.log('🧪 Running Flask API integration tests...');
  
  const isHealthy = await testFlaskAPIConnection();
  
  if (isHealthy) {
    await testPotholeDetection();
  } else {
    console.log('Skipping detection test due to API connection failure');
  }
  
  console.log('🏁 API tests completed');
};
