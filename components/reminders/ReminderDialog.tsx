// components/reminders/ReminderDialog.tsx
// Dialog for creating and editing reminders

import { useState, useEffect } from "react";
import { Reminder, ReminderPriority, ReminderContextType, RecurrencePattern } from "@/types/reminders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  onSave: (data: ReminderFormData) => void;
  isEditMode?: boolean;
}

export interface ReminderFormData {
  title: string;
  description: string;
  context_type: ReminderContextType;
  family_name: string;
  assigned_to_name: string;
  due_date: string;
  reminder_time: string;
  priority: ReminderPriority;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  recurrence_end_date?: string;
  tags: string;
  notes: string;
}

export function ReminderDialog({
  open,
  onOpenChange,
  reminder,
  onSave,
  isEditMode = false,
}: ReminderDialogProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    title: "",
    description: "",
    context_type: "general",
    family_name: "",
    assigned_to_name: "",
    due_date: "",
    reminder_time: "09:00",
    priority: "medium",
    is_recurring: false,
    tags: "",
    notes: "",
  });

  useEffect(() => {
    if (reminder && isEditMode) {
      setFormData({
        title: reminder.title,
        description: reminder.description || "",
        context_type: reminder.context_type,
        family_name: reminder.family_name || "",
        assigned_to_name: reminder.assigned_to_name,
        due_date: reminder.due_date.split("T")[0],
        reminder_time: reminder.reminder_time || "09:00",
        priority: reminder.priority,
        is_recurring: reminder.is_recurring,
        recurrence_pattern: reminder.recurrence_pattern,
        recurrence_interval: reminder.recurrence_interval,
        recurrence_end_date: reminder.recurrence_end_date?.split("T")[0],
        tags: reminder.tags?.join(", ") || "",
        notes: reminder.notes || "",
      });
    } else {
      resetForm();
    }
  }, [reminder, isEditMode, open]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      context_type: "general",
      family_name: "",
      assigned_to_name: "",
      due_date: "",
      reminder_time: "09:00",
      priority: "medium",
      is_recurring: false,
      tags: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update reminder details"
              : "Create a new reminder with details and scheduling"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Follow up with Sharma family"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="context_type">Type *</Label>
              <Select
                value={formData.context_type}
                onValueChange={(value: ReminderContextType) =>
                  setFormData({ ...formData, context_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ReminderPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Family and Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family_name">Family Name</Label>
              <Input
                id="family_name"
                value={formData.family_name}
                onChange={(e) =>
                  setFormData({ ...formData, family_name: e.target.value })
                }
                placeholder="e.g., Sharma Family"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to_name">Assigned To *</Label>
              <Input
                id="assigned_to_name"
                value={formData.assigned_to_name}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_to_name: e.target.value })
                }
                placeholder="Person name"
                required
              />
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_time">Reminder Time</Label>
              <Input
                id="reminder_time"
                type="time"
                value={formData.reminder_time}
                onChange={(e) =>
                  setFormData({ ...formData, reminder_time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_recurring: !!checked })
                }
              />
              <Label htmlFor="is_recurring" className="font-medium">
                Make this a recurring reminder
              </Label>
            </div>

            {formData.is_recurring && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="recurrence_pattern">Pattern</Label>
                  <Select
                    value={formData.recurrence_pattern}
                    onValueChange={(value: RecurrencePattern) =>
                      setFormData({ ...formData, recurrence_pattern: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrence_interval">Every N periods</Label>
                  <Input
                    id="recurrence_interval"
                    type="number"
                    min="1"
                    value={formData.recurrence_interval || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence_interval: parseInt(e.target.value),
                      })
                    }
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="recurrence_end_date">End Date (optional)</Label>
                  <Input
                    id="recurrence_end_date"
                    type="date"
                    value={formData.recurrence_end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, recurrence_end_date: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="urgent, follow-up, important"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Update Reminder" : "Create Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
