"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Calendar, Zap, Bell, X, ShieldCheck, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpcomingMeetingsWidget } from "@/components/dashboard/UpcomingMeetingsWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { RecentDocumentsWidget } from "@/components/dashboard/RecentDocumentsWidget";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

import { Meeting } from "@/types/meetings";
import { DocumentMetadata } from "@/types/documents";

// Mock data for RM meetings
const mockMeetings: Meeting[] = [
    {
        id: "1",
        title: "Portfolio Review",
        family_id: "fam-001",
        family_name: "Rajesh Kumar",
        scheduled_date: new Date(Date.now() + 86400000).toISOString(),
        duration_minutes: 60,
        type: "portfolio_review",
        status: "scheduled",
        assigned_rm_id: "rm-1",
        assigned_rm_name: "RM",
        attendees: [],
        agenda_items: [],
        created_by: "system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "2",
        title: "Onboarding Sync",
        family_id: "fam-002",
        family_name: "Amit Shah",
        scheduled_date: new Date(Date.now() + 172800000).toISOString(),
        duration_minutes: 30,
        type: "initial_consultation",
        status: "scheduled",
        assigned_rm_id: "rm-1",
        assigned_rm_name: "RM",
        attendees: [],
        agenda_items: [],
        created_by: "system",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Mock data for Client documents
const mockDocuments: DocumentMetadata[] = [
    {
        id: "doc-1",
        file_name: "Q3 Investment Report.pdf",
        file_type: "application/pdf",
        file_size: 2048,
        category: "portfolio_statement",
        status: "verified",
        uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        entity_type: "family",
        entity_id: "fam-001",
        uploaded_by_id: "system",
        uploaded_by_name: "System",
        uploaded_by_role: "admin"
    },
    {
        id: "doc-2",
        file_name: "Tax Certificate 2025.pdf",
        file_type: "application/pdf",
        file_size: 1024,
        category: "tax",
        status: "pending",
        uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        entity_type: "family",
        entity_id: "fam-001",
        uploaded_by_id: "client",
        uploaded_by_name: "Client",
        uploaded_by_role: "family"
    }
];

export function ContextPanel({
    isVisible,
    onClose
}: {
    isVisible: boolean;
    onClose: () => void;
}) {
    const { user } = useAuth();
    const role = user?.role || 'client';

    return (
        <div
            className={cn(
                "fixed inset-y-0 right-0 z-40 w-80 bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:shadow-none lg:w-80 lg:border-l lg:block overflow-hidden flex flex-col",
                !isVisible && "translate-x-full lg:hidden"
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-border/40 h-16">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Context Panel
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">

                    {/* --- RM VIEW --- */}
                    {(role === 'rm' || role === 'back_office') && (
                        <>
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Urgent Alerts</h4>
                                <Card className="card-elevated border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10">
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                            <Bell className="h-4 w-4 text-orange-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">KYC Expiring</p>
                                                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Rajesh Kumar's documents expire in 3 days.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Next Up</h4>
                                <UpcomingMeetingsWidget
                                    meetings={mockMeetings}
                                    onViewAll={() => { }}
                                    className="border-none shadow-none bg-transparent p-0"
                                />
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Quick Actions</h4>
                                <QuickActionsWidget
                                    onMessageRM={() => toast.info('Messaging RM...')}
                                    onScheduleMeeting={() => toast.info('Opening scheduler...')}
                                    onUploadDocument={() => toast.info('Opening uploader...')}
                                    className="border-none shadow-none bg-transparent p-0"
                                />
                            </div>
                        </>
                    )}

                    {/* --- ADMIN VIEW --- */}
                    {role === 'admin' && (
                        <>
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">System Status</h4>
                                <Card className="card-elevated border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/10">
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900 dark:text-green-200">System Healthy</p>
                                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">All services operational. Last backup 2h ago.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Pending Approvals</h4>
                                <Card className="card-elevated">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">New Client Requests</span>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">3</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full text-xs h-7">Review All</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}

                    {/* --- CLIENT VIEW --- */}
                    {role === 'client' && (
                        <>
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">My Advisor</h4>
                                <Card className="card-elevated">
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Rahul Sharma</p>
                                            <p className="text-xs text-muted-foreground">Relationship Manager</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Calling RM...')}>Call</Button>
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Emailing RM...')}>Email</Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Recent Documents</h4>
                                <RecentDocumentsWidget
                                    documents={mockDocuments}
                                    onViewAll={() => { }}
                                    onDownload={(doc) => toast.success(`Downloading ${doc.file_name}`)}
                                    className="border-none shadow-none bg-transparent p-0"
                                />
                            </div>
                        </>
                    )}

                </div>
            </ScrollArea>
        </div>
    );
}
