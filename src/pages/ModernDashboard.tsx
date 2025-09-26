import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
// import { Report } from '../types'; // Removed unused import
import {
  Plus, MapPin, X,
  TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import EnhancedMap from '../components/EnhancedMap';
import ModernReportCard from '../components/ModernReportCard';
import StatsCard from '../components/StatsCard';
import MobileNavigation from '../components/MobileNavigation';
import CitizenHeader from '../components/CitizenHeader';
import ReportFilters, { FilterOptions } from '../components/ReportFilters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ModernDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    reports,
    isGovUser,
    userLocation,
    setUserLocation
  } = useAppStore();

  // Removed selectedReport state since we removed the sidebar
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    severity: [],
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Get user location on mount
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to NYC
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, [userLocation, setUserLocation]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(report => filters.severity.includes(report.severity));
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(report => new Date(report.createdAt) >= today);
        break;
      case 'week':
        filtered = filtered.filter(report => new Date(report.createdAt) >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(report => new Date(report.createdAt) >= monthAgo);
        break;
      case 'custom':
        if (filters.customStartDate) {
          const startDate = new Date(filters.customStartDate);
          filtered = filtered.filter(report => new Date(report.createdAt) >= startDate);
        }
        if (filters.customEndDate) {
          const endDate = new Date(filters.customEndDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          filtered = filtered.filter(report => new Date(report.createdAt) <= endDate);
        }
        break;
    }

    // Sort reports
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'status':
          comparison = a.fixingStatus.localeCompare(b.fixingStatus);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [reports, filters]);

  // Calculate stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.fixingStatus === 'pending').length,
    inProgress: reports.filter(r => r.fixingStatus === 'in_progress').length,
    resolved: reports.filter(r => r.fixingStatus === 'resolved').length,
    highSeverity: reports.filter(r => r.severity === 'high').length
  };

  // User stats removed to fix unused variable warning

  // Removed handleReportSelect since we removed the sidebar

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

      {/* Citizen Header */}
      <CitizenHeader />

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isGovUser ? 'Government Reports' : 'Live Reports Feed'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isGovUser
                  ? ''
                  : ''
                }
              </p>
            </div>
            
            {/* Map button */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={<MapPin className="w-4 h-4" />}
                onClick={() => setShowMap(true)}
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                <span className="hidden sm:inline">View Map</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 md:p-6">
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            className="mb-6"
          />

          {/* Stats Overview - Only for Government */}
          {isGovUser && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
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
          )}

          {/* Removed search and filters section */}

          {/* Main Content - Reports Grid */}
          <div className="w-full">
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReports.map(report => (
                  <ModernReportCard
                    key={report.id}
                    report={report}
                    isGovView={isGovUser}
                    showAnnotatedImages={isGovUser}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600 mb-4">
                  No pothole reports have been submitted yet
                </p>
                {!isGovUser && (
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => navigate('/report')}
                  >
                    Report a Pothole
                  </Button>
                )}
              </Card>
            )}
          </div>

          {/* Map Modal */}
          {showMap && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Reports Map</h3>
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
                    centerLocation={userLocation}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
