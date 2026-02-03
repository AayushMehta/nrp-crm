// components/meetings/MeetingCard.tsx
// Meeting card component for displaying meeting information

import { Meeting } from "@/types/meetings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MeetingCardProps {
  meeting: Meeting;
  onJoinClick?: (meeting: Meeting) => void;
  onViewDetails?: (meeting: Meeting) => void;
  showActions?: boolean;
  variant?: "full" | "compact";
}

export function MeetingCard({
  meeting,
  onJoinClick,
  onViewDetails,
  showActions = true,
  variant = "full",
}: MeetingCardProps) {
  const isVirtual = meeting.location === "Virtual" && meeting.meeting_url;
  const isUpcoming =
    meeting.status === "scheduled" &&
    new Date(meeting.scheduled_date) >= new Date();
  const canJoin = isVirtual && isUpcoming && onJoinClick;

  // Format date and time
  const meetingDate = new Date(meeting.scheduled_date);
  const formattedDate = format(meetingDate, "MMM dd, yyyy");
  const formattedTime = format(meetingDate, "hh:mm a");

  // Status badge colors
  const statusConfig = {
    scheduled: {
      icon: Circle,
      label: "Scheduled",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    completed: {
      icon: CheckCircle2,
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    rescheduled: {
      icon: RotateCcw,
      label: "Rescheduled",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  };

  const statusInfo = statusConfig[meeting.status];
  const StatusIcon = statusInfo.icon;

  if (variant === "compact") {
    return (
      <div
        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => onViewDetails?.(meeting)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{meeting.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{formattedTime}</span>
            </div>
            {isVirtual && (
              <div className="flex items-center gap-1 mt-1">
                <Video className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600">Virtual Meeting</span>
              </div>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0", statusInfo.className)}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{meeting.title}</h3>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {meeting.description}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0", statusInfo.className)}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>

            {/* Meeting Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formattedDate}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  {formattedTime} ({meeting.duration_minutes} min)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm">
                {isVirtual ? (
                  <>
                    <Video className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Virtual Meeting</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{meeting.location}</span>
                  </>
                )}
              </div>

              {/* RM */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="truncate">{meeting.assigned_rm_name}</span>
              </div>
            </div>

            {/* Agenda Preview (first 2 items) */}
            {meeting.agenda_items && meeting.agenda_items.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Agenda:
                </p>
                <ul className="space-y-1">
                  {meeting.agenda_items.slice(0, 2).map((item, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                  {meeting.agenda_items.length > 2 && (
                    <li className="text-xs text-muted-foreground italic">
                      +{meeting.agenda_items.length - 2} more items
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-3">
                {canJoin && (
                  <Button
                    size="sm"
                    onClick={() => onJoinClick(meeting)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                )}
                {onViewDetails && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(meeting)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
