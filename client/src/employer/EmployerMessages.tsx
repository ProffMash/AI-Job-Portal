import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Search, Send, MoreHorizontal, Phone, Video, Image, Paperclip, Smile, Circle, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    title: string;
    appliedFor?: string;
    avatar: string;
    isOnline: boolean;
  };
  messages: Message[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Mock conversations data for employers
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'u1',
      name: 'Alex Thompson',
      title: 'Senior Full Stack Developer',
      appliedFor: 'Senior React Developer',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=6366f1&color=fff',
      isOnline: true
    },
    messages: [
      { id: 'm1', senderId: 'me', content: 'Hi Alex! Thank you for applying to our Senior React Developer position. Your profile looks impressive!', timestamp: new Date('2026-01-19T10:00:00'), isRead: true },
      { id: 'm2', senderId: 'u1', content: 'Thank you! I\'m very excited about this opportunity. The role aligns perfectly with my experience.', timestamp: new Date('2026-01-19T10:15:00'), isRead: true },
      { id: 'm3', senderId: 'me', content: 'Great! We would like to schedule a technical interview with you. Are you available this Thursday?', timestamp: new Date('2026-01-19T10:30:00'), isRead: true },
      { id: 'm4', senderId: 'u1', content: 'Yes, Thursday works perfectly! What time would you prefer?', timestamp: new Date('2026-01-19T10:45:00'), isRead: false }
    ],
    lastMessage: 'Yes, Thursday works perfectly!',
    lastMessageTime: new Date('2026-01-19T10:45:00'),
    unreadCount: 1
  },
  {
    id: '2',
    participant: {
      id: 'u2',
      name: 'Maria Garcia',
      title: 'Frontend Developer',
      appliedFor: 'UI Developer',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=10b981&color=fff',
      isOnline: false
    },
    messages: [
      { id: 'm5', senderId: 'me', content: 'Hi Maria, I reviewed your portfolio and I\'m impressed with your UI work!', timestamp: new Date('2026-01-18T14:00:00'), isRead: true },
      { id: 'm6', senderId: 'u2', content: 'Thank you so much! I put a lot of effort into those projects.', timestamp: new Date('2026-01-18T14:30:00'), isRead: true },
      { id: 'm7', senderId: 'u2', content: 'I\'m particularly proud of the e-commerce redesign project.', timestamp: new Date('2026-01-18T14:35:00'), isRead: true }
    ],
    lastMessage: 'I\'m particularly proud of the e-commerce redesign',
    lastMessageTime: new Date('2026-01-18T14:35:00'),
    unreadCount: 0
  },
  {
    id: '3',
    participant: {
      id: 'u3',
      name: 'James Wilson',
      title: 'Backend Engineer',
      appliedFor: 'Python Developer',
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=f59e0b&color=fff',
      isOnline: true
    },
    messages: [
      { id: 'm8', senderId: 'u3', content: 'Hello! I wanted to follow up on my application for the Python Developer position.', timestamp: new Date('2026-01-17T09:00:00'), isRead: true },
      { id: 'm9', senderId: 'me', content: 'Hi James! Thanks for following up. Your application is currently under review.', timestamp: new Date('2026-01-17T09:30:00'), isRead: true }
    ],
    lastMessage: 'Your application is currently under review.',
    lastMessageTime: new Date('2026-01-17T09:30:00'),
    unreadCount: 0
  },
  {
    id: '4',
    participant: {
      id: 'u4',
      name: 'Sarah Chen',
      title: 'DevOps Engineer',
      appliedFor: 'Cloud Engineer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ef4444&color=fff',
      isOnline: false
    },
    messages: [
      { id: 'm10', senderId: 'me', content: 'Congratulations Sarah! We\'re pleased to offer you the Cloud Engineer position.', timestamp: new Date('2026-01-16T16:00:00'), isRead: true },
      { id: 'm11', senderId: 'u4', content: 'This is amazing news! Thank you so much. I\'m thrilled to accept!', timestamp: new Date('2026-01-16T16:30:00'), isRead: true }
    ],
    lastMessage: 'I\'m thrilled to accept!',
    lastMessageTime: new Date('2026-01-16T16:30:00'),
    unreadCount: 0
  }
];

export const EmployerMessages: React.FC = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participant.appliedFor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`${showConversationList ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 border-r border-gray-200 flex-col`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                    {totalUnread > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search candidates"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setShowConversationList(false);
                    }}
                    className={`flex items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="h-12 w-12 rounded-full"
                      />
                      {conversation.participant.isOnline && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 text-green-500 fill-green-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conversation.participant.name}
                        </p>
                        <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-blue-600 truncate">{conversation.participant.appliedFor}</p>
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className={`${!showConversationList ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setShowConversationList(true)}
                    className="md:hidden p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={selectedConversation.participant.avatar}
                        alt={selectedConversation.participant.name}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      />
                      {selectedConversation.participant.isOnline && (
                        <Circle className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 text-green-500 fill-green-500" />
                      )}
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{selectedConversation.participant.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        <span className="hidden sm:inline">{selectedConversation.participant.title}</span>
                        {selectedConversation.participant.appliedFor && (
                          <span className="text-blue-600"> <span className="hidden sm:inline">•</span> Applied for {selectedConversation.participant.appliedFor}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                      <User className="h-5 w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                      <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === 'me'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderId === 'me' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600">
                      <Image className="h-5 w-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Write a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${!showConversationList ? 'flex' : 'hidden'} md:flex flex-1 items-center justify-center text-gray-500 p-4`}>
                <p className="text-center text-sm sm:text-base">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
