import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'blue',
  description
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'bg-green-100 text-green-600',
          text: 'text-green-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          icon: 'bg-yellow-100 text-yellow-600',
          text: 'text-yellow-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          icon: 'bg-red-100 text-red-600',
          text: 'text-red-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          icon: 'bg-purple-100 text-purple-600',
          text: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          text: 'text-blue-600'
        };
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const colors = getColorClasses();

  return (
    <Card className="relative overflow-hidden p-3">
      {/* Background pattern */}
      <div className={`absolute inset-0 ${colors.bg} opacity-50`} />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-lg font-bold text-gray-900 mb-1">{value}</p>

            {change && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {change}
                </span>
                {description && (
                  <span className="text-xs text-gray-500">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={`p-2 rounded-full ${colors.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
