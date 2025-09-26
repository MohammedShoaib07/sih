import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useAppStore } from '../store';
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    currentUser,
    isGovUser,
    govUser
  } = useAppStore();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const handleDeleteNotification = (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    setDeletingId(notifId);
    // Add a small delay for visual feedback
    setTimeout(() => {
      deleteNotification(notifId);
      setDeletingId(null);
    }, 150);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Filter notifications for current user
  const userNotifications = notifications.filter(n => {
    if (isGovUser && govUser) {
      // Government users see notifications assigned to them or compliments sent to them
      return n.govUserId === govUser.id || (n.type === 'compliment' && n.govUserId === govUser.id);
    } else if (currentUser) {
      // Regular users see their own notifications (exclude compliments which are for gov users)
      return (n.userId === currentUser.id || !n.userId) && n.type !== 'compliment';
    }
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="relative flex items-center">
      <Link to="/notifications" className="relative p-2 rounded-full hover:bg-blue-500/20 transition" aria-label="Notifications">
        <Bell className="h-6 w-6 text-blue-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </Link>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 border border-blue-100 animate-fade-in animate-pop-in">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-semibold text-blue-700">Notifications</span>
            <button
              className="text-xs text-blue-500 hover:underline"
              onClick={() => markAllNotificationsRead()}
            >
              Mark all as read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y">
            {userNotifications.length === 0 && (
              <li className="px-4 py-6 text-center text-gray-400">No notifications</li>
            )}
            {userNotifications.map(n => (
              <li
                key={n.id}
                className={`px-4 py-3 flex items-start gap-2 ${
                  n.read ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!n.read && (
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => markNotificationRead(n.id)}
                      aria-label="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className={`text-red-500 hover:text-red-700 transition-all duration-150 ${
                      deletingId === n.id ? 'opacity-50 scale-90' : 'hover:scale-110'
                    }`}
                    onClick={(e) => handleDeleteNotification(n.id, e)}
                    disabled={deletingId === n.id}
                    aria-label="Delete notification"
                  >
                    {deletingId === n.id ? (
                      <X size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
