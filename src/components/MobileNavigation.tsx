import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Plus, Bell, User, BarChart3, FileText
} from 'lucide-react';
import { useAppStore } from '../store';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGovUser, notifications, currentUser, govUser } = useAppStore();

  // Filter notifications by user and count unread
  const userNotifications = notifications.filter(n => {
    // First filter by user
    let belongsToUser = false;
    if (isGovUser && govUser) {
      // Government users see notifications assigned to them or compliments
      belongsToUser = n.govUserId === govUser.id || (n.type === 'compliment' && n.govUserId === govUser.id);
    } else if (currentUser) {
      // Citizens see their own notifications (exclude compliments which are for gov users)
      belongsToUser = (n.userId === currentUser.id || !n.userId) && n.type !== 'compliment';
    }

    return belongsToUser;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Enhanced auto-hide navigation on scroll
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = Math.abs(currentScrollY - lastScrollY);

          // Only react to significant scroll movements (reduces jitter)
          if (scrollDifference > 5) {
            if (currentScrollY < 20) {
              // Always show at top of page
              setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
              // Scrolling down - hide after 80px
              setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
              // Scrolling up - show immediately
              setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const citizenNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home',
      badge: null as number | null,
      isAction: false
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/dashboard',
      badge: null as number | null,
      isAction: false
    },
    {
      id: 'report',
      label: 'Report',
      icon: Plus,
      path: '/report',
      badge: null as number | null,
      isAction: true
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : null,
      isAction: false
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      badge: null as number | null,
      isAction: false
    }
  ];

  const govNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/gov-home',
      badge: null as number | null,
      isAction: false
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/gov-dashboard',
      badge: null as number | null,
      isAction: false
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : null,
      isAction: false
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      badge: null as number | null,
      isAction: false
    }
  ];

  // Filter out report button for government users
  const navItems = isGovUser ? govNavItems : citizenNavItems;

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.isAction) {
      // Special handling for report button
      navigate('/report');
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] md:hidden
        transition-all duration-300 ease-in-out shadow-lg backdrop-blur-sm bg-white/95
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`
                  relative flex flex-col items-center justify-center p-2 min-w-0 flex-1
                  transition-all duration-200 ease-in-out
                  ${active 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                  ${item.isAction 
                    ? 'transform -translate-y-2' 
                    : ''
                  }
                `}
              >
                {/* Action button special styling */}
                {item.isAction ? (
                  <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
                    
                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Label */}
                <span className={`
                  text-xs mt-1 font-medium truncate max-w-full
                  ${active ? 'text-blue-600' : 'text-gray-500'}
                  ${item.isAction ? 'text-white' : ''}
                `}>
                  {item.label}
                </span>

                {/* Active indicator */}
                {active && !item.isAction && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-white md:border-r md:border-gray-200 md:z-[9998] md:shadow-lg">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/logo.jpg"
                  alt="FixMyPothole.AI Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">FixMyPothole.AI</h1>
                <p className="text-xs text-gray-500">
                  {isGovUser ? 'Government Portal' : 'Citizen Portal'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.filter(item => !item.isAction).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                    transition-all duration-200 ease-in-out
                    ${active 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <div className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Button for Desktop - Only for Citizens */}
          {!isGovUser && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/report')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile padding to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />
    </>
  );
};

export default MobileNavigation;
