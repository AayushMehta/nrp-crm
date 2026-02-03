// FamilyMessagesView Component
// Shows ALL messages for selected family with tabs (All Messages / By Conversation)

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCard } from "./MessageCard";
import { Plus, Users, MessageSquare, Lock } from "lucide-react";
import type { FamilyMessageGroup, Message } from "@/types/messaging";

interface FamilyMessagesViewProps {
  family: FamilyMessageGroup;
  currentUserId: string;
  currentUserRole: "admin" | "rm" | "family";
  onReply: () => void;
}

export function FamilyMessagesView({
  family,
  currentUserId,
  currentUserRole,
  onReply,
}: FamilyMessagesViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "threads">("all");

  return (
    <Card className="rounded-xl border shadow-sm flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {family.familyName}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {/* Message Count */}
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>{family.totalMessages} messages</span>
              </div>

              {/* RM Count */}
              {family.assignedRMs.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{family.assignedRMs.length} RM{family.assignedRMs.length > 1 ? 's' : ''} involved</span>
                </div>
              )}

              {/* Internal Badge */}
              {family.hasInternalMessages && currentUserRole !== "family" && (
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                  <Lock className="h-3 w-3 mr-1" />
                  Has Internal
                </Badge>
              )}
            </div>

            {/* List of RMs */}
            {family.assignedRMs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {family.assignedRMs.map((rm) => (
                  <Badge
                    key={rm.rmId}
                    variant="outline"
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    {rm.rmName} ({rm.messageCount})
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button onClick={onReply} size="default">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </CardHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "threads")} className="flex-1 flex flex-col">
        <div className="px-6 pt-4 border-b">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="threads">By Conversation</TabsTrigger>
          </TabsList>
        </div>

        {/* ALL MESSAGES TAB - Chronological merge */}
        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <CardContent className="p-6 space-y-4">
              {family.allMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No messages yet
                    </p>
                  </div>
                </div>
              ) : (
                family.allMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    showSenderRM={true}
                  />
                ))
              )}
            </CardContent>
          </ScrollArea>
        </TabsContent>

        {/* BY CONVERSATION TAB - Grouped threads */}
        <TabsContent value="threads" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <CardContent className="p-6 space-y-6">
              {family.threads.length === 0 ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No conversations yet
                    </p>
                  </div>
                </div>
              ) : (
                family.threads.map((thread) => {
                  // Get messages for this thread
                  const threadMessages = family.allMessages.filter(
                    (m) => m.threadId === thread.id
                  );

                  return (
                    <div
                      key={thread.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                    >
                      {/* Thread Header */}
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {thread.subject}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {threadMessages.length} messages
                          </p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {thread.unreadCount} unread
                          </Badge>
                        )}
                      </div>

                      {/* Thread Messages */}
                      <div className="space-y-3">
                        {threadMessages.map((message) => (
                          <MessageCard
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            showSenderRM={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
