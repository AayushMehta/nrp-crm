"use client";

import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ClientService } from "@/lib/services/client-service";
import { SampleDataService } from "@/lib/services/sample-data-service";
import { Client, ClientFilter, ClientStatus } from "@/types/clients";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientDetailDialog } from "@/components/clients/ClientDetailDialog";

export default function RMClientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filters, setFilters] = useState<ClientFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
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
    // RM only sees their assigned clients
    const myClients = ClientService.getClients("rm", user?.id, {
      ...filters,
      search_query: searchQuery,
    });
    setClients(myClients);
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!user) return null;
    return ClientService.getStats("rm", user.id);
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

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned client relationships
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Clients"
              value={stats.total.toString()}
              description="Assigned to you"
              icon={Users}
              iconClassName="text-blue-600"
            />
            <StatCard
              title="Active Clients"
              value={stats.by_status.active.toString()}
              description={`${stats.by_status.onboarding} onboarding`}
              icon={CheckCircle}
              iconClassName="text-green-600"
            />
            <StatCard
              title="Total AUM"
              value={formatCurrency(stats.total_aum)}
              description={`Avg: ${formatCurrency(stats.average_aum)}`}
              icon={TrendingUp}
              iconClassName="text-purple-600"
            />
            <StatCard
              title="Prospects"
              value={stats.by_status.prospect.toString()}
              description="Potential clients"
              icon={AlertCircle}
              iconClassName="text-orange-600"
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No clients assigned yet</p>
                <p className="text-sm">Contact your admin to get client assignments</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => {
              const statusBadge = getStatusBadge(client.status);

              return (
                <Card key={client.id} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {client.primary_contact_name}
                        </p>
                      </div>
                      <Badge className={statusBadge.className} variant="outline">
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{client.primary_contact_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {client.primary_contact_phone}
                      </div>
                      {client.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {client.city}, {client.state}
                        </div>
                      )}
                    </div>

                    {/* AUM */}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total AUM</span>
                        <span className="font-semibold">{formatCurrency(client.total_aum)}</span>
                      </div>
                      {client.service_type && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Service</span>
                          <span className="text-sm">
                            {client.service_type === "nrp_360" ? "NRP 360" : "NRP Light"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        title="View Details"
                        onClick={() => handleViewClient(client)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        title="Send Message"
                        onClick={() => router.push("/communications")}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs">Message</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        title="Schedule Meeting"
                        onClick={() => router.push("/rm/calendar")}
                      >
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Meeting</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        title="View Documents"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Docs</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <ClientDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        client={selectedClient}
      />
    </AppLayout>
  );
}
