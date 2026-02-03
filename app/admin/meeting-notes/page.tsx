"use client";

// app/admin/meeting-notes/page.tsx
// Meeting Notes - Create and manage client meeting records with privacy controls

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColoredBadge } from "@/components/ui/colored-badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Users,
  Clock,
  ListChecks,
} from "lucide-react";
import { MeetingNoteService } from "@/lib/services/meeting-note-service";
import { MeetingNote, MeetingType, ActionItem } from "@/types/meeting-notes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UserFlowSection } from "@/components/ui/user-flow-section";

export default function MeetingNotesPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | MeetingType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingNote | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "adhoc" as MeetingType,
    meeting_date: "",
    family_id: "",
    family_name: "",
    location: "",
    discussion_points: [""],
    decisions_made: [""],
    action_items: [{
      description: "",
      assigned_to_name: "",
      due_date: "",
      priority: "medium" as const,
      status: "pending" as const,
    }],
    client_visible_summary: "",
    internal_notes: "",
    is_internal: false,
    client_can_view: true,
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = () => {
    if (!user) return;
    const allMeetings = MeetingNoteService.getAll({}, user.role, user.id);
    setMeetings(allMeetings);
  };

  const filteredMeetings = meetings.filter((meeting) => {
    if (typeFilter !== "all" && meeting.meeting_type !== typeFilter) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        meeting.title.toLowerCase().includes(query) ||
        meeting.family_name.toLowerCase().includes(query) ||
        meeting.client_visible_summary.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: meetings.length,
    by_type: meetings.reduce((acc, m) => {
      acc[m.meeting_type] = (acc[m.meeting_type] || 0) + 1;
      return acc;
    }, {} as Record<MeetingType, number>),
    pending_actions: meetings.reduce((sum, m) => {
      return sum + m.action_items.filter((a) => a.status === "pending").length;
    }, 0),
    this_month: meetings.filter((m) => {
      const meetingDate = new Date(m.meeting_date);
      const thisMonth = new Date();
      return (
        meetingDate.getMonth() === thisMonth.getMonth() &&
        meetingDate.getFullYear() === thisMonth.getFullYear()
      );
    }).length,
  };

  const handleCreate = () => {
    if (!formData.title || !formData.meeting_date || !formData.family_name) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    if (!user) return;

    const newMeeting = MeetingNoteService.createMeetingNote({
      title: formData.title,
      meeting_type: formData.meeting_type,
      meeting_date: formData.meeting_date,
      family_id: formData.family_id || `fam-${Date.now()}`,
      family_name: formData.family_name,
      participants: [],
      discussion_points: formData.discussion_points.filter((p) => p.trim()),
      decisions_made: formData.decisions_made.filter((d) => d.trim()),
      action_items: formData.action_items.filter((a) => a.description.trim()).map((a) => ({
        ...a,
        id: "",
        assigned_to_id: "",
      })),
      internal_notes: formData.internal_notes,
      client_visible_summary: formData.client_visible_summary,
      is_internal: formData.is_internal,
      client_can_view: formData.client_can_view,
      created_by_id: user.id,
      created_by_name: user.name,
      created_by_role: user.role === "admin" ? "admin" : "rm",
      location: formData.location,
    });

    loadMeetings();

    toast.success("Meeting Created", {
      description: `${formData.title} has been created successfully`,
    });

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleDelete = (meeting: MeetingNote) => {
    if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
      MeetingNoteService.deleteMeetingNote(meeting.id);
      loadMeetings();

      toast.success("Meeting Deleted", {
        description: `${meeting.title} has been deleted`,
      });
    }
  };

  const handlePreview = (meeting: MeetingNote) => {
    setSelectedMeeting(meeting);
    setIsPreviewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      meeting_type: "adhoc",
      meeting_date: "",
      family_id: "",
      family_name: "",
      location: "",
      discussion_points: [""],
      decisions_made: [""],
      action_items: [{
        description: "",
        assigned_to_name: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      }],
      client_visible_summary: "",
      internal_notes: "",
      is_internal: false,
      client_can_view: true,
    });
    setSelectedMeeting(null);
  };

  const addDiscussionPoint = () => {
    setFormData({
      ...formData,
      discussion_points: [...formData.discussion_points, ""],
    });
  };

  const removeDiscussionPoint = (index: number) => {
    setFormData({
      ...formData,
      discussion_points: formData.discussion_points.filter((_, i) => i !== index),
    });
  };

  const addActionItem = () => {
    setFormData({
      ...formData,
      action_items: [...formData.action_items, {
        description: "",
        assigned_to_name: "",
        due_date: "",
        priority: "medium",
        status: "pending",
      }],
    });
  };

  const removeActionItem = (index: number) => {
    setFormData({
      ...formData,
      action_items: formData.action_items.filter((_, i) => i !== index),
    });
  };

  const getTypeBadge = (type: MeetingType) => {
    const variantMap: Record<MeetingType, any> = {
      onboarding: "onboarding",
      review: "review",
      planning: "planning",
      adhoc: "default",
      follow_up: "warning",
      complaint: "danger",
      annual_review: "purple",
      quarterly_review: "info",
    };

    return (
      <ColoredBadge variant={variantMap[type]}>
        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </ColoredBadge>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meeting Notes</h1>
            <p className="text-muted-foreground">
              Record and manage client meeting notes with privacy controls
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Meeting Note
          </Button>
        </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total Meetings"
          value={stats.total}
          description="All time"
          icon={Calendar}
          iconClassName="text-blue-600"
        />

        <StatCard
          title="This Month"
          value={stats.this_month}
          description="Meetings held"
          icon={Clock}
          iconClassName="text-green-600"
        />

        <StatCard
          title="Pending Actions"
          value={stats.pending_actions}
          description="Action items"
          icon={ListChecks}
          iconClassName="text-yellow-600"
        />

        <StatCard
          title="Families"
          value={new Set(meetings.map((m) => m.family_id)).size}
          description="Unique families"
          icon={Users}
          iconClassName="text-purple-600"
        />
      </div>

      {/* Filters */}
      <Card className="rounded-xl border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="adhoc">Ad-hoc</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Meeting Records</CardTitle>
          <CardDescription>
            Showing {filteredMeetings.length} of {meetings.length} meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No meetings found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>{meeting.family_name}</TableCell>
                    <TableCell>{getTypeBadge(meeting.meeting_type)}</TableCell>
                    <TableCell>
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {meeting.action_items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting.is_internal && !meeting.client_can_view ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Internal Only
                        </Badge>
                      ) : meeting.is_internal && meeting.client_can_view ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Summary Only
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Client Visible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(meeting)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meeting)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Meeting Note</DialogTitle>
            <DialogDescription>
              Record meeting details and action items with privacy controls
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Q1 Review Meeting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Meeting Type *</Label>
                <Select
                  value={formData.meeting_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, meeting_type: value as MeetingType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="adhoc">Ad-hoc</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="annual_review">Annual Review</SelectItem>
                    <SelectItem value="quarterly_review">Quarterly Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="family">Family Name *</Label>
                <Input
                  id="family"
                  value={formData.family_name}
                  onChange={(e) =>
                    setFormData({ ...formData, family_name: e.target.value })
                  }
                  placeholder="e.g., Sharma Family"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Meeting Date *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.meeting_date}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Discussion Points */}
            <div className="space-y-2">
              <Label>Discussion Points</Label>
              {formData.discussion_points.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => {
                      const updated = [...formData.discussion_points];
                      updated[index] = e.target.value;
                      setFormData({ ...formData, discussion_points: updated });
                    }}
                    placeholder="Discussion point..."
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDiscussionPoint(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addDiscussionPoint}>
                + Add Point
              </Button>
            </div>

            {/* Action Items */}
            <div className="space-y-2">
              <Label>Action Items</Label>
              {formData.action_items.map((item, index) => (
                <div key={index} className="border p-3 rounded space-y-2">
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...formData.action_items];
                      updated[index].description = e.target.value;
                      setFormData({ ...formData, action_items: updated });
                    }}
                    placeholder="Action item description..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={item.assigned_to_name}
                      onChange={(e) => {
                        const updated = [...formData.action_items];
                        updated[index].assigned_to_name = e.target.value;
                        setFormData({ ...formData, action_items: updated });
                      }}
                      placeholder="Assigned to..."
                    />
                    <Input
                      type="date"
                      value={item.due_date}
                      onChange={(e) => {
                        const updated = [...formData.action_items];
                        updated[index].due_date = e.target.value;
                        setFormData({ ...formData, action_items: updated });
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeActionItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addActionItem}>
                + Add Action Item
              </Button>
            </div>

            {/* Summaries */}
            <div className="space-y-2">
              <Label htmlFor="summary">Client Visible Summary *</Label>
              <Textarea
                id="summary"
                value={formData.client_visible_summary}
                onChange={(e) =>
                  setFormData({ ...formData, client_visible_summary: e.target.value })
                }
                rows={4}
                placeholder="What clients will see..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal">Internal Notes</Label>
              <Textarea
                id="internal"
                value={formData.internal_notes}
                onChange={(e) =>
                  setFormData({ ...formData, internal_notes: e.target.value })
                }
                rows={3}
                placeholder="Internal notes (HIDDEN from clients)..."
              />
            </div>

            {/* Privacy Controls */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Privacy Controls</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internal"
                  checked={formData.is_internal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_internal: !!checked })
                  }
                />
                <label htmlFor="internal" className="text-sm">
                  Mark as internal meeting (hide from clients)
                </label>
              </div>

              {formData.is_internal && (
                <div className="flex items-center space-x-2 ml-6">
                  <Checkbox
                    id="clientView"
                    checked={formData.client_can_view}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, client_can_view: !!checked })
                    }
                  />
                  <label htmlFor="clientView" className="text-sm">
                    Allow client to see summary only
                  </label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogDescription>
              {selectedMeeting && new Date(selectedMeeting.meeting_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <div className="mt-1 font-medium">{selectedMeeting.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Family</Label>
                  <div className="mt-1">{selectedMeeting.family_name}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedMeeting.meeting_type)}</div>
                </div>
              </div>

              {selectedMeeting.discussion_points.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Discussion Points</Label>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {selectedMeeting.discussion_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMeeting.action_items.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Action Items</Label>
                  <div className="mt-1 space-y-2">
                    {selectedMeeting.action_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{item.description}</span>
                        <Badge variant={item.status === "completed" ? "success" : "warning"}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Client Summary</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                  {selectedMeeting.client_visible_summary}
                </div>
              </div>

              {selectedMeeting.internal_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground text-red-600">
                    Internal Notes (Hidden from clients)
                  </Label>
                  <div className="mt-1 p-3 bg-red-50 rounded whitespace-pre-wrap">
                    {selectedMeeting.internal_notes}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Flow Section */}
      <UserFlowSection
        pageName="Meeting Notes"
        description="Document client meetings with privacy controls and action items"
        userFlow={[
          {
            step: "View Meeting Metrics",
            description: "Track total meetings, meetings this week, action items, and overdue actions."
          },
          {
            step: "Create New Meeting Note",
            description: "Document meeting details with privacy controls.",
            subSteps: [
              "Fill meeting details (family, type, date, status)",
              "Set privacy level (Internal Only, Summary Only, Client Visible)",
              "Add participants with roles and attendance status",
              "Enter discussion points as bulleted list",
              "Document decisions made",
              "Add internal notes (always hidden from clients)",
              "Write client summary (if privacy = Summary Only)"
            ]
          },
          {
            step: "Create Action Items",
            description: "Add action items with assignee, due date, and priority. System auto-creates reminders."
          },
          {
            step: "Review Existing Notes",
            description: "Filter by family, date, type, and privacy level. Search by content."
          },
          {
            step: "Track Action Items",
            description: "Monitor all action items from meetings, filter by status, and mark as completed."
          }
        ]}
        bestPractices={[
          "Set correct privacy level based on content sensitivity",
          "Use 'Internal Only' for sensitive discussions",
          "Use 'Summary Only' for standard meetings with internal analysis",
          "Create action items during meeting",
          "Follow up on overdue action items",
          "Document decisions clearly"
        ]}
        roleSpecific={{
          role: "Admin",
          notes: [
            "Internal notes are ALWAYS hidden from clients",
            "Action items shown only if assigned to client",
            "Summary Only shows summary field only to clients",
            "Client Visible shows full notes to clients",
            "Double-check privacy level before saving"
          ]
        }}
      />
      </div>
    </AppLayout>
  );
}
