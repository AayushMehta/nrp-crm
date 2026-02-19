"use client";

import { useAuth } from "@/context/AuthContext";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Wallet } from "lucide-react";

export default function ClientDashboard() {
  const { user, family } = useAuth();

  return (
    <ConsoleLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {family?.name || "Client Portal"} - Your portfolio overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex rounded-xl">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Last updated: Just now
            </Button>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Invest More
            </Button>
          </div>
        </div>

        {/* Content Placeholder */}
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <Wallet className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold">Dashboard Loading...</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              We are optimizing your new experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </ConsoleLayout>
  );
}
