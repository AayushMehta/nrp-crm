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
}

export function RecentDocumentsWidget({
  documents,
  onViewAll,
  onDownload,
}: RecentDocumentsWidgetProps) {
  const statusIcons = {
    pending: Clock,
    verified: CheckCircle2,
    rejected: XCircle,
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    verified: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Your latest uploaded documents</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">
                        {document.file_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusColors[document.status])}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {document.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(document.uploaded_at), "MMM dd")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(document)}
                    className="shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
