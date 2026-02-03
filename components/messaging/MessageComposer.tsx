import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageDraft, MessagePriority, MessageCategory } from "@/types/messaging";
import { Send, Lock } from "lucide-react";

interface MessageComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (draft: MessageDraft) => void;
  threadId?: string;
  familyId?: string;
  familyName?: string;
  subject?: string;
  userRole: "admin" | "rm" | "family";
}

export function MessageComposer({
  open,
  onOpenChange,
  onSend,
  threadId,
  familyId,
  familyName,
  subject,
  userRole,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<MessagePriority>("medium");
  const [category, setCategory] = useState<MessageCategory>("general");
  const [newSubject, setNewSubject] = useState(subject || "");
  const [newFamilyName, setNewFamilyName] = useState(familyName || "");

  const isReply = !!threadId;
  const canSeeAutoTagInfo = userRole === "admin" || userRole === "rm";

  const handleSend = () => {
    if (!content.trim()) {
      return;
    }

    const draft: MessageDraft = {
      threadId,
      familyId,
      familyName: newFamilyName || familyName,
      subject: newSubject || subject,
      content: content.trim(),
      priority,
      category,
      isInternal: false, // This will be auto-computed by the service
    };

    onSend(draft);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setContent("");
    setPriority("medium");
    setCategory("general");
    if (!isReply) {
      setNewSubject("");
      setNewFamilyName("");
    }
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReply ? "Reply to Conversation" : "New Message"}
          </DialogTitle>
          <DialogDescription>
            {isReply
              ? `Send a message in this conversation`
              : "Start a new conversation with a family"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* New conversation fields */}
          {!isReply && (
            <>
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name *</Label>
                <Input
                  id="familyName"
                  placeholder="e.g., Sharma Family"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Document Upload Request"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as MessagePriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Urgent</SelectItem>
                <SelectItem value="medium">Medium - Normal</SelectItem>
                <SelectItem value="low">Low - FYI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MessageCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              placeholder="Type your message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{content.length} characters</span>
              <span>{content.length > 0 ? `${Math.ceil(content.length / 160)} SMS` : ""}</span>
            </div>
          </div>

          {/* Auto-Tagging Info (Admin/RM only) */}
          {canSeeAutoTagInfo && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Auto-Tagged Message
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Messages are automatically tagged as <strong>internal</strong> when sent between staff members only (Admin ↔ RM),
                  or <strong>external</strong> when sent to/from clients. Internal messages are hidden from family members.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!content.trim() || (!isReply && !newFamilyName.trim())}
          >
            <Send className="h-4 w-4 mr-2" />
            {isReply ? "Send Reply" : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
