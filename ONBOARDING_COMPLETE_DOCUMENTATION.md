# Complete Onboarding Process Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Flow](#architecture--flow)
3. [User Journey](#user-journey)
4. [Data Models & Types](#data-models--types)
5. [Step-by-Step Logic](#step-by-step-logic)
6. [Validation Rules](#validation-rules)
7. [API Integration](#api-integration)
8. [State Management](#state-management)
9. [Utilities & Calculations](#utilities--calculations)
10. [Component Structure](#component-structure)

---

## Overview

The onboarding system is a multi-step wizard that collects user information, determines investor profile, assesses risk tolerance, and optionally adds family members. The flow differs based on user role:

- **Family Heads**: Complete all 4 steps
- **Family Members**: Complete only Step 1 (Basic Info)

### Key Features
- Server-side data fetching (no loading states for user)
- Dynamic questions from API
- Real-time profile calculation
- Progress persistence (resume from any step)
- Role-based conditional flow

---

## Architecture & Flow

### Overall Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Navigates to /onboarding                                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ Server Component (page.tsx)                                     │
│ - Check authentication (Clerk)                                  │
│ - Get user permissions                                          │
│ - Fetch all data in parallel:                                   │
│   * Onboarding status                                           │
│   * Pre-profiler questions & answers                            │
│   * Risk profile questions & answers                            │
│   * Family members                                              │
│ - Calculate initial step based on status                        │
│ - Check if onboarding already completed                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │               │
         ▼               ▼
┌────────────────┐  ┌──────────────────────────────────────┐
│ Already        │  │ OnboardingWizard (Client Component)  │
│ Completed      │  │ - Initialize state from server data  │
│ Screen         │  │ - Render current step                │
│                │  │ - Handle navigation & submission     │
└────────────────┘  └──────────────────────────────────────┘
```

### Step Progression Logic

```
Start → Step 1 (Basic Info)
           │
           ▼
    Is Family Head?
           │
    ┌──────┴──────┐
    │             │
   YES            NO
    │             │
    ▼             ▼
Step 2      Complete → Dashboard
(Pre-       (Update user,
Profiler)   redirect to /)
    │
    ▼
Step 3
(Risk
Profile)
    │
    ▼
Step 4
(Family
Members)
    │
    ▼
Complete → Dashboard
(Submit all,
redirect to /)
```

---

## User Journey

### Journey 1: Family Head (Complete Flow)

```
1. User lands on /onboarding
   ↓
2. Server checks:
   - Authentication: Valid Clerk token?
   - User exists in database?
   - personalDetailsStatus != COMPLETED?
   - onboardingStatus != COMPLETED?
   ↓
3. Server fetches all data in parallel
   ↓
4. User sees Step 1: Basic Information
   - Form pre-filled with existing user data
   - Fields: Full Name, Email, Mobile, Date of Birth
   - User fills/edits information
   - Clicks "Continue"
   ↓
5. Validation:
   - All fields required
   - Email format valid
   - Date not empty
   ↓
6. Submission:
   - Updates user record via API
   - Sets personalDetailsStatus = COMPLETED
   - Progress to Step 2
   ↓
7. User sees Step 2: Pre-Profiler
   - 4 dynamic questions from API
   - Radio button options
   - Real-time profile calculation
   - Shows: Life Stage, Income Type, Hybrid Tag, HNI Flag
   - User answers all questions
   - Clicks "Continue"
   ↓
8. Validation:
   - All 4 questions must be answered
   ↓
9. Submission:
   - Submits answers as {questionId: X, optionId: Y}[]
   - Backend updates family onboarding status to RISK_PROFILE
   - Progress to Step 3
   ↓
10. User sees Step 3: Risk Profile
    - 7 dynamic questions from API
    - Each option has a score (1-5)
    - Real-time score calculation
    - Shows: Total Score, Risk Category, Suggested Allocation
    - Completion percentage indicator
    - User answers all questions
    - Clicks "Continue"
    ↓
11. Validation:
    - All 7 questions must be answered (100% completion)
    ↓
12. Submission:
    - Submits answers as {questionId: X, optionId: Y}[]
    - Backend calculates risk profile
    - Updates family onboarding status to FAMILY_MEMBERS
    - Progress to Step 4
    ↓
13. User sees Step 4: Family Members
    - Optional step
    - Can add multiple family members
    - Each member has: Name, Email, DOB, Relationship, Phone, PAN
    - Can add/remove members dynamically
    - Clicks "Complete Onboarding"
    ↓
14. Submission:
    - If members added, submits array to API
    - Each member gets email (required for API)
    - Backend creates family member records
    - Updates family onboarding status to COMPLETED
    ↓
15. Redirect to Dashboard (/)
```

### Journey 2: Family Member (Simplified Flow)

```
1. User lands on /onboarding
   ↓
2. Server checks:
   - User role = member (not head)
   - personalDetailsStatus != COMPLETED
   ↓
3. User sees Step 1: Basic Information only
   - totalSteps = 1 (not 4)
   - Button text: "Save & Complete" (not "Continue")
   ↓
4. User fills information
   - Clicks "Save & Complete"
   ↓
5. Validation & Submission:
   - Updates user record
   - Sets personalDetailsStatus = COMPLETED
   ↓
6. Redirect to Dashboard (/)
   - No additional steps required
```

### Journey 3: Returning User (Resume Progress)

```
1. User previously completed Step 1 & 2
   ↓
2. Server fetches onboardingStatus = RISK_PROFILE
   ↓
3. Server calculates initialStep = 3
   ↓
4. OnboardingWizard initializes:
   - currentStep = 3
   - basicInfo pre-filled from user data
   - preProfiler pre-filled from saved answers
   - riskProfile empty (current step)
   ↓
5. User continues from Step 3
   - Previous data preserved
   - Can navigate back to review/edit
```

---

## Data Models & Types

### Core Types

#### BasicInfo
```typescript
interface BasicInfo {
  fullName: string;        // User's full name
  email: string;           // Email address
  mobile: string;          // Phone number
  dateOfBirth: string;     // YYYY-MM-DD format
}
```

#### PreProfilerAnswers
```typescript
type PreProfilerAnswers = Record<number, number>;
// Maps questionId → optionId
// Example: { 1: 5, 2: 8, 3: 12, 4: 16 }
```

#### PreProfilerResults
```typescript
interface PreProfilerResults {
  lifeStage: string;        // e.g., "Early Accumulation"
  incomeType: string;       // e.g., "Salaried", "Business", "HNI"
  hybridTag: string;        // e.g., "Young Professional"
  description: string;      // Profile description
  hniFlag: boolean;         // High Net Worth Individual flag
  investorType: string;     // Alias for hybridTag
}
```

#### UnifiedRiskProfileAnswers
```typescript
type UnifiedRiskProfileAnswers = Record<number, number>;
// Maps questionId → optionId
// Example: { 1: 3, 2: 4, 3: 2, 4: 5, 5: 3, 6: 4, 7: 3 }
```

#### RiskScoreResult
```typescript
interface RiskScoreResult {
  totalScore: number;                    // 7-35 range
  category: 'Conservative' | 'Moderate' | 'Aggressive';
  categoryDescription: string;
  suggestedAllocation: {
    equity: number;                      // Percentage
    debt: number;                        // Percentage
    description: string;
  };
}
```

#### FamilyMember
```typescript
interface FamilyMember {
  id: string;              // UI-only ID (e.g., "member-1704895123456")
  name: string;
  email?: string;          // Required for API submission
  dateOfBirth: string;
  relationship: 'father' | 'mother' | 'spouse' | 'son' |
                'daughter' | 'brother' | 'sister' | 'other' | '';
  phone?: string;
  pancard?: string;
}
```

### API Types

#### OnboardingQuestionWithOptions
```typescript
interface OnboardingQuestionWithOptions {
  id: number;
  type: 'pre_profiler' | 'risk_profile';
  text: string;
  order: number;
  options: OnboardingAnswerOption[];
}

interface OnboardingAnswerOption {
  id: number;
  questionId: number;
  text: string;
  order: number;
  score: number | null;        // For risk profile
  metadata: {
    lifeStage?: string;        // For pre-profiler
    incomeType?: string;       // For pre-profiler
    isHNI?: boolean;          // For pre-profiler
    hybridTag?: string;
    description?: string;
  } | null;
}
```

#### API Request DTOs
```typescript
// Pre-Profiler Submission
interface PreProfilerDto {
  answers: Array<{
    questionId: number;
    optionId: number;
  }>;
}

// Risk Profile Submission
interface RiskProfileDto {
  answers: Array<{
    questionId: number;
    optionId: number;
  }>;
}

// Family Members Submission
interface FamilyMembersDto {
  familyMembers: Array<{
    name: string;
    relation: string;
    dob?: string;
    email: string;           // Required
    phone?: string;
    pancard?: string;
  }>;
}
```

---

## Step-by-Step Logic

### Step 1: Basic Information

#### Component: `Step1_BasicInfo.tsx`

**Purpose**: Collect essential user information

**Fields**:
- Full Name (required)
- Email (required, type: email)
- Mobile Number (required, type: tel)
- Date of Birth (required, type: date)

**Validation Logic**:
```typescript
function validateStep1(data: BasicInfo): boolean {
  return (
    data.fullName.trim() !== '' &&
    data.email.trim() !== '' &&
    data.mobile.trim() !== '' &&
    data.dateOfBirth !== ''
  );
}
```

**State Management**:
- Initialized from `userData` (server-fetched)
- Updated via `onChange` callback
- Validated on "Continue" click

**Submission Logic**:
```typescript
// When user clicks Continue:
1. Validate all fields
2. If invalid: Show error alert, return
3. If valid:
   - Call updateUserMutation with:
     {
       userId: user.id,
       data: {
         name: basicInfo.fullName,
         email: basicInfo.email,
         phone: basicInfo.mobile || undefined,
         dob: basicInfo.dateOfBirth || undefined,
         personalDetailsStatus: 'completed'
       }
     }
   - Wait for mutation to complete
   - If family head: Progress to Step 2
   - If member: Complete onboarding, redirect to /
```

**UI Structure**:
- 2-column grid (responsive)
- Icons for each field (User, Mail, Phone, Calendar)
- Real-time validation highlighting (red border on error)
- Error alert at bottom when showValidation = true

---

### Step 2: Pre-Profiler (Investor Type Identifier)

#### Component: `Step2_PreProfiler.tsx`

**Purpose**: Determine investor profile based on life stage and income type

**Data Source**: Dynamic questions from API
- Endpoint: `/api/onboarding/pre-profiler/questions`
- Typically 4 questions
- Questions have metadata in options

**Question Logic**:
- Questions sorted by `order` field
- Options sorted by `order` field
- Each option contains metadata:
  ```typescript
  {
    lifeStage?: string,      // "Early Accumulation", "Retirement", etc.
    incomeType?: string,     // "Salaried", "Business", "HNI"
    isHNI?: boolean          // HNI flag
  }
  ```

**Answer Storage**:
- Map of `questionId` → `optionId`
- Example: `{ 1: 5, 2: 8, 3: 12, 4: 16 }`

**Real-time Analysis**:
As user answers questions, system calculates:

```typescript
// analyzePreProfiler logic:
1. Extract lifeStage from selected option's metadata
2. Extract incomeType from selected option's metadata
3. Determine hybridTag from HYBRID_TAG_MAP:
   - Map[lifeStage][incomeType] = hybridTag
   - Example: ["Early Accumulation"]["Salaried"] = "Young Professional"
4. Get description from PROFILE_DESCRIPTIONS[hybridTag]
5. Check if any selected option has isHNI = true
6. Return PreProfilerResults
```

**HYBRID_TAG_MAP** (Core Logic):
```typescript
const HYBRID_TAG_MAP = {
  'Early Accumulation': {
    Salaried: 'Young Professional',
    Business: 'Young Entrepreneur',
    HNI: 'Young HNI',
    Retired: 'Early Retiree',
    Starter: 'Career Starter',
  },
  'Peak Accumulation': {
    Salaried: 'Corporate Professional',
    Business: 'Established Entrepreneur',
    HNI: 'Prime HNI',
    Retired: 'Mid-Career Retiree',
    Starter: 'Late Bloomer',
  },
  'Late Accumulation': {
    Salaried: 'Senior Professional',
    Business: 'Mature Business Owner',
    HNI: 'Seasoned HNI',
    Retired: 'Early Retiree',
    Starter: 'Career Transition',
  },
  'Pre-Retirement': {
    Salaried: 'Pre-Retirement Professional',
    Business: 'Pre-Exit Entrepreneur',
    HNI: 'Legacy Planning HNI',
    Retired: 'Voluntary Retiree',
    Starter: 'Late Starter',
  },
  'Retirement': {
    Salaried: 'Retired Professional',
    Business: 'Retired Entrepreneur',
    HNI: 'Retired HNI',
    Retired: 'Full Retiree',
    Starter: 'Active Retiree',
  },
};
```

**Validation Logic**:
```typescript
function validateStep2(
  data: PreProfilerAnswers,
  questions: OnboardingQuestionWithOptions[]
): boolean {
  if (!questions || questions.length === 0) return false;
  // Check all questions have answers
  return questions.every(q => data[q.id] !== undefined);
}
```

**Submission Logic**:
```typescript
// When user clicks Continue:
1. Validate all questions answered
2. If invalid: Show error toast, return
3. If valid:
   - Convert map to array format:
     const apiAnswers = Object.entries(preProfiler).map(
       ([questionId, optionId]) => ({
         questionId: parseInt(questionId, 10),
         optionId
       })
     );
   - Call submitPreProfilerMutation with { answers: apiAnswers }
   - Backend:
     * Saves answers to family_onboarding_answers table
     * Updates family.onboardingStatus = 'risk_profile'
   - Progress to Step 3
```

**UI Features**:
- Questions rendered dynamically from API
- Radio groups for options
- Icons per question (Calendar, DollarSign, TrendingUp, BarChart3)
- Results card displays when all answered:
  * Life Stage badge (colored)
  * Income Type badge (colored)
  * Hybrid Tag badge
  * HNI alert (if applicable)
  * Profile description text
- Validation error alert

---

### Step 3: Risk Profile Assessment

#### Component: `Step3_RiskProfile.tsx`

**Purpose**: Assess risk tolerance and determine asset allocation

**Data Source**: Dynamic questions from API
- Endpoint: `/api/onboarding/risk-profile/questions`
- Typically 7 questions
- Each option has a `score` field (1-5)

**Scoring System**:
- 7 questions × 5 max points = 35 maximum score
- Each option has explicit score (from API)
- Total score determines risk category

**Score Calculation**:
```typescript
// calculateRiskScore logic:
1. For each answered question:
   - Find selected option
   - Add option.score to totalScore
2. Determine category based on totalScore:
   - 7-15: Conservative
   - 16-25: Moderate
   - 26-35: Aggressive
3. Get category details from RISK_CATEGORIES
4. Return RiskScoreResult
```

**RISK_CATEGORIES** (Core Logic):
```typescript
const RISK_CATEGORIES = {
  Conservative: {
    minScore: 7,
    maxScore: 15,
    description: 'You prefer stability and capital preservation...',
    allocation: {
      equity: 20,
      debt: 80,
      description: 'Conservative allocation with emphasis on debt'
    },
  },
  Moderate: {
    minScore: 16,
    maxScore: 25,
    description: 'You seek a balance between growth and stability...',
    allocation: {
      equity: 50,
      debt: 50,
      description: 'Balanced allocation between equity and debt'
    },
  },
  Aggressive: {
    minScore: 26,
    maxScore: 35,
    description: 'You are comfortable with market volatility...',
    allocation: {
      equity: 75,
      debt: 25,
      description: 'Growth-focused allocation with equity dominance'
    },
  },
};
```

**Completion Percentage**:
```typescript
function getCompletionPercentage(
  answers: Record<number, number>,
  questions: OnboardingQuestionWithOptions[]
): number {
  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;
  return Math.round((answeredCount / questions.length) * 100);
}
```

**Validation Logic**:
```typescript
function validateStep3(
  data: UnifiedRiskProfileAnswers,
  questions: OnboardingQuestionWithOptions[]
): boolean {
  if (!questions || questions.length === 0) return false;
  // All 7 questions must be answered
  return questions.every(q => data[q.id] !== undefined);
}
```

**Submission Logic**:
```typescript
// When user clicks Continue:
1. Validate all questions answered (100% completion)
2. If invalid: Show error toast, return
3. If valid:
   - Convert map to array format
   - Call submitRiskProfileMutation with { answers: apiAnswers }
   - Backend:
     * Saves answers to family_onboarding_answers table
     * Calculates total score
     * Determines risk profile category
     * Saves to family_risk_profiles table
     * Updates family.onboardingStatus = 'family_members'
   - Progress to Step 4
```

**UI Features**:
- Sticky score card at top showing:
  * Total Score (X/35) with progress bar
  * Risk Category badge (colored)
  * Suggested Allocation (Equity% : Debt%)
  * Category description
- Info alert with instructions
- 7 dynamic questions with radio options
- Icons per question (Clock, DollarSign, PieChart, etc.)
- Completion progress bar at bottom
- Score updates in real-time as user answers

---

### Step 4: Family Members

#### Component: `Step4_FamilyMembers.tsx`

**Purpose**: Add family member information (optional)

**Features**:
- Add unlimited members
- Remove any member
- Dynamic form generation
- Optional step (can skip)

**Family Member Fields**:
- Full Name (required)
- Email (required for API, generates placeholder if empty)
- Date of Birth (optional)
- Relationship (required) - dropdown:
  * Father
  * Mother
  * Spouse
  * Son
  * Daughter
  * Brother
  * Sister
  * Other Relatives
- Phone (optional)
- PAN Card (optional)

**Add Member Logic**:
```typescript
function handleAddMember() {
  const newMember: FamilyMember = {
    id: `member-${Date.now()}`,  // Unique timestamp-based ID
    name: '',
    email: '',
    dateOfBirth: '',
    relationship: '',
  };
  onChange([...data, newMember]);
}
```

**Remove Member Logic**:
```typescript
function handleRemoveMember(id: string) {
  onChange(data.filter(member => member.id !== id));
}

```

**Update Member Logic**:
```typescript
function handleMemberChange(
  id: string,
  field: keyof FamilyMember,
  value: string
) {
  onChange(
    data.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    )
  );
}
```

**Validation Logic**:
```typescript
function isMemberValid(member: FamilyMember): boolean {
  return (
    member.name.trim() !== '' &&
    (member.email?.trim() !== '' || member.name.trim() !== '') &&
    member.relationship !== ''
  );
}

function validateStep4(data: FamilyMember[]): boolean {
  // Step is optional
  if (data.length === 0) return true;
  // But if members added, they must be valid
  return data.every(isMemberValid);
}
```

**Submission Logic**:
```typescript
// When user clicks Complete Onboarding:

// For Family Heads:
if (canAccessFullOnboarding) {
  if (familyMembers.length > 0) {
    const familyMembersData: FamilyMembersDto = {
      familyMembers: familyMembers.map(m => ({
        name: m.name,
        relation: m.relationship || 'Other',
        dob: m.dateOfBirth || undefined,
        email: m.email ||
               `${m.name.toLowerCase().replace(/\s+/g, '.')}@placeholder.com`,
        phone: m.phone,
        pancard: m.pancard,
      })),
    };

    await submitFamilyMembersMutation.mutateAsync(familyMembersData);
    // Backend:
    // - Creates user records for each member
    // - Links them to the family
    // - Updates family.onboardingStatus = 'completed'
  }
}

// For Family Members:
else {
  // Already completed in Step 1
}

// Redirect to dashboard
router.replace('/');
```

**UI Structure**:
- Info alert explaining purpose
- Empty state when no members:
  * Icon illustration
  * "Add First Family Member" button
- Member cards when members exist:
  * Badge showing "Member N"
  * Remove button (trash icon)
  * 2-column grid of fields
  * All fields in one card per member
- "Add Another Family Member" button at bottom
- Green alert: "Can skip this step"

---

## Validation Rules

### Step 1 Validation
```typescript
Required Fields:
- fullName: Non-empty string
- email: Non-empty string (type: email)
- mobile: Non-empty string (type: tel)
- dateOfBirth: Non-empty string (YYYY-MM-DD)

Error Message: "Please fill in all required fields to continue."
```

### Step 2 Validation
```typescript
Required:
- All questions must have an answer
- Each question has one selected option

Validation:
questions.every(q => answers[q.id] !== undefined)

Error Message: "Please answer all {N} questions to continue."
```

### Step 3 Validation
```typescript
Required:
- All 7 questions must be answered
- Completion percentage must be 100%

Validation:
questions.every(q => answers[q.id] !== undefined)

Error Message: "Please answer all {N} questions to continue. All questions are mandatory."
```

### Step 4 Validation
```typescript
Optional Step:
- Can have 0 members (valid)

If members added:
- Each member must have: name, relationship
- Email can be empty (auto-generated)

Validation:
if (members.length === 0) return true;
return members.every(m =>
  m.name.trim() !== '' && m.relationship !== ''
);
```

---

## API Integration

### Endpoints

#### GET `/api/onboarding/status`
**Purpose**: Get current onboarding progress

**Response**:
```typescript
{
  data: {
    currentStep: 'pre_profiler' | 'risk_profile' | 'family_members' | 'completed',
    isCompleted: boolean,
    nextStep: string | null
  }
}
```

#### GET `/api/onboarding/pre-profiler/questions`
**Purpose**: Fetch pre-profiler questions

**Response**:
```typescript
{
  data: [
    {
      id: 1,
      type: 'pre_profiler',
      text: 'What is your age?',
      order: 1,
      options: [
        {
          id: 5,
          questionId: 1,
          text: '18-30 years',
          order: 1,
          score: null,
          metadata: {
            lifeStage: 'Early Accumulation'
          }
        },
        // ... more options
      ]
    },
    // ... more questions
  ]
}
```

#### GET `/api/onboarding/pre-profiler`
**Purpose**: Get saved pre-profiler answers

**Response**:
```typescript
{
  data: [
    {
      id: 123,
      familyId: 1,
      questionId: 1,
      optionId: 5,
      type: 'pre_profiler',
      questionText: 'What is your age?',
      optionText: '18-30 years',
      score: null,
      createdAt: '...',
      updatedAt: '...'
    },
    // ... more answers
  ]
}
```

#### POST `/api/onboarding/pre-profiler`
**Purpose**: Submit pre-profiler answers

**Request Body**:
```typescript
{
  answers: [
    { questionId: 1, optionId: 5 },
    { questionId: 2, optionId: 8 },
    { questionId: 3, optionId: 12 },
    { questionId: 4, optionId: 16 }
  ]
}
```

**Response**:
```typescript
{
  data: {
    message: 'Pre-profiler submitted successfully',
    nextStep: 'risk_profile'
  }
}
```

**Backend Logic**:
1. Validate user is family head
2. Delete existing answers for this family
3. Insert new answers
4. Update family.onboardingStatus = 'risk_profile'
5. Return success

#### GET `/api/onboarding/risk-profile/questions`
**Purpose**: Fetch risk profile questions

**Response**: Similar to pre-profiler questions, but with score field

#### GET `/api/onboarding/risk-profile`
**Purpose**: Get saved risk profile answers

**Response**: Similar to pre-profiler answers

#### POST `/api/onboarding/risk-profile`
**Purpose**: Submit risk profile answers

**Request Body**:
```typescript
{
  answers: [
    { questionId: 1, optionId: 3 },
    { questionId: 2, optionId: 4 },
    // ... 7 total answers
  ]
}
```

**Backend Logic**:
1. Validate user is family head
2. Delete existing answers
3. Insert new answers
4. Calculate total score from option scores
5. Determine risk profile category
6. Save to family_risk_profiles table
7. Update family.onboardingStatus = 'family_members'
8. Return success

#### GET `/api/onboarding/family-members`
**Purpose**: Get saved family members

**Response**:
```typescript
{
  data: {
    familyMembers: [
      {
        name: 'John Doe',
        relation: 'father',
        dob: '1960-05-15',
        email: 'john@example.com',
        phone: '+91 9876543210',
        pancard: 'ABCDE1234F'
      },
      // ... more members
    ]
  }
}
```

#### POST `/api/onboarding/family-members`
**Purpose**: Submit family members

**Request Body**:
```typescript
{
  familyMembers: [
    {
      name: 'John Doe',
      relation: 'father',
      dob: '1960-05-15',
      email: 'john@example.com',
      phone: '+91 9876543210',
      pancard: 'ABCDE1234F'
    },
    // ... more members
  ]
}
```

**Backend Logic**:
1. Validate user is family head
2. For each member:
   - Create user record if doesn't exist
   - Link to family
   - Set familyRole = 'member'
   - Set relation field
3. Update family.onboardingStatus = 'completed'
4. Return success

---

## State Management

### Server State (Initial Data)

Page component fetches in parallel:
```typescript
const [
  statusResponse,
  preProfilerQuestionsResponse,
  preProfilerAnswersResponse,
  riskProfileQuestionsResponse,
  riskProfileAnswersResponse,
  familyMembersResponse,
] = await Promise.all([
  onboardingService.getStatus(),
  onboardingService.getPreProfilerQuestions(),
  onboardingService.getPreProfilerAnswers(),
  onboardingService.getRiskProfileQuestions(),
  onboardingService.getRiskProfileAnswers(),
  onboardingService.getFamilyMembers(),
]);
```

Calculates initial step:
```typescript
let initialStep = 1;
if (personalDetailsStatus === COMPLETED && isFamilyHead) {
  switch (familyOnboardingStatus) {
    case 'pre_profiler': initialStep = 2; break;
    case 'risk_profile': initialStep = 3; break;
    case 'family_members': initialStep = 4; break;
    default: initialStep = 2;
  }
}
```

### Client State (OnboardingWizard)

```typescript
// Navigation
const [currentStep, setCurrentStep] = useState(initialStep);
const [showValidation, setShowValidation] = useState(false);

// Step 1 State (initialized from server)
const [basicInfo, setBasicInfo] = useState<BasicInfo>(() => ({
  fullName: userData?.name || '',
  email: userData?.email || '',
  mobile: userData?.phone || '',
  dateOfBirth: userData?.dob || '',
}));

// Step 2 State (initialized from server)
const [preProfiler, setPreProfiler] = useState<PreProfilerAnswers>(() =>
  answersToMap(preProfilerAnswers)  // Convert array to map
);

// Step 3 State (initialized from server)
const [riskProfile, setRiskProfile] = useState<UnifiedRiskProfileAnswers>(() =>
  answersToMap(riskProfileAnswers)
);

// Step 4 State (initialized from server)
const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() =>
  apiFamilyMembersToLocal(apiFamilyMembers)  // Convert API format to local
);
```

### Derived State (Computed)

```typescript
// Pre-profiler results
const preProfilerResults = useMemo<PreProfilerResults | null>(() => {
  if (!preProfilerQuestions) return null;
  return analyzePreProfiler(preProfiler, preProfilerQuestions);
}, [preProfiler, preProfilerQuestions]);

// Risk score results
const riskScoreResult = useMemo<RiskScoreResult | null>(() => {
  if (!riskProfileQuestions) return null;
  return calculateRiskScore(riskProfile, riskProfileQuestions);
}, [riskProfile, riskProfileQuestions]);

// Completion percentage
const riskProfileCompletion = useMemo(() => {
  return getCompletionPercentage(riskProfile, riskProfileQuestions);
}, [riskProfile, riskProfileQuestions]);

// Submitting state
const isSubmitting =
  updateUserMutation.isPending ||
  submitPreProfilerMutation.isPending ||
  submitRiskProfileMutation.isPending ||
  submitFamilyMembersMutation.isPending;
```

### React Query Mutations

```typescript
// Update user (Step 1)
const updateUserMutation = useUpdateUser();

// Submit pre-profiler (Step 2)
const submitPreProfilerMutation = useSubmitPreProfiler();

// Submit risk profile (Step 3)
const submitRiskProfileMutation = useSubmitRiskProfile();

// Submit family members (Step 4)
const submitFamilyMembersMutation = useSubmitFamilyMembers();
```

Each mutation:
- Uses Clerk for authentication
- Invalidates relevant queries on success
- Shows error toasts on failure
- Returns loading states

---

## Utilities & Calculations

### Pre-Profiler Analysis

File: `lib/utils/preProfilerLogic.ts`

**Function**: `analyzePreProfiler(answers, questions)`

**Algorithm**:
```
1. Initialize: lifeStage = null, incomeType = null
2. For each question:
   a. Get selected optionId from answers map
   b. Find option in question.options
   c. Extract metadata from option
   d. If metadata.lifeStage exists: lifeStage = metadata.lifeStage
   e. If metadata.incomeType exists: incomeType = metadata.incomeType
3. If lifeStage and incomeType both found:
   a. Look up hybridTag in HYBRID_TAG_MAP[lifeStage][incomeType]
   b. Look up description in PROFILE_DESCRIPTIONS[hybridTag]
4. Check HNI flag:
   a. For each selected option:
      - If option.metadata.isHNI === true: hniFlag = true
5. Return {
     lifeStage,
     incomeType,
     hybridTag,
     description,
     hniFlag,
     investorType: hybridTag
   }
```

### Risk Score Calculation

File: `lib/utils/riskScoring.ts`

**Function**: `calculateRiskScore(answers, questions)`

**Algorithm**:
```
1. Initialize: totalScore = 0
2. For each question:
   a. Get selected optionId from answers map
   b. Find option in question.options
   c. Add option.score to totalScore
3. Determine category:
   a. If totalScore <= 15: category = 'Conservative'
   b. If totalScore <= 25: category = 'Moderate'
   c. Else: category = 'Aggressive'
4. Look up category details in RISK_CATEGORIES[category]
5. Return {
     totalScore,
     category,
     categoryDescription: categoryInfo.description,
     suggestedAllocation: categoryInfo.allocation
   }
```

**Function**: `getCompletionPercentage(answers, questions)`

**Algorithm**:
```
1. Count answered questions: answeredCount
2. Total questions: questions.length
3. Return: Math.round((answeredCount / totalQuestions) * 100)
```

### Data Conversion Helpers

**answersToMap**: Convert API array to local map
```typescript
function answersToMap(
  answers: FamilyOnboardingAnswer[] | undefined
): Record<number, number> {
  const map: Record<number, number> = {};
  answers?.forEach(answer => {
    map[answer.questionId] = answer.optionId;
  });
  return map;
}
```

**apiFamilyMembersToLocal**: Convert API members to local format
```typescript
function apiFamilyMembersToLocal(
  apiMembers: FamilyMembersResponse | undefined
): FamilyMember[] {
  if (!apiMembers?.familyMembers) return [];
  return apiMembers.familyMembers.map((m, idx) => ({
    id: `member-${idx}`,
    name: m.name,
    dateOfBirth: m.dob || '',
    relationship: m.relation?.toLowerCase() as FamilyMember['relationship'],
    email: m.email,
    phone: m.phone,
    pancard: m.pancard,
  }));
}
```

---

## Component Structure

### Main Container: OnboardingWizard

**File**: `components/onboarding/OnboardingWizard.tsx`

**Purpose**: Main orchestrator for the wizard

**Responsibilities**:
- Initialize all state from server data
- Manage step navigation
- Handle form submissions
- Coordinate mutations
- Render appropriate step component

**Props**:
```typescript
interface OnboardingWizardProps {
  serverData: {
    user: User;
    onboardingStatus: OnboardingStatusResponse;
    preProfilerQuestions: OnboardingQuestionWithOptions[];
    preProfilerAnswers: FamilyOnboardingAnswer[];
    riskProfileQuestions: OnboardingQuestionWithOptions[];
    riskProfileAnswers: FamilyOnboardingAnswer[];
    familyMembers: FamilyMembersResponse;
    initialStep: number;
    isFamilyHead: boolean;
  };
}
```

**Key Methods**:
- `handleNext()`: Validate current step, submit data, progress
- `handlePrevious()`: Go back one step
- `handleComplete()`: Final submission, redirect
- `renderStepContent()`: Render appropriate step component

### Layout: OnboardingLayout

**File**: `components/onboarding/shared/OnboardingLayout.tsx`

**Purpose**: Split-screen layout wrapper

**Structure**:
- Left Panel (Desktop only):
  * Fixed position
  * Brand logo
  * Personalized greeting
  * Step-specific messaging
  * Highlight items with icons
  * Step indicators (dots)
  * Tagline
- Right Panel:
  * Progress bar
  * Step title & subtitle
  * Form content (children)
  * Navigation buttons (footer)

**Props**:
```typescript
interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  navigation: ReactNode;
  stepConfig: StepConfig;
  userName?: string;
  investorProfile?: string;
  riskCategory?: string;
}
```

### Navigation: WizardNavigation

**File**: `components/onboarding/shared/WizardNavigation.tsx`

**Purpose**: Previous/Next/Complete buttons

**Logic**:
- Show "Back" button (disabled on step 1)
- Show "Continue" button (steps 1-3)
- Show "Complete Onboarding" button (step 4)
- Handle loading states
- Custom button text support

### Step Components

Each step component follows the pattern:
```typescript
interface StepProps {
  data: StepDataType;
  onChange: (data: StepDataType) => void;
  showValidation: boolean;
  // ... step-specific props
}
```

**Step1_BasicInfo**: Form with 4 input fields
**Step2_PreProfiler**: Dynamic questions with radio groups + results card
**Step3_RiskProfile**: Dynamic questions with radio groups + score card
**Step4_FamilyMembers**: Dynamic member cards with add/remove

---

## Database Tables

### users
```sql
- id (primary key)
- name
- email
- phone
- dob
- pancard
- familyId (foreign key to families)
- familyRole ('head' | 'member')
- personalDetailsStatus ('pending' | 'completed')
- relation (for members)
```

### families
```sql
- id (primary key)
- name
- familyHead (foreign key to users)
- onboardingStatus ('pre_profiler' | 'risk_profile' | 'family_members' | 'completed')
```

### onboarding_questions
```sql
- id (primary key)
- type ('pre_profiler' | 'risk_profile')
- text
- order
```

### onboarding_answer_options
```sql
- id (primary key)
- questionId (foreign key)
- text
- order
- score (nullable, for risk profile)
- metadata (jsonb, for pre-profiler)
```

### family_onboarding_answers
```sql
- id (primary key)
- familyId (foreign key)
- questionId (foreign key)
- optionId (foreign key)
- type ('pre_profiler' | 'risk_profile')
```

### family_risk_profiles
```sql
- id (primary key)
- familyId (foreign key)
- totalScore
- profile ('conservative' | 'moderate' | 'aggressive' | 'very-aggressive')
- completedAt
```

---

## Key Algorithms Summary

### Initial Step Calculation
```typescript
if (user.personalDetailsStatus !== 'completed') {
  initialStep = 1;
} else if (!isFamilyHead) {
  // Member already done
  showCompletedScreen = true;
} else {
  // Family head - check family onboarding status
  switch (family.onboardingStatus) {
    case 'pre_profiler': initialStep = 2; break;
    case 'risk_profile': initialStep = 3; break;
    case 'family_members': initialStep = 4; break;
    case 'completed': showCompletedScreen = true; break;
  }
}
```

### Investor Profile Determination
```typescript
1. Extract lifeStage from age question option metadata
2. Extract incomeType from income question option metadata
3. Lookup: HYBRID_TAG_MAP[lifeStage][incomeType]
4. Result: Hybrid tag (e.g., "Young Professional")
5. Check any option has isHNI = true
```

### Risk Category Determination
```typescript
1. Sum all option scores: totalScore
2. If totalScore <= 15: Conservative (20% equity, 80% debt)
3. If totalScore <= 25: Moderate (50% equity, 50% debt)
4. Else: Aggressive (75% equity, 25% debt)
```

### Completion Check
```typescript
const isOnboardingCompleted = isFamilyHead
  ? personalDetailsStatus === 'completed' &&
    familyOnboardingStatus === 'completed'
  : personalDetailsStatus === 'completed';
```

---

## Recreation Checklist

To recreate this onboarding system, implement:

### Backend Requirements
- [ ] User authentication (Clerk or similar)
- [ ] Database tables (users, families, questions, answers, risk_profiles)
- [ ] API endpoints (8 total)
- [ ] Question management system
- [ ] Answer storage system
- [ ] Score calculation logic
- [ ] Status progression logic

### Frontend Requirements
- [ ] Server component for data fetching (page.tsx)
- [ ] Client wizard component (OnboardingWizard.tsx)
- [ ] 4 step components
- [ ] Layout component with split-screen design
- [ ] Navigation component
- [ ] Validation logic per step
- [ ] Pre-profiler analysis utility
- [ ] Risk scoring utility
- [ ] React Query mutations (4 total)
- [ ] State management (local + server)
- [ ] Form handling
- [ ] Error handling & toasts

### Configuration
- [ ] Hybrid tag mappings (25 combinations)
- [ ] Profile descriptions (16 profiles)
- [ ] Risk categories (3 categories with allocations)
- [ ] Step configurations (4 steps)
- [ ] Icon mappings
- [ ] Color schemes

### Testing Scenarios
- [ ] Family head full flow (4 steps)
- [ ] Family member flow (1 step)
- [ ] Resume from each step
- [ ] Form validation
- [ ] API error handling
- [ ] Real-time calculations
- [ ] Navigation (forward/backward)
- [ ] Completion redirect
- [ ] Already completed state

---

## Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# API Base URL
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## Dependencies

```json
{
  "@clerk/nextjs": "^5.x",
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "next": "^14.x",
  "react": "^18.x",
  "sonner": "^1.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-*": "shadcn/ui components"
}
```

---

This documentation captures the complete core logic, flows, and user journey of the onboarding system. Use it as a comprehensive reference to recreate or modify the onboarding process.
