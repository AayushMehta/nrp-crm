// components/meetings/MeetingDetailDialog.tsx
// Dialog to show full meeting details

"use client";

import { Meeting } from "@/types/meetings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Users,
  ListTodo,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MeetingDetailDialogProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (meeting: Meeting) => void;
  userRole: "admin" | "rm" | "family";
}

export function MeetingDetailDialog({
  meeting,
  isOpen,
  onClose,
  onJoin,
  userRole,
}: MeetingDetailDialogProps) {
  if (!meeting) return null;

  const isVirtual = meeting.location === "Virtual" && meeting.meeting_url;
  const isUpcoming =
    meeting.status === "scheduled" &&
    new Date(meeting.scheduled_date) >= new Date();
  const canJoin = isVirtual && isUpcoming;

  // Format date and time
  const meetingDate = new Date(meeting.scheduled_date);
  const formattedDate = format(meetingDate, "EEEE, MMMM dd, yyyy");
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

  const handleJoinMeeting = () => {
    if (meeting.meeting_url) {
      window.open(meeting.meeting_url, "_blank");
    }
    onJoin?.(meeting);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{meeting.title}</DialogTitle>
              {meeting.description && (
                <DialogDescription className="mt-2">
                  {meeting.description}
                </DialogDescription>
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
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Meeting Details Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Meeting Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedTime} ({meeting.duration_minutes} minutes)
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 col-span-2">
                  {isVirtual ? (
                    <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.location}
                    </p>
                    {isVirtual && canJoin && (
                      <Button
                        size="sm"
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={handleJoinMeeting}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </div>

                {/* RM */}
                <div className="flex items-start gap-3 col-span-2">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Relationship Manager</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.assigned_rm_name}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold">Attendees</h3>
                </div>
                <div className="space-y-2">
                  {meeting.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">
                            {attendee.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {attendee.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {attendee.user_role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          attendee.attendance_status === "confirmed" &&
                            "bg-green-100 text-green-800",
                          attendee.attendance_status === "tentative" &&
                            "bg-yellow-100 text-yellow-800",
                          attendee.attendance_status === "declined" &&
                            "bg-red-100 text-red-800",
                          attendee.attendance_status === "no_response" &&
                            "bg-gray-100 text-gray-800"
                        )}
                      >
                        {attendee.attendance_status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda */}
          {meeting.agenda_items && meeting.agenda_items.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold">Agenda</h3>
                </div>
                <ul className="space-y-2">
                  {meeting.agenda_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-sm font-medium text-gray-400 mt-0.5">
                        {index + 1}.
                      </span>
                      <span className="text-sm flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Meeting Notes (if completed) */}
          {meeting.status === "completed" && meeting.meeting_notes && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold">Meeting Notes</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {meeting.meeting_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {meeting.action_items && meeting.action_items.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold">Action Items</h3>
                </div>
                <div className="space-y-2">
                  {meeting.action_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-3 rounded border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>Assigned to: {item.assigned_to_name}</span>
                          {item.due_date && (
                            <>
                              <span>•</span>
                              <span>
                                Due: {format(new Date(item.due_date), "MMM dd, yyyy")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          item.status === "completed" && "bg-green-100 text-green-800",
                          item.status === "in_progress" && "bg-blue-100 text-blue-800",
                          item.status === "pending" && "bg-gray-100 text-gray-800"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Reason */}
          {meeting.status === "cancelled" && meeting.cancelled_reason && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-red-900 mb-2">
                  Cancellation Reason
                </h3>
                <p className="text-sm text-red-700">{meeting.cancelled_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canJoin && onJoin && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleJoinMeeting}>
              <Video className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
