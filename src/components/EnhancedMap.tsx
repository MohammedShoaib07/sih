import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L, { divIcon } from 'leaflet';
import { useAppStore } from '../store';
import { Report, TextReport } from '../types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import MapFilterDropdown from './MapFilterDropdown';
import { MapPin, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import PredictiveHeatmap from './PredictiveHeatmap';
import 'leaflet/dist/leaflet.css';

// Constants for marker styling
const severityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

const statusOpacity = {
  pending: 0.6,
  verified: 1,
  rejected: 0.3,
};

// Component to update map center when location changes
const MapCenterUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

// Custom marker icons
const createLocationIcon = (isGov: boolean) => {
  const color = isGov ? '#dc2626' : '#3b82f6'; // Red for gov, blue for citizen
  const label = isGov ? 'Gov Office' : 'Your Location';

  return divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: ${color};
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        ">${label}</div>
      </div>
    `,
    className: 'location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createMarkerIcon = (report: Report | TextReport) => {
  const isHighPriority = report.priority === 'high';
  const isPothole = 'photo' in report;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${isHighPriority ? '32px' : '24px'};
        height: ${isHighPriority ? '32px' : '24px'};
        background: ${severityColors[report.severity as keyof typeof severityColors] || severityColors.medium};
        opacity: ${statusOpacity[report.verified as keyof typeof statusOpacity] || statusOpacity.pending};
        border: ${isHighPriority ? '3px' : '2px'} solid ${isHighPriority ? '#ff0000' : 'white'};
        border-radius: 50%;
        box-shadow: ${isHighPriority ? '0 0 8px rgba(255,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.2)'};
        display: flex;
        align-items: center;
        justify-content: center;
        animation: ${isHighPriority ? 'pulse 2s infinite' : 'none'};
      ">
        <div style="
          width: ${isPothole ? '8px' : '12px'};
          height: ${isPothole ? '8px' : '12px'};
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: ${severityColors[report.severity as keyof typeof severityColors] || severityColors.medium};
        ">
          ${!isPothole ? ('issueType' in report ? report.issueType.charAt(0).toUpperCase() : '!') : ''}
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [isHighPriority ? 32 : 24, isHighPriority ? 32 : 24],
    iconAnchor: [isHighPriority ? 16 : 12, isHighPriority ? 16 : 12]
  });
}

// MapControls component removed - replaced with MapFilterDropdown

interface ReportPopupProps {
  report: Report;
  onViewDetails: (report: Report) => void;
}

const ReportPopup: React.FC<ReportPopupProps> = ({ report, onViewDetails }) => {
  const { voteReport, currentUser } = useAppStore();
  
  const handleVote = (voteType: 'up' | 'down') => {
    if (currentUser) {
      voteReport(report.id, voteType);
    }
  };

  const hasUpvoted = currentUser && report.upvotedBy?.includes(currentUser.id);
  const hasDownvoted = currentUser && report.downvotedBy?.includes(currentUser.id);

  return (
    <div className="w-64 p-1">
      {/* Image */}
      <div className="relative mb-3">
        <img 
          src={report.annotatedImageUrl || report.photo} 
          alt="Pothole"
          className="w-full h-32 object-cover rounded-lg"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="severity" value={report.severity} showDot />
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="status" value={report.fixingStatus} showDot />
        </div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {report.location.address || 'Unknown location'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {report.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {report.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('up')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              hasUpvoted 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            {report.upvotes}
          </button>
          
          <button
            onClick={() => handleVote('down')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              hasDownvoted 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            {report.downvotes}
          </button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          icon={<Eye className="w-3 h-3" />}
          onClick={() => onViewDetails(report)}
        >
          Details
        </Button>
      </div>
    </div>
  );
};

interface EnhancedMapProps {
  reports: Report[];
  onReportSelect?: (report: Report) => void;
  height?: string;
  className?: string;
  showRadius?: boolean;
  centerLocation?: { lat: number; lng: number } | null;
}

const EnhancedMap: React.FC<EnhancedMapProps> = ({
  reports,
  onReportSelect,
  height = '400px',
  className = '',
  showRadius = false,
  centerLocation = null
}) => {
  const { userLocation, govLocation, isGovUser } = useAppStore();
  const [filters, setFilters] = useState({
    severity: ['high', 'medium', 'low'],
    status: ['pending', 'in_progress', 'resolved', 'rejected']
  });

  const filteredReports = reports.filter(report => 
    filters.severity.includes(report.severity) &&
    filters.status.includes(report.fixingStatus)
  );

  // Determine map center based on user type and available locations
  const currentLocation = isGovUser ? govLocation : userLocation;
  const displayLocation = centerLocation || currentLocation;

  const defaultCenter: [number, number] = displayLocation
    ? [displayLocation.lat, displayLocation.lng]
    : [40.7128, -74.0060]; // NYC default

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl overflow-hidden"
      >
        <MapCenterUpdater center={defaultCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createLocationIcon(isGovUser)}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  {isGovUser ? 'Government Office' : 'Your Location'}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5km radius circle for government users */}
        {isGovUser && showRadius && currentLocation && (
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={5000} // 5km in meters
            pathOptions={{
              color: '#dc2626',
              fillColor: '#dc2626',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* Report markers */}
        {filteredReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createMarkerIcon(report)}
          >
            <Popup>
              <ReportPopup
                report={report}
                onViewDetails={onReportSelect || (() => {})}
              />
            </Popup>
          </Marker>
        ))}

        {/* Show heatmap for predicted hotspots */}
        {centerLocation && showRadius && (
          <PredictiveHeatmap location={centerLocation} />
        )}
      </MapContainer>

      {/* Filter Dropdown */}
      <div className="absolute top-4 left-4 z-[10000]">
        <MapFilterDropdown
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Report count */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{filteredReports.length}</span> reports shown
        </p>
      </div>
    </div>
  );
};

export default EnhancedMap;
