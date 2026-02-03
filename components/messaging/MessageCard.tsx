import { Message } from "@/types/messaging";
import { ColoredBadge } from "@/components/ui/colored-badge";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageCardProps {
  message: Message;
  currentUserId: string;
  currentUserRole?: "admin" | "rm" | "family";
  showInternal?: boolean;
  showSenderRM?: boolean; // Show RM name for multi-RM conversations
}

export function MessageCard({
  message,
  currentUserId,
  currentUserRole,
  showInternal = true,
  showSenderRM = false,
}: MessageCardProps) {
  const isCurrentUser = message.senderId === currentUserId;
  const isRead = message.readBy.includes(currentUserId);

  const getPriorityBadge = () => {
    const variants = {
      high: "danger",
      medium: "warning",
      low: "default",
    } as const;

    return (
      <ColoredBadge variant={variants[message.priority]} className="text-xs">
        {message.priority}
      </ColoredBadge>
    );
  };

  const getRoleBadge = () => {
    const variants = {
      admin: "danger",
      rm: "info",
      family: "success",
    } as const;

    return (
      <ColoredBadge variant={variants[message.senderRole]} className="text-xs">
        {message.senderRole.toUpperCase()}
      </ColoredBadge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg transition-all",
        isCurrentUser
          ? "bg-blue-50 border-l-4 border-blue-500"
          : "bg-white border border-gray-200 hover:shadow-sm",
        !isRead && !isCurrentUser && "bg-blue-50/30 border-blue-300"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          message.senderRole === "admin" && "bg-red-100 text-red-700",
          message.senderRole === "rm" && "bg-purple-100 text-purple-700",
          message.senderRole === "family" && "bg-green-100 text-green-700"
        )}
      >
        {getInitials(message.senderName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{message.senderName}</span>
              {getRoleBadge()}
              {showSenderRM && message.senderRole === "rm" && (
                <Badge
                  variant="outline"
                  className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs"
                >
                  RM: {message.senderName}
                </Badge>
              )}
              {message.isInternal && showInternal && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 text-xs border border-orange-200 dark:border-orange-800"
                  title="Only visible to admins and RMs"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Internal
                </Badge>
              )}
              {getPriorityBadge()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>
                {formatDistanceToNow(new Date(message.sentAt), {
                  addSuffix: true,
                })}
              </span>
              {!isCurrentUser && isRead && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCheck className="h-3 w-3" />
                  Read
                </span>
              )}
              {isCurrentUser && message.readBy.length > 1 && (
                <span className="flex items-center gap-1 text-blue-600">
                  <CheckCheck className="h-3 w-3" />
                  Seen by {message.readBy.length - 1}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm"
              >
                <span className="font-medium">{attachment.fileName}</span>
                <span className="text-xs text-muted-foreground">
                  ({(attachment.fileSize / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Category Badge */}
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {message.category}
          </Badge>
        </div>
      </div>
    </div>
  );
}
