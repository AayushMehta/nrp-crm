"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientInvitationService } from "@/lib/services/client-invitation-service";
import { toast } from "sonner";
import { Loader2, Copy, Mail, CheckCircle } from "lucide-react";

interface ClientInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currentUserId: string;
  currentUserName: string;
}

export function ClientInviteDialog({
  open,
  onOpenChange,
  onSuccess,
  currentUserId,
  currentUserName,
}: ClientInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [assignedRmId, setAssignedRmId] = useState<string>();
  const [expiryDays, setExpiryDays] = useState("14");
  const [invitationLink, setInvitationLink] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Create invitation
      const invitation = ClientInvitationService.createInvitation(
        {
          email,
          assigned_rm_id: assignedRmId,
          expiry_days: parseInt(expiryDays),
        },
        currentUserId,
        currentUserName
      );

      // Generate invitation URL
      const baseUrl = window.location.origin;
      const link = ClientInvitationService.generateInvitationUrl(invitation.token, baseUrl);
      setInvitationLink(link);

      toast.success("Invitation created successfully!", {
        description: `Email invitation sent to ${email}`,
        duration: 5000,
      });

      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create invitation");
      console.error("Error creating invitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleClose = () => {
    setEmail("");
    setAssignedRmId(undefined);
    setExpiryDays("14");
    setInvitationLink(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New Client</DialogTitle>
        </DialogHeader>

        {!invitationLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Client Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Client will receive a link to complete onboarding themselves
              </p>
            </div>

            {/* Assign RM (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="rm">Assign Relationship Manager (Optional)</Label>
              <Select value={assignedRmId} onValueChange={setAssignedRmId}>
                <SelectTrigger id="rm">
                  <SelectValue placeholder="Select RM (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rm-1">Relationship Manager</SelectItem>
                  <SelectItem value="user-rm">Rajesh Kumar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Period */}
            <div className="space-y-2">
              <Label htmlFor="expiry">Link Expires In</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days (Recommended)</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Success View with Copy Link */
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Invitation Sent!</p>
                <p className="text-sm text-green-700">
                  Email sent to {email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={invitationLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can also copy and share this link directly
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
