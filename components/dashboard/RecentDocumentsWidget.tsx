// components/dashboard/RecentDocumentsWidget.tsx
// Widget showing recent documents on dashboard

import { DocumentMetadata } from "@/types/documents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentDocumentsWidgetProps {
  documents: DocumentMetadata[];
  onViewAll: () => void;
  onDownload: (doc: DocumentMetadata) => void;
  className?: string;
}

export function RecentDocumentsWidget({
  documents,
  onViewAll,
  onDownload,
  className
}: RecentDocumentsWidgetProps) {
  const statusIcons = {
    pending: Clock,
    verified: CheckCircle2,
    rejected: XCircle,
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
    verified: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
    rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  };

  return (
    <Card className={cn("card-elevated h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Recent Documents
          </CardTitle>
          <CardDescription>Latest uploads & reports</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="h-8 rounded-full px-3 text-xs">
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.slice(0, 3).map((document) => {
              const StatusIcon = statusIcons[document.status];
              return (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate text-foreground">
                        {document.file_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0 rounded-md h-5", statusColors[document.status])}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {document.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground/80">
                          {format(new Date(document.uploaded_at), "MMM dd")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(document)}
                    className="shrink-0 h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 bg-muted/40 rounded-full flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No documents yet</p>
            <p className="text-xs text-muted-foreground mt-1">Uploaded files will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
