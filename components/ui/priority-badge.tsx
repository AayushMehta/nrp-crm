// Priority Badge Component
// CVA-based badge for consistent priority visual encoding

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ArrowUp } from "lucide-react";
import type { TaskPriority } from "@/types/tasks";

const priorityBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      priority: {
        low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      priority: "medium",
      size: "default",
    },
  }
);

interface PriorityBadgeProps extends VariantProps<typeof priorityBadgeVariants> {
  priority: TaskPriority;
  showIcon?: boolean;
  className?: string;
}

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityIcons: Record<TaskPriority, React.ComponentType<{ className?: string }>> = {
  low: Info,
  medium: ArrowUp,
  high: AlertTriangle,
  urgent: AlertCircle,
};

export function PriorityBadge({
  priority,
  size,
  showIcon = false,
  className,
}: PriorityBadgeProps) {
  const Icon = priorityIcons[priority];

  return (
    <span
      className={cn(priorityBadgeVariants({ priority, size }), className)}
      aria-label={`Priority: ${priorityLabels[priority]}`}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      <span>{priorityLabels[priority]}</span>
    </span>
  );
}

// Export for use in other components
export { priorityBadgeVariants };
