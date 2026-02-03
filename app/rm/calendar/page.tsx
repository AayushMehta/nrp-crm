"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColoredBadge } from "@/components/ui/colored-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  Phone,
  Clock,
  Plus,
  Filter,
  AlertCircle,
} from "lucide-react";
import { CalendarEvent, EventType } from "@/types/calendar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { UserFlowSection } from "@/components/ui/user-flow-section";

const STORAGE_KEY = 'nrp_crm_calendar_events';

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<"all" | EventType>("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      // Initialize with sample events
      const today = new Date();
      const sampleEvents: CalendarEvent[] = [
        {
          id: "evt-1",
          date: today.toISOString().split('T')[0],
          time: "10:00 AM",
          type: "meeting",
          title: "Client Onboarding - Smith Family",
          familyName: "Smith Family",
          duration: "1h",
          priority: "high",
          description: "Initial onboarding meeting",
        },
        {
          id: "evt-2",
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "2:00 PM",
          type: "call",
          title: "Follow-up Call - Johnson Family",
          familyName: "Johnson Family",
          duration: "30m",
          priority: "medium",
        },
        {
          id: "evt-3",
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: "11:00 AM",
          type: "review",
          title: "Quarterly Review - Williams Family",
          familyName: "Williams Family",
          duration: "1.5h",
          priority: "high",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
      setEvents(sampleEvents);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => {
      if (eventFilter !== "all" && event.type !== eventFilter) {
        return false;
      }
      return event.date === dateStr;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events
      .filter((event) => {
        if (eventFilter !== "all" && event.type !== eventFilter) {
          return false;
        }
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "deadline":
        return <Clock className="h-4 w-4" />;
      case "review":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variantMap = {
      high: "danger",
      medium: "warning",
      low: "default",
    } as const;
    return (
      <ColoredBadge variant={variantMap[priority as keyof typeof variantMap]}>
        {priority}
      </ColoredBadge>
    );
  };

  const getTypeBadge = (type: EventType) => {
    const variantMap = {
      meeting: "info",
      call: "success",
      deadline: "danger",
      review: "purple",
    } as const;
    return (
      <ColoredBadge variant={variantMap[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </ColoredBadge>
    );
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage meetings, reviews, and deadlines
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as typeof eventFilter)}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Names */}
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="min-h-[100px] p-2" />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dayEvents = getEventsForDay(day);
                    const today = isToday(day);

                    return (
                      <div
                        key={day}
                        className={cn(
                          "min-h-[100px] p-2 border rounded-lg transition-colors cursor-pointer hover:border-blue-300",
                          today && "border-blue-500 bg-blue-50/50"
                        )}
                      >
                        <div
                          className={cn(
                            "text-sm font-medium mb-1",
                            today ? "text-blue-600 font-semibold" : "text-gray-700"
                          )}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs p-1 rounded truncate flex items-center gap-1",
                                event.priority === "high" && "bg-red-100 text-red-800",
                                event.priority === "medium" && "bg-yellow-100 text-yellow-800",
                                event.priority === "low" && "bg-gray-100 text-gray-800"
                              )}
                              title={`${event.time} - ${event.title}`}
                            >
                              {getEventIcon(event.type)}
                              <span className="truncate">{event.time}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUpcomingEvents().length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-gray-100 rounded-full">
                          <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    </div>
                  ) : (
                    getUpcomingEvents().map((event) => (
                      <div
                        key={event.id}
                        className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white border rounded-lg">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{event.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })} • {event.time}
                              {event.duration && ` • ${event.duration}`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {getPriorityBadge(event.priority)}
                              {getTypeBadge(event.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="rounded-xl border shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm">Meetings</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {events.filter(e => e.type === 'meeting').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">Calls</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {events.filter(e => e.type === 'call').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm">Reviews</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {events.filter(e => e.type === 'review').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-100 rounded">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-sm">Deadlines</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {events.filter(e => e.type === 'deadline').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Flow Section */}
        <UserFlowSection
          pageName="RM Calendar"
          description="Schedule and manage meetings, calls, deadlines, and reviews"
          userFlow={[
            {
              step: "View Calendar Metrics",
              description: "Track Total Events, This Week, High Priority events, and Upcoming Deadlines."
            },
            {
              step: "View Calendar Grid",
              description: "Browse monthly view with all events, event dots color-coded by priority, navigate months, and click dates to see events."
            },
            {
              step: "Create New Event",
              description: "Schedule meetings, calls, deadlines, or reviews.",
              subSteps: [
                "Click 'New Event' or click on date",
                "Enter event title and description",
                "Select event type (Meeting, Call, Deadline, Review)",
                "Set priority (High, Medium, Low)",
                "Set start and end date/time",
                "Select associated family (if applicable)",
                "Save event"
              ]
            },
            {
              step: "View Upcoming Events",
              description: "Right sidebar shows next 5 events sorted by date with details."
            },
            {
              step: "Edit/Delete Events",
              description: "Click event on calendar to edit or delete with confirmation."
            }
          ]}
          bestPractices={[
            "Schedule meetings at least 1 week in advance",
            "Set high priority for compliance deadlines",
            "Associate events with families for tracking",
            "Review 'Upcoming Events' sidebar daily",
            "Use event types consistently",
            "Add descriptions for context"
          ]}
          roleSpecific={{
            role: "RM",
            notes: [
              "Events appear in family timeline when associated",
              "Color-coding helps prioritize daily schedule",
              "Calendar integrates with dashboard view",
              "Use deadline type for important client milestones"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
