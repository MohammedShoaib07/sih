import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import Button from './ui/Button';

interface FilterOptions {
  severity: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  sortBy: 'date' | 'severity' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface ReportFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFiltersChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeverityChange = (severity: string) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    
    onFiltersChange({ ...filters, severity: newSeverities });
  };

  const handleDateRangeChange = (dateRange: FilterOptions['dateRange']) => {
    onFiltersChange({ 
      ...filters, 
      dateRange,
      customStartDate: undefined,
      customEndDate: undefined
    });
  };

  const handleCustomDateChange = (field: 'customStartDate' | 'customEndDate', value: string) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: 'custom',
      [field]: value 
    });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy'], sortOrder: FilterOptions['sortOrder']) => {
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const clearFilters = () => {
    onFiltersChange({
      severity: [],
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.severity.length > 0 || filters.dateRange !== 'all';
  const activeFiltersCount = filters.severity.length + (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 bg-white border border-gray-200
          shadow-sm hover:shadow-md transition-all duration-200
          ${isOpen ? 'shadow-md border-blue-300' : ''}
          ${hasActiveFilters ? 'border-blue-300 bg-blue-50' : ''}
        `}
        variant="secondary"
      >
        <Filter className={`w-4 h-4 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-600'}`} />
        <span className={`text-sm font-medium ${hasActiveFilters ? 'text-blue-700' : 'text-gray-700'}`}>
          Filters
        </span>
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 max-w-[95vw] bg-white rounded-lg shadow-xl border border-gray-200 z-[1001] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Report Filters</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Severity Level
              </label>
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low'].map(severity => (
                  <button
                    key={severity}
                    onClick={() => handleSeverityChange(severity)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.severity.includes(severity)
                        ? severity === 'high'
                          ? 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
                          : severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm'
                          : 'bg-green-100 text-green-800 border border-green-200 shadow-sm'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'custom', label: 'Custom' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value as FilterOptions['dateRange'])}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.dateRange === option.value
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sort Options
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'], filters.sortOrder)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date Created</option>
                    <option value="severity">Severity</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleSortChange(filters.sortBy, e.target.value as FilterOptions['sortOrder'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
export type { FilterOptions };
