#!/usr/bin/env python3
"""
Simple test script to verify the Flask API is working correctly
"""

import requests
import json
import os
from PIL import Image, ImageDraw

def create_test_image():
    """Create a simple test image with mock potholes"""
    # Create a 640x480 image
    img = Image.new('RGB', (640, 480), color='#404040')
    draw = ImageDraw.Draw(img)
    
    # Draw road lines
    draw.line([(320, 0), (320, 480)], fill='white', width=4)
    
    # Draw mock potholes (dark ellipses)
    draw.ellipse([180, 280, 220, 320], fill='#1a1a1a')
    draw.ellipse([420, 180, 480, 230], fill='#1a1a1a')
    
    # Add text
    draw.text((200, 50), "Test Image for Pothole Detection", fill='white')
    
    # Save test image
    test_image_path = 'test_pothole_image.jpg'
    img.save(test_image_path, 'JPEG')
    return test_image_path

def test_health_endpoint():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5000/api/v1/health')
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Status: {data.get('data', {}).get('status')}")
            print(f"   Model loaded: {data.get('data', {}).get('model_loaded')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_detection_endpoint():
    """Test the detection endpoint"""
    print("\nTesting detection endpoint...")
    
    # Create test image
    test_image_path = create_test_image()
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            data = {
                'include_image': 'true',
                'latitude': '40.7128',
                'longitude': '-74.0060'
            }
            
            response = requests.post('http://localhost:5000/api/v1/detect', files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Detection test passed")
            print(f"   Success: {result.get('success')}")
            print(f"   Detections found: {result.get('data', {}).get('detection_count', 0)}")
            
            detections = result.get('data', {}).get('detections', [])
            for i, detection in enumerate(detections):
                print(f"   Detection {i+1}: {detection.get('class')} (confidence: {detection.get('confidence'):.3f}, severity: {detection.get('severity')})")
            
            annotated_url = result.get('data', {}).get('annotated_image_url')
            if annotated_url:
                print(f"   Annotated image: http://localhost:5000{annotated_url}")
            
            return True
        else:
            print(f"❌ Detection test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Detection test error: {e}")
        return False
    finally:
        # Clean up test image
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def main():
    """Run all tests"""
    print("🧪 Testing Flask API Integration")
    print("=" * 40)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    if health_ok:
        # Test detection endpoint
        detection_ok = test_detection_endpoint()
        
        print("\n" + "=" * 40)
        if health_ok and detection_ok:
            print("🎉 All tests passed! API is working correctly.")
            print("\nNext steps:")
            print("1. Start the React app: npm run dev")
            print("2. Test the integration using the test button in the UI")
            print("3. Try the full report flow: Report → Capture → Submit")
        else:
            print("❌ Some tests failed. Check the Flask API logs.")
    else:
        print("\n❌ API is not running or not accessible.")
        print("Make sure to start the Flask API first:")
        print("  python app.py")

if __name__ == '__main__':
    main()
