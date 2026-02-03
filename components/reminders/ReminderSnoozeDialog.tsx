// components/reminders/ReminderSnoozeDialog.tsx
// Dialog for snoozing reminders

import { useState } from "react";
import { Reminder, SNOOZE_OPTIONS } from "@/types/reminders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addHours, addDays, startOfTomorrow, setHours, setMinutes, addWeeks } from "date-fns";
import { Clock } from "lucide-react";

interface ReminderSnoozeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: Reminder | null;
  onSnooze: (snoozeUntil: Date, reason?: string) => void;
}

export function ReminderSnoozeDialog({
  open,
  onOpenChange,
  reminder,
  onSnooze,
}: ReminderSnoozeDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>("1");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("09:00");
  const [reason, setReason] = useState("");

  const handleSnooze = () => {
    if (!reminder) return;

    let snoozeUntil: Date;

    switch (selectedOption) {
      case "1": // 1 hour
        snoozeUntil = addHours(new Date(), 1);
        break;
      case "4": // 4 hours
        snoozeUntil = addHours(new Date(), 4);
        break;
      case "tomorrow": // Tomorrow 9 AM
        snoozeUntil = startOfTomorrow();
        snoozeUntil = setHours(snoozeUntil, 9);
        snoozeUntil = setMinutes(snoozeUntil, 0);
        break;
      case "nextWeek": // Next week
        snoozeUntil = addWeeks(new Date(), 1);
        snoozeUntil = setHours(snoozeUntil, 9);
        snoozeUntil = setMinutes(snoozeUntil, 0);
        break;
      case "custom": // Custom date and time
        if (!customDate) {
          alert("Please select a date");
          return;
        }
        const [hours, minutes] = customTime.split(":").map(Number);
        snoozeUntil = new Date(customDate);
        snoozeUntil = setHours(snoozeUntil, hours);
        snoozeUntil = setMinutes(snoozeUntil, minutes);
        break;
      default:
        snoozeUntil = addHours(new Date(), 1);
    }

    onSnooze(snoozeUntil, reason || undefined);
    onOpenChange(false);
    setReason("");
    setCustomDate("");
    setCustomTime("09:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Snooze Reminder</DialogTitle>
          <DialogDescription>
            Choose when you want to be reminded again
          </DialogDescription>
        </DialogHeader>

        {reminder && (
          <div className="space-y-4">
            {/* Reminder title */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{reminder.title}</p>
            </div>

            {/* Snooze options */}
            <div className="space-y-3">
              <Label>Snooze until:</Label>
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="1hour" />
                  <Label htmlFor="1hour" className="font-normal cursor-pointer">
                    1 hour
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="4hours" />
                  <Label htmlFor="4hours" className="font-normal cursor-pointer">
                    4 hours
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tomorrow" id="tomorrow" />
                  <Label htmlFor="tomorrow" className="font-normal cursor-pointer">
                    Tomorrow at 9:00 AM
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nextWeek" id="nextWeek" />
                  <Label htmlFor="nextWeek" className="font-normal cursor-pointer">
                    Next week
                  </Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-normal cursor-pointer">
                      Custom date and time
                    </Label>
                  </div>

                  {selectedOption === "custom" && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Reason (optional) */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you snoozing this reminder?"
                rows={2}
              />
            </div>

            {/* Snooze history */}
            {reminder.snooze_history && reminder.snooze_history.length > 0 && (
              <div className="pt-3 border-t">
                <Label className="text-xs text-muted-foreground">
                  Snoozed {reminder.snooze_count} time(s) before
                </Label>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSnooze}>
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
