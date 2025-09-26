import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, GovUser, Report, Badge, TextReport, ScratchCard, PredictionData, TrendData } from '../types';


export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type?: 'resolved' | 'compliment' | 'info' | 'new_report';
  reportId?: string;
  govUserId?: string;
  complimentedBy?: string[];
  location?: { lat: number; lng: number }; // Add location for map redirection
  userId?: string; // Owner of the notification
}

interface AppState {
  isLoggedIn: boolean;
  isGovUser: boolean;
  currentUser: User | null;
  govUser: GovUser | null;
  userEmail: string | null;
  reports: Report[];
  textReports: TextReport[];
  scratchCards: ScratchCard[];
  predictions: PredictionData[];
  trends: TrendData[];
  userLocation: { lat: number; lng: number } | null;
  govLocation: { lat: number; lng: number } | null;
  hasCompletedSetup: boolean;
  authenticatedUsers: {
    [email: string]: {
      password: string;
      isGov: boolean;
      hasCompletedSetup: boolean;
      userData: User | GovUser | null;
    };
  };
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'complimentedBy'> & Partial<Pick<AppNotification, 'complimentedBy'>>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  sendComplimentToGov: (notifId: string, userId: string) => void;

  // Actions
  register: (email: string, password: string, isGov: boolean) => boolean;
  signIn: (email: string, password: string) => boolean;
  logout: () => void;
  initAuth: () => void;
  createUser: (userData: Omit<User, 'id' | 'reports' | 'points' | 'createdAt'>) => void;
  createGovUser: (userData: Omit<GovUser, 'id' | 'createdAt'>) => void;
  addReport: (report: Omit<Report, 'id' | 'userName' | 'createdAt' | 'upvotes' | 'downvotes' | 'verified' | 'fixingStatus'>) => void;
  addTextReport: (report: Omit<TextReport, 'id' | 'userName' | 'createdAt' | 'upvotes' | 'downvotes' | 'verified' | 'fixingStatus' | 'type'>) => void;
  deleteReport: (reportId: string) => void;
  updateReport: (reportId: string, updates: Partial<Report>) => void;
  voteReport: (reportId: string, vote: 'up' | 'down') => void;
  voteTextReport: (reportId: string, vote: 'up' | 'down') => void;
  updateUserProfile: (updates: Partial<Omit<User, 'id' | 'reports' | 'points' | 'createdAt'>>) => void;
  updateGovProfile: (updates: Partial<Omit<GovUser, 'id' | 'createdAt'>>) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setGovLocation: (location: { lat: number; lng: number } | null) => void;
  getBadge: (points: number) => Badge;
  createScratchCard: (userId: string) => void;
  revealScratchCard: (cardId: string) => void;
  checkHighPriorityReports: () => void;
  generatePredictions: (location: { lat: number; lng: number }) => Promise<void>;
  getNearbyReports: (location: { lat: number; lng: number }, radius: number) => (Report | TextReport)[];

  // Note: Database API methods removed - using localStorage only
}

// Default authenticated users that should always be available
const defaultAuthenticatedUsers = {
  // Test users for development
  'citizen@test.com': {
    password: 'password',
    isGov: false,
    hasCompletedSetup: true,
    userData: {
      id: 'test-citizen-1',
      name: 'John Citizen',
      age: 30,
      email: 'citizen@test.com',
      points: 25,
      badge: 'bronze' as Badge,
      reports: [],
      createdAt: new Date()
    } as User
  },
  'gov@test.com': {
    password: 'password',
    isGov: true,
    hasCompletedSetup: true,
    userData: {
      id: 'test-gov-1',
      name: 'City Government',
      location: { lat: 40.7128, lng: -74.0060 },
      phone: '+1-555-0123',
      email: 'gov@test.com',
      createdAt: new Date()
    } as GovUser
  },
  // Additional government test accounts
  'admin@cityworks.gov': {
    password: 'CityAdmin2024!',
    isGov: true,
    hasCompletedSetup: true,
    userData: {
      id: 'gov-admin-1',
      name: 'City Works Department',
      location: { lat: 34.0522, lng: -118.2437 },
      phone: '+1-555-0200',
      email: 'admin@cityworks.gov',
      createdAt: new Date()
    } as GovUser
  },
  'roads@municipal.gov': {
    password: 'RoadMaint2024!',
    isGov: true,
    hasCompletedSetup: true,
    userData: {
      id: 'gov-roads-1',
      name: 'Municipal Roads Department',
      location: { lat: 41.8781, lng: -87.6298 },
      phone: '+1-555-0300',
      email: 'roads@municipal.gov',
      createdAt: new Date()
    } as GovUser
  },
  'infrastructure@metro.gov': {
    password: 'MetroInfra2024!',
    isGov: true,
    hasCompletedSetup: true,
    userData: {
      id: 'gov-metro-1',
      name: 'Metro Infrastructure Authority',
      location: { lat: 39.7392, lng: -104.9903 },
      phone: '+1-555-0400',
      email: 'infrastructure@metro.gov',
      createdAt: new Date()
    } as GovUser
  },
  'public.works@county.gov': {
    password: 'CountyPW2024!',
    isGov: true,
    hasCompletedSetup: true,
    userData: {
      id: 'gov-county-1',
      name: 'County Public Works',
      location: { lat: 33.4484, lng: -112.0740 },
      phone: '+1-555-0500',
      email: 'public.works@county.gov',
      createdAt: new Date()
    } as GovUser
  }
};

export const useAppStore = create(
  persist<AppState>(
    (set, get) => ({
      // Initial state
      isLoggedIn: false,
      isGovUser: false,
      currentUser: null,
      govUser: null,
      reports: [],
      textReports: [],
      scratchCards: [],
      predictions: [],
      trends: [],
      userLocation: null,
      govLocation: null,
      hasCompletedSetup: false,
      userEmail: null,
      authenticatedUsers: defaultAuthenticatedUsers,
      notifications: [],
      addNotification: (notif: any) =>
        set((state: any) => ({
          notifications: [
            {
              id: `notif-${Date.now()}-${Math.random()}`,
              read: false,
              createdAt: new Date(),
              complimentedBy: notif.complimentedBy || [],
              userId: notif.userId, // assign userId if provided
              ...notif,
            },
            ...state.notifications,
          ],
        })),
      markNotificationRead: (id: string) =>
        set((state: any) => {
          const { currentUser, isGovUser, govUser } = state;
          return {
            notifications: state.notifications.map((n: any) =>
              n.id === id &&
              (
                (!isGovUser && (!n.userId || n.userId === currentUser?.id)) ||
                (isGovUser && n.govUserId === govUser?.id)
              )
                ? { ...n, read: true }
                : n
            ),
          };
        }),
      markAllNotificationsRead: () =>
        set((state: any) => {
          const { currentUser, isGovUser, govUser } = state;
          return {
            notifications: state.notifications.map((n: any) =>
              (
                (!isGovUser && (!n.userId || n.userId === currentUser?.id)) ||
                (isGovUser && n.govUserId === govUser?.id)
              )
                ? { ...n, read: true }
                : n
            ),
          };
        }),

      deleteNotification: (id: string) =>
        set((state: any) => {
          const { currentUser, isGovUser, govUser } = state;
          return {
            notifications: state.notifications.filter((n: any) => {
              // Only delete if the notification belongs to the current user
              if (n.id !== id) return true; // Keep all other notifications

              // Check if this notification belongs to the current user
              if (isGovUser && govUser) {
                return !(n.govUserId === govUser.id || (n.type === 'compliment' && n.govUserId === govUser.id));
              } else if (currentUser) {
                return !((n.userId === currentUser.id || !n.userId) && n.type !== 'compliment');
              }

              return true; // Keep notification if user check fails
            }),
          };
        }),
      sendComplimentToGov: (notifId: string, userId: string) =>
        set((state: any) => ({
          notifications: state.notifications.map((n: any) =>
            n.id === notifId && n.type === 'resolved'
              ? { ...n, complimentedBy: [...(n.complimentedBy || []), userId] }
              : n
          ).concat(
            // Send compliment notification to government user
            (() => {
              const notif = state.notifications.find((n: any) => n.id === notifId);
              if (notif && notif.govUserId) {
                return [{
                  id: `notif-${Date.now()}-${Math.random()}`,
                  message: `You received a compliment from a citizen for resolving a pothole at ${notif.message.replace(/^Pothole at /, '').replace(' has been resolved!', '')}.`,
                  read: false,
                  createdAt: new Date(),
                  type: 'compliment',
                  govUserId: notif.govUserId,
                }];
              }
              return [];
            })()
          ),
        })),

      // Actions
      register: (email: string, password: string, isGov: boolean) => {
        const state = get();
        if (state.authenticatedUsers[email]) return false;

        set({
          authenticatedUsers: {
            ...state.authenticatedUsers,
            [email]: {
              password,
              isGov,
              hasCompletedSetup: false,
              userData: null
            }
          },
          isLoggedIn: true,
          isGovUser: isGov,
          userEmail: email
        });
        return true;
      },

      signIn: (email: string, password: string) => {
        const state = get();
        const user = state.authenticatedUsers[email];

        if (!user || user.password !== password) {
          return false;
        }

        const newState: any = {
          isLoggedIn: true,
          isGovUser: user.isGov,
          hasCompletedSetup: user.hasCompletedSetup,
          userEmail: email,
          currentUser: !user.isGov ? user.userData as User : null,
          govUser: user.isGov ? user.userData as GovUser : null
        };

        // Set government location if it's a gov user
        if (user.isGov && user.userData) {
          const govData = user.userData as GovUser;
          newState.govLocation = govData.location;
        }

        set(newState);

        return true;
      },

      logout: () => {
        set({
          isLoggedIn: false,
          isGovUser: false,
          currentUser: null,
          govUser: null,
          userLocation: null,
          govLocation: null,
          hasCompletedSetup: false,
          userEmail: null
        });
      },

      initAuth: () => {
        const state = get();
        const email = state.userEmail;
        if (email) {
          const user = state.authenticatedUsers[email];
          if (user) {
            const newState: any = {
              isLoggedIn: true,
              isGovUser: user.isGov,
              hasCompletedSetup: user.hasCompletedSetup,
              currentUser: !user.isGov ? user.userData as User : null,
              govUser: user.isGov ? user.userData as GovUser : null
            };

            // Set government location if it's a gov user
            if (user.isGov && user.userData) {
              const govData = user.userData as GovUser;
              newState.govLocation = govData.location;
            }

            set(newState);
          }
        }
      },

      createUser: (userData: any) => set((state: any) => {
        const email = state.userEmail;
        if (!email) return {};

        const updatedUser = {
          id: `user-${Date.now()}`,
          ...userData,
          points: 0,
          reports: [],
          badge: 'none' as Badge,
          createdAt: new Date()
        };

        return {
          currentUser: updatedUser,
          hasCompletedSetup: true,
          authenticatedUsers: {
            ...state.authenticatedUsers,
            [email]: {
              ...state.authenticatedUsers[email]!,
              hasCompletedSetup: true,
              userData: updatedUser
            }
          }
        };
      }),

      createGovUser: (userData: any) => set((state: any) => {
        const email = state.userEmail;
        if (!email) return {};

        const updatedUser = {
          id: `gov-${Date.now()}`,
          ...userData,
          createdAt: new Date()
        };

        return {
          govUser: updatedUser,
          hasCompletedSetup: true,
          authenticatedUsers: {
            ...state.authenticatedUsers,
            [email]: {
              ...state.authenticatedUsers[email]!,
              hasCompletedSetup: true,
              userData: updatedUser
            }
          }
        };
      }),
      
      addReport: (reportData: any) => set((state: any) => {
        // Only allow logged-in users to create reports
        if (!state.currentUser) {
          console.error('Cannot create report: User not logged in');
          return {};
        }

        // Exclude userId and voting arrays from reportData to avoid duplicate keys
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, upvotedBy, downvotedBy, ...restReportData } = reportData;
        const newReport: Report = {
          id: `report-${Date.now()}`,
          userName: state.currentUser.name,
          userId: state.currentUser.id,
          createdAt: new Date(),
          upvotes: 0,
          downvotes: 0,
          upvotedBy: [],
          downvotedBy: [],
          verified: 'pending',
          fixingStatus: 'pending',
          ...restReportData,
        };
        const locationText = newReport.location.address
          ? newReport.location.address
          : `${newReport.location.lat.toFixed(4)}, ${newReport.location.lng.toFixed(4)}`;

        // Add notifications for all users except the reporter
        const allUserNotifications: AppNotification[] = [];

        // Notify all citizens except the reporter
        Object.values(state.authenticatedUsers)
          .filter((u: any) => u.userData && (u.userData as User).id !== newReport.userId && !u.isGov)
          .forEach((u: any) => {
            allUserNotifications.push({
              id: `notif-${Date.now()}-${Math.random()}-citizen-${(u.userData as User).id}`,
              message: `New pothole reported at ${locationText}.`,
              read: false,
              createdAt: new Date(),
              type: 'new_report',
              reportId: newReport.id,
              location: { lat: newReport.location.lat, lng: newReport.location.lng },
              userId: (u.userData as User).id,
            } as AppNotification);
          });

        // Notify government users within 5km radius
        Object.values(state.authenticatedUsers)
          .filter((u: any) => u.userData && u.isGov && (u.userData as GovUser).id !== newReport.userId)
          .forEach((u: any) => {
            const govData = u.userData as GovUser;

            if (!govData.location) {
              return;
            }

            // Calculate distance using proper formula
            const distance = Math.sqrt(
              Math.pow((newReport.location.lat - govData.location.lat) * 111, 2) +
              Math.pow((newReport.location.lng - govData.location.lng) * 111 * Math.cos(govData.location.lat * Math.PI / 180), 2)
            );

            if (distance <= 5) { // Within 5km radius
              allUserNotifications.push({
                id: `notif-${Date.now()}-${Math.random()}-gov-${govData.id}`,
                message: `New pothole reported at ${locationText} (within your area).`,
                read: false,
                createdAt: new Date(),
                type: 'new_report',
                reportId: newReport.id,
                location: { lat: newReport.location.lat, lng: newReport.location.lng },
                govUserId: govData.id,
              } as AppNotification);
            }
          });

        // No points awarded for just submitting - only when verified

        return {
          reports: [newReport, ...state.reports],
          notifications: [
            ...allUserNotifications,
            ...state.notifications,
          ],
        };
      }),
      
      deleteReport: (reportId: string) => set((state: any) => {
        const reportToDelete = state.reports.find((report: any) => report.id === reportId);

        // If report was verified, deduct 1 point from the user
        if (reportToDelete && reportToDelete.verified === 'verified') {
          const reportOwnerEmail = Object.keys(state.authenticatedUsers).find(email => {
            const userData = state.authenticatedUsers[email]?.userData as User;
            return userData && userData.id === reportToDelete.userId;
          });

          if (reportOwnerEmail) {
            const reportOwner = state.authenticatedUsers[reportOwnerEmail]?.userData as User;
            if (reportOwner) {
              const newPoints = Math.max(0, (reportOwner.points || 0) - 1);
              let newBadge = reportOwner.badge;

              // Update badge based on points
              if (newPoints >= 100) {
                newBadge = 'gold';
              } else if (newPoints >= 50) {
                newBadge = 'silver';
              } else if (newPoints >= 25) {
                newBadge = 'bronze';
              } else {
                newBadge = 'none';
              }

              const updatedUser = {
                ...reportOwner,
                points: newPoints,
                badge: newBadge
              };

              return {
                reports: state.reports.filter((report: any) => report.id !== reportId),
                currentUser: state.currentUser?.id === updatedUser.id ? updatedUser : state.currentUser,
                authenticatedUsers: {
                  ...state.authenticatedUsers,
                  [reportOwnerEmail]: {
                    ...state.authenticatedUsers[reportOwnerEmail]!,
                    userData: updatedUser,
                  },
                },
              };
            }
          }
        }

        return {
          reports: state.reports.filter((report: any) => report.id !== reportId)
        };
      }),
      
      updateReport: (reportId: string, updates: any) => set((state: any) => {
        // Auto-sync fixing status when verification is rejected
        const syncedUpdates = { ...updates };
        if (updates.verified === 'rejected' && !updates.fixingStatus) {
          syncedUpdates.fixingStatus = 'rejected';
        }

        const updatedReports = state.reports.map((report: any) =>
          report.id === reportId ? { ...report, ...syncedUpdates } : report
        );
        let notifications = state.notifications;
        const updatedReport = updatedReports.find((r: any) => r.id === reportId);
        if (updatedReport) {
          const locationText = updatedReport.location.address
            ? updatedReport.location.address
            : `${updatedReport.location.lat.toFixed(4)}, ${updatedReport.location.lng.toFixed(4)}`;
          if (updates.verified === 'verified') {
            notifications = [
              {
                id: `notif-${Date.now()}-${Math.random()}`,
                message: `Report at ${locationText} has been verified by government.`,
                read: false,
                createdAt: new Date(),
                type: 'info',
                reportId,
                userId: updatedReport.userId,
              },
              ...notifications,
            ];
          }
          if (updates.verified === 'rejected') {
            notifications = [
              {
                id: `notif-${Date.now()}-${Math.random()}`,
                message: `Report at ${locationText} was rejected by government.`,
                read: false,
                createdAt: new Date(),
                type: 'info',
                reportId,
                userId: updatedReport.userId,
              },
              ...notifications,
            ];
          }
          if (updates.fixingStatus === 'in_progress') {
            notifications = [
              {
                id: `notif-${Date.now()}-${Math.random()}`,
                message: `Fixing started for pothole at ${locationText}.`,
                read: false,
                createdAt: new Date(),
                type: 'info',
                reportId,
                userId: updatedReport.userId,
              },
              ...notifications,
            ];
          }
          if (updates.fixingStatus === 'resolved') {
            // Notify the original reporter
            notifications = [
              {
                id: `notif-${Date.now()}-${Math.random()}`,
                message: `Pothole at ${locationText} has been resolved!`,
                read: false,
                createdAt: new Date(),
                type: 'resolved',
                reportId,
                govUserId: state.govUser?.id,
                complimentedBy: [],
                userId: updatedReport.userId,
              },
              ...notifications,
            ];

            // Notify ALL other users about the resolution (excluding the reporter)
            const allUserNotifications: AppNotification[] = [];

            // Notify all citizens except the reporter
            Object.values(state.authenticatedUsers)
              .filter((u: any) => u.userData && (u.userData as User).id !== updatedReport.userId && !u.isGov)
              .forEach((u: any) => {
                allUserNotifications.push({
                  id: `notif-${Date.now()}-${Math.random()}-citizen-${(u.userData as User).id}`,
                  message: `A pothole at ${locationText} has been resolved by the government.`,
                  read: false,
                  createdAt: new Date(),
                  type: 'info',
                  reportId,
                  userId: (u.userData as User).id,
                } as AppNotification);
              });

            // Notify government users within 5km radius (excluding the one who resolved it)
            Object.values(state.authenticatedUsers)
              .filter((u: any) => u.userData && u.isGov && (u.userData as GovUser).id !== state.govUser?.id)
              .forEach((u: any) => {
                const govData = u.userData as GovUser;
                // Calculate distance using proper formula
                const distance = Math.sqrt(
                  Math.pow((updatedReport.location.lat - govData.location.lat) * 111, 2) +
                  Math.pow((updatedReport.location.lng - govData.location.lng) * 111 * Math.cos(govData.location.lat * Math.PI / 180), 2)
                );

                if (distance <= 5) { // Within 5km radius
                  allUserNotifications.push({
                    id: `notif-${Date.now()}-${Math.random()}-gov-${govData.id}`,
                    message: `A pothole at ${locationText} has been resolved by another government department.`,
                    read: false,
                    createdAt: new Date(),
                    type: 'info',
                    reportId,
                    govUserId: govData.id,
                  } as AppNotification);
                }
              });

            notifications = [...allUserNotifications, ...notifications];
          }

          if (updates.fixingStatus === 'rejected') {
            notifications = [
              {
                id: `notif-${Date.now()}-${Math.random()}`,
                message: `Fixing request for pothole at ${locationText} was rejected by government.`,
                read: false,
                createdAt: new Date(),
                type: 'info',
                reportId,
                userId: updatedReport.userId,
              },
              ...notifications,
            ];
          }
        }

        if (updates.verified === 'verified' && updatedReport) {
          // Find the user who submitted this report and award 1 point
          const reportOwnerEmail = Object.keys(state.authenticatedUsers).find(email => {
            const userData = state.authenticatedUsers[email]?.userData as User;
            return userData && userData.id === updatedReport.userId;
          });

          if (reportOwnerEmail) {
            const reportOwner = state.authenticatedUsers[reportOwnerEmail]?.userData as User;
            if (reportOwner) {
              const newPoints = (reportOwner.points || 0) + 1;
              let newBadge = reportOwner.badge;

              // Update badge based on points
              if (newPoints >= 100) {
                newBadge = 'gold';
              } else if (newPoints >= 50) {
                newBadge = 'silver';
              } else if (newPoints >= 25) {
                newBadge = 'bronze';
              }

              const updatedUser = {
                ...reportOwner,
                points: newPoints,
                badge: newBadge
              };

              return {
                reports: updatedReports,
                currentUser: state.currentUser?.id === updatedUser.id ? updatedUser : state.currentUser,
                authenticatedUsers: {
                  ...state.authenticatedUsers,
                  [reportOwnerEmail]: {
                    ...state.authenticatedUsers[reportOwnerEmail]!,
                    userData: updatedUser,
                  },
                },
                notifications,
              };
            }
          }
        }

        return { reports: updatedReports, notifications };
      }),
      
      voteReport: (reportId: string, vote: 'up' | 'down') => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        set((state: any) => ({
          reports: state.reports.map((report: any) => {
            if (report.id !== reportId) return report;

            const hasUpvoted = report.upvotedBy?.includes(currentUser.id) || false;
            const hasDownvoted = report.downvotedBy?.includes(currentUser.id) || false;

            if (vote === 'up') {
              if (hasUpvoted) {
                // Remove upvote
                return {
                  ...report,
                  upvotes: Math.max(0, report.upvotes - 1),
                  upvotedBy: report.upvotedBy?.filter((id: any) => id !== currentUser.id) || []
                };
              } else {
                // Add upvote and remove downvote if exists
                return {
                  ...report,
                  upvotes: report.upvotes + 1,
                  downvotes: hasDownvoted ? Math.max(0, report.downvotes - 1) : report.downvotes,
                  upvotedBy: [...(report.upvotedBy || []), currentUser.id],
                  downvotedBy: hasDownvoted
                    ? report.downvotedBy?.filter((id: any) => id !== currentUser.id) || []
                    : report.downvotedBy || []
                };
              }
            } else {
              if (hasDownvoted) {
                // Remove downvote
                return {
                  ...report,
                  downvotes: Math.max(0, report.downvotes - 1),
                  downvotedBy: report.downvotedBy?.filter((id: any) => id !== currentUser.id) || []
                };
              } else {
                // Add downvote and remove upvote if exists
                return {
                  ...report,
                  downvotes: report.downvotes + 1,
                  upvotes: hasUpvoted ? Math.max(0, report.upvotes - 1) : report.upvotes,
                  downvotedBy: [...(report.downvotedBy || []), currentUser.id],
                  upvotedBy: hasUpvoted
                    ? report.upvotedBy?.filter((id: any) => id !== currentUser.id) || []
                    : report.upvotedBy || []
                };
              }
            }
          })
        }));
      },
      
      updateUserProfile: (updates: any) => set((state: any) => {
        const email = state.userEmail;
        if (!email || !state.currentUser) return {};

        const updatedUser = { ...state.currentUser, ...updates };

        return {
          currentUser: updatedUser,
          authenticatedUsers: {
            ...state.authenticatedUsers,
            [email]: {
              ...state.authenticatedUsers[email]!,
              userData: updatedUser,
            },
          },
        };
      }),
      
      updateGovProfile: (updates: any) => set((state: any) => {
        const email = state.userEmail;
        if (!email || !state.govUser) return {};

        const updatedGovUser = { ...state.govUser, ...updates };

        const newState: any = {
          govUser: updatedGovUser,
          authenticatedUsers: {
            ...state.authenticatedUsers,
            [email]: {
              ...state.authenticatedUsers[email]!,
              userData: updatedGovUser,
            },
          },
        };

        // Update govLocation if location was updated
        if (updates.location) {
          newState.govLocation = updates.location;
        }

        return newState;
      }),
      
      setUserLocation: (location: { lat: number; lng: number } | null) => set({ userLocation: location }),
      setGovLocation: (location: { lat: number; lng: number } | null) => set({ govLocation: location }),
      
      getBadge: (points: number) => {
        if (points >= 100) return 'gold';
        if (points >= 50) return 'silver';
        if (points >= 25) return 'bronze';
        return 'none';
      },

      addTextReport: (reportData: Omit<TextReport, 'id' | 'userName' | 'createdAt' | 'upvotes' | 'downvotes' | 'verified' | 'fixingStatus'>) => set((state) => {
        if (!state.currentUser) return state;

        const newReport: TextReport = {
          ...reportData,
          id: crypto.randomUUID(),
          userName: state.currentUser.name,
          userId: state.currentUser.id,
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          upvotedBy: [],
          downvotedBy: [],
          status: 'active',
          verified: 'pending',
          fixingStatus: 'pending',
          reportCount: 1,
          priority: reportData.severity === 'high' ? 'high' : 'normal',
          verified: 'pending',
          fixingStatus: 'pending',
          type: 'text',
          ...reportData,
        };

        return {
          textReports: [newReport, ...state.textReports],
        };
      }),

      voteTextReport: (reportId: string, vote: 'up' | 'down') => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        set((state: any) => ({
          textReports: state.textReports.map((report: any) => {
            if (report.id !== reportId) return report;

            const hasUpvoted = report.upvotedBy?.includes(currentUser.id) || false;
            const hasDownvoted = report.downvotedBy?.includes(currentUser.id) || false;

            if (vote === 'up') {
              if (hasUpvoted) {
                return {
                  ...report,
                  upvotes: Math.max(0, report.upvotes - 1),
                  upvotedBy: report.upvotedBy?.filter((id: any) => id !== currentUser.id) || []
                };
              } else {
                return {
                  ...report,
                  upvotes: report.upvotes + 1,
                  downvotes: hasDownvoted ? Math.max(0, report.downvotes - 1) : report.downvotes,
                  upvotedBy: [...(report.upvotedBy || []), currentUser.id],
                  downvotedBy: hasDownvoted
                    ? report.downvotedBy?.filter((id: any) => id !== currentUser.id) || []
                    : report.downvotedBy || []
                };
              }
            } else {
              if (hasDownvoted) {
                return {
                  ...report,
                  downvotes: Math.max(0, report.downvotes - 1),
                  downvotedBy: report.downvotedBy?.filter((id: any) => id !== currentUser.id) || []
                };
              } else {
                return {
                  ...report,
                  downvotes: report.downvotes + 1,
                  upvotes: hasUpvoted ? Math.max(0, report.upvotes - 1) : report.upvotes,
                  downvotedBy: [...(report.downvotedBy || []), currentUser.id],
                  upvotedBy: hasUpvoted
                    ? report.upvotedBy?.filter((id: any) => id !== currentUser.id) || []
                    : report.upvotedBy || []
                };
              }
            }
          })
        }));
      },

      createScratchCard: (userId: string) => set((state: any) => {
        const rewards: {
          type: 'discount' | 'coupon' | 'badge' | 'charity';
          value: string;
          description: string;
        }[] = [
          { type: 'discount', value: '10%', description: '10% off at local restaurants' },
          { type: 'coupon', value: 'FREE', description: 'Free coffee at partner cafes' },
          { type: 'badge', value: 'HERO', description: 'Community Hero Badge' },
          { type: 'charity', value: '$5', description: '$5 donated to local charity' },
        ];
        
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        
        const newCard: ScratchCard = {
          id: `scratch-${Date.now()}`,
          userId,
          isRevealed: false,
          reward: randomReward,
          createdAt: new Date(),
        };

        return {
          scratchCards: [...state.scratchCards, newCard],
        };
      }),

      revealScratchCard: (cardId: string) => set((state: any) => ({
        scratchCards: state.scratchCards.map((card: any) =>
          card.id === cardId ? { ...card, isRevealed: true } : card
        ),
      })),

      checkHighPriorityReports: () => set((state: any) => {
        const REPORT_COUNT_THRESHOLD = 3;
        
        const updatedReports = state.reports.map((report: any) => {
          const nearbyReports = state.reports.filter((r: any) => {
            if (r.id === report.id) return false;
            const distance = Math.sqrt(
              Math.pow((report.location.lat - r.location.lat) * 111000, 2) +
              Math.pow((report.location.lng - r.location.lng) * 111000, 2)
            );
            return distance <= 100; // 100 meters
          });
          
          const isHighPriority = nearbyReports.length >= REPORT_COUNT_THRESHOLD - 1;
          return {
            ...report,
            reportCount: nearbyReports.length + 1,
            isHighPriority,
          };
        });

        return { reports: updatedReports };
      }),

      generatePredictions: async (location: { lat: number; lng: number }) => {
        // Mock prediction generation - in real app, this would call Gemini API
        const mockPredictions: PredictionData[] = [
          {
            location,
            predictedSeverity: 'medium',
            confidence: 0.75,
            factors: ['Heavy traffic', 'Recent rainfall', 'Road age'],
            timeframe: 'Next 30 days',
          },
        ];
        
        set((state: any) => ({
          predictions: [...state.predictions, ...mockPredictions],
        }));
      },

      getNearbyReports: (location: { lat: number; lng: number }, radius: number) => {
        const state = get();
        const allReports = [...state.reports, ...state.textReports];
        
        return allReports.filter((report: any) => {
          const distance = Math.sqrt(
            Math.pow((location.lat - report.location.lat) * 111, 2) +
            Math.pow((location.lng - report.location.lng) * 111, 2)
          );
          return distance <= radius;
        });
      },

      // Note: Database API methods removed - using localStorage only

    }),
    {
      name: 'pothole-reporter-storage',
      partialize: (state) => ({
        authenticatedUsers: state.authenticatedUsers,
        userEmail: state.userEmail,
        reports: state.reports,
        textReports: state.textReports,
        scratchCards: state.scratchCards,
        predictions: state.predictions,
        trends: state.trends,
        notifications: state.notifications,
      }) as any,
      merge: (persistedState: any, currentState: any) => ({
        ...currentState,
        ...persistedState,
        // Always merge default users with persisted users
        authenticatedUsers: {
          ...defaultAuthenticatedUsers,
          ...persistedState?.authenticatedUsers,
        },
        // Filter out anonymous reports from persisted data and ensure dates are properly restored
        reports: (persistedState?.reports || [])
          .filter((report: any) =>
            report.userName !== 'Anonymous' && report.userId !== 'anonymous'
          )
          .map((report: any) => ({
            ...report,
            createdAt: new Date(report.createdAt), // Ensure createdAt is a Date object
          })),
        textReports: (persistedState?.textReports || []).map((report: any) => ({
          ...report,
          createdAt: new Date(report.createdAt),
        })),
        scratchCards: (persistedState?.scratchCards || []).map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
        })),
        predictions: persistedState?.predictions || [],
        trends: persistedState?.trends || [],
        // Ensure notifications have proper Date objects too
        notifications: (persistedState?.notifications || []).map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        })),
      }),
    }
  )
);