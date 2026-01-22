import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Bell, Briefcase, UserPlus, MessageCircle, Eye, CheckCircle, Star, Settings, Check, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'application' | 'connection' | 'message' | 'job' | 'view' | 'recommendation';
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
    title: 'Application Update',
    description: 'Your application for Senior React Developer at Google has been reviewed.',
    timestamp: new Date('2026-01-19T10:30:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=Google&background=4285f4&color=fff'
  },
  {
    id: '2',
    type: 'connection',
    title: 'New Connection Request',
    description: 'Sarah Johnson, Senior Recruiter at Meta, wants to connect with you.',
    timestamp: new Date('2026-01-19T09:15:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'Michael Chen sent you a message about a job opportunity.',
    timestamp: new Date('2026-01-19T08:45:00'),
    isRead: false,
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff'
  },
  {
    id: '4',
    type: 'job',
    title: 'Job Alert',
    description: '15 new jobs match your skills: React, TypeScript, Node.js',
    timestamp: new Date('2026-01-19T08:00:00'),
    isRead: true
  },
  {
    id: '5',
    type: 'view',
    title: 'Profile Views',
    description: 'Your profile was viewed by 12 recruiters this week.',
    timestamp: new Date('2026-01-18T18:00:00'),
    isRead: true
  },
  {
    id: '6',
    type: 'application',
    title: 'Application Submitted',
    description: 'Your application for Full Stack Developer at Netflix was successfully submitted.',
    timestamp: new Date('2026-01-18T14:30:00'),
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=Netflix&background=e50914&color=fff'
  },
  {
    id: '7',
    type: 'recommendation',
    title: 'Skill Endorsement',
    description: 'Emily Rodriguez endorsed you for React.',
    timestamp: new Date('2026-01-18T11:00:00'),
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=f59e0b&color=fff'
  },
  {
    id: '8',
    type: 'connection',
    title: 'Connection Accepted',
    description: 'David Kim accepted your connection request.',
    timestamp: new Date('2026-01-17T16:00:00'),
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=ef4444&color=fff'
  },
  {
    id: '9',
    type: 'job',
    title: 'Company Update',
    description: 'Stripe is hiring! Check out 5 new positions that match your profile.',
    timestamp: new Date('2026-01-17T10:00:00'),
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=Stripe&background=635bff&color=fff'
  },
  {
    id: '10',
    type: 'view',
    title: 'Search Appearance',
    description: 'You appeared in 28 searches this week.',
    timestamp: new Date('2026-01-16T09:00:00'),
    isRead: true
  }
];

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'connection':
        return <UserPlus className="h-5 w-5 text-purple-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'job':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'view':
        return <Eye className="h-5 w-5 text-indigo-600" />;
      case 'recommendation':
        return <CheckCircle className="h-5 w-5 text-teal-600" />;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
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
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6 transition-colors">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
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
                  className={`flex items-start p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt=""
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
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
