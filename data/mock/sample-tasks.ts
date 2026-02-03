// Sample Task Data Generator
// Creates realistic sample tasks for testing and demonstration

import type { Task, TaskContextType, TaskPriority, TaskStatus } from '@/types/tasks';
import { addDays, subDays, format } from 'date-fns';

// Sample families (would come from family service in production)
const SAMPLE_FAMILIES = [
  { id: 'family-001', name: 'Smith Family' },
  { id: 'family-002', name: 'Johnson Family' },
  { id: 'family-003', name: 'Williams Family' },
  { id: 'family-004', name: 'Brown Family' },
  { id: 'family-005', name: 'Davis Family' },
  { id: 'family-006', name: 'Miller Family' },
  { id: 'family-007', name: 'Wilson Family' },
  { id: 'family-008', name: 'Moore Family' },
];

// Sample users (would come from user service in production)
const SAMPLE_USERS = {
  admin: { id: 'user-admin-1', name: 'Admin User' },
  rm1: { id: 'user-rm-1', name: 'Raj Kumar' },
  rm2: { id: 'user-rm-2', name: 'Priya Sharma' },
  rm3: { id: 'user-rm-3', name: 'Arjun Patel' },
};

// Task templates with variety
interface TaskTemplate {
  title: string;
  description: string;
  context_type: TaskContextType;
  priority: TaskPriority;
  dueInDays: number; // negative = overdue, 0 = today, positive = future
}

const TASK_TEMPLATES: TaskTemplate[] = [
  // Onboarding tasks
  {
    title: 'Complete KYC documentation',
    description: 'Collect and verify PAN, Aadhaar, and cancelled cheque for new client',
    context_type: 'onboarding',
    priority: 'high',
    dueInDays: -2, // Overdue
  },
  {
    title: 'Schedule onboarding call',
    description: 'Set up initial consultation to understand family financial goals',
    context_type: 'onboarding',
    priority: 'urgent',
    dueInDays: 0, // Due today
  },
  {
    title: 'Set up client portal access',
    description: 'Create login credentials and send welcome email with portal instructions',
    context_type: 'onboarding',
    priority: 'medium',
    dueInDays: 1,
  },
  {
    title: 'Collect risk profile questionnaire',
    description: 'Send risk assessment form and schedule review meeting',
    context_type: 'onboarding',
    priority: 'high',
    dueInDays: 3,
  },

  // Compliance tasks
  {
    title: 'Annual compliance review',
    description: 'Review and update client compliance documents for regulatory requirements',
    context_type: 'compliance',
    priority: 'urgent',
    dueInDays: -5, // Overdue
  },
  {
    title: 'Update FATCA declaration',
    description: 'Get updated FATCA self-certification from client',
    context_type: 'compliance',
    priority: 'high',
    dueInDays: 7,
  },
  {
    title: 'Verify address proof',
    description: 'Collect and verify updated address proof (within 3 months)',
    context_type: 'compliance',
    priority: 'medium',
    dueInDays: 14,
  },

  // Document tasks
  {
    title: 'Review quarterly tax report',
    description: 'Analyze tax documents and prepare summary for client review',
    context_type: 'document',
    priority: 'high',
    dueInDays: 2,
  },
  {
    title: 'Upload investment statements',
    description: 'Scan and upload all investment statements to client portal',
    context_type: 'document',
    priority: 'low',
    dueInDays: 10,
  },
  {
    title: 'Organize estate planning documents',
    description: 'Compile will, trust documents, and nominee declarations',
    context_type: 'document',
    priority: 'medium',
    dueInDays: 21,
  },

  // Meeting tasks
  {
    title: 'Prepare Q1 portfolio review',
    description: 'Compile portfolio performance report and investment recommendations',
    context_type: 'meeting',
    priority: 'high',
    dueInDays: 1,
  },
  {
    title: 'Follow up on annual planning meeting',
    description: 'Send meeting notes and action items from annual financial planning session',
    context_type: 'meeting',
    priority: 'medium',
    dueInDays: -1, // Overdue by 1 day
  },
  {
    title: 'Schedule mid-year check-in',
    description: 'Coordinate with client for semi-annual portfolio review meeting',
    context_type: 'meeting',
    priority: 'low',
    dueInDays: 30,
  },

  // General tasks
  {
    title: 'Update client contact information',
    description: 'Verify and update phone, email, and mailing address in CRM',
    context_type: 'general',
    priority: 'low',
    dueInDays: 5,
  },
  {
    title: 'Send birthday wishes',
    description: 'Personalized birthday card and follow-up call',
    context_type: 'general',
    priority: 'low',
    dueInDays: 0,
  },
  {
    title: 'Review insurance coverage',
    description: 'Annual review of life and health insurance policies',
    context_type: 'general',
    priority: 'medium',
    dueInDays: 15,
  },
  {
    title: 'Update investment policy statement',
    description: 'Review and revise IPS based on changed circumstances',
    context_type: 'general',
    priority: 'medium',
    dueInDays: 20,
  },
  {
    title: 'Reconcile account balances',
    description: 'Verify all account balances match bank and brokerage statements',
    context_type: 'general',
    priority: 'low',
    dueInDays: 7,
  },
  {
    title: 'Generate monthly performance report',
    description: 'Create comprehensive performance dashboard for client review',
    context_type: 'general',
    priority: 'medium',
    dueInDays: 4,
  },
];

/**
 * Generate sample tasks with realistic distribution
 * - 25% todo
 * - 40% in_progress
 * - 20% in_review
 * - 15% done
 */
export function generateSampleTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();

  // Generate 30 tasks from templates
  TASK_TEMPLATES.forEach((template, index) => {
    // Cycle through families and RMs
    const familyIndex = index % SAMPLE_FAMILIES.length;
    const rmIndex = index % 3; // Rotate between 3 RMs
    const family = SAMPLE_FAMILIES[familyIndex];
    const rm = [SAMPLE_USERS.rm1, SAMPLE_USERS.rm2, SAMPLE_USERS.rm3][rmIndex];

    // Determine status based on distribution
    let status: TaskStatus;
    const statusRand = Math.random();
    if (statusRand < 0.25) {
      status = 'todo';
    } else if (statusRand < 0.65) {
      status = 'in_progress';
    } else if (statusRand < 0.85) {
      status = 'in_review';
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

    const task: Task = {
      id: `task-${Date.now()}-${index}`,
      title: template.title,
      description: template.description,
      context_type: template.context_type,
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
      tags: [template.context_type, family.name.split(' ')[0]],
      notes:
        status === 'in_progress'
          ? 'Working on this task, making good progress.'
          : undefined,
      created_at: createdAt,
      updated_at: updatedAt,
      completed_at: completedAt,
      completed_by: completedAt ? rm.id : undefined,
      completed_by_name: completedAt ? rm.name : undefined,
      completion_notes: completedAt ? 'Task completed successfully.' : undefined,
    };

    tasks.push(task);
  });

  // Add a few more tasks with variation
  for (let i = 0; i < 10; i++) {
    const templateIndex = Math.floor(Math.random() * TASK_TEMPLATES.length);
    const template = TASK_TEMPLATES[templateIndex];
    const familyIndex = Math.floor(Math.random() * SAMPLE_FAMILIES.length);
    const rmIndex = Math.floor(Math.random() * 3);
    const family = SAMPLE_FAMILIES[familyIndex];
    const rm = [SAMPLE_USERS.rm1, SAMPLE_USERS.rm2, SAMPLE_USERS.rm3][rmIndex];

    // Random status
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Random due date within next 30 days
    const dueDate = format(addDays(now, Math.floor(Math.random() * 30)), 'yyyy-MM-dd');

    const createdAt = subDays(now, 1 + Math.floor(Math.random() * 10)).toISOString();

    const task: Task = {
      id: `task-${Date.now()}-${TASK_TEMPLATES.length + i}`,
      title: template.title,
      description: template.description,
      context_type: template.context_type,
      family_id: family.id,
      family_name: family.name,
      created_by: SAMPLE_USERS.admin.id,
      created_by_name: SAMPLE_USERS.admin.name,
      assigned_to: rm.id,
      assigned_to_name: rm.name,
      status,
      priority: template.priority,
      due_date: dueDate,
      tags: [template.context_type],
      created_at: createdAt,
      updated_at: createdAt,
    };

    tasks.push(task);
  }

  return tasks;
}

// Export for use in tests
export { SAMPLE_FAMILIES, SAMPLE_USERS };
