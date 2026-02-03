"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FamilyMessageList } from "@/components/messaging/FamilyMessageList";
import { FamilyMessagesView } from "@/components/messaging/FamilyMessagesView";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { MessageService } from "@/lib/services/message-service";
import { SampleDataService } from "@/lib/services/sample-data-service";
import { FamilyMessageGroup, MessageDraft, MessageCategory, MessagePriority } from "@/types/messaging";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UserFlowSection } from "@/components/ui/user-flow-section";
import {
  MessageSquare,
  Bell,
  Lock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Database,
  Users,
} from "lucide-react";

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [familyGroups, setFamilyGroups] = useState<FamilyMessageGroup[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyMessageGroup | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MessageCategory>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | MessagePriority>("all");

  useEffect(() => {
    loadFamilyGroups();
  }, [user, searchQuery, categoryFilter, priorityFilter]);

  const loadFamilyGroups = () => {
    if (!user) return;

    // Get assigned family IDs (for RM role)
    // TODO: Get from user context or database
    const assignedFamilyIds = user.role === "rm" ? [] : undefined;

    let groups = MessageService.getFamilyMessageGroups(
      user.id,
      user.role as "admin" | "rm" | "family",
      assignedFamilyIds
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      groups = groups.filter(
        (g) =>
          g.familyName.toLowerCase().includes(query) ||
          g.lastMessagePreview.toLowerCase().includes(query)
      );
    }

    setFamilyGroups(groups);
  };

  const handleFamilySelect = (family: FamilyMessageGroup) => {
    setSelectedFamily(family);

    // Mark all messages as read
    if (user) {
      family.threads.forEach((thread) => {
        MessageService.markThreadAsRead(thread.id, user.id);
      });
      // Reload to update unread counts
      setTimeout(loadFamilyGroups, 100);
    }
  };

  const handleSendMessage = (draft: MessageDraft) => {
    if (!user) return;

    try {
      MessageService.sendMessage(
        draft,
        user.id,
        user.name,
        user.role as "admin" | "rm" | "family"
      );

      toast.success("Message sent successfully");

      // Reload family groups
      loadFamilyGroups();

      // Reload selected family
      if (selectedFamily) {
        const updated = familyGroups.find(g => g.familyId === selectedFamily.familyId);
        if (updated) {
          setSelectedFamily(updated);
        }
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    }
  };

  const handleOpenComposer = () => {
    setIsComposerOpen(true);
  };

  const handleReply = () => {
    setIsComposerOpen(true);
  };

  // Calculate stats from family groups
  const stats = {
    totalFamilies: familyGroups.length,
    unreadMessages: familyGroups.reduce((sum, g) => sum + g.unreadCount, 0),
    internalThreads: familyGroups.filter((g) => g.hasInternalMessages).length,
    highPriority: familyGroups.reduce((sum, g) => {
      return sum + g.allMessages.filter((m) => m.priority === "high").length;
    }, 0),
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Family-based communication trail
            </p>
          </div>
          <div className="flex items-center gap-2">
            {familyGroups.length === 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  SampleDataService.initializeSampleMessages();
                  toast.success("Sample data created!");
                  loadFamilyGroups();
                }}
              >
                <Database className="h-4 w-4 mr-2" />
                Load Sample Data
              </Button>
            )}
            <Button onClick={handleOpenComposer}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total Families"
            value={stats.totalFamilies}
            description="With conversations"
            icon={Users}
            iconClassName="text-blue-600"
          />
          <StatCard
            title="Unread Messages"
            value={stats.unreadMessages}
            description="Across all families"
            icon={Bell}
            iconClassName="text-orange-600"
          />
          <StatCard
            title="Internal Messages"
            value={stats.internalThreads}
            description="Families with internal notes"
            icon={Lock}
            iconClassName="text-orange-600"
          />
          <StatCard
            title="High Priority"
            value={stats.highPriority}
            description="Needs attention"
            icon={AlertTriangle}
            iconClassName="text-red-600"
          />
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v as typeof categoryFilter);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v as typeof priorityFilter);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Two-Panel Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: Family List (1/3) */}
          <Card className="rounded-xl border shadow-sm p-4 lg:col-span-1">
            <FamilyMessageList
              families={familyGroups}
              selectedFamilyId={selectedFamily?.familyId || null}
              onSelect={handleFamilySelect}
              currentUserId={user?.id || ""}
            />
          </Card>

          {/* RIGHT: Family Messages View (2/3) */}
          <div className="lg:col-span-2">
            {selectedFamily && user ? (
              <FamilyMessagesView
                family={selectedFamily}
                currentUserId={user.id}
                currentUserRole={user.role as "admin" | "rm" | "family"}
                onReply={handleReply}
              />
            ) : (
              <Card className="rounded-xl border shadow-sm p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No family selected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a family from the list to view all their messages
                  </p>
                  <Button onClick={handleOpenComposer}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Message Composer Dialog */}
        <MessageComposer
          open={isComposerOpen}
          onOpenChange={setIsComposerOpen}
          onSend={handleSendMessage}
          threadId={selectedFamily?.threads[0]?.id}
          familyId={selectedFamily?.familyId}
          familyName={selectedFamily?.familyName}
          subject={selectedFamily?.threads[0]?.subject}
          userRole={user?.role as "admin" | "rm" | "family" || "family"}
        />

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Communications (All Roles)"
          description="Family-based messaging system with internal/external filtering"
          userFlow={[
            {
              step: "View Communication Metrics",
              description: "Track Total Families, Unread Messages, Internal Threads, and High Priority items."
            },
            {
              step: "Browse Family List",
              description: "Left panel shows family cards with last message preview, unread badge, RM count, and timestamp. Click to select family."
            },
            {
              step: "View Messages",
              description: "Right panel displays conversation.",
              subSteps: [
                "All Messages Tab: Chronological timeline, internal messages shown to Admin/RM only",
                "By Conversation Tab: Messages grouped by thread/topic with unread count"
              ]
            },
            {
              step: "Compose New Message",
              description: "Create messages with category and priority.",
              subSteps: [
                "Click 'New Message'",
                "Enter message content (required)",
                "Select priority (Low, Medium, High)",
                "Select category (Onboarding, Compliance, Reports, General)",
                "System auto-tags as internal (Admin/RM to RM) or external (includes client)",
                "Send message"
              ]
            },
            {
              step: "Reply to Message",
              description: "Click 'Reply' on any message card, compose reply, and send."
            }
          ]}
          bestPractices={[
            "Use appropriate priority levels",
            "Select correct category for organization",
            "Be clear and concise in messages",
            "Use internal messages for team discussions",
            "Use external messages for client communications",
            "Review unread messages daily"
          ]}
          roleSpecific={{
            role: "Role-Based Access",
            notes: [
              "Admin: All families, all messages",
              "RM: Assigned families, all messages for those families",
              "Family: Own family, external messages only (internal hidden)",
              "Multi-RM Support: RMs see all messages for assigned families, enabling team collaboration"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
