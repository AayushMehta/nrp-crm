// components/reminders/ReminderList.tsx
// List of reminders with tabs (overdue, today, upcoming)

import { useState, useEffect } from "react";
import { Reminder, ReminderFilter, ReminderStatus } from "@/types/reminders";
import { ReminderCard } from "./ReminderCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Bell } from "lucide-react";
import { ReminderService } from "@/lib/services/reminder-service";

interface ReminderListProps {
  userId?: string;
  familyId?: string;
  onComplete?: (reminder: Reminder) => void;
  onSnooze?: (reminder: Reminder) => void;
  onView?: (reminder: Reminder) => void;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
  showFilters?: boolean;
}

export function ReminderList({
  userId,
  familyId,
  onComplete,
  onSnooze,
  onView,
  onEdit,
  onDelete,
  showFilters = true,
}: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<"overdue" | "today" | "upcoming" | "completed">("overdue");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [contextFilter, setContextFilter] = useState<string>("all");

  useEffect(() => {
    loadReminders();
  }, [userId, familyId]);

  useEffect(() => {
    applyFilters();
  }, [reminders, activeTab, searchQuery, priorityFilter, contextFilter]);

  const loadReminders = () => {
    let allReminders: Reminder[] = [];

    if (familyId) {
      allReminders = ReminderService.getByFamily(familyId);
    } else if (userId) {
      allReminders = ReminderService.getByUser(userId);
    } else {
      allReminders = ReminderService.getAll();
    }

    setReminders(allReminders);
  };

  const applyFilters = () => {
    let filtered = [...reminders];

    // Tab filter
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    switch (activeTab) {
      case "overdue":
        filtered = filtered.filter(
          (r) =>
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            new Date(r.due_date) < now
        );
        break;
      case "today":
        filtered = filtered.filter((r) => {
          const dueDate = new Date(r.due_date);
          return (
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            dueDate >= startOfDay &&
            dueDate < endOfDay
          );
        });
        break;
      case "upcoming":
        filtered = filtered.filter(
          (r) =>
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            new Date(r.due_date) >= endOfDay
        );
        break;
      case "completed":
        filtered = filtered.filter((r) => r.status === "completed");
        break;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.family_name?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    // Context filter
    if (contextFilter !== "all") {
      filtered = filtered.filter((r) => r.context_type === contextFilter);
    }

    // Sort: overdue first, then by due date
    filtered.sort((a, b) => {
      const aOverdue = new Date(a.due_date) < now;
      const bOverdue = new Date(b.due_date) < now;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    setFilteredReminders(filtered);
  };

  const getCounts = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return {
      overdue: reminders.filter(
        (r) =>
          r.status !== "completed" &&
          r.status !== "cancelled" &&
          new Date(r.due_date) < now
      ).length,
      today: reminders.filter((r) => {
        const dueDate = new Date(r.due_date);
        return (
          r.status !== "completed" &&
          r.status !== "cancelled" &&
          dueDate >= startOfDay &&
          dueDate < endOfDay
        );
      }).length,
      upcoming: reminders.filter(
        (r) =>
          r.status !== "completed" &&
          r.status !== "cancelled" &&
          new Date(r.due_date) >= endOfDay
      ).length,
      completed: reminders.filter((r) => r.status === "completed").length,
    };
  };

  const counts = getCounts();

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Context Filter */}
          <Select value={contextFilter} onValueChange={setContextFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {counts.overdue > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                {counts.overdue}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today" className="relative">
            Today
            {counts.today > 0 && (
              <Badge variant="default" className="ml-2 px-1.5 py-0 text-xs">
                {counts.today}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {counts.upcoming > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                {counts.upcoming}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {counts.completed > 0 && (
              <Badge variant="outline" className="ml-2 px-1.5 py-0 text-xs">
                {counts.completed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">
                {activeTab === "completed"
                  ? "No completed reminders"
                  : `No ${activeTab} reminders`}
              </p>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={onComplete}
                onSnooze={onSnooze}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
