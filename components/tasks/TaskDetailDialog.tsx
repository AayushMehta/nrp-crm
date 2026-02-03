// TaskDetailDialog Component
// View/edit task details with mode toggle

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Edit2, Save, X, Trash2, CheckCircle2, Calendar, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority, TaskContextType, TaskUpdateData } from "@/types/tasks";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_CONTEXT_LABELS } from "@/types/tasks";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: TaskUpdateData) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onComplete,
}: TaskDetailDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<TaskUpdateData>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    context_type: task.context_type,
    due_date: task.due_date,
    due_time: task.due_time,
    notes: task.notes,
    blockedReason: task.blockedReason,
    waitingOnWhat: task.waitingOnWhat,
    documentRequested: task.documentRequested,
  });

  const handleSave = () => {
    onUpdate(task.id, formData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      context_type: task.context_type,
      due_date: task.due_date,
      due_time: task.due_time,
      blockedReason: task.blockedReason,
      waitingOnWhat: task.waitingOnWhat,
      documentRequested: task.documentRequested,
      notes: task.notes,
    });
    setIsEditMode(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      onDelete(task.id);
      onOpenChange(false);
    }
  };

  const handleComplete = () => {
    onComplete(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Task" : "Task Details"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditMode && task.status !== "done" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(true)}
                  title="Edit task"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            {isEditMode ? (
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Task title"
              />
            ) : (
              <p className="text-lg font-semibold">{task.title}</p>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isEditMode ? (
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <StatusBadge status={task.status} showIcon />
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              {isEditMode ? (
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
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
              ) : (
                <div>
                  <PriorityBadge priority={task.priority} showIcon />
                </div>
              )}
            </div>
          </div>

          {/* Context Type */}
          <div className="space-y-2">
            <Label htmlFor="context_type">Type</Label>
            {isEditMode ? (
              <Select
                value={formData.context_type}
                onValueChange={(value: TaskContextType) =>
                  setFormData({ ...formData, context_type: value })
                }
              >
                <SelectTrigger id="context_type">
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
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {TASK_CONTEXT_LABELS[task.context_type]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditMode ? (
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              {isEditMode ? (
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{format(parseISO(task.due_date), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_time">Due Time (optional)</Label>
              {isEditMode ? (
                <Input
                  id="due_time"
                  type="time"
                  value={formData.due_time || ""}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {task.due_time || "No time set"}
                </p>
              )}
            </div>
          </div>

          {/* Family and Assignee (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Family</Label>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{task.family_name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{task.assigned_to_name}</span>
              </div>
            </div>
          </div>

          {/* Conditional Status Fields */}
          {formData.status === 'blocked' && (
            <div className="space-y-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <Label htmlFor="blockedReason">Blocked Reason *</Label>
              {isEditMode ? (
                <Textarea
                  id="blockedReason"
                  value={formData.blockedReason || ""}
                  onChange={(e) => setFormData({ ...formData, blockedReason: e.target.value })}
                  placeholder="Describe what's blocking this task..."
                  rows={2}
                  className="bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {task.blockedReason || "No reason provided"}
                </p>
              )}
            </div>
          )}

          {formData.status === 'waiting_on_client' && (
            <div className="space-y-2 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <Label htmlFor="waitingOnWhat">Waiting On *</Label>
              {isEditMode ? (
                <Input
                  id="waitingOnWhat"
                  value={formData.waitingOnWhat || ""}
                  onChange={(e) => setFormData({ ...formData, waitingOnWhat: e.target.value })}
                  placeholder="e.g., Client approval, Client response..."
                  className="bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {task.waitingOnWhat || "Not specified"}
                </p>
              )}
            </div>
          )}

          {formData.status === 'pending_document_from_client' && (
            <div className="space-y-2 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <Label htmlFor="documentRequested">Document Requested *</Label>
              {isEditMode ? (
                <Input
                  id="documentRequested"
                  value={formData.documentRequested || ""}
                  onChange={(e) => setFormData({ ...formData, documentRequested: e.target.value })}
                  placeholder="e.g., PAN Card, Bank Statement, Aadhar..."
                  className="bg-white dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {task.documentRequested || "Not specified"}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            {isEditMode ? (
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.notes || "No notes"}
              </p>
            )}
          </div>

          {/* Completion Info */}
          {task.completed_at && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Completed</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                By {task.completed_by_name} on {format(parseISO(task.completed_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {task.completion_notes && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  {task.completion_notes}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-4 border-t">
            <p>Created by {task.created_by_name} on {format(parseISO(task.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
            <p>Last updated: {format(parseISO(task.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {!isEditMode && task.status !== "done" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleComplete}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
