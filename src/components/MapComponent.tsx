import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store';
import { Report } from '../types';
import { icon } from 'leaflet';
import { getCurrentLocation } from '../utils/location';

// Fix for Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Customize marker icons
const createMarkerIcon = (color: string) => {
  return icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: color,
  });
};

const highSeverityIcon = createMarkerIcon('text-red-500');
const mediumSeverityIcon = createMarkerIcon('text-orange-500');
const lowSeverityIcon = createMarkerIcon('text-green-500');
const userLocationIcon = createMarkerIcon('text-blue-500');

interface MapComponentProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  filterRadius?: number;
}

// Component to recenter map when center changes
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  centerLat,
  centerLng,
  zoom = 13,
  filterRadius
}) => {
  const { reports, isGovUser, govUser, userLocation, setUserLocation } = useAppStore();

  // Explicitly type reports to ensure Report type is used
  const typedReports: Report[] = reports;
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    userLocation ? [userLocation.lat, userLocation.lng] : [centerLat || 0, centerLng || 0]
  );

  useEffect(() => {
    const initLocation = async () => {
      try {
        const position = await getCurrentLocation();
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setMapCenter([newLocation.lat, newLocation.lng]);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    if (!userLocation && !isGovUser) {
      initLocation();
    }
  }, [userLocation, isGovUser, setUserLocation]);

  useEffect(() => {
    if (isGovUser && govUser) {
      setMapCenter([govUser.location.lat, govUser.location.lng]);
    }
  }, [isGovUser, govUser]);

  const getMarkerIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return highSeverityIcon;
      case 'medium': return mediumSeverityIcon;
      case 'low': return lowSeverityIcon;
    }
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User or Government Location */}
        {(userLocation || (isGovUser && govUser)) && (
          <Marker
            position={isGovUser && govUser 
              ? [govUser.location.lat, govUser.location.lng]
              : [userLocation!.lat, userLocation!.lng]
            }
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">
                  {isGovUser ? 'Government Office Location' : 'Your Location'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Government Radius Circle */}
        {isGovUser && govUser && filterRadius && (
          <Circle
            center={[govUser.location.lat, govUser.location.lng]}
            radius={filterRadius * 1000} // Convert km to meters
            className="radius-circle"
          />
        )}
        
        {/* Report Markers */}
        {typedReports.map(report => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={getMarkerIcon(report.severity)}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="mb-2">
                  <p className="font-semibold">Reported by: {report.userName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {(report.annotatedImageUrl || report.photo) && (
                  <div className="mb-2">
                    <img
                      src={report.annotatedImageUrl || report.photo}
                      alt="Pothole"
                      className="w-full h-24 object-cover rounded-md"
                    />
                    {report.annotatedImageUrl && (
                      <p className="text-xs text-gray-500 mt-1">
                        AI-detected potholes highlighted
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-sm mb-1">
                  <span>Severity: 
                    <span className={`font-medium ml-1 ${
                      report.severity === 'high' ? 'text-red-500' : 
                      report.severity === 'medium' ? 'text-orange-500' : 
                      'text-green-500'
                    }`}>
                      {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                    </span>
                  </span>
                  <span>Confidence: {Math.round(report.confidence * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-sm mb-1">
                  <span>Status: 
                    <span className={`font-medium ml-1 ${
                      report.verified === 'verified' ? 'text-green-500' : 
                      report.verified === 'rejected' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {report.verified.charAt(0).toUpperCase() + report.verified.slice(1)}
                    </span>
                  </span>
                  <span>Fixing: 
                    <span className={`font-medium ml-1 ${
                      report.fixingStatus === 'resolved' ? 'text-green-500' : 
                      report.fixingStatus === 'in_progress' ? 'text-blue-500' : 
                      'text-gray-500'
                    }`}>
                      {report.fixingStatus === 'in_progress' ? 'In Progress' : 
                       report.fixingStatus.charAt(0).toUpperCase() + report.fixingStatus.slice(1)}
                    </span>
                  </span>
                </div>
                
                {report.description && (
                  <p className="text-sm mt-2">{report.description}</p>
                )}
                
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>👍 {report.upvotes}</span>
                  <span>👎 {report.downvotes}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <ChangeMapView center={mapCenter} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;