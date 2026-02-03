"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/dashboard/StatCard";
import { ColoredBadge } from "@/components/ui/colored-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Search,
  BarChart3,
  MessageSquare,
  Users,
} from "lucide-react";
import { EmailTemplate, MessageCategory } from "@/types/messaging";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UserFlowSection } from "@/components/ui/user-flow-section";

const STORAGE_KEY = 'nrp_crm_email_templates';

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<"all" | MessageCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "general" as MessageCategory,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      // Initialize with sample templates
      const sampleTemplates: EmailTemplate[] = [
        {
          id: "tpl-1",
          name: "Welcome Onboarding Email",
          subject: "Welcome to NRP - Let's Get Started!",
          body: "Dear {{familyName}},\n\nWelcome to NRP! We're excited to have you onboard.\n\nYour RM {{rmName}} will guide you through the process.\n\nBest regards,\nNRP Team",
          category: "onboarding",
          variables: ["familyName", "rmName"],
          isActive: true,
          createdBy: user?.id || "admin",
          createdByName: user?.name || "Admin",
          createdAt: new Date().toISOString(),
          usageCount: 12,
        },
        {
          id: "tpl-2",
          name: "Document Submission Reminder",
          subject: "Reminder: Pending Documents",
          body: "Dear {{clientName}},\n\nThis is a friendly reminder that we're still waiting for {{documentName}}.\n\nPlease submit by {{dueDate}}.\n\nThank you,\n{{rmName}}",
          category: "compliance",
          variables: ["clientName", "documentName", "dueDate", "rmName"],
          isActive: true,
          createdBy: user?.id || "admin",
          createdByName: user?.name || "Admin",
          createdAt: new Date().toISOString(),
          usageCount: 8,
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTemplates));
      setTemplates(sampleTemplates);
    }
  };

  const saveTemplates = (updatedTemplates: EmailTemplate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const filteredTemplates = templates.filter((template) => {
    if (categoryFilter !== "all" && template.category !== categoryFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: templates.length,
    usage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
  };

  const handleCreate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    const variables = extractVariables(formData.body);
    const newTemplate: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      body: formData.body,
      category: formData.category,
      variables,
      isActive: true,
      createdBy: user?.id || "admin",
      createdByName: user?.name || "Admin",
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    saveTemplates([...templates, newTemplate]);
    toast.success("Template created successfully");
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedTemplate || !formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    const variables = extractVariables(formData.body);
    const updatedTemplates = templates.map((t) =>
      t.id === selectedTemplate.id
        ? {
            ...t,
            name: formData.name,
            subject: formData.subject,
            body: formData.body,
            category: formData.category,
            variables,
            updatedAt: new Date().toISOString(),
          }
        : t
    );

    saveTemplates(updatedTemplates);
    toast.success("Template updated successfully");
    setIsCreateDialogOpen(false);
    setIsEditMode(false);
    setSelectedTemplate(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      saveTemplates(templates.filter((t) => t.id !== id));
      toast.success("Template deleted successfully");
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedTemplates = templates.map((t) =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );
    saveTemplates(updatedTemplates);
    toast.success("Template status updated");
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    saveTemplates([...templates, newTemplate]);
    toast.success("Template duplicated successfully");
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
  };

  const insertVariable = (variable: string) => {
    setFormData({
      ...formData,
      body: formData.body + `{{${variable}}}`,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      category: "general",
    });
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    });
    setIsEditMode(true);
    setIsCreateDialogOpen(true);
  };

  const getCategoryBadge = (category: MessageCategory) => {
    const variantMap = {
      onboarding: "onboarding",
      compliance: "compliance",
      reports: "review",
      general: "default",
    } as const;
    return (
      <ColoredBadge variant={variantMap[category]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </ColoredBadge>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communications Manager</h1>
            <p className="text-muted-foreground">
              Manage email templates for standardized client communications
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsEditMode(false);
              setSelectedTemplate(null);
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total Templates"
            value={stats.total}
            description="Email templates created"
            icon={Mail}
            iconClassName="text-blue-600"
          />

          <StatCard
            title="Total Usage"
            value={stats.usage}
            description="Times templates used"
            icon={BarChart3}
            iconClassName="text-green-600"
          />

          <StatCard
            title="Active Templates"
            value={stats.active}
            description="Currently active"
            icon={CheckCircle}
            iconClassName="text-green-600"
          />

          <StatCard
            title="Inactive Templates"
            value={stats.inactive}
            description="Currently inactive"
            icon={XCircle}
            iconClassName="text-gray-500"
          />
        </div>

        {/* Filters */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Email Templates</CardTitle>
            <CardDescription>
              Showing {filteredTemplates.length} of {templates.length} templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No templates found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getCategoryBadge(template.category)}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {template.variables.slice(0, 2).map((v) => (
                            <code key={v} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {v}
                            </code>
                          ))}
                          {template.variables.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{template.variables.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{template.usageCount}</span>
                      </TableCell>
                      <TableCell>
                        {template.isActive ? (
                          <ColoredBadge variant="success">Active</ColoredBadge>
                        ) : (
                          <ColoredBadge variant="default">Inactive</ColoredBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(template)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(template.id)}
                          >
                            {template.isActive ? (
                              <XCircle className="h-4 w-4 text-gray-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
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

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Template" : "Create Template"}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update your email template details"
                  : "Create a new email template with variables"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Welcome Email"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v: MessageCategory) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Welcome to NRP!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  placeholder="Type your email content here. Use {{variableName}} for dynamic content."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Insert Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {["familyName", "clientName", "rmName", "date", "dueDate", "documentName", "amount", "portfolioValue"].map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={isEditMode ? handleUpdate : handleCreate}>
                {isEditMode ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Template Name</Label>
                  <p className="font-semibold">{selectedTemplate.name}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedTemplate.category)}</div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Body</Label>
                  <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                    {selectedTemplate.body}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Variables</Label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {selectedTemplate.variables.map((v) => (
                      <code key={v} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {"{{"}{v}{"}}"}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Usage: <span className="font-medium">{selectedTemplate.usageCount} times</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created by <span className="font-medium">{selectedTemplate.createdByName}</span>
                  </div>
                </div>
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
          pageName="Email Templates"
          description="Manage standardized email templates for client communications"
          userFlow={[
            {
              step: "View Template List",
              description: "Browse all templates organized by category (Onboarding, Compliance, Reports, General) and track usage statistics."
            },
            {
              step: "Create New Template",
              description: "Build new email templates with dynamic variables.",
              subSteps: [
                "Click 'New Template'",
                "Enter template name and select category",
                "Write subject line and email body",
                "Insert variables like {{family_name}}, {{rm_name}}, {{due_date}}",
                "Save template"
              ]
            },
            {
              step: "Edit Existing Template",
              description: "Modify template subject, body, and variables as needed."
            },
            {
              step: "Preview Template",
              description: "View template with sample data to verify formatting and variable substitution."
            },
            {
              step: "Manage Template Status",
              description: "Activate, deactivate, duplicate, or delete templates based on needs."
            }
          ]}
          bestPractices={[
            "Use clear, professional language",
            "Include all necessary variables for personalization",
            "Test templates with preview feature",
            "Organize templates by category",
            "Keep template library up-to-date and remove unused templates"
          ]}
          roleSpecific={{
            role: "Admin",
            notes: [
              "Available variables: {{family_name}}, {{rm_name}}, {{due_date}}, {{document_type}}, {{meeting_date}}, {{portfolio_value}}",
              "Templates are reusable across all communications",
              "Usage statistics help identify most effective templates",
              "Inactive templates are hidden from selection lists"
            ]
          }}
        />
      </div>
    </AppLayout>
  );
}
