"use client";

import { useState, useMemo, useEffect } from "react";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientInvitationService } from "@/lib/services/client-invitation-service";
import { ClientInvitation, InvitationStatus } from "@/types/client-invitation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Search,
  RefreshCw,
  Ban,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
  TrendingUp,
  Users,
  Timer,
  MoreVertical,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InvitationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">("all");
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([]);

  // Load invitations
  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = () => {
    const allInvitations = ClientInvitationService.getAll();
    setInvitations(allInvitations);
  };

  // Calculate stats
  const stats = useMemo(() => {
    return ClientInvitationService.getStats();
  }, [invitations]);

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      // Status filter
      if (statusFilter !== "all" && inv.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          inv.email.toLowerCase().includes(query) ||
          inv.assigned_rm_name?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [invitations, statusFilter, searchQuery]);

  // Get status badge
  const getStatusBadge = (status: InvitationStatus) => {
    const variants = {
      pending: {
        label: "Pending",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Clock,
      },
      in_progress: {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Timer,
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      expired: {
        label: "Expired",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };
    return variants[status];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Copy invitation link
  const handleCopyLink = (invitation: ClientInvitation) => {
    const url = ClientInvitationService.generateInvitationUrl(
      invitation.token,
      window.location.origin
    );
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  // Resend invitation
  const handleResend = (invitation: ClientInvitation) => {
    const updated = ClientInvitationService.resendInvitation(invitation.id);
    if (updated) {
      loadInvitations();
      toast.success("Invitation resent successfully");
      handleCopyLink(updated);
    } else {
      toast.error("Failed to resend invitation");
    }
  };

  // Revoke invitation
  const handleRevoke = (invitation: ClientInvitation) => {
    if (confirm(`Are you sure you want to revoke the invitation for ${invitation.email}?`)) {
      const success = ClientInvitationService.revokeInvitation(
        invitation.id,
        user?.id || "",
        "Revoked by admin"
      );
      if (success) {
        loadInvitations();
        toast.success("Invitation revoked");
      } else {
        toast.error("Failed to revoke invitation");
      }
    }
  };

  // View details
  const handleViewDetails = (invitation: ClientInvitation) => {
    // Navigate to client if completed
    if (invitation.client_id) {
      router.push(`/admin/clients?id=${invitation.client_id}`);
    } else {
      // Show invitation details
      toast.info("Invitation is not yet completed");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ConsoleLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Client Invitations
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">Admin Mode</Badge>
              <p className="text-muted-foreground text-lg">
                Manage and track all client onboarding invitations
              </p>
            </div>
          </div>
          <Button
            className="gap-2 shadow-md"
            onClick={() => router.push("/admin/clients")}
          >
            <Mail className="h-4 w-4" />
            Send New Invitation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sent"
            value={stats.total.toString()}
            description="All time invitations"
            icon={Send}
            iconClassName="text-blue-600 dark:text-blue-400"
            className="bg-card hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Pending"
            value={stats.pending.toString()}
            description={`${stats.in_progress} in progress`}
            icon={Clock}
            iconClassName="text-yellow-600 dark:text-yellow-400"
            className="bg-card hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Completed"
            value={stats.completed.toString()}
            description={`${stats.completion_rate}% completion rate`}
            icon={CheckCircle}
            iconClassName="text-green-600 dark:text-green-400"
            className="bg-card hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Avg Completion Time"
            value={stats.average_time_to_complete ? `${stats.average_time_to_complete}d` : "N/A"}
            description="Days to complete"
            icon={TrendingUp}
            iconClassName="text-purple-600 dark:text-purple-400"
            className="bg-card hover:shadow-md transition-shadow"
          />
        </div>

        {/* Filters */}
        <Card className="rounded-xl border shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or RM name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as InvitationStatus | "all")
                  }
                >
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={loadInvitations}
                  className="gap-2 h-10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitations Table */}
        <Card className="rounded-xl border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned RM</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No invitations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvitations.map((invitation) => {
                    const statusBadge = getStatusBadge(invitation.status);
                    const StatusIcon = statusBadge.icon;
                    const daysUntilExpiry = getDaysUntilExpiry(
                      invitation.expires_at
                    );

                    return (
                      <TableRow
                        key={invitation.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-foreground">
                              {invitation.email}
                            </div>
                            {invitation.revoked && (
                              <Badge
                                className="bg-red-50 text-red-700 border-red-200 w-fit mt-1 text-[10px]"
                                variant="outline"
                              >
                                Revoked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusBadge.className}
                            variant="outline"
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.assigned_rm_name ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/10 text-primary rounded-full p-1"><Users className="h-3 w-3" /></span>
                              <span className="font-medium text-sm">{invitation.assigned_rm_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(invitation.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="text-sm text-muted-foreground">
                              {formatDate(invitation.expires_at)}
                            </div>
                            {invitation.status !== "completed" &&
                              invitation.status !== "expired" &&
                              !invitation.revoked && (
                                <div
                                  className={`text-xs mt-1 font-medium ${daysUntilExpiry <= 3
                                    ? "text-red-600"
                                    : "text-amber-600"
                                    }`}
                                >
                                  {daysUntilExpiry > 0
                                    ? `${daysUntilExpiry} days left`
                                    : "Expired"}
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm text-muted-foreground">
                              Accessed: {invitation.access_count}x
                            </div>
                            {invitation.accepted_at && (
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Started:{" "}
                                {formatDate(invitation.accepted_at)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleCopyLink(invitation)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>

                              {invitation.status !== "completed" &&
                                !invitation.revoked && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleResend(invitation)}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Resend
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRevoke(invitation)}
                                      className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                    >
                                      <Ban className="h-4 w-4 mr-2" />
                                      Revoke
                                    </DropdownMenuItem>
                                  </>
                                )}

                              {invitation.client_id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewDetails(invitation)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Client
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Info */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-xl border shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium">
                    Active Invitations
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.pending + stats.in_progress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm bg-red-50/50 dark:bg-red-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium">
                    Expired
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Ban className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 font-medium">Revoked</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.revoked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleLayout>
  );
}
