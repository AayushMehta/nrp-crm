// TaskCard Component
// Draggable task card for Kanban board with priority, assignee, and due date

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Calendar, User, Clock, AlertCircle, FileQuestion } from "lucide-react";
import { format, isToday, isPast, parseISO } from "date-fns";
import type { Task } from "@/types/tasks";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if task is overdue
  const dueDate = parseISO(task.due_date);
  const isOverdue = task.status !== "done" && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = task.status !== "done" && isToday(dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02]",
        isOverdue && "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10 shadow-red-100 dark:shadow-red-900/20",
        isDueToday && "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10 shadow-blue-100 dark:shadow-blue-900/20",
        (isSortableDragging || isDragging) && "opacity-50 cursor-grabbing shadow-2xl scale-105 rotate-2"
      )}
    >
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
          <AlertCircle className="h-3 w-3" />
        </div>
      )}

      {/* Task title */}
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 pr-6">
        {task.title}
      </h4>

      {/* Priority badge */}
      <div className="mb-2">
        <PriorityBadge priority={task.priority} size="sm" />
      </div>

      {/* Task metadata */}
      <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        {/* Family name */}
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{task.family_name}</span>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{task.assigned_to_name}</span>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className={cn(
            "truncate",
            isOverdue && "text-red-600 dark:text-red-400 font-medium",
            isDueToday && "text-blue-600 dark:text-blue-400 font-medium"
          )}>
            {format(dueDate, "MMM d, yyyy")}
            {task.due_time && (
              <>
                {" "}
                <Clock className="inline h-3 w-3" />
                {" "}
                {task.due_time}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Conditional status fields */}
      {task.status === 'blocked' && task.blockedReason && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Blocked:</span>
              <span className="ml-1">{task.blockedReason}</span>
            </div>
          </div>
        </div>
      )}

      {task.status === 'waiting_on_client' && task.waitingOnWhat && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-1.5">
            <Clock className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Waiting:</span>
              <span className="ml-1">{task.waitingOnWhat}</span>
            </div>
          </div>
        </div>
      )}

      {task.status === 'pending_document_from_client' && task.documentRequested && (
        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-1.5">
            <FileQuestion className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Needs:</span>
              <span className="ml-1">{task.documentRequested}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none" />
    </div>
  );
}
