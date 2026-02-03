export type MessageCategory = 'onboarding' | 'compliance' | 'reports' | 'general';
export type MessagePriority = 'high' | 'medium' | 'low';

// Family Message Group - Groups all messages for a family
export interface FamilyMessageGroup {
  familyId: string;
  familyName: string;
  totalMessages: number;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageBy: string;
  assignedRMs: Array<{
    rmId: string;
    rmName: string;
    messageCount: number;
  }>;
  threads: MessageThread[]; // All conversation threads for this family
  allMessages: Message[];    // Flattened list of ALL messages (sorted by date)
  hasInternalMessages: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: MessageCategory;
  variables: string[];
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  usageCount: number;
}

export interface MessageThread {
  id: string;
  familyId: string;
  familyName: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: string;
  messageCount: number;
  unreadCount: number;
  unreadBy: string[]; // User IDs who haven't read latest messages
  participants: Participant[];
  assignedRmId?: string;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  userId: string;
  userName: string;
  userRole: 'admin' | 'rm' | 'family';
  joinedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'rm' | 'family';
  content: string;
  priority: MessagePriority;
  category: MessageCategory;
  isInternal: boolean; // Hidden from family users if true
  sentAt: string;
  readBy: string[]; // User IDs who have read this message
  attachments?: Attachment[];
  replyToId?: string; // For threading replies
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface MessageDraft {
  threadId?: string;
  familyId?: string;
  familyName?: string;
  subject?: string;
  content: string;
  priority: MessagePriority;
  category: MessageCategory;
  isInternal: boolean;
  recipientIds?: string[];
}

// Stats interface for messaging dashboard
export interface MessagingStats {
  totalThreads: number;
  unreadThreads: number;
  unreadMessages: number;
  internalThreads: number;
  thisMonthThreads: number;
  byCategory: Record<MessageCategory, number>;
  byPriority: Record<MessagePriority, number>;
}
