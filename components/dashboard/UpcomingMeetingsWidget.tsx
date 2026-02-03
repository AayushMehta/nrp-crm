// components/dashboard/UpcomingMeetingsWidget.tsx
// Widget showing upcoming meetings on dashboard

import { Meeting } from "@/types/meetings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Calendar, ArrowRight } from "lucide-react";

interface UpcomingMeetingsWidgetProps {
  meetings: Meeting[];
  onViewAll: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onJoinClick?: (meeting: Meeting) => void;
}

export function UpcomingMeetingsWidget({
  meetings,
  onViewAll,
  onMeetingClick,
  onJoinClick,
}: UpcomingMeetingsWidgetProps) {
  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>Your next scheduled meetings</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        {meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                variant="compact"
                onViewDetails={onMeetingClick}
                onJoinClick={onJoinClick}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming meetings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
