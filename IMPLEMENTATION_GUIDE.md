# NRP CRM Implementation Guide

**Project**: NRP CRM - Client Relationship Management System
**Repository**: `/Users/aayush-mac/techpix/NRP/nrp-crm/nrp-crm`
**Reference Project**: `/Users/aayush-mac/techpix/NRP/nrp-cfo-ptoto`
**Start Date**: 2026-01-20

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Directory Structure](#directory-structure)
5. [Implementation Phases](#implementation-phases)
6. [File-by-File Implementation Plan](#file-by-file-implementation-plan)
7. [Data Models](#data-models)
8. [Service Layer Architecture](#service-layer-architecture)
9. [Component Architecture](#component-architecture)
10. [Integration Points](#integration-points)
11. [Testing Strategy](#testing-strategy)

---

## Project Overview

Building three major CRM features from scratch in an empty repository:

### Feature 1: Onboarding Automation with Master Checklist
- Document management system with conditional logic
- Temporary client access for document uploads
- Admin verification workflow
- Progress tracking (100% document scenario coverage)

### Feature 2: Client Communication Trail / Meeting Notes
- Meeting notes with privacy-controlled visibility
- Internal notes hidden from clients
- Action items with reminder conversion
- Unified timeline view (meetings + messages + documents)

### Feature 3: Enhanced Reminder System
- Automated reminder generation from triggers
- Document upload notifications
- Meeting action item reminders
- Dashboard widgets and email notifications

---

## Tech Stack

### Frontend Framework
- **Next.js 15.5.7** (App Router)
- **React 19.1.2**
- **TypeScript** (strict mode)

### UI Libraries
- **shadcn/ui** (Radix UI primitives)
- **Tailwind CSS v4**
- **lucide-react** (icons)

### Form & Validation
- **react-hook-form 7.66.0**
- **zod 3.25.76**
- **@hookform/resolvers 5.2.2**

### Data Storage
- **localStorage** (MVP phase)
- **Migration path to Supabase** (production)

### Date Handling
- **date-fns** (date utilities)

---

## Features

### 1. Onboarding Automation

#### User Stories
- **As an Admin**, I can create onboarding checklists for new clients
- **As an Admin**, I can generate temporary access tokens for clients
- **As a Client**, I can upload documents without creating an account
- **As an Admin**, I can verify or reject uploaded documents
- **As an RM**, I can track onboarding progress for my clients

#### Key Components
- Master checklist dashboard
- Document upload zone (drag & drop)
- Document verification panel
- Temporary access portal
- Progress tracker

#### Business Rules
- If `kyc_already_done = true` → hide PAN, Aadhaar documents
- NRP Light vs NRP 360 → different data input sheets required
- Temporary access expires after 7 days
- Full login granted only after first purchase

---

### 2. Meeting Notes & Communication Trail

#### User Stories
- **As an RM**, I can create meeting notes with internal observations
- **As an RM**, I can add action items with due dates
- **As a Client**, I can view meeting summaries (but not internal notes)
- **As an Admin**, I can see complete communication history for any family
- **As an RM**, I can convert action items to reminders

#### Key Components
- Meeting note dialog (create/edit)
- Action item list with completion tracking
- Communication timeline (unified view)
- Privacy filter for client view

#### Privacy Rules
1. **Internal Notes Field**: Always hidden from clients
2. **Entire Note Internal**: If `is_internal = true`, hide from clients unless `client_can_view = true`
3. **Summary Only Mode**: Show `client_visible_summary` but hide details
4. **Action Item Filtering**: Clients only see items assigned to them

---

### 3. Enhanced Reminder System

#### User Stories
- **As an Admin**, I receive a reminder when a client uploads a document
- **As an RM**, I receive a reminder when onboarding is 100% complete
- **As an RM**, I automatically get reminders for meeting action items
- **As a User**, I can snooze reminders and set recurrence

#### Key Components
- Reminder list (overdue, today, upcoming tabs)
- Reminder dialog (create/edit)
- Dashboard widgets (counts and quick actions)
- Auto-generation service

#### Trigger Points
1. Document uploaded → Admin verification reminder (24h)
2. Checklist 100% complete → RM follow-up reminder (2 days)
3. Meeting action item created → Assigned user reminder (due date)
4. Onboarding request accepted → Admin setup reminder (1 day)
5. 7 days no activity → RM follow-up reminder

---

## Directory Structure

```
nrp-crm/
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Home page
│   │
│   ├── auth/                             # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   └── setup-password/
│   │       └── page.tsx                  # Password setup for new users
│   │
│   ├── admin/                            # Admin-only routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   ├── onboarding/
│   │   │   ├── checklists/
│   │   │   │   ├── page.tsx              # All checklists
│   │   │   │   └── [checklistId]/
│   │   │   │       └── page.tsx          # Checklist detail
│   │   │   └── templates/
│   │   │       └── page.tsx              # Template manager
│   │   ├── communications/
│   │   │   ├── meeting-notes/
│   │   │   │   ├── page.tsx              # All meetings
│   │   │   │   └── [noteId]/
│   │   │   │       └── page.tsx          # Meeting detail
│   │   │   └── timeline/
│   │   │       └── [familyId]/
│   │   │           └── page.tsx          # Family timeline
│   │   └── tasks/
│   │       └── page.tsx                  # All reminders
│   │
│   ├── rm/                               # RM-only routes
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # RM dashboard
│   │   ├── onboarding/
│   │   │   └── [familyId]/
│   │   │       └── checklist/
│   │   │           └── page.tsx          # Client checklist view
│   │   ├── communications/
│   │   │   ├── meeting-notes/
│   │   │   │   ├── page.tsx              # RM's meetings
│   │   │   │   └── [noteId]/
│   │   │   │       └── page.tsx          # Meeting detail
│   │   │   └── timeline/
│   │   │       └── [familyId]/
│   │   │           └── page.tsx          # Family timeline
│   │   └── tasks/
│   │       └── page.tsx                  # RM's reminders
│   │
│   └── client/                           # Client portal routes
│       ├── dashboard/
│       │   └── page.tsx                  # Client dashboard
│       ├── onboarding/
│       │   └── checklist/
│       │       └── page.tsx              # Client's checklist
│       ├── temp-access/
│       │   └── [token]/
│       │       └── page.tsx              # Temporary access portal
│       └── communications/
│           ├── meetings/
│           │   └── page.tsx              # Client's meetings
│           └── timeline/
│               └── page.tsx              # Client timeline
│
├── components/                           # React components
│   ├── ui/                               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── textarea.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── onboarding/                       # Onboarding feature
│   │   ├── ChecklistMaster.tsx           # All checklists dashboard
│   │   ├── ChecklistCard.tsx             # Single checklist card
│   │   ├── ChecklistDetailView.tsx       # Full checklist view
│   │   ├── DocumentVerificationPanel.tsx # Verify/reject UI
│   │   ├── TempAccessGenerator.tsx       # Generate tokens
│   │   └── ChecklistTemplateManager.tsx  # Template CRUD
│   │
│   ├── documents/                        # Document management
│   │   ├── FileUploadZone.tsx            # Drag-drop upload
│   │   ├── DocumentList.tsx              # List of documents
│   │   ├── DocumentCard.tsx              # Single document
│   │   ├── DocumentPreview.tsx           # Preview modal
│   │   └── DocumentVerificationDialog.tsx # Verify/reject dialog
│   │
│   ├── client-portal/                    # Client-facing components
│   │   ├── ClientChecklistView.tsx       # Client's checklist
│   │   ├── ClientDocumentUpload.tsx      # Upload interface
│   │   └── ClientProgressTracker.tsx     # Progress bar
│   │
│   ├── meeting-notes/                    # Meeting notes feature
│   │   ├── MeetingNoteList.tsx           # List all meetings
│   │   ├── MeetingNoteCard.tsx           # Single meeting card
│   │   ├── MeetingNoteDialog.tsx         # Create/edit modal
│   │   ├── MeetingNoteDetailView.tsx     # Full meeting view
│   │   ├── ActionItemList.tsx            # Action items
│   │   ├── ActionItemCard.tsx            # Single action item
│   │   └── ConvertToReminderButton.tsx   # Convert to reminder
│   │
│   ├── communication-timeline/           # Timeline feature
│   │   ├── CommunicationTimeline.tsx     # Master timeline
│   │   ├── TimelineItem.tsx              # Single timeline entry
│   │   ├── TimelineFilter.tsx            # Filter sidebar
│   │   ├── TimelineTypeIcon.tsx          # Icons for types
│   │   └── TimelineClientView.tsx        # Client-visible view
│   │
│   ├── reminders/                        # Reminder feature (copy from ref)
│   │   ├── ReminderList.tsx              # List with tabs
│   │   ├── ReminderCard.tsx              # Single reminder
│   │   ├── ReminderDialog.tsx            # Create/edit modal
│   │   └── ReminderSnoozeDialog.tsx      # Snooze options
│   │
│   └── dashboard/                        # Dashboard widgets
│       ├── ReminderWidget.tsx            # Reminder stats
│       ├── OverdueRemindersCard.tsx      # Overdue count
│       ├── UpcomingRemindersCard.tsx     # Upcoming count
│       ├── OnboardingWidget.tsx          # Onboarding stats
│       └── MeetingsWidget.tsx            # Meeting stats
│
├── lib/                                  # Business logic
│   ├── services/                         # Service layer
│   │   ├── auth-service.ts               # Authentication logic
│   │   ├── checklist-service.ts          # Checklist CRUD
│   │   ├── document-service.ts           # File handling
│   │   ├── temp-access-service.ts        # Token management
│   │   ├── meeting-note-service.ts       # Meeting CRUD
│   │   ├── timeline-service.ts           # Timeline aggregation
│   │   ├── reminder-service.ts           # Reminder CRUD (copy from ref)
│   │   ├── reminder-automation-service.ts # Auto-generation
│   │   └── reminder-notification-service.ts # Email notifications
│   │
│   ├── storage/                          # Storage layer
│   │   ├── localStorage.ts               # Generic localStorage wrapper (copy from ref)
│   │   ├── checklist-storage.ts          # Checklist persistence
│   │   ├── document-storage.ts           # Document persistence
│   │   ├── meeting-storage.ts            # Meeting persistence
│   │   └── reminder-storage.ts           # Reminder persistence (copy from ref)
│   │
│   └── utils/                            # Utility functions
│       ├── cn.ts                         # Class name merger
│       ├── date-utils.ts                 # Date formatting
│       ├── privacy-filter.ts             # Privacy control logic
│       └── validation.ts                 # Shared validators
│
├── types/                                # TypeScript type definitions
│   ├── auth.ts                           # User, roles
│   ├── family.ts                         # Family, members
│   ├── onboarding-checklist.ts           # Checklist, items
│   ├── documents.ts                      # Document metadata
│   ├── temp-access.ts                    # Temporary tokens
│   ├── meeting-notes.ts                  # Meetings, action items
│   ├── communication-timeline.ts         # Timeline items
│   └── reminders.ts                      # Reminders, triggers (copy from ref)
│
├── context/                              # React Context providers
│   └── AuthContext.tsx                   # Auth state (copy from ref)
│
├── public/                               # Static assets
│   └── ... (images, fonts, etc.)
│
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── components.json                       # shadcn/ui config
├── IMPLEMENTATION_GUIDE.md              # This file
└── README.md
```

---

## Implementation Phases

### Phase 1: Project Foundation (Days 1-2)

**Goals:**
- Initialize Next.js project
- Set up TypeScript, Tailwind, shadcn/ui
- Copy core infrastructure from reference
- Set up authentication system

**Tasks:**
1. ✅ Create IMPLEMENTATION_GUIDE.md
2. Initialize Next.js 15 with App Router
3. Install all dependencies
4. Configure TypeScript (strict mode)
5. Set up Tailwind CSS v4
6. Initialize shadcn/ui
7. Copy AuthContext from reference
8. Copy localStorage utilities from reference
9. Copy auth pages (login, setup-password)
10. Create base layout and home page

**Files Created:**
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.ts`
- `components.json`
- `/context/AuthContext.tsx`
- `/lib/storage/localStorage.ts`
- `/app/auth/login/page.tsx`
- `/app/auth/setup-password/page.tsx`
- `/app/layout.tsx`
- `/app/page.tsx`

---

### Phase 2: Feature 1 - Onboarding Automation (Days 3-5)

**Goals:**
- Create all type definitions
- Build service layer for checklists, documents, temp access
- Create admin and client components
- Build routes and pages

#### Day 3: Type Definitions & Service Layer

**Tasks:**
1. Create `/types/onboarding-checklist.ts`
2. Create `/types/documents.ts`
3. Create `/types/temp-access.ts`
4. Create `/lib/storage/checklist-storage.ts`
5. Create `/lib/storage/document-storage.ts`
6. Create `/lib/services/checklist-service.ts`
7. Create `/lib/services/document-service.ts`
8. Create `/lib/services/temp-access-service.ts`

#### Day 4: Admin Components

**Tasks:**
1. Create `/components/onboarding/ChecklistMaster.tsx`
2. Create `/components/onboarding/ChecklistCard.tsx`
3. Create `/components/onboarding/ChecklistDetailView.tsx`
4. Create `/components/onboarding/DocumentVerificationPanel.tsx`
5. Create `/components/onboarding/TempAccessGenerator.tsx`
6. Create `/components/documents/FileUploadZone.tsx`
7. Create `/components/documents/DocumentList.tsx`
8. Create `/components/documents/DocumentCard.tsx`
9. Create `/app/admin/onboarding/checklists/page.tsx`
10. Create `/app/admin/onboarding/checklists/[checklistId]/page.tsx`

#### Day 5: Client Portal

**Tasks:**
1. Create `/components/client-portal/ClientChecklistView.tsx`
2. Create `/components/client-portal/ClientDocumentUpload.tsx`
3. Create `/components/client-portal/ClientProgressTracker.tsx`
4. Create `/app/client/onboarding/checklist/page.tsx`
5. Create `/app/client/temp-access/[token]/page.tsx`
6. Create `/app/rm/onboarding/[familyId]/checklist/page.tsx`
7. Test complete onboarding flow
8. Test conditional logic (KYC exception, NRP Light vs 360)

---

### Phase 3: Feature 2 - Meeting Notes (Days 6-8)

**Goals:**
- Create meeting notes types
- Build service layer with privacy controls
- Create meeting components
- Build timeline aggregation

#### Day 6: Type Definitions & Service Layer

**Tasks:**
1. Create `/types/meeting-notes.ts`
2. Create `/types/communication-timeline.ts`
3. Create `/lib/storage/meeting-storage.ts`
4. Create `/lib/services/meeting-note-service.ts`
5. Create `/lib/services/timeline-service.ts`
6. Create `/lib/utils/privacy-filter.ts`

#### Day 7: Meeting Components

**Tasks:**
1. Create `/components/meeting-notes/MeetingNoteList.tsx`
2. Create `/components/meeting-notes/MeetingNoteCard.tsx`
3. Create `/components/meeting-notes/MeetingNoteDialog.tsx`
4. Create `/components/meeting-notes/MeetingNoteDetailView.tsx`
5. Create `/components/meeting-notes/ActionItemList.tsx`
6. Create `/components/meeting-notes/ActionItemCard.tsx`
7. Create `/components/meeting-notes/ConvertToReminderButton.tsx`
8. Create `/app/admin/communications/meeting-notes/page.tsx`
9. Create `/app/admin/communications/meeting-notes/[noteId]/page.tsx`

#### Day 8: Timeline & Integration

**Tasks:**
1. Create `/components/communication-timeline/CommunicationTimeline.tsx`
2. Create `/components/communication-timeline/TimelineItem.tsx`
3. Create `/components/communication-timeline/TimelineFilter.tsx`
4. Create `/components/communication-timeline/TimelineClientView.tsx`
5. Create `/app/admin/communications/timeline/[familyId]/page.tsx`
6. Create `/app/rm/communications/meeting-notes/page.tsx`
7. Create `/app/client/communications/meetings/page.tsx`
8. Create `/app/client/communications/timeline/page.tsx`
9. Test privacy controls thoroughly
10. Test timeline aggregation

---

### Phase 4: Feature 3 - Reminder Automation (Days 9-10)

**Goals:**
- Copy base reminder system from reference
- Add automation triggers
- Create dashboard widgets
- Integrate with other features

#### Day 9: Copy & Extend Reminders

**Tasks:**
1. Copy `/types/reminders.ts` from reference
2. Extend with ReminderTrigger types
3. Copy `/lib/services/reminder-service.ts` from reference
4. Copy `/lib/storage/reminder-storage.ts` from reference
5. Create `/lib/services/reminder-automation-service.ts`
6. Create `/lib/services/reminder-notification-service.ts`
7. Copy `/components/reminders/ReminderList.tsx` from reference
8. Copy `/components/reminders/ReminderCard.tsx` from reference
9. Copy `/components/reminders/ReminderDialog.tsx` from reference
10. Copy `/components/reminders/ReminderSnoozeDialog.tsx` from reference

#### Day 10: Triggers & Integration

**Tasks:**
1. Implement document upload trigger in document-service.ts
2. Implement checklist complete trigger in checklist-service.ts
3. Implement action item trigger in meeting-note-service.ts
4. Implement onboarding milestone trigger
5. Create `/components/dashboard/ReminderWidget.tsx`
6. Create `/components/dashboard/OverdueRemindersCard.tsx`
7. Create `/components/dashboard/UpcomingRemindersCard.tsx`
8. Create `/app/admin/tasks/page.tsx`
9. Create `/app/rm/tasks/page.tsx`
10. Test all trigger points

---

### Phase 5: Dashboards & Integration (Days 11-12)

**Goals:**
- Build all three dashboards (admin, RM, client)
- Create dashboard widgets
- Final integration testing

#### Day 11: Dashboards

**Tasks:**
1. Create `/app/admin/dashboard/page.tsx`
2. Create `/app/rm/dashboard/page.tsx`
3. Create `/app/client/dashboard/page.tsx`
4. Create `/components/dashboard/OnboardingWidget.tsx`
5. Create `/components/dashboard/MeetingsWidget.tsx`
6. Integrate all widgets
7. Test dashboard data loading

#### Day 12: Final Integration & Testing

**Tasks:**
1. Test complete onboarding flow end-to-end
2. Test meeting notes with privacy controls
3. Test all reminder triggers
4. Test timeline aggregation
5. Test role-based access control
6. Fix bugs and edge cases
7. Performance optimization
8. Documentation updates

---

## Data Models

### Authentication & Users

```typescript
// types/auth.ts

export type UserRole = "admin" | "rm" | "family";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  familyId?: string;  // For family users
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
```

### Onboarding System

```typescript
// types/onboarding-checklist.ts

export type DocumentType =
  | 'pan_card'
  | 'aadhaar_card'
  | 'cancelled_check'
  | 'kyc_certificate'
  | 'risk_profile_form'
  | 'investor_declaration_form'
  | 'data_input_sheet_nrp_light'
  | 'data_input_sheet_nrp_360'
  | 'bank_statement'
  | 'other';

export type DocumentStatus =
  | 'required'      // Not yet uploaded
  | 'pending'       // Uploaded, awaiting verification
  | 'verified'      // Admin verified
  | 'rejected'      // Admin rejected
  | 'not_required'; // Based on conditional logic

export interface ChecklistItem {
  id: string;
  document_type: DocumentType;
  category: 'kyc' | 'forms' | 'financial' | 'additional';
  display_name: string;
  description: string;
  status: DocumentStatus;
  is_mandatory: boolean;

  // Conditional logic
  conditional_on?: {
    field: string;
    value: any;
    if_true: boolean;
  };

  // File tracking
  uploaded_file_id?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;

  order: number;
}

export interface OnboardingChecklist {
  id: string;
  family_id: string;
  family_name: string;

  // Checklist state
  items: ChecklistItem[];
  total_required: number;
  completed_count: number;
  verified_count: number;
  completion_percentage: number;

  // Workflow
  current_step: 'kyc_docs' | 'data_input' | 'execution' | 'completed';
  kyc_already_done: boolean;
  selected_service: 'nrp_light' | 'nrp_360';

  // Access control
  temporary_access_token?: string;
  temporary_access_expires?: string;
  full_login_granted: boolean;
  first_purchase_date?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_rm_id?: string;
}
```

```typescript
// types/documents.ts

export interface DocumentMetadata {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;

  // Ownership
  uploaded_by_id: string;
  uploaded_by_name: string;
  uploaded_by_role: 'admin' | 'rm' | 'family' | 'temp_client';

  // Association
  entity_type: 'checklist_item';
  entity_id: string;
  checklist_id?: string;
  checklist_item_id?: string;
  document_type?: DocumentType;

  // Status
  status: 'pending' | 'verified' | 'rejected';
  verified_by_id?: string;
  verified_by_name?: string;
  verified_at?: string;
  rejection_reason?: string;

  // Storage
  base64_data?: string;  // For localStorage

  // Metadata
  uploaded_at: string;
  updated_at: string;
  tags?: string[];
  notes?: string;
}
```

```typescript
// types/temp-access.ts

export interface TempAccessToken {
  id: string;
  token: string;  // UUID

  // Association
  checklist_id: string;
  family_id: string;
  family_name: string;
  client_email: string;

  // Permissions
  allowed_actions: ('upload' | 'view' | 'download')[];
  max_upload_size_mb: number;

  // Lifecycle
  created_at: string;
  expires_at: string;
  last_accessed_at?: string;
  access_count: number;
  is_active: boolean;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
}
```

### Meeting Notes System

```typescript
// types/meeting-notes.ts

export type MeetingType =
  | 'onboarding'
  | 'review'
  | 'planning'
  | 'adhoc'
  | 'follow_up'
  | 'complaint'
  | 'annual_review';

export type MeetingStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface ActionItem {
  id: string;
  description: string;
  assigned_to_id?: string;
  assigned_to_name: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  completed_at?: string;
  reminder_id?: string;  // Link to auto-generated reminder
}

export interface MeetingNote {
  id: string;

  // Basic info
  title: string;
  meeting_type: MeetingType;
  meeting_date: string;
  meeting_duration_minutes?: number;
  location?: string;

  // Association
  family_id: string;
  family_name: string;

  // Content
  discussion_points: string[];
  decisions_made: string[];
  action_items: ActionItem[];
  internal_notes?: string;           // HIDDEN from clients
  client_visible_summary: string;    // VISIBLE to clients

  // Privacy control
  is_internal: boolean;              // If true, entire note hidden
  client_can_view: boolean;          // Override: show summary

  // Status
  status: MeetingStatus;

  // Follow-up
  next_meeting_date?: string;
  next_meeting_reminder_id?: string;

  // Metadata
  created_by_id: string;
  created_by_name: string;
  created_by_role: 'admin' | 'rm';
  created_at: string;
  updated_at: string;

  tags?: string[];
}
```

```typescript
// types/communication-timeline.ts

export type TimelineItemType =
  | 'meeting_note'
  | 'message'
  | 'reminder'
  | 'document_upload'
  | 'onboarding_milestone'
  | 'system_event';

export interface TimelineItem {
  id: string;
  item_type: TimelineItemType;
  item_id: string;  // Original item ID

  // Common fields
  family_id: string;
  family_name: string;
  title: string;
  summary: string;

  // Privacy
  is_internal: boolean;
  client_can_view: boolean;

  // Context
  created_by_id: string;
  created_by_name: string;
  created_by_role: 'admin' | 'rm' | 'family';
  created_at: string;

  // Type-specific data
  metadata?: Record<string, any>;
}
```

### Reminder System

```typescript
// types/reminders.ts (extended from reference)

export type TriggerType =
  | 'document_uploaded'
  | 'checklist_completed'
  | 'meeting_action_item'
  | 'onboarding_milestone'
  | 'manual';

export interface Reminder {
  id: string;

  // Content
  title: string;
  description?: string;

  // Context
  context_type: 'family' | 'task' | 'compliance' | 'document' | 'goal' | 'general';
  context_id?: string;
  family_id?: string;
  family_name?: string;

  // Assignment
  created_by: string;
  created_by_name: string;
  assigned_to: string;
  assigned_to_name: string;

  // Scheduling
  due_date: string;
  reminder_time?: string;

  // Recurrence
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  parent_reminder_id?: string;

  // Snooze
  snoozed_until?: string;
  snooze_count: number;

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'snoozed';
  completed_at?: string;
  completed_by?: string;

  // Priority
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Auto-generation
  auto_generated: boolean;
  trigger_id?: string;
  trigger_type?: TriggerType;
  trigger_context_id?: string;

  // Email notification
  email_sent: boolean;
  email_sent_at?: string;

  // Metadata
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderTrigger {
  id: string;
  trigger_type: TriggerType;
  trigger_event: string;
  title_template: string;
  description_template?: string;
  assign_to: 'rm' | 'admin' | 'specific_user';
  specific_user_id?: string;
  delay_hours: number;
  due_date_offset_hours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_at: string;
  created_by_id: string;
}
```

---

## Service Layer Architecture

### Storage Abstraction Layer

```typescript
// lib/storage/localStorage.ts (copy from reference)

export class LocalStorageService {
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }
}
```

### Storage Keys

```typescript
export const STORAGE_KEYS = {
  USERS: 'nrp_users',
  CHECKLISTS: 'nrp_checklists',
  DOCUMENTS: 'nrp_documents',
  TEMP_TOKENS: 'nrp_temp_tokens',
  MEETING_NOTES: 'nrp_meeting_notes',
  REMINDERS: 'nrp_reminders',
  MESSAGES: 'nrp_messages',
  SETTINGS: 'nrp_settings',
};
```

### Checklist Service

```typescript
// lib/services/checklist-service.ts

export class ChecklistService {
  /**
   * Create checklist from template
   */
  static createFromTemplate(
    familyId: string,
    familyName: string,
    clientType: 'individual' | 'huf',
    serviceType: 'nrp_light' | 'nrp_360',
    kycAlreadyDone: boolean = false
  ): OnboardingChecklist {
    // Generate items based on template
    // Apply conditional logic
    // Save to storage
  }

  /**
   * Apply conditional logic to show/hide items
   */
  static applyConditionalLogic(
    checklist: OnboardingChecklist
  ): OnboardingChecklist {
    checklist.items.forEach(item => {
      if (item.conditional_on) {
        const fieldValue = checklist[item.conditional_on.field];
        const showItem = (fieldValue === item.conditional_on.value) === item.conditional_on.if_true;

        if (!showItem) {
          item.status = 'not_required';
        }
      }
    });

    return checklist;
  }

  /**
   * Update item status
   */
  static updateItemStatus(
    checklistId: string,
    itemId: string,
    status: DocumentStatus,
    notes?: string
  ): boolean {
    // Update item
    // Recalculate progress
    // Trigger reminders if needed
  }

  /**
   * Calculate progress
   */
  static calculateProgress(checklist: OnboardingChecklist): {
    total: number;
    completed: number;
    verified: number;
    percentage: number;
  } {
    const required = checklist.items.filter(
      item => item.status !== 'not_required'
    );

    const completed = required.filter(
      item => item.status === 'pending' || item.status === 'verified'
    );

    const verified = required.filter(
      item => item.status === 'verified'
    );

    return {
      total: required.length,
      completed: completed.length,
      verified: verified.length,
      percentage: Math.round((verified.length / required.length) * 100)
    };
  }
}
```

### Document Service

```typescript
// lib/services/document-service.ts

export class DocumentService {
  /**
   * Upload document
   */
  static async uploadDocument(
    file: File,
    checklistId: string,
    checklistItemId: string,
    uploadedById: string,
    uploadedByRole: 'admin' | 'rm' | 'family' | 'temp_client'
  ): Promise<DocumentMetadata> {
    // Convert file to base64
    const base64 = await this.fileToBase64(file);

    // Create document metadata
    const doc: DocumentMetadata = {
      id: `doc-${Date.now()}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      uploaded_by_id: uploadedById,
      uploaded_by_role: uploadedByRole,
      checklist_id: checklistId,
      checklist_item_id: checklistItemId,
      status: 'pending',
      base64_data: base64,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to storage
    const documents = documentStorage.getAll();
    documents.push(doc);
    documentStorage.save(documents);

    // Update checklist item status
    ChecklistService.updateItemStatus(checklistId, checklistItemId, 'pending');

    // Trigger reminder for admin
    ReminderAutomationService.onDocumentUploaded(
      checklistId,
      checklistItemId,
      uploadedById
    );

    return doc;
  }

  /**
   * Convert file to base64
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Verify document
   */
  static verifyDocument(
    docId: string,
    verifiedById: string,
    verifiedByName: string
  ): boolean {
    // Update document status
    // Update checklist item
    // Check if checklist complete → trigger reminder
  }

  /**
   * Reject document
   */
  static rejectDocument(
    docId: string,
    rejectedById: string,
    reason: string
  ): boolean {
    // Update document status
    // Update checklist item to 'required'
    // Notify client
  }
}
```

### Meeting Note Service with Privacy Controls

```typescript
// lib/services/meeting-note-service.ts

export class MeetingNoteService {
  /**
   * Apply privacy filter
   */
  static applyPrivacyFilter(
    note: MeetingNote,
    userRole: 'admin' | 'rm' | 'family',
    userId: string
  ): MeetingNote | null {
    // Rule 1: Admin and RM see everything
    if (userRole === 'admin' || userRole === 'rm') {
      return note;
    }

    // Rule 2: Hide fully internal notes
    if (note.is_internal && !note.client_can_view) {
      return null;
    }

    // Rule 3: Show summary only
    if (note.is_internal && note.client_can_view) {
      return {
        ...note,
        discussion_points: [],
        decisions_made: [],
        internal_notes: undefined,
        action_items: note.action_items.filter(
          item => item.assigned_to_id === userId
        )
      };
    }

    // Rule 4: Filter action items
    return {
      ...note,
      internal_notes: undefined,
      action_items: note.action_items.filter(
        item => item.assigned_to_id === userId
      )
    };
  }

  /**
   * Get meeting notes for family
   */
  static getMeetingNotes(
    familyId: string,
    userRole: 'admin' | 'rm' | 'family',
    userId: string
  ): MeetingNote[] {
    const allNotes = meetingStorage.getByFamily(familyId);

    return allNotes
      .map(note => this.applyPrivacyFilter(note, userRole, userId))
      .filter(note => note !== null) as MeetingNote[];
  }

  /**
   * Convert action item to reminder
   */
  static convertActionToReminder(
    meetingId: string,
    actionItemId: string,
    currentUserId: string
  ): Reminder {
    const meeting = meetingStorage.getById(meetingId);
    const actionItem = meeting?.action_items.find(a => a.id === actionItemId);

    if (!meeting || !actionItem) {
      throw new Error('Meeting or action item not found');
    }

    const reminder = ReminderAutomationService.onActionItemCreated(
      meetingId,
      actionItem
    );

    // Link reminder to action item
    actionItem.reminder_id = reminder.id;
    meetingStorage.update(meetingId, meeting);

    return reminder;
  }
}
```

### Reminder Automation Service

```typescript
// lib/services/reminder-automation-service.ts

export class ReminderAutomationService {
  /**
   * Document uploaded trigger
   */
  static onDocumentUploaded(
    checklistId: string,
    itemId: string,
    uploadedBy: string
  ): Reminder {
    const checklist = checklistStorage.getById(checklistId);
    const item = checklist?.items.find(i => i.id === itemId);

    if (!checklist || !item) {
      throw new Error('Checklist or item not found');
    }

    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: `Verify document: ${item.display_name}`,
      description: `${checklist.family_name} uploaded ${item.display_name}. Please review and verify.`,
      context_type: 'document',
      context_id: itemId,
      family_id: checklist.family_id,
      family_name: checklist.family_name,
      created_by: 'system',
      created_by_name: 'System',
      assigned_to: 'admin',  // Get from settings
      assigned_to_name: 'Admin',
      due_date: addHours(new Date(), 24).toISOString(),
      is_recurring: false,
      snooze_count: 0,
      status: 'pending',
      priority: 'high',
      auto_generated: true,
      trigger_type: 'document_uploaded',
      trigger_context_id: checklistId,
      email_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    reminderStorage.create(reminder);
    return reminder;
  }

  /**
   * Checklist completed trigger
   */
  static onChecklistCompleted(
    checklistId: string,
    familyId: string
  ): Reminder {
    const checklist = checklistStorage.getById(checklistId);

    if (!checklist) {
      throw new Error('Checklist not found');
    }

    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: `Complete onboarding for ${checklist.family_name}`,
      description: `All documents verified. Complete final onboarding steps and grant full access.`,
      context_type: 'family',
      context_id: checklistId,
      family_id: familyId,
      family_name: checklist.family_name,
      created_by: 'system',
      created_by_name: 'System',
      assigned_to: checklist.assigned_rm_id || 'rm',
      assigned_to_name: 'RM',
      due_date: addDays(new Date(), 2).toISOString(),
      is_recurring: false,
      snooze_count: 0,
      status: 'pending',
      priority: 'high',
      auto_generated: true,
      trigger_type: 'checklist_completed',
      trigger_context_id: checklistId,
      email_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    reminderStorage.create(reminder);
    return reminder;
  }

  /**
   * Meeting action item trigger
   */
  static onActionItemCreated(
    meetingId: string,
    actionItem: ActionItem
  ): Reminder {
    const meeting = meetingStorage.getById(meetingId);

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: actionItem.description,
      description: `Action item from meeting: ${meeting.title}`,
      context_type: 'task',
      context_id: meetingId,
      family_id: meeting.family_id,
      family_name: meeting.family_name,
      created_by: meeting.created_by_id,
      created_by_name: meeting.created_by_name,
      assigned_to: actionItem.assigned_to_id || 'rm',
      assigned_to_name: actionItem.assigned_to_name,
      due_date: actionItem.due_date || addDays(new Date(), 7).toISOString(),
      is_recurring: false,
      snooze_count: 0,
      status: 'pending',
      priority: actionItem.priority,
      auto_generated: true,
      trigger_type: 'meeting_action_item',
      trigger_context_id: meetingId,
      email_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    reminderStorage.create(reminder);
    return reminder;
  }
}
```

---

## Component Architecture

### File Upload Component

```tsx
// components/documents/FileUploadZone.tsx

import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // MB
  maxFiles?: number;
}

export function FileUploadZone({
  onFileSelect,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10,
  maxFiles = 5
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    // Validate file size
    const validFiles = selectedFiles.filter(file =>
      file.size <= maxSize * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      alert(`Some files exceed ${maxSize}MB and were not added`);
    }

    setFiles(validFiles);
    onFileSelect(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              {accept} (Max {maxSize}MB per file)
            </p>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <File className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Checklist Master Dashboard

```tsx
// components/onboarding/ChecklistMaster.tsx

import { useState, useEffect } from 'react';
import { ChecklistCard } from './ChecklistCard';
import { ChecklistService } from '@/lib/services/checklist-service';
import { OnboardingChecklist } from '@/types/onboarding-checklist';

export function ChecklistMaster() {
  const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadChecklists();
  }, [filter]);

  const loadChecklists = () => {
    const all = ChecklistService.getAll();

    if (filter === 'pending') {
      setChecklists(all.filter(c => c.completion_percentage < 100));
    } else if (filter === 'completed') {
      setChecklists(all.filter(c => c.completion_percentage === 100));
    } else {
      setChecklists(all);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Onboarding Checklists</h1>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            All ({checklists.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${
              filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded ${
              filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklists.map(checklist => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onUpdate={loadChecklists}
          />
        ))}
      </div>

      {checklists.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No checklists found
        </div>
      )}
    </div>
  );
}
```

---

## Integration Points

### 1. Onboarding → Reminders

**Trigger Point:** Document Upload

```typescript
// In document-service.ts

static async uploadDocument(...) {
  const doc = await upload();

  // Trigger reminder
  ReminderAutomationService.onDocumentUploaded(
    checklistId,
    documentType,
    uploadedBy
  );

  return doc;
}
```

**Trigger Point:** Checklist Complete

```typescript
// In checklist-service.ts

static updateItemStatus(...) {
  // Update item
  updateItem();

  // Check if 100% complete
  const progress = this.calculateProgress(checklist);
  if (progress.percentage === 100) {
    ReminderAutomationService.onChecklistCompleted(
      checklistId,
      familyId
    );
  }
}
```

### 2. Meeting Notes → Reminders

**Trigger Point:** Action Item Created

```typescript
// In meeting-note-service.ts

static addActionItem(meetingId: string, actionItem: ActionItem) {
  // Add to meeting
  meeting.action_items.push(actionItem);
  meetingStorage.update(meetingId, meeting);

  // Auto-create reminder if due date set
  if (actionItem.due_date) {
    const reminder = ReminderAutomationService.onActionItemCreated(
      meetingId,
      actionItem
    );

    // Link reminder back
    actionItem.reminder_id = reminder.id;
    meetingStorage.update(meetingId, meeting);
  }
}
```

### 3. Timeline Aggregation

**Combine Multiple Sources:**

```typescript
// In timeline-service.ts

static getTimeline(
  familyId: string,
  userRole: 'admin' | 'rm' | 'family',
  userId: string
): TimelineItem[] {
  // Get all items
  const meetings = MeetingNoteService.getMeetingNotes(familyId, userRole, userId);
  const documents = DocumentService.getByFamily(familyId);
  const reminders = ReminderService.getByFamily(familyId);

  // Convert to timeline items
  const timelineItems: TimelineItem[] = [
    ...meetings.map(m => this.meetingToTimelineItem(m)),
    ...documents.map(d => this.documentToTimelineItem(d)),
    ...reminders.map(r => this.reminderToTimelineItem(r))
  ];

  // Sort by date descending
  return timelineItems.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/checklist-service.test.ts

describe('ChecklistService', () => {
  it('should create checklist from template', () => {
    const checklist = ChecklistService.createFromTemplate(
      'fam-1',
      'Smith Family',
      'individual',
      'nrp_light',
      false
    );

    expect(checklist.items.length).toBeGreaterThan(0);
    expect(checklist.family_id).toBe('fam-1');
  });

  it('should hide KYC documents when kyc_already_done is true', () => {
    const checklist = ChecklistService.createFromTemplate(
      'fam-1',
      'Smith Family',
      'individual',
      'nrp_light',
      true  // KYC already done
    );

    const panCard = checklist.items.find(i => i.document_type === 'pan_card');
    expect(panCard?.status).toBe('not_required');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/onboarding-flow.test.ts

describe('Onboarding Flow', () => {
  it('should complete full onboarding flow', async () => {
    // 1. Create checklist
    const checklist = ChecklistService.createFromTemplate(...);

    // 2. Generate temp token
    const token = TempAccessService.generateToken(checklist.id);

    // 3. Upload document
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const doc = await DocumentService.uploadDocument(
      file,
      checklist.id,
      checklist.items[0].id,
      'user-1',
      'temp_client'
    );

    // 4. Verify reminder created
    const reminders = ReminderService.getByChecklist(checklist.id);
    expect(reminders.length).toBeGreaterThan(0);

    // 5. Verify document
    DocumentService.verifyDocument(doc.id, 'admin-1', 'Admin');

    // 6. Check progress
    const updatedChecklist = ChecklistService.getById(checklist.id);
    expect(updatedChecklist.completion_percentage).toBeGreaterThan(0);
  });
});
```

### Manual Testing Checklist

**Onboarding Flow:**
- [ ] Create checklist with KYC not done → all items required
- [ ] Create checklist with KYC done → PAN/Aadhaar hidden
- [ ] Generate temp access token
- [ ] Access temp portal with token
- [ ] Upload document via temp portal
- [ ] Verify admin receives reminder
- [ ] Admin verifies document
- [ ] Progress bar updates correctly
- [ ] All items verified → RM receives completion reminder

**Meeting Notes Flow:**
- [ ] Create meeting note with internal notes
- [ ] Add action items
- [ ] Login as client → verify internal notes hidden
- [ ] Login as client → verify action items filtered
- [ ] Convert action item to reminder
- [ ] Verify reminder created with correct due date
- [ ] Timeline shows meeting + action items

**Reminder Flow:**
- [ ] Manual reminder creation
- [ ] Document upload → reminder created
- [ ] Checklist complete → reminder created
- [ ] Meeting action → reminder created
- [ ] Snooze reminder
- [ ] Complete reminder
- [ ] Recurring reminder creates next occurrence

---

## Next Steps

1. ✅ Create this implementation guide
2. Initialize Next.js project
3. Follow phase-by-phase implementation
4. Test each feature thoroughly
5. Integrate all features
6. Final testing and bug fixes

**Current Status:** Implementation guide created, ready to begin Phase 1.

**Estimated Timeline:** 12-14 days for full implementation.

---

## Notes

- All file paths are relative to project root: `/Users/aayush-mac/techpix/NRP/nrp-crm/nrp-crm`
- Reference project available at: `/Users/aayush-mac/techpix/NRP/nrp-cfo-ptoto`
- Using localStorage for MVP, ready for Supabase migration
- Privacy controls are critical - test thoroughly
- Auto-trigger integration must be bulletproof

---

**Document Version:** 1.0
**Last Updated:** 2026-01-20
**Author:** Claude Code
