import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { X, MapPin, Search } from 'lucide-react';
import { useAppStore } from '../store';
import { calculateDistance } from '../utils/location';
import Button from './ui/Button';
import 'leaflet/dist/leaflet.css';

interface LocationRadiusSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Custom marker for selected location
const createLocationMarker = () => {
  return divIcon({
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const LocationRadiusSelector: React.FC<LocationRadiusSelectorProps> = ({ isOpen, onClose }) => {
  const { reports, userLocation } = useAppStore();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(1); // Default 1km
  const [reportsInRadius, setReportsInRadius] = useState(0);

  // Initialize with user's current location
  useEffect(() => {
    if (userLocation && !selectedLocation) {
      setSelectedLocation(userLocation);
    }
  }, [userLocation, selectedLocation]);

  // Calculate reports within radius whenever location or radius changes
  useEffect(() => {
    if (selectedLocation) {
      const count = reports.filter(report => {
        const distance = calculateDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          report.location.lat,
          report.location.lng
        );
        return distance <= radius;
      }).length;
      setReportsInRadius(count);
    }
  }, [selectedLocation, radius, reports]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
    }
  };

  if (!isOpen) return null;

  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [40.7128, -74.0060]; // NYC default

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reports in Area</h3>
            <p className="text-sm text-gray-600">Click on the map to select a location and enter custom radius (up to 1000 km) find potholes and take preventive actions </p>
          </div>
          <Button
            variant="ghost"
            icon={<X className="w-4 h-4" />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              variant="secondary"
              icon={<MapPin className="w-4 h-4" />}
              onClick={handleUseCurrentLocation}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Use My current Location
            </Button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Radius:</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={radius === 0 ? '' : radius}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setRadius(0);
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
                        setRadius(numValue);
                      }
                    }
                  }}
                  min="0.1"
                  max="1000"
                  step="0.1"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter radius"
                />
                <span className="text-sm text-gray-600">km</span>
              </div>
            </div>

            {selectedLocation && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {reportsInRadius} reports found
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              
              {/* Selected location marker */}
              {selectedLocation && (
                <>
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={createLocationMarker()}
                  />
                  <Circle
                    center={[selectedLocation.lat, selectedLocation.lng]}
                    radius={radius * 1000} // Convert km to meters
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  />
                </>
              )}
              
              {/* Report markers within radius */}
              {selectedLocation && reports
                .filter(report => {
                  const distance = calculateDistance(
                    selectedLocation.lat,
                    selectedLocation.lng,
                    report.location.lat,
                    report.location.lng
                  );
                  return distance <= radius;
                })
                .map(report => (
                  <Marker
                    key={report.id}
                    position={[report.location.lat, report.location.lng]}
                    icon={divIcon({
                      html: `<div style="width: 12px; height: 12px; background: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                      className: 'report-marker',
                      iconSize: [12, 12],
                      iconAnchor: [6, 6]
                    })}
                  />
                ))
              }
            </MapContainer>
          </div>
        </div>

        {/* Results Summary */}
        {selectedLocation && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {reportsInRadius} pothole reports found in this region
              </p>
              <p className="text-sm text-gray-600">
                within {radius} km of selected location
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationRadiusSelector;
