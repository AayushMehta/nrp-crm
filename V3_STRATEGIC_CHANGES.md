# NRP CRM V3 - Strategic Realignment Guide

**Version:** 3.0
**Date:** February 13, 2026
**Status:** Planning - Ready for Implementation

---

## Executive Summary

This document outlines all changes required to align NRP CRM with the new strategic direction:

**Primary Objective:** Shift from a communication-focused CRM to an **operational efficiency platform** for task management and portfolio tracking.

**Key Changes:**
1. Add **Back Office** user role for operations team
2. Implement **Table-Based Task Management** for batch processing
3. Add **WhatsApp Integration** for task creation (mocked)
4. Implement **NSDL CAS PDF Parser** for portfolio bulk uploads
5. Add **Template Download System** for onboarding documents
6. Create **Saved Journeys** for different client types
7. Support **Multiple RMs + Back-Office** team structure

---

## Strategic Shift Overview

### FROM: Communication-Focused CRM
- Primary feature: Real-time messaging
- Focus: Client communication
- Use case: Messaging platform with portfolio view

### TO: Operational Efficiency Platform
- Primary feature: Task management & portfolio tracking
- Focus: Internal operations workflow
- Use case: Replace Excel sheets and phone calls with structured task system

---

## User Role Changes

### Current Roles (V2)
1. **Admin** - Full system access
2. **Relationship Manager (RM)** - Manages assigned families
3. **Family/Client** - Portfolio view, communications

### New Roles (V3)
1. **Admin** - Full system access, manages master document lists
2. **Relationship Manager (RM)** - Field-based, creates tasks via mobile, **multiple RMs can co-manage**
3. **Back Office** ⭐ NEW - Operations team, executes tasks (SIPs, STPs, etc.)
4. **Family/Client** - Portfolio view, onboarding, external communications

**Implementation Required:**
- Update `/types/auth.ts` - Add `back_office` to UserRole enum
- Add back_office sample users to `/data/mock/sample-users.ts`

---

## Team Structure Changes

### Current (V2): Single RM Assignment
- Each client has ONE assigned RM
- Tasks assigned to individual users
- RM sees only their assigned families

### New (V3): Multiple RMs + Back-Office Teams
- Each client has a **Team**: Multiple RMs + Multiple Back-Office members
- One primary RM (lead)
- Tasks assigned to the **Team** (not individuals)
- Any team member can pick up and complete tasks
- All team members can view/manage the client

**Implementation Required:**

**New Files:**
- `/types/teams.ts` - ClientTeam, TeamMember interfaces
- `/lib/services/team-service.ts` - Team management CRUD
- `/components/admin/TeamAssignmentPanel.tsx` - UI for assigning teams

**Modified Files:**
- `/types/family.ts` - Add `team?: ClientTeam` field
- `/app/admin/clients/page.tsx` - Add team selection in create client dialog

---

## Task Management Changes

### Current (V2): Kanban Board
- **UI**: 7-column Kanban board with drag-and-drop
- **View**: Status-based columns (Todo, In Progress, Done, etc.)
- **Assignment**: Individual users
- **Task Types**: Generic contexts (onboarding, compliance, document, meeting, general)
- **Use Case**: Visual workflow management

### New (V3): Table View + Kanban
- **UI**: **Table view** (primary for Back Office) + Kanban view (alternate)
- **View**: Sortable table with batch operations
- **Assignment**: Team-based
- **Task Types**: **Investment product types** (SIP, STP, SWP, Lumpsum, etc.) - 10 types
- **Use Case**: Batch processing for efficiency (e.g., execute all 15 pending SIPs at once)

**New Task Types:**
```typescript
type TaskType =
  | 'SIP'                    // Systematic Investment Plan
  | 'STP'                    // Systematic Transfer Plan
  | 'SWP'                    // Systematic Withdrawal Plan
  | 'Lumpsum'                // One-time investment
  | 'Fund Transfer'          // Transfer between funds
  | 'Redemption'             // Sell/redeem investment
  | 'Portfolio Review'       // Review client portfolio
  | 'Compliance'             // KYC, regulatory tasks
  | 'Documentation'          // Document collection
  | 'Other';                 // Ad-hoc tasks
```

**Table Features:**
- Columns: Task Type, Family, Status, Priority, Due Date, Team, Actions
- Sortable by: Task Type (for batch processing), Priority, Due Date
- Multi-select for batch operations
- Filters: Task Type, Status, Priority, Team, Date Range
- Batch actions: Update status, Reassign team, Mark complete

**Implementation Required:**

**New Files:**
- `/components/tasks/TaskTableView.tsx` - Table UI
- `/components/tasks/TaskFilterBar.tsx` - Filters and search
- `/components/tasks/TaskBatchActions.tsx` - Bulk update UI

**Modified Files:**
- `/types/tasks.ts` - Add TaskType enum, team fields, created_via field
- `/lib/services/task-service.ts` - Add team methods, bulk operations
- `/app/tasks/page.tsx` - Add view toggle (Table | Kanban)

**New Fields in Task Interface:**
```typescript
interface Task {
  // ... existing fields ...
  task_type: TaskType;              // NEW - Investment product type
  assigned_to_team?: string;        // NEW - Team ID
  assigned_to_team_name?: string;   // NEW - Team name
  team_members?: TeamMember[];      // NEW - Team member list
  created_via?: 'manual' | 'whatsapp' | 'system'; // NEW
}
```

---

## WhatsApp Integration (Mocked)

### Purpose
RMs in the field can send WhatsApp messages to create tasks instantly, without opening the app.

### Current (V2)
- No WhatsApp integration
- Tasks created manually via UI

### New (V3)
- **Mocked WhatsApp interface** (no real WebSocket)
- Parse WhatsApp messages to extract task details
- Auto-create tasks in system
- Tag tasks as WhatsApp-created

### Example Workflow
1. RM sends WhatsApp message: "Sharma Family - SIP - Urgent - 5000/month HDFC Balanced Fund"
2. System parses: Family=Sharma, TaskType=SIP, Priority=Urgent
3. Auto-creates task assigned to Sharma Family's team
4. Back Office sees task in table, executes it

**Implementation Required:**

**New Files:**
- `/types/whatsapp.ts` - WhatsAppMessage, ParsedTask interfaces
- `/lib/services/whatsapp-integration-service.ts` - Mocked parsing logic
- `/components/tasks/WhatsAppMockPanel.tsx` - Mock UI for testing

**Modified Files:**
- `/app/tasks/page.tsx` - Add "New Task via WhatsApp" button

**Storage:**
- localStorage key: `nrp_crm_whatsapp_messages` - Store mock messages

**Future (Real Implementation):**
- WhatsApp Web JS integration
- Real webhook endpoint
- NLP-based parsing

---

## Portfolio Management Changes

### Current (V2): Manual Entry
- Holdings added one-by-one via UI
- Mock data for demonstration
- Hard delete when removing holdings
- No bulk operations

### New (V3): NSDL Bulk Upload
- **PDF parsing** - Upload NSDL CAS (Consolidated Account Statement) PDF
- **Bulk import** - Parse and import all holdings at once
- **Upsert logic** - Match by ISIN/name, update if exists, create if new
- **Soft delete** - Mark missing holdings as "closed" (don't delete)
- **Historical tracking** - Preserve historical data

### NSDL Parser Features
1. Upload NSDL PDF
2. Parse PDF to JSON (extract holdings)
3. Match existing holdings by ISIN or scheme name
4. Update matched holdings (quantity, NAV, value)
5. Create new holdings if not found
6. Mark holdings not in new statement as "closed"

**Implementation Required:**

**New Files:**
- `/types/nsdl.ts` - NSDLData, NSDLHolding interfaces
- `/lib/services/nsdl-parser-service.ts` - PDF parsing logic
- `/components/portfolio/BulkUploadDialog.tsx` - Upload UI

**Modified Files:**
- `/types/portfolio.ts` - Add fields:
  ```typescript
  interface Holding {
    // ... existing fields ...
    isin?: string;              // NEW - ISIN code
    folio_number?: string;      // NEW - Folio number
    status: 'active' | 'closed'; // NEW - Status field
    closed_date?: string;       // NEW - Closure date
  }
  ```
- `/lib/services/portfolio-service.ts` - Add methods:
  - `bulkUpdateHoldings(portfolioId, holdings[])`
  - `upsertHolding(portfolioId, holding)` - Match by ISIN/name
  - `markHoldingClosed(holdingId, closedDate)` - Soft delete
- `/app/client/dashboard/page.tsx` - Add "Bulk Upload from NSDL" button

**Dependencies:**
```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

---

## Onboarding System Changes

### Current (V2): Token-Based Invitations
- Admin creates invitation with token (inv_xxx)
- Client completes 7-step wizard
- Document upload with base64 storage
- Single generic checklist for all client types

### New (V3): Enhanced Onboarding

#### Change 1: UID-Based Links
- Change from tokens to UID-based system
- More user-friendly URLs

#### Change 2: Admin-Controlled Master Document List
- **Current**: Static checklist hard-coded in template
- **New**: Admin can configure required documents via UI
- Create/edit document requirements
- Mark documents as requiring signature
- Define conditional logic

**Implementation Required:**
- Create admin page: `/app/admin/onboarding/master-documents/page.tsx`

#### Change 3: Template Download System
- **Purpose**: Clients download pre-filled templates, sign them, re-upload
- **Example**: Download PAN consent form template → Print → Sign → Scan → Re-upload

**Implementation Required:**

**New Files:**
- `/types/templates.ts` - Template interface
- `/lib/services/template-service.ts` - Template CRUD (S3 mocked as base64)
- `/components/onboarding/TemplateDownloadCard.tsx` - Download UI
- `/app/admin/onboarding/templates/page.tsx` - Admin template management

**Modified Files:**
- `/types/onboarding-checklist.ts` - Add fields:
  ```typescript
  interface ChecklistItem {
    // ... existing fields ...
    template_id?: string;           // NEW - Link to template
    requires_signature: boolean;    // NEW - Flag
  }
  ```
- `/components/onboarding/steps/DocumentUploadStep.tsx` - Show template download cards

**Template Storage:**
- localStorage (base64) for MVP
- S3 for production

#### Change 4: Saved Journeys for Client Types
- **Purpose**: Pre-configured document checklists for different client types
- **Journeys**: Indian National, NRI, HUF, Corporate

**Example Journey - Indian National:**
1. PAN Card
2. Aadhaar Card
3. Cancelled Cheque
4. Bank Statement
5. Risk Profile Form
6. Investor Declaration Form
7. Data Input Sheet
8. Address Proof
9. Income Proof (optional)
10. Signature Specimen

**Implementation Required:**

**New Files:**
- `/types/journeys.ts` - Journey, JourneyStep interfaces
- `/lib/services/journey-service.ts` - Journey CRUD
- `/components/onboarding/JourneySelector.tsx` - Client type selection UI
- `/app/admin/onboarding/journeys/page.tsx` - Admin journey management

**Modified Files:**
- `/lib/services/client-invitation-service.ts` - Add journey selection
- `/components/onboarding/steps/WelcomeStep.tsx` - Show journey selector

#### Change 5: Team Assignment During Onboarding
- **Current**: Admin assigns single RM
- **New**: Admin assigns team (Multiple RMs + Back-Office)

**Implementation Required:**
- Add team selection step in invitation creation
- Save team with client on onboarding completion

---

## Messaging System Changes

### Current (V2): Full-Featured Messaging
- Family-based messaging with threads
- Priority levels, categories
- Internal/external filtering
- Read receipts
- Message search
- Email templates

### New (V3): Minimal Communication
- **Scope Reduction**: Communication is NOT the primary feature
- **Use Cases**:
  - OTP verification
  - Basic client communication
  - Two thread types: Private (internal) vs General (client-visible)
- **Architecture**: API-based (no real-time sockets)
- **Refresh Required**: Users must refresh to see new messages

### Changes Required
- Keep existing messaging infrastructure (no removal)
- Simplify UI (de-emphasize in navigation)
- Focus documentation on it being a "small module"
- No real-time features (acceptable as-is)

**No Implementation Changes** - Current system already matches requirements

---

## Documentation Updates Required

### 1. `/IMPLEMENTATION_GUIDE.md`

**Add Sections:**
```markdown
## User Roles (Updated)
1. **Admin**: Full access, manages master document lists, creates clients
2. **Relationship Manager (RM)**: Field-based, creates tasks via mobile, multiple RMs can co-manage
3. **Back Office**: Operations team, executes tasks (SIPs, STPs, etc.)
4. **Client/Family**: Portfolio view, onboarding, external communications

## Team Structure
- Each client mapped to a Team during onboarding
- Team = Multiple RMs + Multiple Back-Office members
- Tasks assigned to Team (not individuals)
- Any team member can pick up tasks

## Task Types
10 investment product types:
- SIP, STP, SWP, Lumpsum, Fund Transfer, Redemption
- Portfolio Review, Compliance, Documentation, Other

## WhatsApp Integration (Mocked)
- RMs send WhatsApp messages to create tasks
- Mocked for MVP (localStorage-based)
- Real implementation planned for Phase 2

## NSDL CAS Parser
- Bulk upload portfolio holdings from PDF
- Upsert logic (match by ISIN/name)
- Soft delete for closed holdings
```

### 2. `/COMPLETED_FEATURES.md`

**Add Phase 6:**
```markdown
## Phase 6: Strategic Realignment (February 2026)

### Goals
- Shift focus to operational efficiency
- Add table-based task management
- Integrate WhatsApp (mocked)
- Add NSDL bulk upload
- Template download system

### Deliverables
- Back Office role
- Table view for tasks
- 10 task types (SIP, STP, etc.)
- Team-based assignment
- NSDL parser
- Template system
- WhatsApp mock integration
```

### 3. `/CLIENT_ONBOARDING_SYSTEM.md`

**Update Sections:**
```markdown
## Master Document List (Admin-Controlled)
Admins configure required documents per client type

## Onboarding Journeys
Pre-configured workflows:
- Indian National: 10 documents
- NRI: Additional OCI, passport
- HUF: HUF-specific docs
- Corporate: Company registration

## Team Assignment
During setup, Admin selects:
- Primary RM(s)
- Back-Office members
- Team saved with client
```

### 4. `/NRP_CRM.md`

**Major Updates:**
1. Add Back Office to User Roles section
2. Update Task Management:
   - Add Table View description
   - 10 task types
   - Team-based assignment
3. Add WhatsApp Integration section (mocked)
4. Add NSDL Parser to Portfolio section
5. Add Template System section
6. Update Messaging (clarify it's minimal)

---

## Implementation Phases

### Phase 1: Team Structure & Back Office (2-3 days) ⭐ FOUNDATION
**Priority:** HIGH - Required for all other features

**Tasks:**
1. ✅ Create `/types/teams.ts`
2. ✅ Create `/lib/services/team-service.ts`
3. Add `back_office` to `/types/auth.ts`
4. Create `/components/admin/TeamAssignmentPanel.tsx`
5. Add back_office users to sample data
6. Update client creation flow

**Deliverables:**
- Back Office role functional
- Teams can be assigned to clients
- Team-based access control

---

### Phase 2: Table-Based Task Management (3-4 days) ⭐ CORE FEATURE
**Priority:** HIGH

**Dependencies:** Phase 1

**Tasks:**
1. Update `/types/tasks.ts` - Add TaskType enum, team fields
2. Update `/lib/services/task-service.ts` - Team methods, bulk operations
3. Create `/components/tasks/TaskTableView.tsx`
4. Create `/components/tasks/TaskFilterBar.tsx`
5. Create `/components/tasks/TaskBatchActions.tsx`
6. Update `/app/tasks/page.tsx` - View toggle

**Deliverables:**
- Table view (default for Back Office)
- 10 task types
- Batch operations (multi-select, bulk update)
- Sortable/filterable table

---

### Phase 3: NSDL Parser & Bulk Upload (3-4 days) ⭐ CRITICAL
**Priority:** HIGH

**Dependencies:** None (can run parallel)

**Tasks:**
1. Install `pdf-parse` library
2. Create `/types/nsdl.ts`
3. Create `/lib/services/nsdl-parser-service.ts`
4. Update `/types/portfolio.ts` - Add ISIN, status fields
5. Update `/lib/services/portfolio-service.ts` - Upsert, soft delete
6. Create `/components/portfolio/BulkUploadDialog.tsx`
7. Test with sample NSDL PDF

**Deliverables:**
- NSDL PDF parsing
- Bulk upload with preview
- Upsert logic working
- Soft delete for closed holdings

---

### Phase 4: Template System (2-3 days)
**Priority:** MEDIUM

**Tasks:**
1. Create `/types/templates.ts`
2. Create `/lib/services/template-service.ts`
3. Create `/components/onboarding/TemplateDownloadCard.tsx`
4. Create `/app/admin/onboarding/templates/page.tsx`
5. Update onboarding flow

**Deliverables:**
- Admin can upload templates
- Clients can download templates
- Re-upload after signing

---

### Phase 5: Saved Journeys (2 days)
**Priority:** MEDIUM

**Dependencies:** Phase 4

**Tasks:**
1. Create `/types/journeys.ts`
2. Create `/lib/services/journey-service.ts`
3. Create `/components/onboarding/JourneySelector.tsx`
4. Create `/app/admin/onboarding/journeys/page.tsx`
5. Create sample journeys (4 client types)

**Deliverables:**
- Journey selector in onboarding
- Admin journey management
- Auto-populate checklist from journey

---

### Phase 6: WhatsApp Integration (Mocked) (1-2 days)
**Priority:** LOW - Can be added later

**Dependencies:** Phase 2

**Tasks:**
1. Create `/types/whatsapp.ts`
2. Create `/lib/services/whatsapp-integration-service.ts`
3. Create `/components/tasks/WhatsAppMockPanel.tsx`
4. Add parsing logic

**Deliverables:**
- Mock WhatsApp UI
- Message parsing
- Task creation from WhatsApp

---

### Phase 7: Documentation (1 day)
**Priority:** MEDIUM - Continuous

**Tasks:**
1. Update `/IMPLEMENTATION_GUIDE.md`
2. Update `/COMPLETED_FEATURES.md`
3. Update `/CLIENT_ONBOARDING_SYSTEM.md`
4. Update `/NRP_CRM.md`

---

## File Summary

### New Files to Create: 20

**Types (5):**
1. `/types/teams.ts` ✅
2. `/types/whatsapp.ts`
3. `/types/nsdl.ts`
4. `/types/templates.ts`
5. `/types/journeys.ts`

**Services (5):**
1. `/lib/services/team-service.ts` ✅
2. `/lib/services/whatsapp-integration-service.ts`
3. `/lib/services/nsdl-parser-service.ts`
4. `/lib/services/template-service.ts`
5. `/lib/services/journey-service.ts`

**Components (8):**
1. `/components/tasks/TaskTableView.tsx`
2. `/components/tasks/TaskFilterBar.tsx`
3. `/components/tasks/TaskBatchActions.tsx`
4. `/components/tasks/WhatsAppMockPanel.tsx`
5. `/components/portfolio/BulkUploadDialog.tsx`
6. `/components/onboarding/TemplateDownloadCard.tsx`
7. `/components/onboarding/JourneySelector.tsx`
8. `/components/admin/TeamAssignmentPanel.tsx`

**Pages (3):**
1. `/app/admin/onboarding/templates/page.tsx`
2. `/app/admin/onboarding/journeys/page.tsx`
3. `/app/admin/teams/page.tsx`

### Files to Modify: 15

**Types (5):**
1. `/types/auth.ts` - Add back_office role
2. `/types/tasks.ts` - Add TaskType, team fields
3. `/types/portfolio.ts` - Add ISIN, status fields
4. `/types/onboarding-checklist.ts` - Add template_id
5. `/types/family.ts` - Add team reference

**Services (4):**
1. `/lib/services/task-service.ts` - Team methods, bulk ops
2. `/lib/services/portfolio-service.ts` - Upsert, soft delete
3. `/lib/services/client-invitation-service.ts` - Journey, team
4. `/lib/services/onboarding-form-service.ts` - Store journey

**Components (3):**
1. `/components/onboarding/steps/DocumentUploadStep.tsx` - Templates
2. `/components/onboarding/steps/WelcomeStep.tsx` - Journey selector

**Pages (3):**
1. `/app/tasks/page.tsx` - View toggle
2. `/app/client/dashboard/page.tsx` - Bulk upload button
3. `/app/admin/clients/page.tsx` - Team assignment

---

## Technical Considerations

### LocalStorage Constraints
- Max 5-10MB per domain
- Base64 increases file size by ~33%
- Large NSDL PDFs may hit limits
- Consider chunking or compression

### PDF Parsing Challenges
- NSDL format variations (different AMCs)
- Scanned PDFs may need OCR
- Validation required post-parse
- Edge cases: Missing ISIN, non-standard names

### Mobile Optimization
- Table view must work on mobile
- Horizontal scroll for many columns
- Touch-friendly batch selection
- Filter dropdowns mobile-optimized

### Performance
- Large task lists (1000+) may slow table
- Consider pagination or virtualization
- Bulk operations must not freeze UI
- PDF parsing should use Web Workers

---

## Success Criteria

### Phase 1-2 Complete
- [ ] Back Office role exists
- [ ] Teams assignable to clients
- [ ] Table view functional
- [ ] 10 task types working
- [ ] Batch operations work (select 10+ tasks, update)

### Phase 3 Complete
- [ ] NSDL PDF parses successfully
- [ ] Holdings upsert correctly
- [ ] Closed holdings marked (not deleted)
- [ ] Bulk upload shows summary

### Phase 4-5 Complete
- [ ] Templates uploadable by Admin
- [ ] Clients can download templates
- [ ] Journeys creatable and applicable

### Phase 6 Complete
- [ ] WhatsApp mock panel works
- [ ] Messages parse into tasks

### Documentation Complete
- [ ] All 4 docs updated
- [ ] New features documented

---

## Timeline

**Total Estimate:** 14-18 days

- Phase 1: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 3-4 days
- Phase 4: 2-3 days
- Phase 5: 2 days
- Phase 6: 1-2 days
- Phase 7: 1 day
- Buffer: 2-3 days

**Recommended Order:** 1 → 2 → 3 → 4 → 5 → 6 → 7

**Parallelization:** Phase 3 can run parallel to Phases 1-2

---

## Migration Path (Future)

When ready for backend:

1. **Database**: Supabase/PostgreSQL
2. **API Routes**: `/api/tasks`, `/api/teams`, `/api/portfolios/bulk-upload`
3. **File Storage**: S3 for documents
4. **Real-Time**: Supabase subscriptions
5. **WhatsApp**: Real webhook integration

---

## Current Status

- ✅ Planning complete
- ✅ Team types created (`/types/teams.ts`)
- ✅ Team service created (`/lib/services/team-service.ts`)
- ⏳ Phase 1 in progress
- ⏳ Phases 2-7 pending

---

**Last Updated:** February 13, 2026
**Author:** Claude Code
**Status:** Ready for Implementation
