# Task Management System — "The Clean Desk"

A modern, focused financial task management module for NRP-CRM. Designed to reduce cognitive load by only showing actionable tasks and automatically resurfacing snoozed/follow-up items when they're ready.

---

## 1. Core Philosophy

- **Clean Desk:** Only show tasks that can be acted upon *right now*. Blocked/snoozed tasks are hidden until their follow-up date arrives.
- **Predefined Workflows:** 12 standardized financial operation types eliminate ambiguity.
- **Automated Resurfacing:** Tasks snoozed for client dependencies (e.g., Aadhar/PAN mismatch) automatically return to the active queue on the follow-up date.

---

## 2. Predefined Task Types (12)

| # | Operation Type | Key | Description |
|---|---------------|-----|-------------|
| 1 | SIP Setup | `sip_setup` | New Systematic Investment Plan |
| 2 | SIP Cancellation / Pause | `sip_cancellation` | Stop or pause existing SIP |
| 3 | SWP Setup | `swp_setup` | Systematic Withdrawal Plan |
| 4 | STP Setup | `stp_setup` | Systematic Transfer Plan |
| 5 | Switch Plans | `switch_plans` | Scheme to scheme transfer |
| 6 | Lumpsum Investment | `lumpsum_investment` | One-time purchase |
| 7 | Redemption | `redemption` | Full or partial withdrawal |
| 8 | Client Onboarding | `client_onboarding` | Account opening / Demat setup |
| 9 | KYC Update | `kyc_update` | Aadhar/PAN linking, address proof |
| 10 | Bank Mandate (OTM) | `bank_mandate` | Auto-debit registration |
| 11 | Nomination Update | `nomination_update` | Nominee change |
| 12 | Portfolio Review | `portfolio_review` | Advisory / strategy call |

---

## 3. Task Attributes

**Statuses:** `todo` → `in_progress` → `in_review` → `waiting_on_client` / `blocked` → `done`

**Priorities:** `low` | `medium` | `high` | `urgent`

**Snooze Fields (Follow-up Engine):**
- `snooze_date` — When the task should resurface
- `snooze_reason` — Why it's blocked (preset: Aadhar/PAN Mismatch, Awaiting Signature, Insufficient Funds, etc.)
- `snooze_count` — How many times snoozed
- `is_follow_up_due` — Computed flag, true when `snooze_date <= TODAY`

---

## 4. Follow-up / Snooze Logic

```
┌─────────────┐     Snooze     ┌──────────────────┐
│  Active Desk │ ───────────▶  │  Hidden (Snoozed) │
│  (todo /     │               │  status =          │
│  in_progress)│               │  waiting_on_client │
└─────────────┘               └──────────┬─────────┘
       ▲                                  │
       │   snooze_date <= TODAY           │
       │   Auto-resurface                 │
       └──────────────────────────────────┘
```

1. **Snooze:** RM clicks "Set Follow-up" → picks date + reason → task disappears from Active Desk
2. **Incubation:** Task hidden from main view, visible only in "Snoozed" section
3. **Resurface:** On dashboard load: `if (status == 'waiting_on_client' && snooze_date <= today)` → flip to `todo`, set `is_follow_up_due = true`
4. **Resolution:** RM marks complete or snoozes again

---

## 5. Dashboard Layout ("Clean Desk")

```
┌──────────────────────────────────────────────────────────┐
│  Good morning, [Name]         Mar 3, 2026    🔍 Search   │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ 🚨 4     │ ⏳ 12    │ 📝 8     │ ✅ 24                    │
│ Urgent   │ Pending  │ In       │ Completed                │
│ Follow-  │ Client   │ Progress │ This Week                │
│ ups      │ Action   │          │                          │
├──────────┴──────────┴──────────┴──────────────────────────┤
│  [Board]  [List]  [Spreadsheet]     + Create Task        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ Action Required Today ──────────────────────────┐   │
│  │  [SIP Withdrawal] Rajesh Sharma  🔴 High  Mar 3  │   │
│  │  [KYC Update]     Priya Patel    🟡 Med   Mar 3  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ In Progress ────────────────────────────────────┐   │
│  │  [STP Setup]  Amit Kumar  🟢 Low   Mar 5         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Snoozed (12 tasks) ─────────────── [collapsed] ┐   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Plan (4 Parts)

### Part 1: Foundation & Data Layer ✅

| Step | File | Action |
|------|------|--------|
| 1.1 | `types/tasks.ts` | Add `TaskOperationType` enum, snooze fields, `TaskManagerStats`, label/color constants |
| 1.2 | `lib/services/task-service.ts` | Add `snoozeTask()`, `resurfaceSnoozedTasks()`, `getTaskManagerStats()`, `getActiveDesk()`, `getSnoozedTasks()` |
| 1.3 | `data/mock/sample-tasks.ts` | Add financial operation task templates with snoozed mock data |

### Part 2: UI Components ✅

| Step | File | Action |
|------|------|--------|
| 2.1 | `components/task-manager/TaskMetricsRow.tsx` | 4-column stat cards (Urgent, Pending, In Progress, Completed) |
| 2.2 | `components/task-manager/TaskManagerCard.tsx` | Clean-desk task card with operation type pill, priority, snooze button |
| 2.3 | `components/task-manager/SnoozePopover.tsx` | Date + reason picker popover (Tomorrow, In 3 Days, Next Week, Custom) |
| 2.4 | `components/task-manager/TaskGroupList.tsx` | Grouped sections: "Action Required", "In Progress", "Snoozed" |

### Part 3: Dashboard Assembly ✅

| Step | File | Action |
|------|------|--------|
| 3.1 | `app/rm/tasks/page.tsx` | RM-facing Task Manager page in ConsoleLayout |
| 3.2 | `app/back-office/task-manager/page.tsx` | Back Office Task Manager page |
| 3.3 | — | Wire filtering, search, and snooze interactions |

### Part 4: Task Detail & Type-Specific Workflows ✅

| Step | File | Action |
|------|------|--------|
| 4.1 | `components/task-manager/TaskDetailSheet.tsx` | Sliding right panel with full task metadata |
| 4.2 | `components/task-manager/TaskActivityTimeline.tsx` | Activity timeline with color-coded icons |
| 4.3 | `lib/services/task-service.ts` | `getTaskActivityLog()` — synthetic log from task fields |

---

## 7. Verification

- `npm run build` — TypeScript compilation check
- Browser: Navigate to `/rm/tasks` and `/back-office/task-manager`
- Test snooze flow end-to-end
