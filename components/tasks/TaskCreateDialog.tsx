// TaskCreateDialog Component
// Create new task with form validation

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { format, addDays } from "date-fns";
import type { TaskCreateData, TaskPriority, TaskContextType } from "@/types/tasks";
import { TASK_PRIORITY_LABELS, TASK_CONTEXT_LABELS } from "@/types/tasks";

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (taskData: TaskCreateData) => void;
  defaultFamilyId?: string;
  defaultAssignedTo?: string;
}

export function TaskCreateDialog({
  open,
  onOpenChange,
  onCreate,
  defaultFamilyId,
  defaultAssignedTo,
}: TaskCreateDialogProps) {
  const [formData, setFormData] = useState<TaskCreateData>({
    title: "",
    description: "",
    context_type: "general",
    family_id: defaultFamilyId || "",
    assigned_to: defaultAssignedTo || "",
    priority: "medium",
    due_date: format(addDays(new Date(), 7), "yyyy-MM-dd"), // Default 7 days from now
    due_time: "",
    tags: [],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.family_id) {
      newErrors.family_id = "Family is required";
    }

    if (!formData.assigned_to) {
      newErrors.assigned_to = "Assignee is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: "",
      description: "",
      context_type: "general",
      family_id: defaultFamilyId || "",
      assigned_to: defaultAssignedTo || "",
      priority: "medium",
      due_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      due_time: "",
      tags: [],
      notes: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="create-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete KYC documentation"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="create-description">Description</Label>
            <Textarea
              id="create-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task in detail..."
              rows={3}
            />
          </div>

          {/* Priority and Context Type Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger id="create-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Context Type */}
            <div className="space-y-2">
              <Label htmlFor="create-context-type">Type</Label>
              <Select
                value={formData.context_type}
                onValueChange={(value: TaskContextType) =>
                  setFormData({ ...formData, context_type: value })
                }
              >
                <SelectTrigger id="create-context-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_CONTEXT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Family (placeholder - would be dropdown in production) */}
          <div className="space-y-2">
            <Label htmlFor="create-family">
              Family <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-family"
              value={formData.family_id}
              onChange={(e) => setFormData({ ...formData, family_id: e.target.value })}
              placeholder="Enter family ID (e.g., family-001)"
              className={errors.family_id ? "border-red-500" : ""}
            />
            {errors.family_id && (
              <p className="text-xs text-red-500">{errors.family_id}</p>
            )}
            <p className="text-xs text-gray-500">
              In production, this would be a searchable dropdown
            </p>
          </div>

          {/* Assigned To (placeholder - would be dropdown in production) */}
          <div className="space-y-2">
            <Label htmlFor="create-assigned-to">
              Assigned To <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-assigned-to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Enter user ID (e.g., user-rm-1)"
              className={errors.assigned_to ? "border-red-500" : ""}
            />
            {errors.assigned_to && (
              <p className="text-xs text-red-500">{errors.assigned_to}</p>
            )}
            <p className="text-xs text-gray-500">
              In production, this would be a user dropdown
            </p>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-due-date">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-due-date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={errors.due_date ? "border-red-500" : ""}
              />
              {errors.due_date && (
                <p className="text-xs text-red-500">{errors.due_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-due-time">Due Time (optional)</Label>
              <Input
                id="create-due-time"
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="create-tags">Tags (comma-separated)</Label>
            <Input
              id="create-tags"
              value={formData.tags?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="e.g., urgent, kyc, onboarding"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="create-notes">Notes</Label>
            <Textarea
              id="create-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
