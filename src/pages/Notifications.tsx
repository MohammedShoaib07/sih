// filepath: d:\PotholeProject\project\src\pages\Notifications.tsx
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Check, ThumbsUp, Trash2, X } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';

const Notifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    sendComplimentToGov,
    currentUser,
    isGovUser,
    govUser,
  } = useAppStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleThanks = (notifId: string) => {
    if (currentUser) {
      sendComplimentToGov(notifId, currentUser.id);
    }
  };

  const handleDeleteNotification = (notifId: string) => {
    setDeletingId(notifId);
    // Add a small delay for visual feedback
    setTimeout(() => {
      deleteNotification(notifId);
      setDeletingId(null);
    }, 150);
  };

  const filteredNotifications = notifications.filter(n => {
    if (isGovUser && govUser) {
      // Government users see notifications assigned to them or compliments sent to them
      return n.govUserId === govUser.id || (n.type === 'compliment' && n.govUserId === govUser.id);
    } else if (currentUser) {
      // Regular users see their own notifications (exclude compliments which are for gov users)
      return (n.userId === currentUser.id || !n.userId) && n.type !== 'compliment';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {/* Centered Logo Header - Flush with top */}
      <div className="bg-white border-b border-gray-200 md:pl-64 pt-0 md:pt-0">
        <div className="flex items-center justify-center py-2 md:py-3">
          <div className="flex items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <img
                src="/logo2.jpg"
                alt="FixMyPothole.AI Logo"
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar spacing */}
      <div className="md:pl-64">
        <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Notifications</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          onClick={markAllNotificationsRead}
        >
          Mark all as read
        </button>
      </div>
      <div className="grid gap-6">
        {filteredNotifications.length === 0 && (
          <div className="text-center text-gray-400 py-12">No notifications</div>
        )}
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl shadow-lg border transition-all ${
              n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
            } flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 animate-pop-in`}
          >
            <div>
              <div className="text-gray-800 text-base font-medium">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {!n.read && (
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => markNotificationRead(n.id)}
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <Check size={18} />
                </button>
              )}
              {n.type === 'resolved' &&
                currentUser &&
                !isGovUser &&
                n.userId === currentUser.id && // Only show to the original reporter
                (!n.complimentedBy || !n.complimentedBy.includes(currentUser.id)) && (
                  <button
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded text-xs"
                    onClick={() => handleThanks(n.id)}
                  >
                    <ThumbsUp size={16} />
                    Say Thanks
                  </button>
                )}
              {n.type === 'compliment' && isGovUser && govUser && n.govUserId === govUser.id && (
                <span className="text-green-700 text-xs flex items-center gap-1">
                  <ThumbsUp size={14} /> Compliment received!
                </span>
              )}
              {n.type === 'resolved' &&
                currentUser &&
                n.userId === currentUser.id && // Only show to the original reporter
                n.complimentedBy &&
                n.complimentedBy.includes(currentUser.id) && (
                  <span className="text-green-700 text-xs flex items-center gap-1">
                    <ThumbsUp size={14} /> Thanked
                  </span>
                )}

              {/* Delete button - always available */}
              <button
                className={`text-red-500 hover:text-red-700 transition-all duration-150 ${
                  deletingId === n.id ? 'opacity-50 scale-90' : 'hover:scale-110'
                }`}
                onClick={() => handleDeleteNotification(n.id)}
                disabled={deletingId === n.id}
                aria-label="Delete notification"
                title="Delete notification"
              >
                {deletingId === n.id ? (
                  <X size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
