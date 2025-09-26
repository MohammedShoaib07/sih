#!/usr/bin/env python3
"""
Test script to verify geocoding functionality
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

def test_reverse_geocoding():
    """Test reverse geocoding with sample coordinates"""
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ ERROR: Mapbox access token not found")
        return False
    
    print("Testing Reverse Geocoding")
    print("=" * 40)
    
    # Test coordinates (various locations)
    test_locations = [
        {"name": "New York City", "lat": 40.7128, "lng": -74.0060},
        {"name": "London", "lat": 51.5074, "lng": -0.1278},
        {"name": "Bangalore", "lat": 12.9716, "lng": 77.5946},
        {"name": "Ballari (your area)", "lat": 15.1394, "lng": 76.9214},
    ]
    
    for location in test_locations:
        print(f"\n📍 Testing: {location['name']}")
        print(f"Coordinates: {location['lat']}, {location['lng']}")
        
        try:
            # Mapbox Geocoding API for reverse geocoding
            geocoding_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location['lng']},{location['lat']}.json?access_token={MAPBOX_ACCESS_TOKEN}"
            
            response = requests.get(geocoding_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('features'):
                    # Get the most relevant result
                    place = data['features'][0]
                    address = place.get('place_name', 'Address not found')
                    print(f"✅ Address: {address}")
                else:
                    print("❌ No address features found")
            else:
                print(f"❌ Geocoding API error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return True

def test_map_generation():
    """Test map generation with sample coordinates"""
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ ERROR: Mapbox access token not found")
        return False
    
    print("\n\nTesting Map Generation")
    print("=" * 40)
    
    # Test coordinates (Ballari area)
    test_lat = 15.1394
    test_lng = 76.9214
    
    severities = ['High', 'Medium', 'Low']
    
    for severity in severities:
        print(f"\n🗺️ Generating {severity} severity map...")
        
        try:
            # Determine marker color and size based on severity
            if severity == 'High':
                color = 'ff0000'  # Red
                size = 'l'
            elif severity == 'Medium':
                color = 'ffaa00'  # Orange
                size = 'm'
            else:
                color = '00ff00'  # Green
                size = 's'

            # Create URL for static map
            base_url = "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static"
            marker = f"pin-{size}+{color}({test_lng},{test_lat})"
            zoom = 14
            map_size = "600x400"

            map_url = f"{base_url}/{marker}/{test_lng},{test_lat},{zoom}/{map_size}?access_token={MAPBOX_ACCESS_TOKEN}"
            
            print(f"Map URL: {map_url[:100]}...")
            
            # Download map image
            response = requests.get(map_url, timeout=30)
            
            if response.status_code == 200:
                # Save test map
                filename = f"test_map_{severity.lower()}.png"
                with open(filename, 'wb') as f:
                    f.write(response.content)
                print(f"✅ Map saved as: {filename}")
            else:
                print(f"❌ Map generation failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error generating map: {e}")
    
    return True

def test_combined_functionality():
    """Test combined address + map functionality"""
    print("\n\nTesting Combined Functionality")
    print("=" * 40)
    
    # Test with Ballari coordinates
    test_lat = 15.1394
    test_lng = 76.9214
    
    print(f"📍 Test Location: {test_lat}, {test_lng}")
    
    # Get address
    try:
        geocoding_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{test_lng},{test_lat}.json?access_token={MAPBOX_ACCESS_TOKEN}"
        response = requests.get(geocoding_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('features'):
                address = data['features'][0].get('place_name', 'Address not found')
                print(f"📍 Address: {address}")
            else:
                print("❌ No address found")
        else:
            print(f"❌ Address lookup failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Address error: {e}")
    
    # Generate map
    try:
        base_url = "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static"
        marker = f"pin-l+ff0000({test_lng},{test_lat})"
        zoom = 14
        map_size = "600x400"

        map_url = f"{base_url}/{marker}/{test_lng},{test_lat},{zoom}/{map_size}?access_token={MAPBOX_ACCESS_TOKEN}"
        
        response = requests.get(map_url, timeout=30)
        
        if response.status_code == 200:
            with open('test_combined_map.png', 'wb') as f:
                f.write(response.content)
            print(f"✅ Combined test map saved as: test_combined_map.png")
        else:
            print(f"❌ Combined map generation failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Combined map error: {e}")

def main():
    """Main test function"""
    print("🗺️ Geocoding & Map Testing")
    print("=" * 50)
    
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ ERROR: MAPBOX_ACCESS_TOKEN not found in .env file")
        return
    
    print(f"✅ Mapbox token loaded: {'*' * len(MAPBOX_ACCESS_TOKEN)}")
    
    # Run tests
    test_reverse_geocoding()
    test_map_generation()
    test_combined_functionality()
    
    print("\n" + "=" * 50)
    print("🎉 Testing complete!")
    print("Check the generated PNG files to verify map generation.")
    print("If this works but emails still don't show location/maps:")
    print("1. Check Flask API debug logs")
    print("2. Verify location permission in browser")
    print("3. Check email HTML rendering")

if __name__ == "__main__":
    main()
