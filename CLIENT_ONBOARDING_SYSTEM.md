# NRP CRM - Self-Service Client Onboarding System

**Version:** 1.0
**Last Updated:** February 3, 2026
**Status:** Phase 1 & 2 Complete (Backend + Admin UI)

---

## Table of Contents
1. [Overview](#overview)
2. [Current Implementation](#current-implementation)
3. [System Architecture](#system-architecture)
4. [Admin User Guide](#admin-user-guide)
5. [Client Experience (Planned)](#client-experience-planned)
6. [Future Work](#future-work)
7. [Technical Documentation](#technical-documentation)
8. [API Reference](#api-reference)

---

## Overview

### Problem Statement
Previously, client onboarding required admins to manually fill out 15+ fields for each new client. The onboarding checklist system was disconnected from client creation, leading to fragmented workflows.

### Solution
A **self-service client onboarding system** where:
- Admins only need to enter a client's **email address**
- Clients receive a **magic link** to complete onboarding themselves
- Clients fill out all forms and upload documents via a multi-step wizard
- System automatically creates client records and onboarding checklists
- Clients can be activated with **warning badges** for pending items

### Key Benefits
- **90% reduction** in admin data entry time
- **Self-service** client experience
- **Automatic integration** between invitations, clients, and checklists
- **Flexible activation** with warning indicators
- **Token-based security** with expiration

---

## Current Implementation

### ✅ Phase 1: Foundation (Complete)

**Files Created:**
1. `types/client-invitation.ts` - Type definitions
2. `lib/storage/invitation-storage.ts` - Data persistence
3. `lib/services/client-invitation-service.ts` - Business logic
4. `lib/services/onboarding-form-service.ts` - Form management

**Capabilities:**
- ✅ Invitation creation with unique tokens
- ✅ Token generation (secure, unique, time-limited)
- ✅ Token validation (expiry, revocation checking)
- ✅ Progress auto-save functionality
- ✅ Document upload handling
- ✅ Form validation per step
- ✅ Statistics and analytics
- ✅ localStorage persistence

### ✅ Phase 2: Admin Interface (Complete)

**Files Created/Modified:**
1. `components/clients/ClientInviteDialog.tsx` - Invitation dialog
2. `app/admin/clients/page.tsx` - Updated admin page

**Features:**
- ✅ Simple email-only invitation form
- ✅ Optional RM assignment
- ✅ Configurable expiry period (7/14/30/60 days)
- ✅ Automatic link generation
- ✅ Copy-to-clipboard functionality
- ✅ Mock email notification
- ✅ Primary "Invite Client" button
- ✅ Secondary "Manual Entry" option

### 🔄 Phase 3: Client Onboarding Portal (Pending)

**Files to Create:**
1. `app/client/onboarding/layout.tsx` - Public layout
2. `app/client/onboarding/[token]/page.tsx` - Main wizard
3. `components/onboarding/OnboardingProgressBar.tsx` - Progress indicator
4. `components/onboarding/OnboardingStepWrapper.tsx` - Step container
5. Step-specific components (7 steps)
6. Success/error pages

### 🔄 Phase 4: Warning System (Pending)

**Files to Create:**
1. `lib/services/client-warning-service.ts` - Warning logic
2. `components/clients/ClientWarningBadges.tsx` - Badge display

### 🔄 Phase 5: Integration (Pending)

**Tasks:**
- Link invitation completion to client creation
- Connect to checklist system
- Document linking
- End-to-end testing

---

## System Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CREATES INVITATION                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin Dashboard (/admin/clients)                           │
│    └─> Click "Invite Client"                               │
│        └─> Enter email only                                │
│        └─> Optional: Assign RM, Set expiry                 │
│        └─> Click "Send Invitation"                         │
│            └─> ClientInvitationService.createInvitation()  │
│                ├─> Generate unique token                   │
│                ├─> Set expiry date                         │
│                ├─> Save to localStorage                    │
│                └─> Return magic link                       │
│                                                             │
│  Result:                                                    │
│    - Invitation record created                              │
│    - Token: inv_1738564832_abc123xyz                       │
│    - Link: /client/onboarding/{token}                      │
│    - Status: pending                                        │
│    - Expires: 14 days from now                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                         ↓
                  (Link shared via email)
                         ↓

┌─────────────────────────────────────────────────────────────┐
│               CLIENT COMPLETES ONBOARDING                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Client clicks link → /client/onboarding/{token}           │
│                                                             │
│  Step 1: Welcome & Token Validation                         │
│    ├─> ClientInvitationService.validateToken()            │
│    ├─> Check: not expired, not revoked, not completed     │
│    └─> Mark as 'in_progress'                              │
│                                                             │
│  Step 2-6: Multi-Step Form                                 │
│    ├─> Auto-save every 2 seconds                          │
│    ├─> OnboardingFormService.saveProgress()               │
│    ├─> Validate on next/submit                            │
│    └─> Upload documents                                    │
│                                                             │
│  Step 7: Review & Submit                                    │
│    └─> ClientInvitationService.completeInvitation()       │
│        ├─> ClientService.create() → Create client         │
│        ├─> ChecklistService.create() → Create checklist   │
│        ├─> Link uploaded documents                         │
│        ├─> Update invitation status: 'completed'          │
│        └─> Clean up progress data                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                         ↓
               (Client & Checklist Created)
                         ↓

┌─────────────────────────────────────────────────────────────┐
│                ADMIN REVIEWS & ACTIVATES                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin sees notification: "New onboarding submitted"        │
│    └─> Open client record (auto-created)                  │
│        ├─> Status: "onboarding"                           │
│        ├─> Warning badges: KYC pending, Docs need verify  │
│        └─> Open linked checklist                          │
│                                                             │
│  Admin verifies documents                                   │
│    ├─> Review uploaded PAN, Aadhaar, etc.                │
│    ├─> Verify or reject each item                        │
│    └─> All verified → Clear warnings                     │
│                                                             │
│  Admin activates client                                     │
│    ├─> Update status to "active"                         │
│    ├─> Grant full portal access                          │
│    └─> Send welcome email (future)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (localStorage)

**Collection: `nrp_crm_invitations`**
```typescript
{
  id: "inv-123",
  email: "client@example.com",
  token: "inv_1738564832_abc123xyz",
  status: "pending" | "in_progress" | "completed" | "expired",
  created_by_id: "admin-1",
  created_at: "2026-02-03T...",
  expires_at: "2026-02-17T...",
  accepted_at: "2026-02-05T...", // When clicked
  completed_at: "2026-02-06T...", // When submitted
  client_id: "client-456", // Created client
  checklist_id: "checklist-789", // Created checklist
  access_count: 3,
  revoked: false
}
```

**Collection: `nrp_crm_onboarding_progress`**
```typescript
{
  token: "inv_1738564832_abc123xyz",
  current_step: 3,
  total_steps: 7,
  form_data: {
    family_name: "Sharma Family",
    primary_contact_name: "Rajesh Sharma",
    // ... partial data
  },
  last_saved_at: "2026-02-05T...",
  completed_steps: [1, 2]
}
```

**Collection: `nrp_crm_onboarding_documents`**
```typescript
{
  id: "doc-123",
  token: "inv_1738564832_abc123xyz",
  document_type: "pan_card",
  file_name: "pan.pdf",
  file_size: 245678,
  file_type: "application/pdf",
  file_data: "data:application/pdf;base64,...",
  uploaded_at: "2026-02-05T..."
}
```

---

## Admin User Guide

### How to Invite a New Client

**Step 1: Navigate to Clients**
1. Log in as Admin (username: `admin`, password: `admin123`)
2. Click "Clients" in the sidebar
3. You'll see the client management page

**Step 2: Create Invitation**
1. Click the **"Invite Client"** button (blue, primary)
2. Enter the client's email address
3. (Optional) Assign a Relationship Manager
4. (Optional) Change expiry period (default: 14 days)
5. Click **"Send Invitation"**

**Step 3: Share the Link**
1. System shows success message
2. Invitation link is displayed
3. Click the **copy icon** to copy the link
4. Share via:
   - Email (manually for now)
   - SMS
   - WhatsApp
   - Any other channel

**Step 4: Track Invitation Status**
- View invitation list at `/admin/clients/invitations` (future)
- Monitor status:
  - **Pending**: Not clicked yet
  - **In Progress**: Client started but didn't finish
  - **Completed**: Client submitted onboarding
  - **Expired**: Link expired
  - **Revoked**: Manually cancelled

### Manual Client Entry (Alternative)

For edge cases where self-service isn't suitable:
1. Click **"Manual Entry"** button (outline, secondary)
2. Fill out the complete client form (15+ fields)
3. System creates client immediately
4. Manually create checklist if needed

Use cases for manual entry:
- Client doesn't have email
- Offline onboarding
- Urgent setup needed
- Data migration from old system

### Managing Invitations

**Resend Invitation:**
- If client lost the link
- Generates new token, extends expiry

**Revoke Invitation:**
- If client no longer interested
- If sent to wrong email
- Security concern

**Check Statistics:**
```typescript
ClientInvitationService.getStats()
// Returns:
{
  total: 50,
  pending: 15,
  in_progress: 5,
  completed: 25,
  expired: 3,
  revoked: 2,
  completion_rate: 50, // percentage
  average_time_to_complete: 3 // days
}
```

---

## Client Experience (Planned)

### Onboarding Journey (7 Steps)

**URL:** `https://your-domain.com/client/onboarding/{token}`

**Step 1: Welcome**
- NRP branding and logo
- Welcome message
- Estimated time: 10-15 minutes
- "Get Started" button

**Step 2: Basic Information**
- Family name
- Your full name
- Phone number
- Auto-save enabled

**Step 3: Address Details**
- Street address
- City, State, Pincode
- Auto-complete suggestions (future)

**Step 4: Service Selection**
- **NRP Light** vs **NRP 360** comparison cards
- Clear pricing and features
- "Already completed KYC?" checkbox
- Conditional document list updates

**Step 5: Family Members** (Optional)
- Add spouse, children, parents
- Name, relationship, contact info
- Can skip if not applicable

**Step 6: Document Upload**
- Drag-and-drop interface
- Required documents (conditional):
  - If KYC not done: PAN Card, Aadhaar Card
  - Always: Cancelled Cheque, Bank Statement
  - Optional: Income Proof
- File validation:
  - Max size: 10MB per file
  - Allowed: PDF, JPG, PNG, DOC, DOCX
- Preview uploaded files
- Delete and re-upload capability

**Step 7: Review & Submit**
- Summary of all information
- Edit links to go back to any step
- Checkbox: "I confirm this information is accurate"
- **"Submit Onboarding"** button
- Success page with next steps

### Progress Features

**Auto-Save:**
- Saves every 2 seconds automatically
- "Progress saved" toast notification
- Can close and return later

**Progress Bar:**
- Visual indicator: 7 steps
- Shows current step
- Completed steps marked green
- Percentage: X% Complete

**Validation:**
- Real-time field validation
- Can't proceed with errors
- Clear error messages
- Required fields marked with *

**Security:**
- Token-based access (no login required)
- Time-limited (expires after 14 days)
- Single-use (can't resubmit)
- Revocable by admin

---

## Future Work

### Priority 1: Complete Client Portal (Sprint 3)

**Estimated Time:** 2-3 days

**Tasks:**
1. Create public onboarding layout
   - File: `app/client/onboarding/layout.tsx`
   - Minimal header with NRP logo
   - No sidebar/navigation
   - Progress bar at top
   - Responsive design

2. Build OnboardingProgressBar component
   - File: `components/onboarding/OnboardingProgressBar.tsx`
   - 7-step visual indicator
   - Current step highlight
   - Completed steps checkmark
   - Percentage display

3. Create main wizard orchestrator
   - File: `app/client/onboarding/[token]/page.tsx`
   - Step state management
   - Navigation (Back/Next)
   - Auto-save integration
   - Form data consolidation

4. Build individual step components:
   - `WelcomeStep.tsx` - Token validation, branding
   - `BasicInfoStep.tsx` - Name, phone fields
   - `AddressStep.tsx` - Address form
   - `ServiceSelectionStep.tsx` - NRP Light/360 cards
   - `FamilyMembersStep.tsx` - Dynamic family member form
   - `DocumentUploadStep.tsx` - File upload interface
   - `ReviewSubmitStep.tsx` - Summary view

5. Create success/error pages
   - `app/client/onboarding/success/page.tsx`
   - `app/client/onboarding/expired/page.tsx`

**Acceptance Criteria:**
- [ ] Client can access via magic link
- [ ] All 7 steps functional
- [ ] Auto-save works (debounced 2s)
- [ ] Form validation on each step
- [ ] Document upload with validation
- [ ] Progress saves and restores
- [ ] Mobile responsive
- [ ] Success page on completion

### Priority 2: Warning System (Sprint 4)

**Estimated Time:** 1 day

**Tasks:**
1. Create ClientWarningService
   - File: `lib/services/client-warning-service.ts`
   - Calculate warnings per client
   - Warning types: KYC pending, documents missing, onboarding incomplete
   - Severity levels: low, medium, high, critical

2. Build warning badge components
   - File: `components/clients/ClientWarningBadges.tsx`
   - Color-coded badges
   - Tooltips with details
   - Click to view checklist
   - Count indicators

3. Integrate into views
   - Add warning column to admin clients table
   - Show warnings in client detail dialog
   - Display on RM client cards
   - Dashboard alert widget

**Acceptance Criteria:**
- [ ] Warnings calculated correctly
- [ ] Badges display on all client views
- [ ] Color coding by severity
- [ ] Clickable to view details
- [ ] Admin can activate despite warnings
- [ ] Warning count updates real-time

### Priority 3: Email Integration

**Estimated Time:** 2 days

**Tasks:**
1. Choose email service provider
   - Options: SendGrid, AWS SES, Mailgun, Resend
   - Set up API credentials
   - Configure DNS (SPF, DKIM)

2. Create email templates
   - Invitation email (HTML + plain text)
   - Reminder email (3 days before expiry)
   - Completion confirmation
   - Welcome email (on activation)

3. Implement sending
   - Replace mock email with real sending
   - Track delivery status
   - Handle bounces/failures
   - Retry logic

4. Add email tracking
   - Opened: Pixel tracking
   - Clicked: Link tracking
   - Display in admin dashboard

**Acceptance Criteria:**
- [ ] Emails send successfully
- [ ] Templates branded with NRP logo
- [ ] Track open/click rates
- [ ] Handle errors gracefully
- [ ] Configurable from admin panel

### Priority 4: Invitation Management Dashboard

**Estimated Time:** 1 day

**File:** `app/admin/clients/invitations/page.tsx`

**Features:**
- Table of all invitations
- Columns: Email, Status, Created, Expires, Actions
- Filters: Status, Date range, RM
- Search by email
- Bulk actions: Resend, Revoke
- Statistics cards
- Export to CSV

**Acceptance Criteria:**
- [ ] View all invitations
- [ ] Filter and search
- [ ] Resend functionality
- [ ] Revoke functionality
- [ ] Copy link
- [ ] Stats dashboard

### Priority 5: Advanced Features

**Mobile App Integration:**
- Expo/React Native app
- Deep linking to onboarding
- Native document scanner
- Offline capability
- Push notifications

**Enhanced Onboarding:**
- Video KYC integration
- Aadhaar/PAN verification APIs
- Address auto-fill from Pincode
- Digital signature capture
- Prefill from LinkedIn/Google
- Multi-language support (Hindi, Tamil, etc.)

**Analytics Dashboard:**
- Conversion funnel visualization
- Drop-off analysis per step
- Time-to-complete trends
- A/B testing framework
- Cohort analysis

**Workflow Automation:**
- Auto-assign RM based on rules
- Trigger follow-up tasks
- Integration with calendar (schedule first meeting)
- Slack/Teams notifications
- Webhook support for external systems

---

## Technical Documentation

### File Structure

```
nrp-crm/
├── types/
│   └── client-invitation.ts          ✅ Created
│
├── lib/
│   ├── storage/
│   │   └── invitation-storage.ts     ✅ Created
│   │
│   └── services/
│       ├── client-invitation-service.ts   ✅ Created
│       ├── onboarding-form-service.ts     ✅ Created
│       └── client-warning-service.ts      🔄 Pending
│
├── components/
│   ├── clients/
│   │   ├── ClientInviteDialog.tsx         ✅ Created
│   │   └── ClientWarningBadges.tsx        🔄 Pending
│   │
│   └── onboarding/
│       ├── OnboardingProgressBar.tsx      🔄 Pending
│       ├── OnboardingStepWrapper.tsx      🔄 Pending
│       ├── ServiceSelectionCard.tsx       🔄 Pending
│       └── FamilyMemberForm.tsx           🔄 Pending
│
└── app/
    ├── admin/
    │   └── clients/
    │       ├── page.tsx                   ✅ Updated
    │       └── invitations/
    │           └── page.tsx               🔄 Pending
    │
    └── client/
        └── onboarding/
            ├── layout.tsx                 🔄 Pending
            ├── [token]/
            │   └── page.tsx               🔄 Pending
            ├── success/
            │   └── page.tsx               🔄 Pending
            └── expired/
                └── page.tsx               🔄 Pending
```

### Key Dependencies

```json
{
  "dependencies": {
    "next": "15.5.7",
    "react": "19.1.2",
    "date-fns": "^3.0.0",      // Date formatting
    "zod": "^3.22.0",          // Validation
    "sonner": "^1.3.0"         // Toast notifications
  }
}
```

### Environment Variables (Future)

```env
# Email Service
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@nrpwealth.com
FROM_NAME=NRP Wealth Management

# Base URL
NEXT_PUBLIC_BASE_URL=https://crm.nrpwealth.com

# Feature Flags
ENABLE_EMAIL_SENDING=true
ENABLE_SMS_INVITES=false
ENABLE_AUTO_REMINDERS=true

# Token Configuration
DEFAULT_INVITATION_EXPIRY_DAYS=14
MAX_DOCUMENT_SIZE_MB=10
```

---

## API Reference

### ClientInvitationService

```typescript
import { ClientInvitationService } from "@/lib/services/client-invitation-service";

// Create invitation
const invitation = ClientInvitationService.createInvitation(
  {
    email: "client@example.com",
    assigned_rm_id: "rm-1",
    expiry_days: 14,
  },
  "admin-1",      // createdById
  "Admin User"    // createdByName
);

// Validate token
const validation = ClientInvitationService.validateToken("inv_xxx");
if (validation.valid) {
  console.log("Invitation:", validation.invitation);
}

// Accept invitation (mark as in-progress)
ClientInvitationService.acceptInvitation("inv_xxx");

// Complete invitation (create client + checklist)
const result = ClientInvitationService.completeInvitation(
  "inv_xxx",
  {
    family_name: "Sharma Family",
    primary_contact_name: "Rajesh Sharma",
    primary_contact_phone: "+91 98765 43210",
    address: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    selected_service: "nrp_360",
    kyc_already_done: false,
  }
);
console.log("Created client:", result.client);
console.log("Created checklist:", result.checklist);

// Get statistics
const stats = ClientInvitationService.getStats();
console.log(`Completion rate: ${stats.completion_rate}%`);
console.log(`Avg time: ${stats.average_time_to_complete} days`);

// Revoke invitation
ClientInvitationService.revokeInvitation(
  "inv-123",
  "admin-1",
  "Client no longer interested"
);

// Generate URL
const url = ClientInvitationService.generateInvitationUrl(
  "inv_xxx",
  "https://crm.nrpwealth.com"
);
// Returns: https://crm.nrpwealth.com/client/onboarding/inv_xxx
```

### OnboardingFormService

```typescript
import { OnboardingFormService } from "@/lib/services/onboarding-form-service";

// Save progress (auto-save)
OnboardingFormService.saveProgress(
  "inv_xxx",    // token
  3,            // current step
  {             // partial form data
    family_name: "Sharma Family",
    primary_contact_name: "Rajesh",
  },
  [1, 2]        // completed steps
);

// Get progress
const progress = OnboardingFormService.getProgress("inv_xxx");
console.log(`Currently on step ${progress.current_step}`);

// Validate step
const validation = OnboardingFormService.validateStep(2, formData);
if (!validation.valid) {
  console.error("Errors:", validation.errors);
}

// Check if complete
const isComplete = OnboardingFormService.isOnboardingComplete(formData);

// Upload document
const document = await OnboardingFormService.uploadDocument(
  "inv_xxx",
  "pan_card",
  fileObject  // File from input
);

// Get completion percentage
const percentage = OnboardingFormService.getCompletionPercentage(formData);
console.log(`${percentage}% complete`);
```

---

## Testing Checklist

### Unit Tests
- [ ] Token generation is unique
- [ ] Token validation logic
- [ ] Expiry date calculation
- [ ] Form validation rules
- [ ] Document upload validation
- [ ] Statistics calculation

### Integration Tests
- [ ] Create invitation → Save to storage
- [ ] Validate token → Update access count
- [ ] Complete invitation → Create client + checklist
- [ ] Auto-save → Restore progress
- [ ] Document upload → Link to checklist

### E2E Tests
- [ ] Admin creates invitation
- [ ] Copy link works
- [ ] Client accesses link
- [ ] Token validation passes
- [ ] Form auto-saves
- [ ] All steps navigate correctly
- [ ] Documents upload successfully
- [ ] Submit creates client
- [ ] Admin sees new client
- [ ] Checklist is linked

### Security Tests
- [ ] Expired tokens rejected
- [ ] Revoked tokens rejected
- [ ] Completed tokens can't be reused
- [ ] File type validation works
- [ ] File size limits enforced
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## Support & Maintenance

### Monitoring

**Key Metrics:**
- Invitation creation rate
- Link click-through rate
- Step completion funnel
- Average time per step
- Document upload success rate
- Overall completion rate
- Error rates per step

**Alerts:**
- Expiry rate > 30%
- Completion rate < 50%
- Error rate > 5%
- Upload failures

### Troubleshooting

**Client can't access link:**
1. Check if token expired → Resend
2. Check if revoked → Create new
3. Check browser compatibility
4. Try incognito mode

**Auto-save not working:**
1. Check localStorage quota
2. Check network connectivity
3. Verify debounce timing
4. Check browser console for errors

**Document upload fails:**
1. Check file size (<10MB)
2. Check file type (PDF, JPG, PNG, DOC, DOCX only)
3. Check browser compatibility
4. Try different browser

---

## Changelog

### Version 1.0 (February 3, 2026)

**Added:**
- ✅ Complete invitation system backend
- ✅ Token generation and validation
- ✅ Auto-save functionality
- ✅ Document upload handling
- ✅ Admin invitation dialog
- ✅ Statistics and analytics
- ✅ localStorage persistence

**Pending:**
- 🔄 Client-facing onboarding wizard
- 🔄 Warning badge system
- 🔄 Email integration
- 🔄 Invitation management dashboard

---

## Contact

**Product Owner:** NRP Wealth Management
**Development Team:** [Your Team]
**Documentation:** This file (CLIENT_ONBOARDING_SYSTEM.md)
**Issues:** GitHub Issues / JIRA

---

**Last Updated:** February 3, 2026
**Next Review:** After Phase 3 completion
