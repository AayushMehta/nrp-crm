import { MessageThread } from "@/types/messaging";
import { Badge } from "@/components/ui/badge";
import { ColoredBadge } from "@/components/ui/colored-badge";
import { formatDistanceToNow } from "date-fns";
import { Users, MessageSquare, Lock, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageThreadListProps {
  threads: MessageThread[];
  selectedThreadId?: string;
  onThreadSelect: (thread: MessageThread) => void;
  currentUserId: string;
}

export function MessageThreadList({
  threads,
  selectedThreadId,
  onThreadSelect,
  currentUserId,
}: MessageThreadListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasInternalMessages = (thread: MessageThread) => {
    // This would need to check actual messages, simplified for now
    return thread.tags.includes("internal");
  };

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a new conversation with your clients
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const isSelected = thread.id === selectedThreadId;
        const hasUnread = thread.unreadBy.includes(currentUserId);

        return (
          <div
            key={thread.id}
            onClick={() => onThreadSelect(thread)}
            className={cn(
              "p-4 rounded-lg border transition-all cursor-pointer",
              isSelected
                ? "bg-blue-50 border-blue-500 shadow-sm"
                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm",
              hasUnread && !isSelected && "bg-blue-50/30 border-blue-300"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {getInitials(thread.familyName)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-semibold text-sm truncate",
                        hasUnread && "text-blue-600"
                      )}
                    >
                      {thread.familyName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.subject}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(thread.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {hasUnread && (
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-0">
                        {thread.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Last Message Preview */}
                <p
                  className={cn(
                    "text-sm text-muted-foreground truncate mb-2",
                    hasUnread && "font-medium text-gray-700"
                  )}
                >
                  {thread.lastMessageBy ? `${thread.lastMessageBy}: ` : ""}
                  {thread.lastMessage || "No messages yet"}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{thread.participants.length}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>{thread.messageCount}</span>
                  </div>

                  {hasInternalMessages(thread) && (
                    <ColoredBadge variant="danger" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Internal
                    </ColoredBadge>
                  )}

                  {thread.isArchived && (
                    <ColoredBadge variant="default" className="text-xs">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </ColoredBadge>
                  )}

                  {thread.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
