import React from 'react';
import {
  CheckCircle, AlertTriangle, Info, Heart,
  MapPin, Clock, ThumbsUp, X
} from 'lucide-react';
import { AppNotification } from '../store';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface NotificationCardProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  onDismiss?: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onAction,
  onDismiss
}) => {
  const getNotificationIcon = (type: string | undefined) => {
    switch (type) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'compliment':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'new_report':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string | undefined) => {
    switch (type) {
      case 'resolved':
        return 'border-l-green-500 bg-green-50';
      case 'compliment':
        return 'border-l-pink-500 bg-pink-50';
      case 'new_report':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleMarkRead = () => {
    if (onMarkRead && !notification.read) {
      onMarkRead(notification.id);
    }
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(notification.id, action);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(notification.id);
    }
  };

  return (
    <Card 
      variant={notification.read ? 'default' : 'elevated'}
      className={`
        relative transition-all duration-200 hover:shadow-md
        ${!notification.read ? 'ring-2 ring-blue-500/20' : ''}
        ${getNotificationColor(notification.type)}
        border-l-4
      `}
      onClick={handleMarkRead}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {notification.message}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(notification.createdAt)}
                </div>
                
                {notification.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Location</span>
                  </div>
                )}
                
                {!notification.read && (
                  <Badge 
                    variant="default" 
                    value="New" 
                    size="sm"
                    className="bg-blue-100 text-blue-700 border-blue-200"
                  />
                )}
              </div>
            </div>

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {notification.type === 'resolved' && 
             notification.userId && 
             !notification.complimentedBy?.includes(notification.userId) && (
              <Button
                size="sm"
                variant="ghost"
                icon={<ThumbsUp className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('thanks');
                }}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                Say Thanks
              </Button>
            )}

            {notification.location && (
              <Button
                size="sm"
                variant="ghost"
                icon={<MapPin className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('view_location');
                }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                View on Map
              </Button>
            )}

            {notification.reportId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('view_report');
                }}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                View Report
              </Button>
            )}
          </div>

          {/* Thanks indicator */}
          {notification.type === 'resolved' && 
           notification.complimentedBy?.includes(notification.userId || '') && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <ThumbsUp className="w-3 h-3" />
              <span>You thanked the government for this resolution</span>
            </div>
          )}
        </div>
      </div>

      {/* Unread indicator dot */}
      {!notification.read && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </Card>
  );
};

export default NotificationCard;
