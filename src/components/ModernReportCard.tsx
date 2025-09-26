import React, { useState } from 'react';
import { Report } from '../types';
import { useAppStore } from '../store';
import {
  ThumbsUp, ThumbsDown, Trash2, MapPin, Calendar, User, Eye,
  AlertTriangle, MoreVertical
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface ReportCardProps {
  report: Report;
  isGovView?: boolean;
  onViewDetails?: (report: Report) => void;
  showAnnotatedImages?: boolean; // New prop to control annotated image display
}

const ModernReportCard: React.FC<ReportCardProps> = ({
  report,
  isGovView = false,
  onViewDetails,
  showAnnotatedImages = false
}) => {
  const {
    currentUser,
    isGovUser,
    voteReport,
    deleteReport,
    updateReport
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasUpvoted = currentUser ? report.upvotedBy?.includes(currentUser.id) || false : false;
  const hasDownvoted = currentUser ? report.downvotedBy?.includes(currentUser.id) || false : false;

  const handleVote = (voteType: 'up' | 'down') => {
    if (currentUser) {
      voteReport(report.id, voteType);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteReport(report.id);
    }
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReport(report.id, { verified: e.target.value as 'pending' | 'verified' | 'rejected' });
  };

  const handleFixingStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReport(report.id, { fixingStatus: e.target.value as 'pending' | 'in_progress' | 'resolved' | 'rejected' });
  };

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    // For very recent reports (less than 1 hour), show relative time
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes}m ago`;
    }

    // For reports within the same day, show time
    if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // For reports within the last 7 days, show day and time
    if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // For older reports, show full date and time
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDelete = currentUser && (
    currentUser.id === report.userId || 
    (isGovUser && isGovView)
  );

  return (
    <Card 
      variant="interactive" 
      padding="none"
      className="overflow-hidden group hover:shadow-xl transition-all duration-300 w-full"
    >
      {/* Severity indicator bar */}
      <div className={`h-1 ${
        report.severity === 'high' ? 'bg-red-500' : 
        report.severity === 'medium' ? 'bg-yellow-500' : 
        'bg-green-500'
      }`} />

      {/* Image Section */}
      <div className="relative">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {(() => {
            // Handle multiple photos or single photo
            const photos = report.photos || [];
            const hasPhotos = photos.length > 0;
            const fallbackPhoto = report.annotatedImageUrl || report.photo;

            if (hasPhotos) {
              const currentPhoto = photos[currentImageIndex];
              let photoSrc = typeof currentPhoto === 'string' ? currentPhoto : currentPhoto?.image;

              // For government view, show annotated images if available
              if (showAnnotatedImages) {
                // Check if current photo has its own annotated image
                if (typeof currentPhoto === 'object' && currentPhoto?.image) {
                  // Use the annotated image from the photo object if available
                  photoSrc = currentPhoto.image;
                } else if (report.annotatedImageUrl && currentImageIndex === 0) {
                  // Fallback to main report annotated image for first photo
                  photoSrc = report.annotatedImageUrl;
                }
              }

              return (
                <div className="relative w-full h-full">
                  <img
                    src={photoSrc}
                    alt={`Pothole ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Photo counter */}
                  {photos.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1}/{photos.length}
                    </div>
                  )}

                  {/* Navigation arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
                        }}
                        disabled={currentImageIndex === 0}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70 disabled:opacity-30 text-sm"
                      >
                        ←
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(Math.min(photos.length - 1, currentImageIndex + 1));
                        }}
                        disabled={currentImageIndex === photos.length - 1}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70 disabled:opacity-30 text-sm"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>
              );
            } else if (fallbackPhoto) {
              return (
                <img
                  src={fallbackPhoto}
                  alt="Pothole"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              );
            } else {
              return (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <AlertTriangle className="w-12 h-12 text-gray-400" />
                </div>
              );
            }
          })()}
        </div>



        {(report.annotatedImageUrl || (report.photos && report.photos.length > 0)) && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            AI Detected
          </div>
        )}

        {/* Actions menu */}
        {(canDelete || onViewDetails) && (
          <div className="absolute top-3 left-3">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showActions && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                  {onViewDetails && (
                    <button
                      onClick={() => {
                        onViewDetails(report);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate">{report.userName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(new Date(report.createdAt))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 truncate">
              {report.location.address || 'Unknown location'}
            </p>
            <p className="text-xs text-gray-500">
              {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="severity" value={report.severity} showDot size="sm" />
          <Badge variant="verification" value={report.verified} showDot size="sm" />
          <Badge variant="status" value={report.fixingStatus} showDot size="sm" />
        </div>

        {/* Description */}
        {report.description && (
          <div className="space-y-1">
            <p className={`text-sm text-gray-600 ${!isExpanded ? 'line-clamp-2' : ''}`}>
              {report.description}
            </p>
            {report.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Government Controls */}
        {isGovView && isGovUser && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Verification
                </label>
                <select
                  value={report.verified}
                  onChange={handleVerificationChange}
                  className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fixing Status
                </label>
                <select
                  value={report.fixingStatus}
                  onChange={handleFixingStatusChange}
                  className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('up')}
              disabled={!currentUser}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                hasUpvoted 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              <ThumbsUp className="w-4 h-4" />
              {report.upvotes}
            </button>
            
            <button
              onClick={() => handleVote('down')}
              disabled={!currentUser}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                hasDownvoted 
                  ? 'bg-red-100 text-red-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              <ThumbsDown className="w-4 h-4" />
              {report.downvotes}
            </button>
          </div>

          {/* Confidence Score */}
          <div className="text-xs text-gray-500">
            {Math.round(report.confidence * 100)}% confidence
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModernReportCard;
