import api from './apiClient';

export interface MessageUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'seeker' | 'employer';
  company?: string;
  bio?: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface LastMessage {
  content: string;
  created_at: string;
  sender_id: number;
}

export interface Conversation {
  id: number;
  participant: MessageUser;
  employer_details: MessageUser;
  seeker_details: MessageUser;
  last_message: LastMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail {
  id: number | null;
  participant: MessageUser;
  employer_details?: MessageUser;
  seeker_details?: MessageUser;
  messages: Message[];
  created_at: string | null;
  updated_at: string | null;
}

export interface SendMessageResponse {
  message: Message;
  conversation_id: number;
}

// Get all conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>('/conversations/');
  return response.data;
}

// Get a specific conversation with all messages
export async function getConversation(conversationId: number): Promise<ConversationDetail> {
  const response = await api.get<ConversationDetail>(`/conversations/${conversationId}/`);
  return response.data;
}

// Get or create conversation with a specific user
export async function getConversationWithUser(userId: number): Promise<ConversationDetail> {
  const response = await api.get<ConversationDetail>(`/conversations/with-user/${userId}/`);
  return response.data;
}

// Send a new message (creates conversation if needed)
export async function sendMessage(recipientId: number, content: string): Promise<SendMessageResponse> {
  const response = await api.post<SendMessageResponse>('/conversations/send/', {
    recipient_id: recipientId,
    content: content
  });
  return response.data;
}

// Reply to an existing conversation
export async function replyToConversation(conversationId: number, content: string): Promise<Message> {
  const response = await api.post<Message>(`/conversations/${conversationId}/reply/`, {
    content: content
  });
  return response.data;
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(conversationId: number): Promise<void> {
  await api.post(`/conversations/${conversationId}/mark-read/`);
}

// Get total unread message count
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<{ unread_count: number }>('/conversations/unread-count/');
  return response.data.unread_count;
}
