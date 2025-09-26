import React from 'react';
import { useAppStore } from '../store';
import { User } from 'lucide-react';

const CitizenHeader: React.FC = () => {
  const { currentUser, getBadge } = useAppStore();

  if (!currentUser) return null;

  const points = currentUser.points || 0;
  const badge = getBadge(points);
  
  // Calculate progress to next badge
  const getNextBadgeInfo = () => {
    if (points < 25) {
      return { next: 'Bronze', target: 25, progress: (points / 25) * 100 };
    } else if (points < 50) {
      return { next: 'Silver', target: 50, progress: ((points - 25) / 25) * 100 };
    } else if (points < 100) {
      return { next: 'Gold', target: 100, progress: ((points - 50) / 50) * 100 };
    } else {
      return { next: 'Max Level', target: 100, progress: 100 };
    }
  };

  const nextBadgeInfo = getNextBadgeInfo();

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'bronze':
        return 'text-amber-600';
      case 'silver':
        return 'text-gray-500';
      case 'gold':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 md:px-6 md:ml-64 md:mt-0 mt-0">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">{currentUser.name}</h2>
            <p className="text-xs text-blue-200">Citizen Reporter</p>
          </div>
        </div>

        {/* Points and Progress */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium">Points: {points}</div>
            <div className={`text-xs capitalize ${getBadgeColor(badge)}`}>
              {badge === 'none' ? 'No Badge' : `${badge} Badge`}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="hidden sm:block">
            <div className="w-32 bg-blue-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, nextBadgeInfo.progress)}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-200 mt-1 text-center">
              {badge === 'gold' ? 'Max Level!' : `Next: ${nextBadgeInfo.next} (${nextBadgeInfo.target} pts)`}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-3">
        <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
          <span>Progress to {nextBadgeInfo.next}</span>
          <span>{points}/{nextBadgeInfo.target} pts</span>
        </div>
        <div className="w-full bg-blue-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, nextBadgeInfo.progress)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CitizenHeader;
