import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface MapFilterDropdownProps {
  onFilterChange: (filters: any) => void;
  filters: any;
  className?: string;
}

const MapFilterDropdown: React.FC<MapFilterDropdownProps> = ({ 
  onFilterChange, 
  filters, 
  className = '' 
}) => {
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

  // Count active filters
  const activeFiltersCount =
    (filters.severity.length < 3 ? 3 - filters.severity.length : 0) +
    (filters.status.length < 4 ? 4 - filters.status.length : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const clearAllFilters = () => {
    onFilterChange({
      severity: ['high', 'medium', 'low'],
      status: ['pending', 'in_progress', 'resolved', 'rejected']
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ minWidth: '120px' }}>
      {/* Filter Toggle Button - More Visible */}
      <button
        onClick={() => {
          console.log('Filter button clicked, isOpen:', !isOpen);
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center gap-2 bg-white border-2 border-gray-400
          shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200
          px-1 py-2 rounded-lg font-semibold text-sm
          ${isOpen ? 'bg-gray-50 shadow-xl border-blue-500' : ''}
          ${hasActiveFilters ? 'border-blue-500 bg-blue-50' : ''}
        `}
      >
        <Filter className={`w-5 h-5 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-700'}`} />
        <span className={`text-sm font-semibold ${hasActiveFilters ? 'text-blue-700' : 'text-gray-800'}`}>
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
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 z-[10001] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Map Filters</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
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
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Severity Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Severity Level</h4>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map(severity => (
                  <label key={severity} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.severity.includes(severity)}
                      onChange={(e) => {
                        const newSeverity = e.target.checked
                          ? [...filters.severity, severity]
                          : filters.severity.filter((s: string) => s !== severity);
                        onFilterChange({ ...filters, severity: newSeverity });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <Badge variant="severity" value={severity} size="sm" showDot />
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Report Status</h4>
              <div className="space-y-2">
                {['pending', 'in_progress', 'resolved', 'rejected'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => {
                        const newStatus = e.target.checked
                          ? [...filters.status, status]
                          : filters.status.filter((s: string) => s !== status);
                        onFilterChange({ ...filters, status: newStatus });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <Badge variant="status" value={status} size="sm" showDot />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filters.severity.length + filters.status.length} of 7 filters active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilterDropdown;
