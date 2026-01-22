import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Search, Send, MoreHorizontal, Phone, Video, Image, Paperclip, Smile, Circle, User, Loader2, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { 
  getConversations, 
  getConversation, 
  replyToConversation,
  Conversation,
  ConversationDetail,
  Message
} from '../API/messageApi';

export const EmployerMessages: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
      // Select first conversation if available
      if (data.length > 0 && !selectedConversationId) {
        selectConversation(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      setSelectedConversationId(conversationId);
      setShowConversationList(false);
      const data = await getConversation(conversationId);
      setSelectedConversation(data);
      
      // Update unread count in conversations list
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
      );
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participant;
    return participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           participant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation?.id || sending) return;

    try {
      setSending(true);
      const sentMessage = await replyToConversation(selectedConversation.id, newMessage.trim());
      
      // Add message to current conversation
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, sentMessage]
      } : null);

      // Update last message in conversations list
      setConversations(prev => 
        prev.map(c => c.id === selectedConversation.id ? {
          ...c,
          last_message: {
            content: sentMessage.content,
            created_at: sentMessage.created_at,
            sender_id: sentMessage.sender_id
          },
          updated_at: sentMessage.created_at
        } : c)
      );

      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

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
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Start by contacting candidates from the Talent Pool</p>
                  </div>
                ) : (
                  filteredConversations.map(conversation => {
                    const participant = conversation.participant;
                    const avatarUrl = participant?.avatar || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(participant?.name || 'User')}&background=6366f1&color=fff`;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => selectConversation(conversation.id)}
                        className={`flex items-center p-3 sm:p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                          selectedConversationId === conversation.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={avatarUrl}
                            alt={participant?.name || 'User'}
                            className="h-12 w-12 rounded-full"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                              {participant?.name || 'Unknown User'}
                            </p>
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 truncate">{participant?.bio?.split('\n')[0] || 'Job Seeker'}</p>
                          <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
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
                        src={selectedConversation.participant?.avatar || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.participant?.name || 'User')}&background=6366f1&color=fff`}
                        alt={selectedConversation.participant?.name || 'User'}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                      />
                    </div>
                    <div className="ml-2 sm:ml-3 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {selectedConversation.participant?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedConversation.participant?.bio?.split('\n')[0] || 'Job Seeker'}
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
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : selectedConversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {selectedConversation.messages.map(message => {
                        const isMe = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
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
                        disabled={sending}
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${!showConversationList ? 'flex' : 'hidden'} md:flex flex-1 items-center justify-center text-gray-500 p-4`}>
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-center text-sm sm:text-base">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
