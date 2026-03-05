// Sample Task Data Generator (v2 — with Financial Operation Types & Snoozed Tasks)
// Creates realistic sample tasks for testing and demonstration

import type { Task, TaskContextType, TaskPriority, TaskStatus, TaskOperationType } from '@/types/tasks';
import { addDays, subDays, format } from 'date-fns';

// Sample families (would come from family service in production)
const SAMPLE_FAMILIES = [
  { id: 'family-001', name: 'Sharma Family' },
  { id: 'family-002', name: 'Patel Family' },
  { id: 'family-003', name: 'Gupta Family' },
  { id: 'family-004', name: 'Singh Family' },
  { id: 'family-005', name: 'Kumar Family' },
  { id: 'family-006', name: 'Joshi Family' },
  { id: 'family-007', name: 'Reddy Family' },
  { id: 'family-008', name: 'Malhotra Family' },
];

// Sample users (would come from user service in production)
const SAMPLE_USERS = {
  admin: { id: 'user-admin-1', name: 'Admin User' },
  rm1: { id: 'user-rm-1', name: 'Raj Kumar' },
  rm2: { id: 'user-rm-2', name: 'Priya Sharma' },
  rm3: { id: 'user-rm-3', name: 'Arjun Patel' },
};

// ─── Financial Operation Task Templates ────────────────────────────────────────

interface TaskTemplate {
  title: string;
  description: string;
  context_type: TaskContextType;
  operation_type?: TaskOperationType;
  priority: TaskPriority;
  dueInDays: number; // negative = overdue, 0 = today, positive = future
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // ── SIP tasks ──
  {
    title: 'SIP Setup — Monthly ₹10,000 in Axis Bluechip',
    description: 'Set up new SIP for client in Axis Bluechip Fund. Direct plan, growth option. Monthly debit on 5th.',
    context_type: 'general',
    operation_type: 'sip_setup',
    priority: 'high',
    dueInDays: 0,
  },
  {
    title: 'SIP Cancellation — HDFC Top 100',
    description: 'Client wants to stop SIP in HDFC Top 100. Cancel via AMC portal and confirm to client.',
    context_type: 'general',
    operation_type: 'sip_cancellation',
    priority: 'medium',
    dueInDays: 2,
  },

  // ── SWP tasks ──
  {
    title: 'SWP Setup — ₹25,000/month from ICICI Balanced',
    description: 'Setup systematic withdrawal of ₹25,000 monthly from ICICI Balanced Advantage Fund.',
    context_type: 'general',
    operation_type: 'swp_setup',
    priority: 'high',
    dueInDays: 1,
  },

  // ── STP tasks ──
  {
    title: 'STP Setup — Liquid to Equity over 6 months',
    description: 'Transfer ₹5L from SBI Liquid Fund to SBI Equity Hybrid via monthly STP over 6 months.',
    context_type: 'general',
    operation_type: 'stp_setup',
    priority: 'medium',
    dueInDays: 3,
  },

  // ── Switch tasks ──
  {
    title: 'Switch — Mirae Large Cap to Mirae Flexi Cap',
    description: 'Client wants to switch entire holding from Mirae Large Cap to Mirae Flexi Cap fund.',
    context_type: 'general',
    operation_type: 'switch_plans',
    priority: 'high',
    dueInDays: -1,
  },

  // ── Lumpsum ──
  {
    title: 'Lumpsum ₹5,00,000 — Parag Parikh Flexi Cap',
    description: 'One-time investment of ₹5L in Parag Parikh Flexi Cap. Client transferred funds.',
    context_type: 'general',
    operation_type: 'lumpsum_investment',
    priority: 'urgent',
    dueInDays: 0,
  },

  // ── Redemption ──
  {
    title: 'Partial Redemption — ₹2L from Kotak Small Cap',
    description: 'Client needs ₹2L redeemed from Kotak Small Cap for home renovation. Process urgently.',
    context_type: 'general',
    operation_type: 'redemption',
    priority: 'urgent',
    dueInDays: -2,
  },

  // ── Client Onboarding ──
  {
    title: 'New Client Onboarding — Vikram Mehta',
    description: 'Complete Demat account opening, KYC verification, and risk profiling for new client.',
    context_type: 'onboarding',
    operation_type: 'client_onboarding',
    priority: 'high',
    dueInDays: 5,
  },

  // ── KYC Update ──
  {
    title: 'KYC Rectification — Aadhar/PAN Name Mismatch',
    description: 'Client PAN name shows "Rajesh" but Aadhar shows "Rajeshwar". Needs correction before processing.',
    context_type: 'compliance',
    operation_type: 'kyc_update',
    priority: 'high',
    dueInDays: -3,
  },

  // ── Bank Mandate (OTM) ──
  {
    title: 'OTM Registration — HDFC Bank Account',
    description: 'Register One-Time Mandate for auto-debit from client HDFC Bank savings account. Limit ₹50,000.',
    context_type: 'general',
    operation_type: 'bank_mandate',
    priority: 'medium',
    dueInDays: 7,
  },

  // ── Nomination Update ──
  {
    title: 'Nomination Update — Add spouse as nominee',
    description: 'Client recently married. Update nominee from parent to spouse across all folios.',
    context_type: 'compliance',
    operation_type: 'nomination_update',
    priority: 'low',
    dueInDays: 14,
  },

  // ── Portfolio Review ──
  {
    title: 'Quarterly Portfolio Review — Q1 2026',
    description: 'Prepare performance report and rebalancing recommendations for quarterly advisory call.',
    context_type: 'meeting',
    operation_type: 'other',
    priority: 'medium',
    dueInDays: 4,
  },

  // ── More variety ──
  {
    title: 'SIP Setup — ₹5,000 in Nifty 50 Index Fund',
    description: 'New index fund SIP for young investor. Monthly on 15th via UPI mandate.',
    context_type: 'general',
    operation_type: 'sip_setup',
    priority: 'low',
    dueInDays: 10,
  },
  {
    title: 'Complete KYC documentation',
    description: 'Collect and verify PAN, Aadhaar, and cancelled cheque for new client.',
    context_type: 'onboarding',
    operation_type: 'kyc_update',
    priority: 'high',
    dueInDays: -2,
  },
  {
    title: 'STP Transfer — ₹1L/month Debt to Equity',
    description: 'Monthly systematic transfer from HDFC Corporate Bond to HDFC Mid Cap Opportunities.',
    context_type: 'general',
    operation_type: 'stp_setup',
    priority: 'medium',
    dueInDays: 6,
  },
  {
    title: 'Full Redemption — Exit from Franklin India Focused Equity',
    description: 'Client exiting position entirely. Proceed with full redemption and send confirmation.',
    context_type: 'general',
    operation_type: 'redemption',
    priority: 'high',
    dueInDays: 1,
  },
  {
    title: 'Switch — Regular to Direct Plan (Motilal Oswal Midcap)',
    description: 'Client wants to switch from Regular to Direct plan to save on expense ratio.',
    context_type: 'general',
    operation_type: 'switch_plans',
    priority: 'low',
    dueInDays: 12,
  },
  {
    title: 'Portfolio Review — Year-End Tax Harvesting',
    description: 'Review portfolio for tax-loss harvesting opportunities before March 31 deadline.',
    context_type: 'meeting',
    operation_type: 'other',
    priority: 'urgent',
    dueInDays: 0,
  },
  {
    title: 'Bank Mandate Renewal — ICICI Account',
    description: 'Existing OTM expired. Re-register with updated limit of ₹1,00,000.',
    context_type: 'general',
    operation_type: 'bank_mandate',
    priority: 'medium',
    dueInDays: 5,
  },
];

// ─── Snooze reason templates for mock snoozed tasks ────────────────────────────
const SNOOZE_REASONS = [
  'Aadhar/PAN Mismatch',
  'Awaiting Client Signature',
  'Insufficient Funds',
  'Client Unavailable',
  'Waiting for Bank Mandate',
  'Document Verification Pending',
];

/**
 * Generate sample tasks with realistic distribution, including snoozed tasks.
 * Status distribution: ~20% todo, ~30% in_progress, ~15% waiting_on_client (snoozed),
 * ~10% blocked, ~25% done
 */
export function generateSampleTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();

  TASK_TEMPLATES.forEach((template, index) => {
    const familyIndex = index % SAMPLE_FAMILIES.length;
    const rmIndex = index % 3;
    const family = SAMPLE_FAMILIES[familyIndex];
    const rm = [SAMPLE_USERS.rm1, SAMPLE_USERS.rm2, SAMPLE_USERS.rm3][rmIndex];

    // Determine status based on distribution
    let status: TaskStatus;
    const statusRand = Math.random();
    if (statusRand < 0.20) {
      status = 'todo';
    } else if (statusRand < 0.50) {
      status = 'in_progress';
    } else if (statusRand < 0.65) {
      status = 'waiting_on_client'; // Snoozed
    } else if (statusRand < 0.75) {
      status = 'blocked';
    } else {
      status = 'done';
    }

    // Calculate due date
    const dueDate = format(
      template.dueInDays >= 0
        ? addDays(now, template.dueInDays)
        : subDays(now, Math.abs(template.dueInDays)),
      'yyyy-MM-dd'
    );

    // Random due time for some tasks
    const dueTime =
      Math.random() > 0.5
        ? `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`
        : undefined;

    // Created date (7-30 days ago)
    const createdAt = subDays(now, 7 + Math.floor(Math.random() * 23)).toISOString();

    // Updated date (between created and now)
    const updatedAt =
      status !== 'todo'
        ? addDays(new Date(createdAt), Math.floor(Math.random() * 7)).toISOString()
        : createdAt;

    // Completion data for done tasks
    const completedAt =
      status === 'done'
        ? addDays(new Date(createdAt), Math.floor(Math.random() * 7)).toISOString()
        : undefined;

    // Snooze data for waiting_on_client tasks
    const isSnoozed = status === 'waiting_on_client';
    const snoozeDate = isSnoozed
      ? format(addDays(now, 1 + Math.floor(Math.random() * 7)), 'yyyy-MM-dd')
      : undefined;
    const snoozeReason = isSnoozed
      ? SNOOZE_REASONS[Math.floor(Math.random() * SNOOZE_REASONS.length)]
      : undefined;

    const task: Task = {
      id: `task-${Date.now()}-${index}`,
      title: template.title,
      description: template.description,
      context_type: template.context_type,
      operation_type: template.operation_type,
      family_id: family.id,
      family_name: family.name,
      created_by: SAMPLE_USERS.admin.id,
      created_by_name: SAMPLE_USERS.admin.name,
      assigned_to: rm.id,
      assigned_to_name: rm.name,
      status,
      priority: template.priority,
      due_date: dueDate,
      due_time: dueTime,
      tags: [template.operation_type || template.context_type, family.name.split(' ')[0]],
      notes:
        status === 'in_progress'
          ? 'Working on this task, making good progress.'
          : isSnoozed
            ? `Snoozed: ${snoozeReason}`
            : undefined,
      created_at: createdAt,
      updated_at: updatedAt,
      completed_at: completedAt,
      completed_by: completedAt ? rm.id : undefined,
      completed_by_name: completedAt ? rm.name : undefined,
      completion_notes: completedAt ? 'Task completed successfully.' : undefined,
      // Snooze fields
      snooze_date: snoozeDate,
      snooze_reason: snoozeReason,
      snooze_count: isSnoozed ? 1 : 0,
      snoozed_at: isSnoozed ? updatedAt : undefined,
      is_follow_up_due: false,
      waitingOnWhat: isSnoozed ? snoozeReason : undefined,
      blockedReason: status === 'blocked' ? 'AMC portal down for maintenance' : undefined,
    };

    tasks.push(task);
  });

  // Add a few more random tasks for density
  for (let i = 0; i < 8; i++) {
    const templateIndex = Math.floor(Math.random() * TASK_TEMPLATES.length);
    const template = TASK_TEMPLATES[templateIndex];
    const familyIndex = Math.floor(Math.random() * SAMPLE_FAMILIES.length);
    const rmIndex = Math.floor(Math.random() * 3);
    const family = SAMPLE_FAMILIES[familyIndex];
    const rm = [SAMPLE_USERS.rm1, SAMPLE_USERS.rm2, SAMPLE_USERS.rm3][rmIndex];

    const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dueDate = format(addDays(now, Math.floor(Math.random() * 30)), 'yyyy-MM-dd');
    const createdAt = subDays(now, 1 + Math.floor(Math.random() * 10)).toISOString();

    const task: Task = {
      id: `task-${Date.now()}-${TASK_TEMPLATES.length + i}`,
      title: template.title,
      description: template.description,
      context_type: template.context_type,
      operation_type: template.operation_type,
      family_id: family.id,
      family_name: family.name,
      created_by: SAMPLE_USERS.admin.id,
      created_by_name: SAMPLE_USERS.admin.name,
      assigned_to: rm.id,
      assigned_to_name: rm.name,
      status,
      priority: template.priority,
      due_date: dueDate,
      tags: [template.operation_type || template.context_type],
      created_at: createdAt,
      updated_at: createdAt,
    };

    tasks.push(task);
  }

  return tasks;
}

// Export for use in tests
export { SAMPLE_FAMILIES, SAMPLE_USERS };
