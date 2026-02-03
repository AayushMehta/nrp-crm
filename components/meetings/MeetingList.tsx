// components/meetings/MeetingList.tsx
// List of meetings with search and filter

"use client";

import { useState, useMemo } from "react";
import { Meeting, MeetingStatus, MeetingType } from "@/types/meetings";
import { MeetingCard } from "./MeetingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search } from "lucide-react";

interface MeetingListProps {
  meetings: Meeting[];
  title?: string;
  description?: string;
  emptyMessage?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  onMeetingClick?: (meeting: Meeting) => void;
  onJoinClick?: (meeting: Meeting) => void;
}

export function MeetingList({
  meetings,
  title,
  description,
  emptyMessage = "No meetings found",
  showSearch = false,
  showFilters = false,
  onMeetingClick,
  onJoinClick,
}: MeetingListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter and search meetings
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query) ||
          m.family_name.toLowerCase().includes(query) ||
          m.assigned_rm_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    return filtered;
  }, [meetings, searchQuery, statusFilter, typeFilter]);

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meeting_url) {
      window.open(meeting.meeting_url, "_blank");
    }
    onJoinClick?.(meeting);
  };

  return (
    <Card className="rounded-xl border shadow-sm">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={title || description ? "" : "p-6"}>
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="mb-6 space-y-3">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meetings by title, family, or RM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="initial_consultation">Initial Consultation</SelectItem>
                    <SelectItem value="portfolio_review">Portfolio Review</SelectItem>
                    <SelectItem value="quarterly_review">Quarterly Review</SelectItem>
                    <SelectItem value="annual_review">Annual Review</SelectItem>
                    <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Result count */}
            <p className="text-sm text-muted-foreground">
              {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? "s" : ""}{" "}
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "found"
                : "total"}
            </p>
          </div>
        )}

        {/* Meetings List */}
        {filteredMeetings.length > 0 ? (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onViewDetails={onMeetingClick}
                onJoinClick={handleJoinMeeting}
                showActions={true}
                variant="full"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {emptyMessage}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Meetings will appear here when scheduled"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
