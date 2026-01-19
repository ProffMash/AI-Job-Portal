import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Bell, MessageCircle, Eye, FileText, Settings, Check, Trash2, TrendingUp, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'application' | 'message' | 'view' | 'milestone' | 'reminder' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'application',
    title: 'New Application',
    description: 'Alex Thompson applied for Senior React Developer position.',
    timestamp: new Date('2026-01-19T10:30:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=6366f1&color=fff'
  },
  {
    id: '2',
    type: 'application',
    title: 'New Application',
    description: 'Maria Garcia applied for UI Developer position.',
    timestamp: new Date('2026-01-19T09:15:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=10b981&color=fff'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'James Wilson sent you a message regarding his application.',
    timestamp: new Date('2026-01-19T08:45:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=f59e0b&color=fff'
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Milestone Reached',
    description: 'Your job posting "Senior React Developer" reached 50 applications!',
    timestamp: new Date('2026-01-19T08:00:00'),
    isRead: true
  },
  {
    id: '5',
    type: 'view',
    title: 'Job Views',
    description: 'Your job postings received 150 views this week.',
    timestamp: new Date('2026-01-18T18:00:00'),
    isRead: true
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Interview Reminder',
    description: 'You have an interview scheduled with Sarah Chen tomorrow at 2:00 PM.',
    timestamp: new Date('2026-01-18T14:30:00'),
    isRead: true
  },
  {
    id: '7',
    type: 'application',
    title: 'Application Withdrawn',
    description: 'David Kim withdrew his application for Mobile Developer position.',
    timestamp: new Date('2026-01-18T11:00:00'),
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff'
  },
  {
    id: '8',
    type: 'system',
    title: 'Job Posting Expiring',
    description: 'Your "Python Developer" job posting will expire in 3 days. Consider renewing it.',
    timestamp: new Date('2026-01-17T16:00:00'),
    isRead: true
  },
  {
    id: '9',
    type: 'milestone',
    title: 'Weekly Report',
    description: 'Your weekly hiring report is ready. You received 28 new applications this week.',
    timestamp: new Date('2026-01-17T10:00:00'),
    isRead: true
  },
  {
    id: '10',
    type: 'view',
    title: 'Profile Interest',
    description: '12 candidates viewed your company profile this week.',
    timestamp: new Date('2026-01-16T09:00:00'),
    isRead: true
  }
];

export const EmployerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'view':
        return <Eye className="h-5 w-5 text-indigo-600" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5 text-yellow-600" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
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
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Mark all as read
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs sm:text-sm text-gray-500">New Applications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs sm:text-sm text-gray-500">Unread Messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs sm:text-sm text-gray-500">Interviews Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' ? 'You\'ve read all your notifications!' : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
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
                      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
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
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
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
