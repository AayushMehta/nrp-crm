"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client, ClientStatus, ClientTier } from "@/types/clients";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Edit,
} from "lucide-react";
import { format } from "date-fns";

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit?: (client: Client) => void;
}

export function ClientDetailDialog({
  open,
  onOpenChange,
  client,
  onEdit,
}: ClientDetailDialogProps) {
  if (!client) return null;

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

  const statusBadge = getStatusBadge(client.status);
  const tierBadge = getTierBadge(client.tier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{client.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {client.primary_contact_name}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className={statusBadge.className} variant="outline">
                {statusBadge.label}
              </Badge>
              <Badge className={tierBadge.className} variant="outline">
                {tierBadge.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Contact</p>
                    <p className="font-medium">{client.primary_contact_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{client.primary_contact_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{client.primary_contact_phone}</p>
                  </div>
                </div>
                {client.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {client.address}
                        {client.city && `, ${client.city}`}
                        {client.state && `, ${client.state}`}
                        {client.pincode && ` - ${client.pincode}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relationship Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned RM</p>
                    <p className="font-medium">
                      {client.assigned_rm_name || "Unassigned"}
                    </p>
                  </div>
                </div>
                {client.assigned_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Date</p>
                      <p className="font-medium">
                        {format(new Date(client.assigned_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
                {client.last_contact_date && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Contact</p>
                      <p className="font-medium">
                        {format(new Date(client.last_contact_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total AUM</p>
                    <p className="text-2xl font-bold">{formatCurrency(client.total_aum)}</p>
                  </div>
                  {client.invested_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Invested Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(client.invested_amount)}</p>
                    </div>
                  )}
                </div>

                {client.current_value && (
                  <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-xl font-semibold">{formatCurrency(client.current_value)}</p>
                    </div>
                    {client.unrealized_gain && (
                      <div>
                        <p className="text-sm text-muted-foreground">Unrealized Gain</p>
                        <p className={`text-xl font-semibold ${client.unrealized_gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(client.unrealized_gain)}
                          {client.unrealized_gain_percent && (
                            <span className="text-sm ml-2">
                              ({client.unrealized_gain_percent > 0 ? "+" : ""}
                              {client.unrealized_gain_percent.toFixed(2)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {client.one_year_return && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">1-Year Return</p>
                    <p className={`text-xl font-semibold ${client.one_year_return >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {client.one_year_return > 0 ? "+" : ""}
                      {client.one_year_return.toFixed(2)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value="service" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">
                      {client.service_type === "nrp_360" ? "NRP 360" : "NRP Light"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Profile</p>
                    <p className="font-medium capitalize">
                      {client.risk_profile.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Onboarding Status</p>
                    <p className="font-medium capitalize">
                      {client.onboarding_status?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KYC Status</p>
                    <p className="font-medium capitalize">{client.kyc_status}</p>
                  </div>
                </div>

                {client.tags && client.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Activity tracking coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(client)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
