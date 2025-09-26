import React, { useState, useMemo } from 'react';
import { MapPin, X, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import EnhancedMap from '../components/EnhancedMap';
import ModernReportCard from '../components/ModernReportCard';
import StatsCard from '../components/StatsCard';
import MobileNavigation from '../components/MobileNavigation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReportFilters, { FilterOptions } from '../components/ReportFilters';
import { useAppStore } from '../store';
import { filterReportsWithinRadius } from '../utils/location';

const GovDashboard: React.FC = () => {
  const {
    reports,
    govLocation
  } = useAppStore();

  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    severity: [],
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Government location is set during profile setup, no auto-detection needed
  // Filter reports within 5km radius for government users with additional filters
  const filteredReports = useMemo(() => {
    let filtered = govLocation
      ? filterReportsWithinRadius(reports, govLocation.lat, govLocation.lng, 5)
      : [];

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
  }, [reports, govLocation, filters]);

  // Calculate stats based on filtered reports
  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter(r => r.verified === 'pending').length,
    inProgress: filteredReports.filter(r => r.fixingStatus === 'in_progress').length,
    resolved: filteredReports.filter(r => r.fixingStatus === 'resolved').length,
    highSeverity: filteredReports.filter(r => r.severity === 'high').length
  };
  
  return (
    <div className="min-h-screen bg-red-50">
      <MobileNavigation />

      {/* Centered Logo Header - Flush with top */}
      <div className="bg-white border-b border-gray-200 md:pl-64 pt-0 md:pt-0">
        <div className="flex items-center justify-center py-2 md:py-3">
          <div className="flex items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <img
                src="/logo2.jpg"
                alt="FixMyPothole.AI Logo"
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        {/* Header */}
        <div className="bg-red-900 border-b border-red-800 px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Reports Submitted under your Area</h1>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-900">
                  5km Radius Assigned Reports & Stats
                </span>
              </div>
            </div>

            {/* Map button */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={<MapPin className="w-4 h-4" />}
                onClick={() => setShowMap(true)}
                className="bg-red-200 text-red-900 border-red-300 hover:bg-red-300"
              >
                <span className="hidden sm:inline">View Map</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-6 pt-4 md:pt-4">
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            className="mb-4"
          />

          {/* Stats Overview */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Reports Stats in your Radius</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatsCard
              title="Total Reports"
              value={stats.total}
              icon={AlertTriangle}
              
            />
            <StatsCard
              title="Pending Review"
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

          {/* Reports Grid */}
          <div className="w-full">
            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReports.map(report => (
                  <ModernReportCard
                    key={report.id}
                    report={report}
                    isGovView={true}
                    showAnnotatedImages={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600 mb-4">
                  No pothole reports submitted yet
                </p>
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
                    showRadius={true}
                    centerLocation={govLocation}
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

export default GovDashboard;