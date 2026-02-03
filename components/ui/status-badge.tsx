// Status Badge Component
// CVA-based badge for task status with animated pulse for in_progress

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Circle, Loader2, Eye, CheckCircle2, FileQuestion, Clock, AlertCircle } from "lucide-react";
import type { TaskStatus } from "@/types/tasks";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        pending_document_from_client: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        waiting_on_client: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      status: "todo",
      size: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: TaskStatus;
  showIcon?: boolean;
  className?: string;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  pending_document_from_client: "Pending Document",
  waiting_on_client: "Waiting on Client",
  blocked: "Blocked",
  done: "Done",
};

const statusIcons: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: Loader2,
  in_review: Eye,
  pending_document_from_client: FileQuestion,
  waiting_on_client: Clock,
  blocked: AlertCircle,
  done: CheckCircle2,
};

export function StatusBadge({
  status,
  size,
  showIcon = false,
  className,
}: StatusBadgeProps) {
  const Icon = statusIcons[status];

  // Add animation for in_progress status
  const isInProgress = status === "in_progress";

  return (
    <span
      className={cn(
        statusBadgeVariants({ status, size }),
        isInProgress && "animate-pulse",
        className
      )}
      aria-label={`Status: ${statusLabels[status]}`}
    >
      {showIcon && (
        <Icon
          className={cn(
            "h-3 w-3",
            isInProgress && "animate-spin"
          )}
          aria-hidden="true"
        />
      )}
      <span>{statusLabels[status]}</span>
    </span>
  );
}

// Export for use in other components
export { statusBadgeVariants };
