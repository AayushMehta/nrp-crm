// DroppableColumn - Droppable container for Kanban columns

"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/tasks";

interface DroppableColumnProps {
  id: TaskStatus;
  children: React.ReactNode;
  className?: string;
}

export function DroppableColumn({ id, children, className }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isOver && "bg-blue-50/50 dark:bg-blue-900/10",
        className
      )}
    >
      {children}
    </div>
  );
}
