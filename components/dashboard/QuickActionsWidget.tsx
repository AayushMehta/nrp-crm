// components/dashboard/QuickActionsWidget.tsx
// Quick actions widget for client dashboard

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Upload } from "lucide-react";

interface QuickActionsWidgetProps {
  onMessageRM: () => void;
  onScheduleMeeting: () => void;
  onUploadDocument: () => void;
}

export function QuickActionsWidget({
  onMessageRM,
  onScheduleMeeting,
  onUploadDocument,
}: QuickActionsWidgetProps) {
  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={onMessageRM}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Message RM</span>
          </Button>

          <Button
            onClick={onScheduleMeeting}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Schedule Meeting</span>
          </Button>

          <Button
            onClick={onUploadDocument}
            className="h-auto py-4 flex flex-col items-center gap-2"
            variant="outline"
          >
            <Upload className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Upload Document</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
