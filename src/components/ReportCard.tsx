import React from 'react';
import { Report } from '../types';
import { useAppStore } from '../store';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  isGovView?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, isGovView = false }) => {
  const {
    currentUser,
    voteReport,
    deleteReport,
    updateReport
  } = useAppStore();


  const hasUpvoted = currentUser ? report.upvotedBy?.includes(currentUser.id) || false : false;
  const hasDownvoted = currentUser ? report.downvotedBy?.includes(currentUser.id) || false : false;
  
  const canDelete = currentUser?.id === report.userId;
  
  const handleVote = (vote: 'up' | 'down') => {
    voteReport(report.id, vote);
  };
  
  const handleDelete = () => {
    if (canDelete) {
      deleteReport(report.id);
    }
  };
  
  const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReport(report.id, { verified: e.target.value as 'pending' | 'verified' | 'rejected' });
  };
  
  const handleFixingStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateReport(report.id, { fixingStatus: e.target.value as 'pending' | 'in_progress' | 'resolved' | 'rejected' });
  };
  
  return (
    <div className="glass rounded-lg shadow-xl overflow-hidden mb-4 transition-transform hover:scale-[1.01] flex animate-pop-in">
      {/* Left side - Image */}
      <div className="w-1/2 relative">
        {(report.annotatedImageUrl || report.photo) && (
          <div className="relative w-full h-full">
            <img
              src={report.annotatedImageUrl || report.photo}
              alt="Pothole"
              className="w-full h-full object-contain bg-black/40"
            />
            {report.annotatedImageUrl && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                AI Detected
              </div>
            )}
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs text-white font-semibold rounded ${
          report.severity === 'high' ? 'bg-red-500' : 
          report.severity === 'medium' ? 'bg-orange-500' : 
          'bg-green-500'
        }`}>
          {report.severity.toUpperCase()}
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-1/2 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-white">{report.userName}</h3>
              <p className="text-xs text-blue-200">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
            {canDelete && !isGovView && (
              <button 
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300"
                aria-label="Delete report"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          
          <p className="text-sm mb-2 text-blue-200">
            <span className="font-medium text-blue-300">Location: </span>
            {report.location.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
          </p>
          
          {report.description && (
            <p className="text-sm mb-2 text-blue-200">{report.description}</p>
          )}
        </div>

        {/* Status Section - Show in both views */}
        <div className="flex justify-between text-sm mb-3">
          <div>
            <span className="font-medium text-blue-300">Status: </span>
            <span className={`${
              report.verified === 'verified' ? 'text-green-400' : 
              report.verified === 'rejected' ? 'text-red-400' : 
              'text-blue-200'
            }`}>
              {report.verified.charAt(0).toUpperCase() + report.verified.slice(1)}
            </span>
          </div>
          
          <div>
            <span className="font-medium text-blue-300">Fixing: </span>
            <span className={`${
              report.fixingStatus === 'resolved' ? 'text-green-400' : 
              report.fixingStatus === 'in_progress' ? 'text-blue-400' : 
              'text-blue-200'
            }`}>
              {report.fixingStatus === 'in_progress' ? 'In Progress' : 
               report.fixingStatus.charAt(0).toUpperCase() + report.fixingStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Government Controls */}
        {isGovView ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-blue-300 mb-1">Status</label>
              <select
                value={report.verified}
                onChange={handleVerificationChange}
                className="w-full p-1 text-sm bg-black/30 border border-blue-500/30 rounded text-blue-200"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-blue-300 mb-1">Fixing</label>
              <select
                value={report.fixingStatus}
                onChange={handleFixingStatusChange}
                className="w-full p-1 text-sm bg-black/30 border border-blue-500/30 rounded text-blue-200"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ) : (
          /* Citizen Controls */
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center space-x-1 transition-colors ${
                  hasUpvoted
                    ? 'text-green-400 hover:text-green-300'
                    : 'text-blue-300 hover:text-blue-200'
                }`}
                title={hasUpvoted ? 'Remove upvote' : 'Upvote this report'}
              >
                <ThumbsUp size={16} className={hasUpvoted ? 'fill-current' : ''} />
                <span>{report.upvotes}</span>
              </button>

              <button
                onClick={() => handleVote('down')}
                className={`flex items-center space-x-1 transition-colors ${
                  hasDownvoted
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-blue-300 hover:text-blue-200'
                }`}
                title={hasDownvoted ? 'Remove downvote' : 'Downvote this report'}
              >
                <ThumbsDown size={16} className={hasDownvoted ? 'fill-current' : ''} />
                <span>{report.downvotes}</span>
              </button>
            </div>
            
            <div className="text-sm text-blue-300">
              Confidence: {Math.round(report.confidence * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;