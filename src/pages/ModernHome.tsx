import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store';
import {
  X, Search,
  TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import EnhancedMap from '../components/EnhancedMap';
import StatsCard from '../components/StatsCard';
import MobileNavigation from '../components/MobileNavigation';
import CitizenHeader from '../components/CitizenHeader';
import LocationRadiusSelector from '../components/LocationRadiusSelector';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ModernHome: React.FC = () => {
  const {
    reports,
    isGovUser,
    userLocation,
    setUserLocation,
    govLocation,
    currentUser
  } = useAppStore();
  
  const [showMap, setShowMap] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Get location on mount for citizen users only (gov location set during profile setup)
  useEffect(() => {
    if (!isGovUser && !userLocation && navigator.geolocation && locationStatus === 'idle') {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
          // Hide success message after 3 seconds
          setTimeout(() => setLocationStatus('idle'), 3000);
        },
        (error) => {
          console.log('Location access denied:', error);
          setLocationStatus('error');
          // Default to NYC
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          // Hide error message after 5 seconds
          setTimeout(() => setLocationStatus('idle'), 5000);
        }
      );
    }
  }, [isGovUser, userLocation, setUserLocation, locationStatus]);

  // Filter reports (simple filtering for home page)
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Government location filter (5km radius)
    if (isGovUser && govLocation) {
      filtered = filtered.filter(report => {
        const distance = Math.sqrt(
          Math.pow(report.location.lat - govLocation.lat, 2) +
          Math.pow(report.location.lng - govLocation.lng, 2)
        ) * 111; // Rough conversion to km
        return distance <= 5;
      });
    }

    // Default sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [reports, isGovUser, govLocation]);

  // Calculate stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.fixingStatus === 'pending').length,
    inProgress: reports.filter(r => r.fixingStatus === 'in_progress').length,
    resolved: reports.filter(r => r.fixingStatus === 'resolved').length,
    highSeverity: reports.filter(r => r.severity === 'high').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Centered Logo Header - Flush with top, no extra spacing on mobile */}
      <div className="bg-white border-b border-gray-200 md:pl-64 pt-0 md:pt-0 mt-0">
        <div className="flex items-center justify-center py-1 md:py-3">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center">
              <img
                src="/logo2.jpg"
                alt="FixMyPothole.AI Logo"
                className="w-10 h-10 md:w-16 md:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Header - only for citizens */}
      {!isGovUser && <CitizenHeader />}

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        {/* Location Status Messages */}
        {!isGovUser && locationStatus !== 'idle' && (
          <div className={`px-4 py-3 text-sm ${
            locationStatus === 'loading' ? 'bg-blue-50 text-blue-700 border-b border-blue-200' :
            locationStatus === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' :
            'bg-red-50 text-red-700 border-b border-red-200'
          }`}>
            <div className="flex items-center justify-center">
              {locationStatus === 'loading' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Detecting your location...
                </>
              )}
              {locationStatus === 'success' && '✓ Location detected successfully'}
              {locationStatus === 'error' && '⚠ Location access denied. Using default location.'}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              {!isGovUser && currentUser && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">Welcome,</span>
                  <span className="text-sm font-medium text-blue-600">
                    {currentUser.name}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {!isGovUser && (
                <Button
                  variant="secondary"
                  icon={<Search className="w-4 h-4" />}
                  onClick={() => setShowLocationSelector(true)}
                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  <span className="hidden sm:inline">Reports in Area</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview - Only for Government */}
        <div className="p-4 md:p-6">
          {isGovUser && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Overall Report Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard
                title="Total Reports"
                value={stats.total}
                icon={AlertTriangle}
                
              />
              <StatsCard
                title="Pending"
                value={stats.pending}
                icon={Clock}
                
              />
              <StatsCard
                title="In Progress"
                value={stats.inProgress}
                icon={TrendingUp}
                
              />
              <StatsCard
                title="Resolved"
                value={stats.resolved}
                icon={CheckCircle}
                
              />
              <StatsCard
                title="High Priority"
                value={stats.highSeverity}
                icon={AlertTriangle}
                
              />
              </div>
            </div>
          )}

          {/* Main Map View */}
          <div className="w-full">
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Citizen's Reports Map</h2>
                <span className="text-xs md:text-sm text-gray-500">
                  {filteredReports.length} reports shown
                </span>
              </div>
              <EnhancedMap
                reports={filteredReports}
                height="360px"
                className="w-full rounded-xl"
                centerLocation={isGovUser ? govLocation : userLocation}
                showRadius={isGovUser}
              />
            </Card>
          </div>

          {/* Map Modal */}
          {showMap && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Full Screen Map</h3>
                  <Button
                    variant="ghost"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => setShowMap(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </Button>
                </div>
                <div className="flex-1 p-4">
                  <EnhancedMap
                    reports={filteredReports}
                    height="100%"
                    className="w-full h-full"
                    centerLocation={isGovUser ? govLocation : userLocation}
                    showRadius={isGovUser}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location Radius Selector - Only for Citizens */}
          {!isGovUser && (
            <LocationRadiusSelector
              isOpen={showLocationSelector}
              onClose={() => setShowLocationSelector(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernHome;
