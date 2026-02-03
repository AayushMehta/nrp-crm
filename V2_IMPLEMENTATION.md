# NRP CRM V2 - Complete Redesign Implementation Plan

**Date**: January 21, 2026
**Version**: 2.0.0
**Status**: Ready for Implementation

---

## Executive Summary

Complete redesign of NRP CRM to match reference project (`nrp-cfo-ptoto`) quality with:
1. **Family-based messaging** (not thread-based UI)
2. **Expanded task states** (7 statuses including "Pending Document from Client")
3. **Professional design system** (navy blue, proper cards, clean typography)

---

## Part 1: Design System Overhaul

### 1.1 Color Palette Update
**File**: `tailwind.config.ts`

**Current**: Generic colors
**New**: Reference-matched palette

```typescript
colors: {
  // Primary
  primary: {
    DEFAULT: '#1f2f5c',  // Navy blue
    foreground: '#ffffff',
  },

  // Card backgrounds
  card: {
    DEFAULT: '#f8f7f2',  // Warm cream
    foreground: '#171717',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Grays (from reference)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d1d5db',
    400: '#a1a1a1',
    500: '#737373',
    600: '#6b7280',
    700: '#474343',
    800: '#282828',
    900: '#171717',
  },
}
```

### 1.2 Card Component Redesign
**File**: `components/ui/card.tsx`

**Changes**:
- Border radius: `rounded-xl` (10px)
- Shadow: `shadow-sm` with hover `shadow-md`
- Background: Use `bg-card` variable
- Padding: `p-6` standard
- Transition: `transition-shadow`

**New Standard**:
```tsx
<Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### 1.3 Stat Card Redesign
**File**: `components/dashboard/StatCard.tsx`

**Match reference pattern exactly**:
```tsx
<Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className={cn("p-3 rounded-full", iconBgColor)}>
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
    </div>
  </CardContent>
</Card>
```

### 1.4 Badge Color System
**File**: `components/ui/colored-badge.tsx`

**Update all badge colors**:
```typescript
// Priority badges
high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-100'
medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950'
low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950'

// Status badges
info: 'bg-blue-100 text-blue-800 border-blue-200'
warning: 'bg-orange-100 text-orange-800 border-orange-200'
success: 'bg-green-100 text-green-800 border-green-200'
danger: 'bg-red-100 text-red-800 border-red-200'

// Special
internal: 'bg-orange-100 text-orange-800 border-orange-200'
```

### 1.5 Sidebar Redesign
**File**: `components/layout/Sidebar.tsx`

**Dark Sidebar Style** (from reference):
```typescript
// Main sidebar
bg: 'bg-slate-900'
text: 'text-white'

// Navigation items
inactive: 'text-slate-300 hover:bg-slate-800 hover:text-white'
active: 'bg-blue-600 text-white'
padding: 'px-3 py-2.5'
rounded: 'rounded-lg'

// Icons
size: 'h-5 w-5'

// Logo/Avatar gradients (role-based)
admin: 'from-red-500 to-orange-600'
rm: 'from-purple-500 to-blue-600'
family: 'from-blue-500 to-purple-600'
```

### 1.6 Typography System
**Apply across all pages**:

```
Page Titles:      text-3xl font-bold tracking-tight
Section Titles:   text-2xl font-bold
Card Titles:      text-sm font-medium
Subsection:       text-lg font-semibold
Body:             Default (base)
Muted:            text-xs text-muted-foreground
```

### 1.7 Spacing Standards
**Consistent spacing everywhere**:

```
Between sections:  space-y-6
Grid gaps:         gap-6 (large), gap-4 (standard)
Card padding:      p-6
Card header:       pb-2 to pb-6
List items:        gap-3 or gap-4
Page padding:      p-6
```

---

## Part 2: Family-Based Messaging System

### 2.1 Problem with Current Implementation
**Current**: Thread-based UI - shows individual conversation threads
**Needed**: Family-based UI - group ALL messages by family first

**User Story**:
- RM logs in → sees list of FAMILIES (not threads)
- RM clicks "Sharma Family" → sees ALL messages related to Sharma Family:
  - Messages between Sharma and any RM
  - Messages between RMs about Sharma (internal, hidden from client)
  - All merged chronologically
- Admin sees ALL families
- Family user sees only their own external messages

### 2.2 New Type Definitions
**File**: `types/messaging.ts`

**Add**:
```typescript
export interface FamilyMessageGroup {
  familyId: string;
  familyName: string;
  totalMessages: number;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageBy: string;
  assignedRMs: Array<{
    rmId: string;
    rmName: string;
    messageCount: number;
  }>;
  threads: MessageThread[]; // All conversation threads
  allMessages: Message[];    // Flattened, sorted by date
  hasInternalMessages: boolean;
}
```

### 2.3 Service Layer Updates
**File**: `lib/services/message-service.ts`

**Add new methods**:
```typescript
class MessageService {
  /**
   * Get all families with their aggregated message data
   * Groups messages by family, not by thread
   */
  static getFamilyMessageGroups(
    userId: string,
    userRole: 'admin' | 'rm' | 'family',
    assignedFamilyIds?: string[]
  ): FamilyMessageGroup[]

  /**
   * Get ALL messages for a specific family
   * Includes messages from all RMs who have communicated with this family
   * Sorted chronologically
   */
  static getFamilyMessages(
    familyId: string,
    userId: string,
    userRole: 'admin' | 'rm' | 'family'
  ): Message[]

  /**
   * Get all conversation threads for a family
   */
  static getFamilyThreads(familyId: string): MessageThread[]

  /**
   * Get stats per family
   */
  static getFamilyStats(familyId: string): {
    totalMessages: number;
    internalMessages: number;
    externalMessages: number;
    rmCount: number;
    lastActivity: string;
  }
}
```

**Access Control Logic**:
```typescript
// Admin
- Sees ALL families
- Sees ALL messages (internal + external)

// RM
- Sees only ASSIGNED families
- For assigned families, sees ALL messages:
  - Messages between that family and ANY RM
  - Messages between RMs about that family (internal)
  - Their own messages to other RMs about family (internal)

// Family
- Sees ONLY their own family
- Sees ONLY external messages (RM ↔ Client)
- Does NOT see internal messages (RM ↔ RM, Admin ↔ RM)
```

### 2.4 UI Restructure
**File**: `app/communications/page.tsx`

**Complete Redesign**:

```tsx
// NEW LAYOUT STRUCTURE

<AppLayout>
  {/* Header */}
  <div className="flex justify-between">
    <div>
      <h1>Messages</h1>
      <p>Family-based communication trail</p>
    </div>
    <Button>New Message</Button>
  </div>

  {/* Stats - 4 cards */}
  <div className="grid gap-6 md:grid-cols-4">
    <StatCard title="Total Families" value={stats.totalFamilies} />
    <StatCard title="Unread Messages" value={stats.unreadMessages} />
    <StatCard title="Internal Threads" value={stats.internalThreads} />
    <StatCard title="High Priority" value={stats.highPriority} />
  </div>

  {/* Search & Filters */}
  <Card className="p-4">
    <Input placeholder="Search families..." />
    <Select> {/* Priority filter */}
    <Select> {/* Category filter */}
  </Card>

  {/* Two-Panel Layout */}
  <div className="grid lg:grid-cols-3 gap-6">
    {/* LEFT: Family List (1/3) */}
    <Card className="lg:col-span-1">
      <FamilyMessageList
        families={familyGroups}
        selectedFamilyId={selectedFamily?.familyId}
        onSelect={handleFamilySelect}
      />
    </Card>

    {/* RIGHT: Family Messages View (2/3) */}
    <div className="lg:col-span-2">
      {selectedFamily ? (
        <FamilyMessagesView
          family={selectedFamily}
          messages={familyMessages}
          currentUser={user}
          onReply={handleReply}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  </div>

  {/* Message Composer Dialog */}
  <MessageComposer ... />
</AppLayout>
```

### 2.5 New Components

#### FamilyMessageList.tsx
**New File**: `components/messaging/FamilyMessageList.tsx`

**Purpose**: Show list of families with message previews

```tsx
export function FamilyMessageList({
  families: FamilyMessageGroup[],
  selectedFamilyId: string | null,
  onSelect: (family: FamilyMessageGroup) => void
}) {
  return (
    <div className="space-y-2">
      {families.map(family => (
        <div
          key={family.familyId}
          className={cn(
            "p-4 rounded-lg cursor-pointer transition-colors",
            selectedFamilyId === family.familyId
              ? "bg-blue-50 border-blue-200"
              : "hover:bg-gray-50"
          )}
          onClick={() => onSelect(family)}
        >
          {/* Family avatar/icon */}
          {/* Family name */}
          {/* Last message preview */}
          {/* Unread badge */}
          {/* Timestamp */}
          {/* RM list (if multiple RMs) */}
        </div>
      ))}
    </div>
  );
}
```

#### FamilyMessagesView.tsx
**New File**: `components/messaging/FamilyMessagesView.tsx`

**Purpose**: Show ALL messages for selected family

```tsx
export function FamilyMessagesView({
  family: FamilyMessageGroup,
  messages: Message[],
  currentUser: User,
  onReply: () => void
}) {
  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex justify-between">
        <div>
          <h2 className="text-xl font-bold">{family.familyName}</h2>
          <p className="text-sm text-muted-foreground">
            {family.totalMessages} messages · {family.assignedRMs.length} RMs involved
          </p>
        </div>
        <Button onClick={onReply}>Reply</Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="threads">By Conversation</TabsTrigger>
        </TabsList>

        {/* ALL MESSAGES TAB - Chronological merge */}
        <TabsContent value="all">
          <ScrollArea className="flex-1 p-4">
            {messages.map(message => (
              <MessageCard
                key={message.id}
                message={message}
                currentUser={currentUser}
                showSenderRM={true} // Show which RM sent it
              />
            ))}
          </ScrollArea>
        </TabsContent>

        {/* BY CONVERSATION TAB - Grouped threads */}
        <TabsContent value="threads">
          {family.threads.map(thread => (
            <ThreadGroup key={thread.id} thread={thread} />
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
```

#### MessageCard.tsx Updates
**File**: `components/messaging/MessageCard.tsx`

**Add support for multi-RM display**:
```tsx
{/* Show sender name with RM identifier */}
{showSenderRM && message.senderRole === 'rm' && (
  <Badge variant="outline" className="ml-2">
    RM: {message.senderName}
  </Badge>
)}

{/* Show "To: [RM Name]" for RM-to-RM messages */}
{message.isInternal && (
  <div className="text-xs text-muted-foreground">
    <Lock className="inline h-3 w-3 mr-1" />
    Internal: To {recipientName}
  </div>
)}
```

### 2.6 Auto-Internal Detection (Already Implemented)
**Status**: ✅ Already working in `message-service.ts` lines 158-177

**No changes needed** - service automatically detects:
- RM ↔ RM = internal
- Admin ↔ RM = internal
- Client ↔ RM = external

**UI just needs to display it properly** with badges/icons.

---

## Part 3: Expanded Task States

### 3.1 Current vs New States

**Current (4 states)**:
- To Do
- In Progress
- In Review
- Done

**New (7 states)**:
- To Do
- In Progress
- In Review
- **Pending Document from Client** ← NEW
- **Waiting on Client** ← NEW
- **Blocked** ← NEW
- Done

### 3.2 Type Updates
**File**: `types/tasks.ts`

**Update TaskStatus**:
```typescript
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'pending_document_from_client'
  | 'waiting_on_client'
  | 'blocked'
  | 'done';
```

**Update Task interface**:
```typescript
export interface Task {
  // ... existing fields ...

  // Conditional fields for specific statuses
  blockedReason?: string;           // Required if status = 'blocked'
  waitingOnWhat?: string;           // Required if status = 'waiting_on_client'
  documentRequested?: string;        // Required if status = 'pending_document_from_client'
  clientNotifiedAt?: string;        // Timestamp when client was notified
}
```

### 3.3 Kanban Board Updates
**File**: `components/tasks/KanbanBoard.tsx`

**Update COLUMNS array**:
```typescript
const COLUMNS = [
  {
    status: 'todo',
    title: 'To Do',
    icon: Circle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100'
  },
  {
    status: 'in_progress',
    title: 'In Progress',
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    animated: true
  },
  {
    status: 'in_review',
    title: 'In Review',
    icon: Eye,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100'
  },
  {
    status: 'pending_document_from_client',
    title: 'Pending Document',
    icon: FileQuestion,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100'
  },
  {
    status: 'waiting_on_client',
    title: 'Waiting on Client',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  },
  {
    status: 'blocked',
    title: 'Blocked',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  },
  {
    status: 'done',
    title: 'Done',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
];
```

**Grid Layout** (for 7 columns):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
  {/* Columns */}
</div>
```

### 3.4 Task Card Updates
**File**: `components/tasks/TaskCard.tsx`

**Add conditional field displays**:
```tsx
{/* Show blocked reason */}
{task.status === 'blocked' && task.blockedReason && (
  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
    <AlertCircle className="inline h-3 w-3 mr-1" />
    Blocked: {task.blockedReason}
  </div>
)}

{/* Show waiting info */}
{task.status === 'waiting_on_client' && task.waitingOnWhat && (
  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
    <Clock className="inline h-3 w-3 mr-1" />
    Waiting: {task.waitingOnWhat}
  </div>
)}

{/* Show document request */}
{task.status === 'pending_document_from_client' && task.documentRequested && (
  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
    <FileQuestion className="inline h-3 w-3 mr-1" />
    Needs: {task.documentRequested}
  </div>
)}
```

### 3.5 Task Dialog Updates
**Files**:
- `components/tasks/TaskCreateDialog.tsx`
- `components/tasks/TaskDetailDialog.tsx`

**Add conditional fields**:
```tsx
{/* Status Selector */}
<Select value={task.status} onChange={setStatus}>
  <SelectItem value="todo">To Do</SelectItem>
  <SelectItem value="in_progress">In Progress</SelectItem>
  <SelectItem value="in_review">In Review</SelectItem>
  <SelectItem value="pending_document_from_client">Pending Document</SelectItem>
  <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
  <SelectItem value="blocked">Blocked</SelectItem>
  <SelectItem value="done">Done</SelectItem>
</Select>

{/* Conditional fields based on status */}
{task.status === 'blocked' && (
  <div className="space-y-2">
    <Label>Blocked Reason *</Label>
    <Textarea
      value={task.blockedReason}
      onChange={(e) => setBlockedReason(e.target.value)}
      placeholder="Describe what's blocking this task..."
    />
  </div>
)}

{task.status === 'waiting_on_client' && (
  <div className="space-y-2">
    <Label>Waiting On *</Label>
    <Input
      value={task.waitingOnWhat}
      onChange={(e) => setWaitingOnWhat(e.target.value)}
      placeholder="e.g., Client approval, Client response..."
    />
  </div>
)}

{task.status === 'pending_document_from_client' && (
  <div className="space-y-2">
    <Label>Document Requested *</Label>
    <Input
      value={task.documentRequested}
      onChange={(e) => setDocumentRequested(e.target.value)}
      placeholder="e.g., PAN Card, Bank Statement..."
    />
  </div>
)}
```

### 3.6 Service Layer Updates
**File**: `lib/services/task-service.ts`

**Update stats calculation**:
```typescript
static getStats(userRole, userId, familyIds) {
  const tasks = this.getTasks(userRole, userId, familyIds);

  return {
    total: tasks.length,
    by_status: {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
      pending_document_from_client: tasks.filter(t => t.status === 'pending_document_from_client').length,
      waiting_on_client: tasks.filter(t => t.status === 'waiting_on_client').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      done: tasks.filter(t => t.status === 'done').length,
    },
    overdue: tasks.filter(t => /* overdue logic */),
    completed_this_week: tasks.filter(t => /* this week logic */),
  };
}
```

### 3.7 Stats Cards Update
**File**: `app/tasks/page.tsx`

**Update stat cards for new statuses**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
  <StatCard title="To Do" value={stats.by_status.todo} icon={Circle} iconClassName="text-gray-600" />
  <StatCard title="In Progress" value={stats.by_status.in_progress} icon={Loader2} iconClassName="text-blue-600" />
  <StatCard title="In Review" value={stats.by_status.in_review} icon={Eye} iconClassName="text-yellow-600" />
  <StatCard title="Pending Doc" value={stats.by_status.pending_document_from_client} icon={FileQuestion} iconClassName="text-orange-600" />
  <StatCard title="Waiting" value={stats.by_status.waiting_on_client} icon={Clock} iconClassName="text-amber-600" />
  <StatCard title="Blocked" value={stats.by_status.blocked} icon={AlertCircle} iconClassName="text-red-600" />
  <StatCard title="Done" value={stats.by_status.done} icon={CheckCircle2} iconClassName="text-green-600" />
</div>
```

---

## Part 4: Apply Design System to All Pages

### 4.1 Admin Dashboard
**File**: `app/admin/dashboard/page.tsx`

**Apply**:
- New color palette
- Updated StatCard components
- Proper spacing (space-y-6, gap-6)
- Card styling (rounded-xl, shadow-sm)
- Typography hierarchy

### 4.2 RM Dashboard
**File**: `app/rm/dashboard/page.tsx`

**Apply**:
- Calendar styling (if applicable)
- Task widget with new design
- KPI cards matching reference
- Proper grid layouts

### 4.3 Client Dashboard
**File**: `app/client/dashboard/page.tsx`

**Apply**:
- Simple, clean design for clients
- Easy-to-read metrics
- Proper card styling

### 4.4 Meeting Notes Page
**File**: `app/admin/meeting-notes/page.tsx`

**Apply**:
- Table styling from reference
- Badge colors matching new system
- Dialog redesign
- Form component updates

### 4.5 Reminders Pages
**Files**:
- `app/admin/reminders/page.tsx`
- `app/rm/reminders/page.tsx`

**Apply**:
- New StatCard design
- Updated badge colors
- List component styling

### 4.6 Onboarding Pages
**Files**:
- `app/admin/onboarding/page.tsx`
- `app/admin/onboarding/checklists/[checklistId]/page.tsx`

**Apply**:
- Card redesign
- Progress bar styling
- Button and form updates

---

## Part 5: Lead Generation (Future Phase)

### 5.1 Lead Data Structure
**New File**: `types/leads.ts`

```typescript
export interface Lead {
  id: string;
  familyName: string;
  contactName: string;
  email: string;
  phone: string;
  source: 'website' | 'referral' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assignedRmId?: string;
  assignedRmName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  websiteData?: {
    formType: string;
    ipAddress: string;
    referrer: string;
  };
}
```

### 5.2 Lead Service
**New File**: `lib/services/lead-service.ts`

```typescript
export class LeadService {
  static createLead(data: LeadCreateData): Lead;
  static getLeads(filters: LeadFilters): Lead[];
  static assignToRM(leadId: string, rmId: string): void;
  static updateStatus(leadId: string, status: LeadStatus): void;
  static convertToFamily(leadId: string): Family;
}
```

### 5.3 Lead Management Page
**New File**: `app/admin/leads/page.tsx`

**Features**:
- List all leads with filters
- Assign leads to RMs
- Update lead status
- Convert leads to families
- Lead source tracking

---

## Implementation Checklist

### Phase 1: Design Foundation ✅
- [ ] Update `tailwind.config.ts` with new colors
- [ ] Update `app/globals.css` with CSS variables
- [ ] Redesign `components/ui/card.tsx`
- [ ] Redesign `components/dashboard/StatCard.tsx`
- [ ] Update `components/ui/colored-badge.tsx` colors
- [ ] Redesign `components/layout/Sidebar.tsx`
- [ ] Apply typography standards across all pages
- [ ] Apply spacing standards across all pages

### Phase 2: Task States ✅
- [ ] Update `types/tasks.ts` with new statuses
- [ ] Update `components/tasks/KanbanBoard.tsx` with 7 columns
- [ ] Update `components/tasks/TaskCard.tsx` with conditional fields
- [ ] Update `components/tasks/TaskCreateDialog.tsx` with status fields
- [ ] Update `components/tasks/TaskDetailDialog.tsx` with status fields
- [ ] Update `lib/services/task-service.ts` stats calculation
- [ ] Update `app/tasks/page.tsx` stats cards

### Phase 3: Family-Based Messaging ✅
- [ ] Update `types/messaging.ts` with `FamilyMessageGroup`
- [ ] Update `lib/services/message-service.ts` with family methods
- [ ] Create `components/messaging/FamilyMessageList.tsx`
- [ ] Create `components/messaging/FamilyMessagesView.tsx`
- [ ] Update `components/messaging/MessageCard.tsx` for multi-RM
- [ ] Completely restructure `app/communications/page.tsx`
- [ ] Test access control for all roles
- [ ] Test auto-internal detection display

### Phase 4: Page Redesigns ✅
- [ ] Redesign `app/admin/dashboard/page.tsx`
- [ ] Redesign `app/rm/dashboard/page.tsx`
- [ ] Redesign `app/client/dashboard/page.tsx`
- [ ] Redesign `app/admin/meeting-notes/page.tsx`
- [ ] Redesign `app/admin/reminders/page.tsx`
- [ ] Redesign `app/rm/reminders/page.tsx`
- [ ] Redesign `app/admin/onboarding/page.tsx`

### Phase 5: Testing ✅
- [ ] Test messaging: Admin sees all families
- [ ] Test messaging: RM sees assigned families
- [ ] Test messaging: RM sees ALL messages for assigned families
- [ ] Test messaging: Family sees only external messages
- [ ] Test messaging: Auto-internal badges display correctly
- [ ] Test tasks: All 7 statuses work in Kanban
- [ ] Test tasks: Conditional fields appear correctly
- [ ] Test tasks: Drag-and-drop between all columns
- [ ] Test design: All colors match reference
- [ ] Test design: All cards use proper styling
- [ ] Test design: Typography hierarchy is correct
- [ ] Test design: Spacing is consistent

---

## Critical Files List

### Immediate Changes (Phase 1-3):
1. `tailwind.config.ts` - Color palette
2. `app/globals.css` - CSS variables
3. `components/ui/card.tsx` - Card redesign
4. `components/dashboard/StatCard.tsx` - Stat card redesign
5. `components/ui/colored-badge.tsx` - Badge colors
6. `components/layout/Sidebar.tsx` - Sidebar redesign
7. `types/messaging.ts` - Add FamilyMessageGroup
8. `lib/services/message-service.ts` - Add family methods
9. `components/messaging/FamilyMessageList.tsx` - NEW
10. `components/messaging/FamilyMessagesView.tsx` - NEW
11. `components/messaging/MessageCard.tsx` - Updates
12. `app/communications/page.tsx` - Complete restructure
13. `types/tasks.ts` - New task statuses
14. `components/tasks/KanbanBoard.tsx` - 7 columns
15. `components/tasks/TaskCard.tsx` - Conditional fields
16. `components/tasks/TaskCreateDialog.tsx` - Status fields
17. `components/tasks/TaskDetailDialog.tsx` - Status fields
18. `lib/services/task-service.ts` - Stats update
19. `app/tasks/page.tsx` - Stats cards

### Page Redesigns (Phase 4):
20. `app/admin/dashboard/page.tsx`
21. `app/rm/dashboard/page.tsx`
22. `app/client/dashboard/page.tsx`
23. `app/admin/meeting-notes/page.tsx`
24. `app/admin/reminders/page.tsx`
25. `app/rm/reminders/page.tsx`

---

## Estimated Timeline

- **Phase 1** (Design Foundation): 3-4 hours
- **Phase 2** (Task States): 2-3 hours
- **Phase 3** (Family Messaging): 5-6 hours
- **Phase 4** (Page Redesigns): 3-4 hours
- **Testing & Bug Fixes**: 2-3 hours

**Total**: 15-20 hours

---

## Success Metrics

✅ Design matches reference project quality
✅ Family-based messaging with proper access control
✅ 7 task statuses with conditional fields
✅ All pages use consistent design system
✅ Auto-internal message detection displays correctly
✅ RMs can see all messages for assigned families
✅ Clean, professional, "visually intellectual" UI
✅ No manual checkboxes for internal messages
✅ Proper color palette (navy blue #1f2f5c)
✅ Proper card styling (rounded-xl, shadow-sm)
✅ Proper typography hierarchy
✅ Consistent spacing throughout

---

**Document Version**: 2.0
**Last Updated**: January 21, 2026
**Status**: Ready for Implementation
