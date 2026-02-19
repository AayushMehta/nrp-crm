// components/dashboard/QuickActionsWidget.tsx
// Quick actions widget for client dashboard

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Upload, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsWidgetProps {
  onMessageRM: () => void;
  onScheduleMeeting: () => void;
  onUploadDocument: () => void;
  className?: string;
}

export function QuickActionsWidget({
  onMessageRM,
  onScheduleMeeting,
  onUploadDocument,
  className
}: QuickActionsWidgetProps) {
  return (
    <Card className={cn("card-elevated h-full", className)}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={onMessageRM}
            className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-dashed hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
            variant="outline"
          >
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Message RM</span>
          </Button>

          <Button
            onClick={onScheduleMeeting}
            className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-dashed hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
            variant="outline"
          >
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Schedule Meeting</span>
          </Button>

          <Button
            onClick={onUploadDocument}
            className="h-auto py-6 flex flex-col items-center gap-3 border-2 border-dashed hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all group"
            variant="outline"
          >
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Upload Document</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
