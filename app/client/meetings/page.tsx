"use client";

// app/client/meetings/page.tsx
// Client meetings page - view upcoming and past meetings

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MeetingList } from "@/components/meetings/MeetingList";
import { MeetingDetailDialog } from "@/components/meetings/MeetingDetailDialog";
import { MeetingService } from "@/lib/services/meeting-service";
import { Meeting } from "@/types/meetings";
import {
  Calendar,
  Clock,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function ClientMeetingsPage() {
  const { user, family } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Load meetings on mount
  useEffect(() => {
    if (user && family) {
      const allMeetings = MeetingService.getMeetings(
        user.id,
        "family",
        family.id
      );
      setMeetings(allMeetings);
    }
  }, [user, family]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!user || !family) {
      return {
        total: 0,
        upcoming_count: 0,
        this_month: 0,
        this_quarter: 0,
        by_status: {
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          rescheduled: 0,
        },
        by_type: {},
      };
    }

    return MeetingService.getStats(user.id, "family", family.id);
  }, [meetings, user, family]);

  // Separate upcoming and past meetings
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter(
        (m) =>
          m.status === "scheduled" && new Date(m.scheduled_date) >= now
      )
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime()
      );
  }, [meetings]);

  const pastMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter(
        (m) =>
          m.status === "completed" ||
          (m.status === "scheduled" && new Date(m.scheduled_date) < now) ||
          m.status === "cancelled" ||
          m.status === "rescheduled"
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_date).getTime() -
          new Date(a.scheduled_date).getTime()
      );
  }, [meetings]);

  // Handle meeting click
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDetailDialogOpen(true);
  };

  // Handle join meeting
  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meeting_url) {
      toast({
        title: "Joining Meeting",
        description: `Opening ${meeting.title} in a new tab`,
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and track meetings with your advisor
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total Meetings"
            value={stats.total}
            description="All meetings"
            icon={Calendar}
            iconClassName="text-blue-600"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcoming_count}
            description="Next 30 days"
            icon={Clock}
            iconClassName="text-purple-600"
          />
          <StatCard
            title="This Month"
            value={stats.this_month}
            description="Meetings this month"
            icon={CalendarDays}
            iconClassName="text-orange-600"
          />
          <StatCard
            title="Completed"
            value={stats.by_status.completed}
            description="Past meetings"
            icon={CheckCircle2}
            iconClassName="text-green-600"
          />
        </div>

        {/* Tabs: Upcoming / Past */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Meetings ({pastMeetings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <MeetingList
              meetings={upcomingMeetings}
              title="Upcoming Meetings"
              description="Your scheduled meetings with your relationship manager"
              emptyMessage="No upcoming meetings"
              showSearch={true}
              showFilters={true}
              onMeetingClick={handleMeetingClick}
              onJoinClick={handleJoinMeeting}
            />
          </TabsContent>

          <TabsContent value="past">
            <MeetingList
              meetings={pastMeetings}
              title="Past Meetings"
              description="Your meeting history"
              emptyMessage="No past meetings"
              showSearch={true}
              showFilters={true}
              onMeetingClick={handleMeetingClick}
            />
          </TabsContent>
        </Tabs>

        {/* Meeting Detail Dialog */}
        <MeetingDetailDialog
          meeting={selectedMeeting}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          onJoin={handleJoinMeeting}
          userRole="family"
        />

        {/* User Flow Section */}
        <UserFlowSection
          pageName="Client Meetings"
          description="View client-visible meeting notes and action items"
          userFlow={[
            {
              step: "View Meeting List",
              description: "See all meetings for your family, filtered by privacy level (only client-visible shown)."
            },
            {
              step: "Review Meeting Details",
              description: "Click meeting card to view details.",
              subSteps: [
                "View meeting date and participants",
                "Read discussion points",
                "Review decisions made",
                "See client summary (if privacy = Summary Only)",
                "View full notes (if privacy = Client Visible)"
              ]
            },
            {
              step: "Track Action Items",
              description: "See action items assigned to you, track completion status, and note due dates."
            }
          ]}
          bestPractices={[
            "Review meeting notes after each meeting",
            "Follow up on assigned action items",
            "Contact RM with questions",
            "Track decisions for reference"
          ]}
          roleSpecific={{
            role: "Client",
            notes: [
              "Internal Only meetings: Not shown",
              "Summary Only meetings: Shows summary field only",
              "Client Visible meetings: Shows full notes",
              "Internal notes: Always hidden",
              "Action items: Only yours shown"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
