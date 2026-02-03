"use client";

import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { ClientService } from "@/lib/services/client-service";
import { SampleDataService } from "@/lib/services/sample-data-service";
import { Client, ClientFilter, ClientStatus, ClientTier } from "@/types/clients";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  MoreVertical,
  Phone,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ClientCreateDialog } from "@/components/clients/ClientCreateDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { ClientDetailDialog } from "@/components/clients/ClientDetailDialog";
import { ClientInviteDialog } from "@/components/clients/ClientInviteDialog";
import { ClientWarningBadges } from "@/components/clients/ClientWarningBadges";

export default function AdminClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filters, setFilters] = useState<ClientFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load clients
  useEffect(() => {
    if (user) {
      // Initialize sample data if needed
      SampleDataService.initializeSampleClients();
      loadClients();
    }
  }, [user, filters]);

  const loadClients = () => {
    const allClients = ClientService.getClients("admin", user?.id, {
      ...filters,
      search_query: searchQuery,
    });
    setClients(allClients);
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!user) return null;
    return ClientService.getStats("admin", user.id);
  }, [clients, user]);

  // Get status badge variant
  const getStatusBadge = (status: ClientStatus) => {
    const variants = {
      active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800 border-gray-200" },
      prospect: { label: "Prospect", className: "bg-blue-100 text-blue-800 border-blue-200" },
      onboarding: { label: "Onboarding", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      churned: { label: "Churned", className: "bg-red-100 text-red-800 border-red-200" },
    };
    return variants[status];
  };

  // Get tier badge
  const getTierBadge = (tier: ClientTier) => {
    const variants = {
      tier_1: { label: "Tier 1", className: "bg-purple-100 text-purple-800 border-purple-200" },
      tier_2: { label: "Tier 2", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      tier_3: { label: "Tier 3", className: "bg-blue-100 text-blue-800 border-blue-200" },
      prospect: { label: "Prospect", className: "bg-gray-100 text-gray-800 border-gray-200" },
    };
    return variants[tier];
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSearch = () => {
    loadClients();
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setDetailDialogOpen(false);
    setEditDialogOpen(true);
  };

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all client accounts and relationships
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" onClick={() => setInviteDialogOpen(true)}>
              <Mail className="h-4 w-4" />
              Invite Client
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Clients"
              value={stats.total.toString()}
              description={`${stats.total_clients_with_rm} with assigned RM`}
              icon={Users}
              iconClassName="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <StatCard
              title="Active Clients"
              value={stats.by_status.active.toString()}
              description={`${stats.by_status.onboarding} onboarding`}
              icon={CheckCircle}
              iconClassName="text-green-600"
              iconBgColor="bg-green-100"
            />
            <StatCard
              title="Total AUM"
              value={formatCurrency(stats.total_aum)}
              description={`Avg: ${formatCurrency(stats.average_aum)}`}
              icon={TrendingUp}
              iconClassName="text-purple-600"
              iconBgColor="bg-purple-100"
            />
            <StatCard
              title="Prospects"
              value={stats.by_status.prospect.toString()}
              description="Potential clients"
              icon={AlertCircle}
              iconClassName="text-orange-600"
              iconBgColor="bg-orange-100"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary">
                  Search
                </Button>
              </div>

              <div className="flex gap-2">
                <Select
                  value={filters.status as string || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value === "all" ? undefined : value as ClientStatus })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.tier as string || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, tier: value === "all" ? undefined : value as ClientTier })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="tier_1">Tier 1</SelectItem>
                    <SelectItem value="tier_2">Tier 2</SelectItem>
                    <SelectItem value="tier_3">Tier 3</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Assigned RM</TableHead>
                  <TableHead className="text-right">AUM</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No clients found. Add your first client to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const statusBadge = getStatusBadge(client.status);
                    const tierBadge = getTierBadge(client.tier);

                    return (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.primary_contact_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {client.primary_contact_email}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {client.primary_contact_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.className} variant="outline">
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={tierBadge.className} variant="outline">
                            {tierBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ClientWarningBadges
                            client={client}
                            onChecklistClick={(checklistId) => {
                              // Navigate to checklist or open in detail view
                              router.push(`/admin/checklists?client=${client.id}`);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {client.assigned_rm_name ? (
                            <div className="text-sm">{client.assigned_rm_name}</div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(client.total_aum)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Client
                              </DropdownMenuItem>
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
      </div>

      {/* Dialogs */}
      <ClientInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        currentUserId={user.id}
        currentUserName={user.name}
        onSuccess={loadClients}
      />

      <ClientCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        currentUserId={user.id}
        onSuccess={loadClients}
      />

      <ClientDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        client={selectedClient}
        onEdit={handleEditClient}
      />

      <ClientEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        client={selectedClient}
        onSuccess={loadClients}
      />
    </AppLayout>
  );
}
