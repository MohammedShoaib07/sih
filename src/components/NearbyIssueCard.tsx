import React from 'react';
import { MapPin, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { TextReport } from '../types';
import { useAppStore } from '../store';

interface NearbyIssueCardProps {
  report: TextReport;
  distance: number;
}

const NearbyIssueCard: React.FC<NearbyIssueCardProps> = ({ report, distance }) => {
  const { voteTextReport, currentUser } = useAppStore();

  const getIssueTypeLabel = (type: string) => {
    const labels = {
      street_lamp: 'Street Lamp',
      sign_board: 'Sign Board',
      drainage: 'Drainage',
      road_damage: 'Road Damage',
      other: 'Other',
    };
    return labels[type as keyof typeof labels] || 'Other';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (currentUser) {
      voteTextReport(report.id, vote);
    }
  };

  const hasUpvoted = currentUser && report.upvotedBy?.includes(currentUser.id);
  const hasDownvoted = currentUser && report.downvotedBy?.includes(currentUser.id);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Nearby Issue
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(report.severity)}`}>
            {report.severity.toUpperCase()}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.fixingStatus)}`}>
          {report.fixingStatus.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-1">
          {getIssueTypeLabel(report.issueType)}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {report.description}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{distance.toFixed(1)} km away</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <span className="text-xs">by {report.userName}</span>
      </div>

      {currentUser && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                hasUpvoted
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{report.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote('down')}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                hasDownvoted
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{report.downvotes}</span>
            </button>
          </div>
          
          {report.verified === 'verified' && (
            <div className="flex items-center text-green-600 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Verified
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyIssueCard;