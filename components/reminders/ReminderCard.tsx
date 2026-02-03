// components/reminders/ReminderCard.tsx
// Single reminder card component

import { Reminder } from "@/types/reminders";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColoredBadge } from "@/components/ui/colored-badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag,
  Eye,
  Edit,
  Trash2,
  Bell,
  BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReminderCardProps {
  reminder: Reminder;
  onComplete?: (reminder: Reminder) => void;
  onSnooze?: (reminder: Reminder) => void;
  onView?: (reminder: Reminder) => void;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  showActions?: boolean;
}

export function ReminderCard({
  reminder,
  onComplete,
  onSnooze,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: ReminderCardProps) {
  const isOverdue =
    reminder.status !== "completed" &&
    reminder.status !== "cancelled" &&
    new Date(reminder.due_date) < new Date();

  const getPriorityVariant = (priority: Reminder["priority"]) => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "default";
    }
  };

  const getStatusVariant = (status: Reminder["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "cancelled":
        return "default";
      case "snoozed":
        return "info";
      case "in_progress":
        return "warning";
      case "pending":
        return "default";
    }
  };

  const getContextIcon = (contextType: Reminder["context_type"]) => {
    switch (contextType) {
      case "family":
        return User;
      case "document":
        return Calendar;
      case "task":
        return CheckCircle;
      case "meeting":
        return Calendar;
      default:
        return Tag;
    }
  };

  const ContextIcon = getContextIcon(reminder.context_type);

  return (
    <Card
      className={`rounded-xl border shadow-sm hover:shadow-md transition-all ${
        isOverdue ? "border-l-4 border-l-red-500" : ""
      } ${reminder.status === "completed" ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Main content */}
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {reminder.title}
                </h3>
                {reminder.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {reminder.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {/* Due date */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                  {isOverdue
                    ? `Overdue by ${formatDistanceToNow(new Date(reminder.due_date))}`
                    : `Due ${formatDistanceToNow(new Date(reminder.due_date), {
                        addSuffix: true,
                      })}`}
                </span>
              </div>

              {/* Family */}
              {reminder.family_name && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{reminder.family_name}</span>
                  </div>
                </>
              )}

              {/* Context type */}
              <span>•</span>
              <div className="flex items-center gap-1">
                <ContextIcon className="h-3 w-3" />
                <span className="capitalize">
                  {reminder.context_type.replace(/_/g, " ")}
                </span>
              </div>

              {/* Auto-generated indicator */}
              {reminder.auto_generated && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs py-0">
                    Auto
                  </Badge>
                </>
              )}
            </div>

            {/* Tags */}
            {reminder.tags && reminder.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {reminder.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Status & Priority badges */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <ColoredBadge variant={getPriorityVariant(reminder.priority)}>
              {reminder.priority}
            </ColoredBadge>
            <Badge variant={getStatusVariant(reminder.status)}>
              {reminder.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        {showActions &&
          reminder.status !== "completed" &&
          reminder.status !== "cancelled" && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t">
              {onComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(reminder)}
                  className="flex-1"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              {onSnooze && reminder.status !== "snoozed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSnooze(reminder)}
                >
                  <BellOff className="h-3 w-3" />
                </Button>
              )}
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(reminder)}>
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(reminder)}>
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(reminder)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

        {/* Completed state */}
        {reminder.status === "completed" && reminder.completed_at && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>
                Completed {formatDistanceToNow(new Date(reminder.completed_at), {
                  addSuffix: true,
                })}
              </span>
              {reminder.completed_by && <span>by {reminder.completed_by}</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
