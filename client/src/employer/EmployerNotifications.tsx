import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Bell, MessageCircle, Eye, FileText, Settings, Check, Trash2, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react';
import { getAllApplications, ApplicationResponse } from '../API/applicationApi';

interface Notification {
  id: string;
  type: 'application' | 'message' | 'view' | 'milestone' | 'reminder' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  avatar?: string;
  applicationId?: number;
}

export const EmployerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  // Fetch applications and generate notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const applicationsData = await getAllApplications();
        setApplications(applicationsData);

        // Filter for active applications (pending and reviewed)
        const activeApplications = applicationsData.filter(
          app => app.status === 'pending' || app.status === 'reviewed'
        );

        // Generate notifications from active applications
        const appNotifications: Notification[] = activeApplications.map(app => ({
          id: `app-${app.id}`,
          type: 'application' as const,
          title: app.status === 'pending' ? 'New Application' : 'Application In Review',
          description: `${app.seeker_name || app.seeker_details?.name || 'A candidate'} applied for ${app.job_details?.title || 'a position'}.`,
          timestamp: new Date(app.applied_at),
          isRead: readNotificationIds.has(`app-${app.id}`),
          avatar: app.seeker_details?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.seeker_name || 'User')}&background=6366f1&color=fff`,
          applicationId: app.id
        }));

        // Add some system notifications based on stats
        const systemNotifications: Notification[] = [];
        
        if (activeApplications.length >= 10) {
          systemNotifications.push({
            id: 'milestone-1',
            type: 'milestone',
            title: 'Milestone Reached',
            description: `You have ${activeApplications.length} active applications to review!`,
            timestamp: new Date(),
            isRead: readNotificationIds.has('milestone-1')
          });
        }

        const pendingCount = applicationsData.filter(a => a.status === 'pending').length;
        if (pendingCount > 0) {
          systemNotifications.push({
            id: 'reminder-pending',
            type: 'reminder',
            title: 'Pending Applications',
            description: `You have ${pendingCount} pending application${pendingCount > 1 ? 's' : ''} waiting for review.`,
            timestamp: new Date(),
            isRead: readNotificationIds.has('reminder-pending')
          });
        }

        // Sort all notifications by timestamp (newest first)
        const allNotifications = [...appNotifications, ...systemNotifications].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        setNotifications(allNotifications);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [readNotificationIds]);

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'view':
        return <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => new Set([...prev, id]));
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadNotificationIds(allIds);
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Stats from real data - focus on active applications
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const reviewedApplications = applications.filter(a => a.status === 'reviewed').length;
  const activeApplications = pendingApplications + reviewedApplications;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Notifications</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Mark all as read
              </button>
            )}
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activeApplications}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{pendingApplications}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-colors">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{reviewedApplications}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reviewed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === 'unread' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' ? 'You\'ve read all your notifications!' : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mr-4">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt=""
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
