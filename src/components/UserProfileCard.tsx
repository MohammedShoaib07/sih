import React from 'react';
import { User, Award, Star, Calendar, Trophy } from 'lucide-react';
import { useAppStore } from '../store';
import Card from './ui/Card';
import Badge from './ui/Badge';
import ProgressBar from './ui/ProgressBar';

const UserProfileCard: React.FC = () => {
  const { currentUser, reports } = useAppStore();

  if (!currentUser) return null;

  const userReports = reports.filter(r => r.userId === currentUser.id);
  const resolvedReports = userReports.filter(r => r.fixingStatus === 'resolved');
  
  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'gold':
        return { 
          color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          icon: Trophy,
          name: 'Gold Reporter',
          description: 'Community Champion'
        };
      case 'silver':
        return { 
          color: 'bg-gradient-to-r from-gray-300 to-gray-500',
          icon: Award,
          name: 'Silver Reporter',
          description: 'Active Contributor'
        };
      case 'bronze':
        return { 
          color: 'bg-gradient-to-r from-orange-400 to-orange-600',
          icon: Star,
          name: 'Bronze Reporter',
          description: 'Getting Started'
        };
      default:
        return { 
          color: 'bg-gradient-to-r from-blue-500 to-purple-600',
          icon: User,
          name: 'New Reporter',
          description: 'Welcome!'
        };
    }
  };

  const getNextLevelInfo = (currentPoints: number) => {
    if (currentPoints < 25) return { points: 25, badge: 'bronze' };
    if (currentPoints < 50) return { points: 50, badge: 'silver' };
    if (currentPoints < 100) return { points: 100, badge: 'gold' };
    return { points: currentPoints + 50, badge: 'platinum' };
  };

  const badgeInfo = getBadgeInfo(currentUser.badge);
  const nextLevel = getNextLevelInfo(currentUser.points);
  const BadgeIcon = badgeInfo.icon;

  const achievements = [
    {
      id: 'first_report',
      name: 'First Report',
      description: 'Submitted your first pothole report',
      earned: userReports.length > 0,
      icon: '🎯'
    },
    {
      id: 'helpful_citizen',
      name: 'Helpful Citizen',
      description: 'Received 10+ upvotes',
      earned: userReports.reduce((sum, r) => sum + r.upvotes, 0) >= 10,
      icon: '👍'
    },
    {
      id: 'problem_solver',
      name: 'Problem Solver',
      description: 'Had 5+ reports resolved',
      earned: resolvedReports.length >= 5,
      icon: '🔧'
    },
    {
      id: 'community_hero',
      name: 'Community Hero',
      description: 'Reached 100+ points',
      earned: currentUser.points >= 100,
      icon: '🏆'
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <Card className="relative overflow-hidden">
      {/* Header with gradient background */}
      <div className={`${badgeInfo.color} p-6 text-white relative`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <BadgeIcon className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-white/90 text-sm">{badgeInfo.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="default" 
                value={badgeInfo.name}
                className="bg-white/20 text-white border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/90 mb-2">
            <span>{currentUser.points} points</span>
            <span>Next: {nextLevel.points}</span>
          </div>
          <ProgressBar
            current={currentUser.points}
            max={nextLevel.points}
            className="bg-white/20"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{userReports.length}</p>
            <p className="text-sm text-gray-600">Reports</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{resolvedReports.length}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {userReports.reduce((sum, r) => sum + r.upvotes, 0)}
            </p>
            <p className="text-sm text-gray-600">Upvotes</p>
          </div>
        </div>

        {/* Location - removed since User type doesn't have location */}

        {/* Member since */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Member since {new Date(currentUser.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Achievements */}
        {earnedAchievements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {earnedAchievements.slice(0, 3).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1"
                  title={achievement.description}
                >
                  <span className="text-sm">{achievement.icon}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {achievement.name}
                  </span>
                </div>
              ))}
              {earnedAchievements.length > 3 && (
                <div className="flex items-center justify-center bg-gray-100 rounded-full w-8 h-8">
                  <span className="text-xs font-medium text-gray-600">
                    +{earnedAchievements.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;
