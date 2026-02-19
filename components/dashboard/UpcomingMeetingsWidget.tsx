// components/dashboard/UpcomingMeetingsWidget.tsx
// Widget showing upcoming meetings on dashboard

import { Meeting } from "@/types/meetings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingMeetingsWidgetProps {
  meetings: Meeting[];
  onViewAll: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onJoinClick?: (meeting: Meeting) => void;
  className?: string;
}

export function UpcomingMeetingsWidget({
  meetings,
  onViewAll,
  onMeetingClick,
  onJoinClick,
  className
}: UpcomingMeetingsWidgetProps) {
  return (
    <Card className={cn("card-elevated h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription>Your schedule details</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="h-8 rounded-full px-3 text-xs">
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
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
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 bg-muted/40 rounded-full flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No upcoming meetings</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later or schedule one</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
