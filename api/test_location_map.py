#!/usr/bin/env python3
"""
Test script to verify location and map functionality
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAPBOX_ACCESS_TOKEN = os.getenv('MAPBOX_ACCESS_TOKEN')

def test_mapbox_token():
    """Test if Mapbox token is valid"""
    print("Testing Mapbox Configuration")
    print("=" * 40)
    print(f"MAPBOX_ACCESS_TOKEN: {'*' * len(MAPBOX_ACCESS_TOKEN) if MAPBOX_ACCESS_TOKEN else 'None'}")
    
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ ERROR: Mapbox access token not found in .env file")
        return False
    
    # Test token validity
    try:
        test_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token={MAPBOX_ACCESS_TOKEN}"
        response = requests.get(test_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Mapbox token is valid")
            return True
        else:
            print(f"❌ Mapbox token validation failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Mapbox token test failed: {e}")
        return False

def test_static_map_generation():
    """Test static map generation"""
    if not MAPBOX_ACCESS_TOKEN:
        print("❌ Cannot test map generation - no Mapbox token")
        return False
    
    print("\nTesting Static Map Generation")
    print("=" * 40)
    
    # Test coordinates (New York City)
    test_lat = 40.7128
    test_lng = -74.0060
    
    # Generate map URL
    severity_colors = {
        'High': 'ff0000',    # Red
        'Medium': 'ff8c00',  # Orange  
        'Low': '00ff00'      # Green
    }
    
    severity = 'High'
    color = severity_colors.get(severity, 'ff8c00')
    
    map_url = (
        f"https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/"
        f"pin-s+{color}({test_lng},{test_lat})/"
        f"{test_lng},{test_lat},14,0/600x400@2x"
        f"?access_token={MAPBOX_ACCESS_TOKEN}"
    )
    
    print(f"Test coordinates: {test_lat}, {test_lng}")
    print(f"Severity: {severity}")
    print(f"Map URL: {map_url[:100]}...")
    
    try:
        response = requests.get(map_url, timeout=30)
        
        if response.status_code == 200:
            # Save test map
            with open('test_map.png', 'wb') as f:
                f.write(response.content)
            print("✅ Static map generated successfully")
            print("✅ Test map saved as 'test_map.png'")
            return True
        else:
            print(f"❌ Map generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Map generation error: {e}")
        return False

def test_location_parsing():
    """Test location data parsing"""
    print("\nTesting Location Data Parsing")
    print("=" * 40)
    
    # Test location data
    test_locations = [
        {'latitude': '40.7128', 'longitude': '-74.0060'},  # String format
        {'latitude': 40.7128, 'longitude': -74.0060},     # Float format
        {'latitude': None, 'longitude': None},             # None values
        {'latitude': 'invalid', 'longitude': 'invalid'},   # Invalid values
    ]
    
    for i, test_data in enumerate(test_locations):
        print(f"\nTest {i+1}: {test_data}")
        
        try:
            latitude = test_data['latitude']
            longitude = test_data['longitude']
            
            if latitude and longitude:
                location = {
                    'latitude': float(latitude),
                    'longitude': float(longitude)
                }
                print(f"✅ Parsed successfully: {location}")
            else:
                print("⚠️  No location data provided")
                
        except (ValueError, TypeError) as e:
            print(f"❌ Parsing failed: {e}")

def main():
    """Main test function"""
    print("🗺️  Location & Map Testing")
    print("=" * 50)
    
    # Test Mapbox token
    token_valid = test_mapbox_token()
    
    # Test static map generation
    if token_valid:
        map_success = test_static_map_generation()
    else:
        map_success = False
    
    # Test location parsing
    test_location_parsing()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS:")
    print(f"Mapbox Token: {'VALID' if token_valid else 'INVALID'}")
    print(f"Map Generation: {'SUCCESS' if map_success else 'FAILED'}")
    
    if token_valid and map_success:
        print("\n🎉 Location and map functionality is working!")
        print("If emails still don't show location/maps, check:")
        print("1. Location permission in browser")
        print("2. Flask API debug logs")
        print("3. Email HTML rendering")
    else:
        print("\n⚠️  Issues found with location/map functionality")
        print("Check your Mapbox configuration in .env file")

if __name__ == "__main__":
    main()
