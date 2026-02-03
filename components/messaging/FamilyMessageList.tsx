// FamilyMessageList Component
// Shows list of families with message previews, unread counts, and last message info

"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageSquare, Clock, Lock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { FamilyMessageGroup } from "@/types/messaging";
import { EmptyState } from "@/components/ui/empty-state";

interface FamilyMessageListProps {
  families: FamilyMessageGroup[];
  selectedFamilyId: string | null;
  onSelect: (family: FamilyMessageGroup) => void;
  currentUserId: string;
}

export function FamilyMessageList({
  families,
  selectedFamilyId,
  onSelect,
  currentUserId,
}: FamilyMessageListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (families.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a new conversation to see it here"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
      {families.map((family) => {
        const isSelected = family.familyId === selectedFamilyId;
        const hasUnread = family.unreadCount > 0;

        return (
          <div
            key={family.familyId}
            onClick={() => onSelect(family)}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all border",
              isSelected
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700",
              hasUnread && !isSelected && "border-blue-200 dark:border-blue-700"
            )}
          >
            {/* Family Header */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(family.familyName)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Family Name and Unread Badge */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={cn(
                    "text-sm font-semibold truncate",
                    hasUnread ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                  )}>
                    {family.familyName}
                  </h3>
                  {hasUnread && (
                    <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {family.unreadCount}
                    </Badge>
                  )}
                </div>

                {/* Last Message Preview */}
                <p className={cn(
                  "text-xs truncate mb-1.5",
                  hasUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400"
                )}>
                  {family.lastMessageBy && (
                    <span className="font-medium">{family.lastMessageBy}: </span>
                  )}
                  {family.lastMessagePreview || "No messages yet"}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {/* Message Count */}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{family.totalMessages}</span>
                  </div>

                  {/* RM Count */}
                  {family.assignedRMs.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{family.assignedRMs.length} RM{family.assignedRMs.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Internal Badge */}
                  {family.hasInternalMessages && (
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Lock className="h-3 w-3" />
                      <span>Internal</span>
                    </div>
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(parseISO(family.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
