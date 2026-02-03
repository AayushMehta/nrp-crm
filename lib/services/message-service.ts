import {
  Message,
  MessageThread,
  MessageDraft,
  Participant,
  MessagingStats,
  MessagePriority,
  MessageCategory,
  FamilyMessageGroup,
} from "@/types/messaging";

const STORAGE_KEY_THREADS = "nrp_crm_message_threads";
const STORAGE_KEY_MESSAGES = "nrp_crm_messages";

export class MessageService {
  // ==================== Thread Management ====================

  static getAllThreads(): MessageThread[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY_THREADS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveThreads(threads: MessageThread[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  }

  static getThreadById(threadId: string): MessageThread | null {
    const threads = this.getAllThreads();
    return threads.find((t) => t.id === threadId) || null;
  }

  static getThreadsByFamily(familyId: string): MessageThread[] {
    const threads = this.getAllThreads();
    return threads.filter((t) => t.familyId === familyId);
  }

  /**
   * Get threads with role-based filtering
   */
  static getThreads(
    userId: string,
    userRole: "admin" | "rm" | "family",
    assignedFamilyIds?: string[]
  ): MessageThread[] {
    const threads = this.getAllThreads();

    if (userRole === "admin") {
      // Admin sees all threads
      return threads;
    }

    if (userRole === "rm") {
      // RM sees threads for assigned families
      return threads.filter(
        (t) =>
          assignedFamilyIds?.includes(t.familyId) || t.assignedRmId === userId
      );
    }

    if (userRole === "family") {
      // Family sees only their own threads (non-internal messages only - filtered at message level)
      return threads.filter((t) =>
        t.participants.some((p) => p.userId === userId)
      );
    }

    return [];
  }

  static createThread(
    familyId: string,
    familyName: string,
    subject: string,
    participants: Participant[],
    assignedRmId?: string
  ): MessageThread {
    const thread: MessageThread = {
      id: `thread-${Date.now()}`,
      familyId,
      familyName,
      subject,
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: "",
      messageCount: 0,
      unreadCount: 0,
      unreadBy: participants.map((p) => p.userId),
      participants,
      assignedRmId,
      tags: [],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const threads = this.getAllThreads();
    threads.push(thread);
    this.saveThreads(threads);

    return thread;
  }

  static updateThread(threadId: string, updates: Partial<MessageThread>): void {
    const threads = this.getAllThreads();
    const index = threads.findIndex((t) => t.id === threadId);

    if (index !== -1) {
      threads[index] = {
        ...threads[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveThreads(threads);
    }
  }

  // ==================== Message Management ====================

  static getAllMessages(): Message[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
    return stored ? JSON.parse(stored) : [];
  }

  static saveMessages(messages: Message[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }

  static getThreadMessages(
    threadId: string,
    userId: string,
    userRole: "admin" | "rm" | "family"
  ): Message[] {
    const messages = this.getAllMessages();
    let threadMessages = messages.filter((m) => m.threadId === threadId);

    // Filter internal messages for family users
    if (userRole === "family") {
      threadMessages = threadMessages.filter((m) => !m.isInternal);
    }

    // Sort by time (oldest first for conversation view)
    return threadMessages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }

  /**
   * Determine if a message should be internal based on sender role and thread participants
   * AUTO-TAGGING LOGIC:
   * - Family user sends message → always external
   * - Admin/RM sends message:
   *   - If thread has family participants → external
   *   - If thread has only admin/RM participants → internal
   */
  private static determineInternalStatus(
    senderRole: "admin" | "rm" | "family",
    threadParticipants: Participant[]
  ): boolean {
    // If sender is family, always external
    if (senderRole === "family") {
      return false;
    }

    // If sender is admin or RM, check if thread has any family participants
    const hasFamilyParticipants = threadParticipants.some(
      (p) => p.userRole === "family"
    );

    // RM↔RM = internal (no family participants)
    // Admin↔RM = internal (no family participants)
    // RM→Client = external (has family participants)
    // Admin→Client = external (has family participants)
    return !hasFamilyParticipants;
  }

  /**
   * Send a new message with AUTO-TAGGING
   */
  static sendMessage(draft: MessageDraft, senderId: string, senderName: string, senderRole: "admin" | "rm" | "family"): Message {
    const messages = this.getAllMessages();
    const threads = this.getAllThreads();

    // Create or find thread
    let thread: MessageThread | null = null;

    if (draft.threadId) {
      thread = this.getThreadById(draft.threadId);
    } else if (draft.familyId) {
      // Create new thread
      const participants: Participant[] = [
        {
          userId: senderId,
          userName: senderName,
          userRole: senderRole,
          joinedAt: new Date().toISOString(),
        },
      ];

      thread = this.createThread(
        draft.familyId,
        draft.familyName || "",
        draft.subject || "New Conversation",
        participants
      );
    }

    if (!thread) {
      throw new Error("Cannot send message without thread or family");
    }

    // AUTO-COMPUTE isInternal based on sender role and thread participants
    const isInternal = this.determineInternalStatus(senderRole, thread.participants);

    // Create message
    const message: Message = {
      id: `msg-${Date.now()}`,
      threadId: thread.id,
      senderId,
      senderName,
      senderRole,
      content: draft.content,
      priority: draft.priority,
      category: draft.category,
      isInternal: isInternal, // Use computed value instead of draft.isInternal
      sentAt: new Date().toISOString(),
      readBy: [senderId], // Sender has read their own message
      attachments: [],
    };

    messages.push(message);
    this.saveMessages(messages);

    // Update thread
    this.updateThread(thread.id, {
      lastMessage: draft.content.substring(0, 100),
      lastMessageAt: message.sentAt,
      lastMessageBy: senderName,
      messageCount: thread.messageCount + 1,
      unreadCount: thread.unreadCount + 1,
      unreadBy: thread.participants
        .filter((p) => p.userId !== senderId)
        .map((p) => p.userId),
    });

    return message;
  }

  /**
   * Mark message as read
   */
  static markMessageAsRead(messageId: string, userId: string): void {
    const messages = this.getAllMessages();
    const index = messages.findIndex((m) => m.id === messageId);

    if (index !== -1) {
      const message = messages[index];
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        this.saveMessages(messages);

        // Update thread unread count
        const thread = this.getThreadById(message.threadId);
        if (thread) {
          const threadMessages = this.getThreadMessages(
            thread.id,
            userId,
            "admin"
          );
          const unreadCount = threadMessages.filter(
            (m) => !m.readBy.includes(userId)
          ).length;

          this.updateThread(thread.id, {
            unreadCount,
            unreadBy: thread.unreadBy.filter((id) => id !== userId),
          });
        }
      }
    }
  }

  /**
   * Mark all messages in thread as read
   */
  static markThreadAsRead(threadId: string, userId: string): void {
    const messages = this.getAllMessages();
    let updated = false;

    messages.forEach((message) => {
      if (
        message.threadId === threadId &&
        !message.readBy.includes(userId)
      ) {
        message.readBy.push(userId);
        updated = true;
      }
    });

    if (updated) {
      this.saveMessages(messages);

      // Update thread
      const thread = this.getThreadById(threadId);
      if (thread) {
        this.updateThread(threadId, {
          unreadCount: 0,
          unreadBy: thread.unreadBy.filter((id) => id !== userId),
        });
      }
    }
  }

  // ==================== Stats & Analytics ====================

  static getStats(
    userId: string,
    userRole: "admin" | "rm" | "family",
    assignedFamilyIds?: string[]
  ): MessagingStats {
    const threads = this.getThreads(userId, userRole, assignedFamilyIds);
    const allMessages = this.getAllMessages();

    // Get messages for visible threads
    const visibleThreadIds = threads.map((t) => t.id);
    const messages = allMessages.filter((m) =>
      visibleThreadIds.includes(m.threadId)
    );

    // Filter internal messages for family users
    const filteredMessages =
      userRole === "family"
        ? messages.filter((m) => !m.isInternal)
        : messages;

    const unreadMessages = filteredMessages.filter(
      (m) => !m.readBy.includes(userId)
    );

    const unreadThreads = threads.filter((t) => t.unreadBy.includes(userId));

    const internalThreads = threads.filter((t) => {
      const threadMessages = messages.filter((m) => m.threadId === t.id);
      return threadMessages.some((m) => m.isInternal);
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthThreads = threads.filter(
      (t) => new Date(t.createdAt) >= thisMonth
    );

    // Count by category
    const byCategory: Record<MessageCategory, number> = {
      onboarding: 0,
      compliance: 0,
      reports: 0,
      general: 0,
    };

    filteredMessages.forEach((m) => {
      byCategory[m.category]++;
    });

    // Count by priority
    const byPriority: Record<MessagePriority, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    filteredMessages.forEach((m) => {
      byPriority[m.priority]++;
    });

    return {
      totalThreads: threads.length,
      unreadThreads: unreadThreads.length,
      unreadMessages: unreadMessages.length,
      internalThreads: internalThreads.length,
      thisMonthThreads: thisMonthThreads.length,
      byCategory,
      byPriority,
    };
  }

  /**
   * Get unread count for user
   */
  static getUnreadCount(userId: string): number {
    const threads = this.getAllThreads();
    return threads.filter((t) => t.unreadBy.includes(userId)).length;
  }

  // ==================== Search & Filter ====================

  static searchThreads(
    query: string,
    userId: string,
    userRole: "admin" | "rm" | "family",
    assignedFamilyIds?: string[]
  ): MessageThread[] {
    const threads = this.getThreads(userId, userRole, assignedFamilyIds);
    const lowercaseQuery = query.toLowerCase();

    return threads.filter(
      (t) =>
        t.familyName.toLowerCase().includes(lowercaseQuery) ||
        t.subject.toLowerCase().includes(lowercaseQuery) ||
        t.lastMessage.toLowerCase().includes(lowercaseQuery)
    );
  }

  static filterThreadsByPriority(
    threads: MessageThread[],
    priority: MessagePriority
  ): MessageThread[] {
    const allMessages = this.getAllMessages();

    return threads.filter((t) => {
      const threadMessages = allMessages.filter((m) => m.threadId === t.id);
      return threadMessages.some((m) => m.priority === priority);
    });
  }

  static filterThreadsByCategory(
    threads: MessageThread[],
    category: MessageCategory
  ): MessageThread[] {
    const allMessages = this.getAllMessages();

    return threads.filter((t) => {
      const threadMessages = allMessages.filter((m) => m.threadId === t.id);
      return threadMessages.some((m) => m.category === category);
    });
  }

  // ==================== Utility ====================

  static deleteThread(threadId: string): void {
    // Delete thread
    const threads = this.getAllThreads();
    const filteredThreads = threads.filter((t) => t.id !== threadId);
    this.saveThreads(filteredThreads);

    // Delete all messages in thread
    const messages = this.getAllMessages();
    const filteredMessages = messages.filter((m) => m.threadId !== threadId);
    this.saveMessages(filteredMessages);
  }

  static archiveThread(threadId: string): void {
    this.updateThread(threadId, { isArchived: true });
  }

  static unarchiveThread(threadId: string): void {
    this.updateThread(threadId, { isArchived: false });
  }

  // ==================== Family-Based Messaging ====================

  /**
   * Get all families with their aggregated message data
   * Groups messages by family, not by thread
   */
  static getFamilyMessageGroups(
    userId: string,
    userRole: "admin" | "rm" | "family",
    assignedFamilyIds?: string[]
  ): FamilyMessageGroup[] {
    const allThreads = this.getAllThreads();
    const allMessages = this.getAllMessages();

    // Filter threads based on role
    let threads = allThreads;
    if (userRole === "rm") {
      threads = allThreads.filter(
        (t) => assignedFamilyIds?.includes(t.familyId) || t.assignedRmId === userId
      );
    } else if (userRole === "family") {
      threads = allThreads.filter((t) =>
        t.participants.some((p) => p.userId === userId)
      );
    }

    // Group threads by family
    const familyMap = new Map<string, MessageThread[]>();
    threads.forEach((thread) => {
      if (!familyMap.has(thread.familyId)) {
        familyMap.set(thread.familyId, []);
      }
      familyMap.get(thread.familyId)!.push(thread);
    });

    // Create FamilyMessageGroup for each family
    const familyGroups: FamilyMessageGroup[] = [];

    familyMap.forEach((familyThreads, familyId) => {
      const familyName = familyThreads[0].familyName;

      // Get all messages for this family
      const familyMessages = allMessages
        .filter((m) => familyThreads.some((t) => t.id === m.threadId))
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

      // Filter internal messages for family users
      const visibleMessages =
        userRole === "family"
          ? familyMessages.filter((m) => !m.isInternal)
          : familyMessages;

      // Get unique RMs who have messaged this family
      const rmSet = new Map<string, { rmId: string; rmName: string; messageCount: number }>();
      familyMessages.forEach((msg) => {
        if (msg.senderRole === "rm") {
          const existing = rmSet.get(msg.senderId);
          if (existing) {
            existing.messageCount++;
          } else {
            rmSet.set(msg.senderId, {
              rmId: msg.senderId,
              rmName: msg.senderName,
              messageCount: 1,
            });
          }
        }
      });

      // Calculate unread count
      const unreadCount = visibleMessages.filter(
        (m) => !m.readBy.includes(userId)
      ).length;

      // Get last message
      const lastMessage = visibleMessages[visibleMessages.length - 1];

      // Check if family has internal messages
      const hasInternalMessages = familyMessages.some((m) => m.isInternal);

      familyGroups.push({
        familyId,
        familyName,
        totalMessages: visibleMessages.length,
        unreadCount,
        lastMessageAt: lastMessage?.sentAt || familyThreads[0].createdAt,
        lastMessagePreview: lastMessage?.content.substring(0, 100) || "",
        lastMessageBy: lastMessage?.senderName || "",
        assignedRMs: Array.from(rmSet.values()),
        threads: familyThreads,
        allMessages: visibleMessages,
        hasInternalMessages,
      });
    });

    // Sort by last message time (most recent first)
    return familyGroups.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }

  /**
   * Get ALL messages for a specific family
   * Includes messages from all RMs who have communicated with this family
   * Sorted chronologically
   */
  static getFamilyMessages(
    familyId: string,
    userId: string,
    userRole: "admin" | "rm" | "family"
  ): Message[] {
    const allThreads = this.getAllThreads();
    const allMessages = this.getAllMessages();

    // Get all threads for this family
    const familyThreads = allThreads.filter((t) => t.familyId === familyId);
    const familyThreadIds = familyThreads.map((t) => t.id);

    // Get all messages for these threads
    let messages = allMessages.filter((m) => familyThreadIds.includes(m.threadId));

    // Filter internal messages for family users
    if (userRole === "family") {
      messages = messages.filter((m) => !m.isInternal);
    }

    // Sort by time (oldest first for conversation view)
    return messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }

  /**
   * Get all conversation threads for a family
   */
  static getFamilyThreads(familyId: string): MessageThread[] {
    const threads = this.getAllThreads();
    return threads.filter((t) => t.familyId === familyId);
  }

  /**
   * Get stats per family
   */
  static getFamilyStats(familyId: string): {
    totalMessages: number;
    internalMessages: number;
    externalMessages: number;
    rmCount: number;
    lastActivity: string;
  } {
    const allMessages = this.getAllMessages();
    const threads = this.getFamilyThreads(familyId);
    const threadIds = threads.map((t) => t.id);

    const messages = allMessages.filter((m) => threadIds.includes(m.threadId));
    const internalMessages = messages.filter((m) => m.isInternal);
    const externalMessages = messages.filter((m) => !m.isInternal);

    // Get unique RMs
    const rmIds = new Set(
      messages.filter((m) => m.senderRole === "rm").map((m) => m.senderId)
    );

    const lastMessage = messages[messages.length - 1];

    return {
      totalMessages: messages.length,
      internalMessages: internalMessages.length,
      externalMessages: externalMessages.length,
      rmCount: rmIds.size,
      lastActivity: lastMessage?.sentAt || threads[0]?.createdAt || "",
    };
  }
}
