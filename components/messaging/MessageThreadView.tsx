import { useState, useEffect, useRef } from "react";
import { Message, MessageThread } from "@/types/messaging";
import { MessageCard } from "./MessageCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Reply, CheckCheck, Archive, Trash2 } from "lucide-react";
import { MessageService } from "@/lib/services/message-service";

interface MessageThreadViewProps {
  thread: MessageThread;
  messages: Message[];
  currentUserId: string;
  currentUserRole: "admin" | "rm" | "family";
  onReply: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function MessageThreadView({
  thread,
  messages,
  currentUserId,
  currentUserRole,
  onReply,
  onArchive,
  onDelete,
}: MessageThreadViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark thread as read when viewing
  useEffect(() => {
    if (thread.unreadBy.includes(currentUserId) && !isMarkingRead) {
      setIsMarkingRead(true);
      MessageService.markThreadAsRead(thread.id, currentUserId);
      setTimeout(() => setIsMarkingRead(false), 500);
    }
  }, [thread.id, currentUserId, thread.unreadBy, isMarkingRead]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const unreadCount = messages.filter((m) => !m.readBy.includes(currentUserId)).length;

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <Card className="rounded-xl border shadow-sm mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {getInitials(thread.familyName)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl">{thread.familyName}</CardTitle>
                <CardDescription className="mt-1">{thread.subject}</CardDescription>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{thread.participants.length} participants</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CheckCheck className="h-4 w-4" />
                    <span>{thread.messageCount} messages</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="bg-blue-600">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={onReply}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              {onArchive && (
                <Button variant="outline" size="icon" onClick={onArchive}>
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              {onDelete && currentUserRole === "admin" && (
                <Button variant="outline" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages List */}
      <Card className="rounded-xl border shadow-sm flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Reply className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start the conversation by sending the first message
              </p>
              <Button onClick={onReply}>
                <Reply className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  currentUserId={currentUserId}
                  showInternal={currentUserRole !== "family"}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants Sidebar Info */}
      <Card className="rounded-xl border shadow-sm mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {thread.participants.map((participant) => (
              <div key={participant.userId} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    participant.userRole === "admin"
                      ? "bg-red-100 text-red-700"
                      : participant.userRole === "rm"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {getInitials(participant.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.userName}</p>
                  <p className="text-xs text-muted-foreground">{participant.userRole.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
