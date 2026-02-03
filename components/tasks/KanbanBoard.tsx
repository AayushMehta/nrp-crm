// KanbanBoard Component
// Drag-and-drop Kanban board with 4 columns

"use client";

import { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { DroppableColumn } from "./DroppableColumn";
import { EmptyState } from "@/components/ui/empty-state";
import { Circle, Loader2, Eye, CheckCircle2, Inbox, FileQuestion, Clock, AlertCircle } from "lucide-react";
import type { Task, TaskStatus } from "@/types/tasks";
import { useState } from "react";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const COLUMNS: { status: TaskStatus; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "todo", title: "To Do", icon: Circle },
  { status: "in_progress", title: "In Progress", icon: Loader2 },
  { status: "in_review", title: "In Review", icon: Eye },
  { status: "pending_document_from_client", title: "Pending Document", icon: FileQuestion },
  { status: "waiting_on_client", title: "Waiting on Client", icon: Clock },
  { status: "blocked", title: "Blocked", icon: AlertCircle },
  { status: "done", title: "Done", icon: CheckCircle2 },
];

export function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      pending_document_from_client: [],
      waiting_on_client: [],
      blocked: [],
      done: [],
    };

    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [tasks]);

  // Get active task for drag overlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((task) => task.id === activeId);
  }, [activeId, tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) {
      return;
    }

    // Extract droppable data
    const overId = over.id as string;
    const overData = over.data.current;

    let newStatus: TaskStatus | undefined;

    // Check if dropped on column or task
    if (overData?.type === 'column') {
      // Dropped directly on column
      newStatus = overData.status as TaskStatus;
    } else if (overData?.type === 'task') {
      // Dropped on a task, inherit its status
      const overTask = tasks.find((t) => t.id === overId);
      newStatus = overTask?.status;
    }

    if (newStatus && activeTask.status !== newStatus) {
      onTaskMove(activeTask.id, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
        {COLUMNS.map((column) => {
          const columnTasks = tasksByStatus[column.status];
          const Icon = column.icon;

          return (
            <DroppableColumn
              key={column.status}
              id={column.status}
              className="flex flex-col bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 min-h-[70vh] w-[320px] flex-shrink-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      column.status === "todo" && "text-gray-500",
                      column.status === "in_progress" && "text-blue-500 animate-spin",
                      column.status === "in_review" && "text-yellow-500",
                      column.status === "pending_document_from_client" && "text-orange-500",
                      column.status === "waiting_on_client" && "text-amber-500",
                      column.status === "blocked" && "text-red-500",
                      column.status === "done" && "text-green-500"
                    )}
                  />
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md flex-shrink-0">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Content - Droppable Area */}
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-center">
                      <div>
                        <Inbox className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">Drop tasks here</p>
                      </div>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={onTaskClick}
                        isDragging={task.id === activeId}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
        </div>
      </div>

      {/* Drag Overlay - Shows the dragged card */}
      <DragOverlay>
        {activeTask ? (
          <div className="cursor-grabbing">
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
