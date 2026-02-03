import { MessageService } from "./message-service";
import { MeetingService } from "./meeting-service";
import { GoalsService } from "./goals-service";
import { ClientService } from "./client-service";
import { MessageDraft, MessagePriority, MessageCategory } from "@/types/messaging";
import { Meeting } from "@/types/meetings";
import { FinancialGoal } from "@/types/goals";
import { Client } from "@/types/clients";
import { LocalStorageService } from "@/lib/storage/localStorage";
import { generateSampleTasks } from "@/data/mock/sample-tasks";
import type { Task } from "@/types/tasks";

/**
 * Service to initialize sample data for testing
 */
export class SampleDataService {
  /**
   * Initialize sample messaging data
   */
  static initializeSampleMessages() {
    // Check if data already exists
    const existingThreads = MessageService.getAllThreads();
    if (existingThreads.length > 0) {
      console.log("Sample data already exists");
      return;
    }

    // Sample families
    const families = [
      { id: "fam-001", name: "Sharma Family" },
      { id: "fam-002", name: "Patel Family" },
      { id: "fam-003", name: "Kumar Family" },
    ];

    // Sample users (from mockAuth)
    const adminUser = { id: "user-admin", name: "Admin User", role: "admin" as const };
    const rmUser = { id: "user-rm", name: "Rajesh Kumar", role: "rm" as const };

    // Create sample threads and messages
    families.forEach((family, index) => {
      // First message from admin to family
      const welcomeDraft: MessageDraft = {
        familyId: family.id,
        familyName: family.name,
        subject: "Welcome to NRP Wealth Management",
        content: `Dear ${family.name},\n\nWelcome to NRP Wealth Management! We're excited to have you onboard.\n\nWe will be reaching out shortly to schedule your onboarding meeting. In the meantime, please feel free to reach out if you have any questions.\n\nBest regards,\nNRP Team`,
        priority: "medium" as MessagePriority,
        category: "onboarding" as MessageCategory,
        isInternal: false,
      };

      const welcomeMessage = MessageService.sendMessage(
        welcomeDraft,
        adminUser.id,
        adminUser.name,
        adminUser.role
      );

      // Simulate a delay
      setTimeout(() => {}, 100);

      // RM response (internal note)
      const internalDraft: MessageDraft = {
        threadId: welcomeMessage.threadId,
        content: `Internal note: ${family.name} has been assigned to me. Will schedule initial meeting for next week. Need to verify their KYC documents first.`,
        priority: "medium" as MessagePriority,
        category: "onboarding" as MessageCategory,
        isInternal: true, // This will be hidden from family
      };

      MessageService.sendMessage(
        internalDraft,
        rmUser.id,
        rmUser.name,
        rmUser.role
      );

      // High priority message for first family
      if (index === 0) {
        const urgentDraft: MessageDraft = {
          threadId: welcomeMessage.threadId,
          content: `URGENT: We need your PAN card and Aadhaar card uploaded by end of this week to complete your onboarding.\n\nPlease use the temporary access link we sent to your email to upload the documents.`,
          priority: "high" as MessagePriority,
          category: "compliance" as MessageCategory,
          isInternal: false,
        };

        MessageService.sendMessage(
          urgentDraft,
          rmUser.id,
          rmUser.name,
          rmUser.role
        );
      }

      // Regular follow-up for second family
      if (index === 1) {
        const followUpDraft: MessageDraft = {
          threadId: welcomeMessage.threadId,
          content: `Thank you for uploading your documents. We have received:\n\n✓ PAN Card\n✓ Aadhaar Card\n✓ Cancelled Cheque\n\nOur team is currently verifying these documents. We'll update you within 2 business days.`,
          priority: "low" as MessagePriority,
          category: "general" as MessageCategory,
          isInternal: false,
        };

        MessageService.sendMessage(
          followUpDraft,
          adminUser.id,
          adminUser.name,
          adminUser.role
        );
      }
    });

    console.log("✅ Sample messaging data initialized successfully!");
    console.log(`Created ${families.length} conversation threads with multiple messages`);
  }

  /**
   * Initialize sample task data
   */
  static initializeSampleTasks() {
    // Check if tasks already exist
    const existingTasks = LocalStorageService.get<Task[]>("nrp_crm_tasks", []);
    if (existingTasks.length > 0) {
      console.log("Sample tasks already exist");
      return;
    }

    // Generate and save sample tasks
    const tasks = generateSampleTasks();
    LocalStorageService.set("nrp_crm_tasks", tasks);

    console.log("✅ Sample task data initialized successfully!");
    console.log(`Created ${tasks.length} sample tasks`);
    console.log(
      `- ${tasks.filter((t) => t.status === "todo").length} To Do`,
    );
    console.log(
      `- ${tasks.filter((t) => t.status === "in_progress").length} In Progress`,
    );
    console.log(
      `- ${tasks.filter((t) => t.status === "in_review").length} In Review`,
    );
    console.log(
      `- ${tasks.filter((t) => t.status === "done").length} Done`,
    );
  }

  /**
   * Initialize sample meeting data
   */
  static initializeSampleMeetings() {
    // Check if data already exists
    const existingMeetings = MeetingService.getAll();
    if (existingMeetings.length > 0) {
      console.log("Sample meeting data already exists");
      return;
    }

    // Sample meetings
    const meetings: Meeting[] = [
      {
        id: "mtg-1",
        family_id: "fam-001",
        family_name: "Sharma Family",
        title: "Quarterly Portfolio Review - Q1 2026",
        description: "Review Q1 2026 performance, discuss rebalancing, and update financial goals",
        type: "quarterly_review",
        status: "scheduled",
        scheduled_date: "2026-02-15T14:00:00Z",
        duration_minutes: 60,
        location: "Virtual",
        meeting_url: "https://zoom.us/j/123456789",
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        attendees: [
          {
            user_id: "sharma-1",
            user_name: "Amit Sharma",
            user_role: "family",
            attendance_status: "confirmed",
          },
          {
            user_id: "user-rm",
            user_name: "Rajesh Kumar",
            user_role: "rm",
            attendance_status: "confirmed",
          },
        ],
        agenda_items: [
          "Review Q1 portfolio performance",
          "Discuss tax planning for FY 2025-26",
          "Update retirement goal progress",
          "Rebalancing recommendations",
        ],
        created_by: "user-rm",
        created_at: "2026-01-20T10:00:00Z",
        updated_at: "2026-01-20T10:00:00Z",
      },
      {
        id: "mtg-2",
        family_id: "fam-001",
        family_name: "Sharma Family",
        title: "Annual Financial Planning Session",
        description: "Comprehensive review of financial goals and investment strategy for 2026",
        type: "annual_review",
        status: "completed",
        scheduled_date: "2026-01-10T15:00:00Z",
        duration_minutes: 90,
        location: "NRP Office, Mumbai",
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        attendees: [
          {
            user_id: "sharma-1",
            user_name: "Amit Sharma",
            user_role: "family",
            attendance_status: "confirmed",
          },
          {
            user_id: "user-rm",
            user_name: "Rajesh Kumar",
            user_role: "rm",
            attendance_status: "confirmed",
          },
        ],
        agenda_items: [
          "Review 2025 performance",
          "Update 2026 financial goals",
          "Discuss education fund for children",
          "Tax optimization strategies",
        ],
        meeting_notes: "Client satisfied with 2025 returns (18.5% XIRR). Discussed increasing allocation to debt funds for daughter's education in 3 years. Action: Prepare education fund proposal.",
        action_items: [
          {
            id: "action-1",
            description: "Prepare education fund investment proposal",
            assigned_to: "user-rm",
            assigned_to_name: "Rajesh Kumar",
            due_date: "2026-01-17T00:00:00Z",
            status: "completed",
            completed_at: "2026-01-16T12:00:00Z",
          },
        ],
        created_by: "user-rm",
        created_at: "2025-12-15T10:00:00Z",
        updated_at: "2026-01-10T17:00:00Z",
      },
      {
        id: "mtg-3",
        family_id: "fam-002",
        family_name: "Patel Family",
        title: "Initial Consultation",
        description: "First meeting to understand financial goals and current portfolio",
        type: "initial_consultation",
        status: "scheduled",
        scheduled_date: "2026-02-20T10:00:00Z",
        duration_minutes: 60,
        location: "Virtual",
        meeting_url: "https://meet.google.com/abc-defg-hij",
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        attendees: [
          {
            user_id: "patel-1",
            user_name: "Priya Patel",
            user_role: "family",
            attendance_status: "confirmed",
          },
          {
            user_id: "user-rm",
            user_name: "Rajesh Kumar",
            user_role: "rm",
            attendance_status: "confirmed",
          },
        ],
        agenda_items: [
          "Understand financial goals",
          "Review current portfolio",
          "Discuss risk profile",
          "Explain NRP services",
        ],
        created_by: "user-rm",
        created_at: "2026-02-01T09:00:00Z",
        updated_at: "2026-02-01T09:00:00Z",
      },
      {
        id: "mtg-4",
        family_id: "fam-003",
        family_name: "Kumar Family",
        title: "Portfolio Rebalancing Discussion",
        description: "Discuss Q4 2025 performance and rebalancing strategy",
        type: "portfolio_review",
        status: "completed",
        scheduled_date: "2026-01-05T11:00:00Z",
        duration_minutes: 45,
        location: "Virtual",
        meeting_url: "https://zoom.us/j/987654321",
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        attendees: [
          {
            user_id: "kumar-1",
            user_name: "Vikram Kumar",
            user_role: "family",
            attendance_status: "confirmed",
          },
          {
            user_id: "user-rm",
            user_name: "Rajesh Kumar",
            user_role: "rm",
            attendance_status: "confirmed",
          },
        ],
        agenda_items: [
          "Review Q4 2025 performance",
          "Discuss equity-debt rebalancing",
          "Tax loss harvesting opportunities",
        ],
        meeting_notes: "Portfolio up 22% in 2025. Client wants to reduce equity exposure from 70% to 60%. Proceeding with rebalancing next week.",
        created_by: "user-rm",
        created_at: "2025-12-20T10:00:00Z",
        updated_at: "2026-01-05T12:00:00Z",
      },
      {
        id: "mtg-5",
        family_id: "fam-001",
        family_name: "Sharma Family",
        title: "Mid-Year Review",
        description: "Review H1 2026 performance and adjust strategy if needed",
        type: "portfolio_review",
        status: "scheduled",
        scheduled_date: "2026-07-15T14:00:00Z",
        duration_minutes: 60,
        location: "Virtual",
        meeting_url: "https://zoom.us/j/111222333",
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        attendees: [
          {
            user_id: "sharma-1",
            user_name: "Amit Sharma",
            user_role: "family",
            attendance_status: "no_response",
          },
          {
            user_id: "user-rm",
            user_name: "Rajesh Kumar",
            user_role: "rm",
            attendance_status: "confirmed",
          },
        ],
        agenda_items: [
          "Review H1 2026 performance",
          "Check goal progress",
          "Discuss any major changes",
        ],
        created_by: "user-rm",
        created_at: "2026-02-01T10:00:00Z",
        updated_at: "2026-02-01T10:00:00Z",
      },
    ];

    MeetingService.saveAll(meetings);

    console.log("✅ Sample meeting data initialized successfully!");
    console.log(`Created ${meetings.length} sample meetings`);
  }

  /**
   * Initialize sample financial goals data
   */
  static initializeSampleGoals() {
    // Check if data already exists
    const existingGoals = GoalsService.getAll();
    if (existingGoals.length > 0) {
      console.log("Sample goals data already exists");
      return;
    }

    // Sample goals
    const goals: FinancialGoal[] = [
      {
        id: "goal-1",
        family_id: "fam-001",
        title: "Retirement Fund",
        description: "Build retirement corpus for comfortable post-retirement life",
        type: "retirement",
        status: "on_track",
        target_amount: 50000000, // ₹5 Crores
        current_amount: 18500000, // ₹1.85 Crores
        monthly_contribution: 150000, // ₹1.5 Lakhs
        target_date: "2040-12-31",
        start_date: "2020-01-01",
        progress_percent: 37,
        is_achievable: true,
        created_at: "2020-01-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        last_reviewed_at: "2026-01-10T00:00:00Z",
      },
      {
        id: "goal-2",
        family_id: "fam-001",
        title: "Daughter's Education Fund",
        description: "Fund for daughter's higher education (MBA/MS abroad)",
        type: "education",
        status: "on_track",
        target_amount: 15000000, // ₹1.5 Crores
        current_amount: 4200000, // ₹42 Lakhs
        monthly_contribution: 100000, // ₹1 Lakh
        target_date: "2029-06-30",
        start_date: "2022-01-01",
        progress_percent: 28,
        is_achievable: true,
        created_at: "2022-01-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        last_reviewed_at: "2026-01-10T00:00:00Z",
      },
      {
        id: "goal-3",
        family_id: "fam-001",
        title: "Emergency Fund",
        description: "6 months of expenses as emergency fund",
        type: "emergency_fund",
        status: "achieved",
        target_amount: 1800000, // ₹18 Lakhs
        current_amount: 1850000, // ₹18.5 Lakhs
        monthly_contribution: 0,
        target_date: "2025-12-31",
        start_date: "2023-01-01",
        progress_percent: 100,
        is_achievable: true,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2025-11-15T00:00:00Z",
        last_reviewed_at: "2025-11-15T00:00:00Z",
      },
      {
        id: "goal-4",
        family_id: "fam-002",
        title: "Home Purchase Down Payment",
        description: "Save down payment for 3BHK apartment in Bangalore",
        type: "home_purchase",
        status: "at_risk",
        target_amount: 8000000, // ₹80 Lakhs
        current_amount: 2500000, // ₹25 Lakhs
        monthly_contribution: 80000, // ₹80k
        target_date: "2027-12-31",
        start_date: "2024-01-01",
        progress_percent: 31,
        is_achievable: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
      },
      {
        id: "goal-5",
        family_id: "fam-003",
        title: "Wealth Target - 10 Crores",
        description: "Build net worth of ₹10 Crores by 2035",
        type: "wealth_target",
        status: "on_track",
        target_amount: 100000000, // ₹10 Crores
        current_amount: 32000000, // ₹3.2 Crores
        monthly_contribution: 200000, // ₹2 Lakhs
        target_date: "2035-12-31",
        start_date: "2020-01-01",
        progress_percent: 32,
        is_achievable: true,
        created_at: "2020-01-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        last_reviewed_at: "2026-01-05T00:00:00Z",
      },
    ];

    GoalsService.saveAll(goals);

    console.log("✅ Sample goals data initialized successfully!");
    console.log(`Created ${goals.length} financial goals`);
  }

  /**
   * Initialize sample client data
   */
  static initializeSampleClients() {
    // Check if data already exists
    const existingClients = ClientService.getAll();
    if (existingClients.length > 0) {
      console.log("Sample client data already exists");
      return;
    }

    // Sample clients
    const clients: Client[] = [
      {
        id: "fam-001",
        name: "Sharma Family",
        primary_contact_name: "Amit Sharma",
        primary_contact_email: "amit.sharma@email.com",
        primary_contact_phone: "+91 98765 43210",
        address: "123 MG Road, Koramangala",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560034",

        // RM Assignment
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        assigned_date: "2023-01-15T00:00:00Z",

        // Status
        status: "active",
        review_status: "current",
        onboarding_status: "completed",
        onboarding_completed_date: "2023-02-20T00:00:00Z",
        kyc_status: "verified",

        // Financial
        total_aum: 45000000, // ₹4.5 Cr
        invested_amount: 38000000,
        current_value: 45000000,
        unrealized_gain: 7000000,
        unrealized_gain_percent: 18.42,
        one_year_return: 18.5,

        // Service
        tier: "tier_1",
        service_type: "nrp_360",
        risk_profile: "balanced",

        // Dates
        first_investment_date: "2023-03-01T00:00:00Z",
        last_contact_date: "2026-01-10T00:00:00Z",
        last_meeting_date: "2026-01-10T00:00:00Z",
        next_review_date: "2026-04-15T00:00:00Z",

        // Family interface
        primaryContactId: "contact-sharma",
        members: [
          {
            id: "member-sharma-1",
            name: "Amit Sharma",
            relationship: "self",
            email: "amit.sharma@email.com",
            phone: "+91 98765 43210",
          },
          {
            id: "member-sharma-2",
            name: "Priya Sharma",
            relationship: "spouse",
            email: "priya.sharma@email.com",
          },
        ],
        createdAt: new Date("2023-01-15"),
        updatedAt: new Date("2026-02-01"),

        // Meta
        tags: ["High Value", "Engaged"],
        notes: "Very engaged client. Strong portfolio performance. Interested in tax optimization.",
        created_at: "2023-01-15T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        created_by: "user-admin",
      },
      {
        id: "fam-002",
        name: "Patel Family",
        primary_contact_name: "Priya Patel",
        primary_contact_email: "priya.patel@email.com",
        primary_contact_phone: "+91 98765 43211",
        address: "456 Indiranagar",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560038",

        // RM Assignment
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        assigned_date: "2024-06-01T00:00:00Z",

        // Status
        status: "onboarding",
        review_status: "current",
        onboarding_status: "in_progress",
        kyc_status: "submitted",

        // Financial
        total_aum: 0,
        tier: "prospect",
        service_type: "nrp_light",
        risk_profile: "moderate",

        // Dates
        last_contact_date: "2026-02-01T00:00:00Z",
        next_review_date: "2026-03-01T00:00:00Z",

        // Family interface
        primaryContactId: "contact-patel",
        members: [
          {
            id: "member-patel-1",
            name: "Priya Patel",
            relationship: "self",
            email: "priya.patel@email.com",
            phone: "+91 98765 43211",
          },
        ],
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2026-02-01"),

        // Meta
        tags: ["New Client", "Onboarding"],
        notes: "Recently onboarded. Awaiting KYC verification.",
        created_at: "2024-06-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        created_by: "user-rm",
      },
      {
        id: "fam-003",
        name: "Kumar Family",
        primary_contact_name: "Vikram Kumar",
        primary_contact_email: "vikram.kumar@email.com",
        primary_contact_phone: "+91 98765 43212",
        address: "789 Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560066",

        // RM Assignment
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        assigned_date: "2022-03-10T00:00:00Z",

        // Status
        status: "active",
        review_status: "due_soon",
        onboarding_status: "completed",
        onboarding_completed_date: "2022-04-15T00:00:00Z",
        kyc_status: "verified",

        // Financial
        total_aum: 85000000, // ₹8.5 Cr
        invested_amount: 70000000,
        current_value: 85000000,
        unrealized_gain: 15000000,
        unrealized_gain_percent: 21.43,
        one_year_return: 22.0,

        // Service
        tier: "tier_1",
        service_type: "nrp_360",
        risk_profile: "aggressive",

        // Dates
        first_investment_date: "2022-05-01T00:00:00Z",
        last_contact_date: "2026-01-05T00:00:00Z",
        last_meeting_date: "2026-01-05T00:00:00Z",
        next_review_date: "2026-02-20T00:00:00Z",

        // Family interface
        primaryContactId: "contact-kumar",
        members: [
          {
            id: "member-kumar-1",
            name: "Vikram Kumar",
            relationship: "self",
            email: "vikram.kumar@email.com",
            phone: "+91 98765 43212",
          },
        ],
        createdAt: new Date("2022-03-10"),
        updatedAt: new Date("2026-02-01"),

        // Meta
        tags: ["High Value", "Growth Focus"],
        notes: "Aggressive investor. Portfolio up 22% in 2025. Review due soon.",
        created_at: "2022-03-10T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        created_by: "user-admin",
      },
      {
        id: "fam-004",
        name: "Reddy Family",
        primary_contact_name: "Sanjay Reddy",
        primary_contact_email: "sanjay.reddy@email.com",
        primary_contact_phone: "+91 98765 43213",
        address: "321 JP Nagar",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560078",

        // RM Assignment
        assigned_rm_id: "user-rm",
        assigned_rm_name: "Rajesh Kumar",
        assigned_date: "2025-11-01T00:00:00Z",

        // Status
        status: "active",
        review_status: "overdue",
        onboarding_status: "completed",
        onboarding_completed_date: "2025-12-10T00:00:00Z",
        kyc_status: "verified",

        // Financial
        total_aum: 25000000, // ₹2.5 Cr
        invested_amount: 22000000,
        current_value: 25000000,
        unrealized_gain: 3000000,
        unrealized_gain_percent: 13.64,
        one_year_return: 14.0,

        // Service
        tier: "tier_2",
        service_type: "nrp_light",
        risk_profile: "conservative",

        // Dates
        first_investment_date: "2025-12-15T00:00:00Z",
        last_contact_date: "2025-12-10T00:00:00Z",
        last_meeting_date: "2025-12-10T00:00:00Z",
        next_review_date: "2026-01-15T00:00:00Z",

        // Family interface
        primaryContactId: "contact-reddy",
        members: [
          {
            id: "member-reddy-1",
            name: "Sanjay Reddy",
            relationship: "self",
            email: "sanjay.reddy@email.com",
            phone: "+91 98765 43213",
          },
        ],
        createdAt: new Date("2025-11-01"),
        updatedAt: new Date("2026-02-01"),

        // Meta
        tags: ["Conservative", "Review Overdue"],
        notes: "Conservative investor. Review overdue - schedule ASAP.",
        created_at: "2025-11-01T00:00:00Z",
        updated_at: "2026-02-01T00:00:00Z",
        created_by: "user-rm",
      },
      {
        id: "fam-005",
        name: "Gupta Family",
        primary_contact_name: "Rohit Gupta",
        primary_contact_email: "rohit.gupta@email.com",
        primary_contact_phone: "+91 98765 43214",
        city: "Mumbai",
        state: "Maharashtra",

        // RM Assignment - Unassigned prospect
        assigned_rm_id: undefined,
        assigned_rm_name: undefined,

        // Status
        status: "prospect",
        review_status: "current",
        onboarding_status: "not_started",
        kyc_status: "pending",

        // Financial
        total_aum: 0,
        tier: "prospect",
        service_type: "nrp_light",
        risk_profile: "moderate",

        // Dates
        last_contact_date: "2026-01-28T00:00:00Z",

        // Family interface
        primaryContactId: "contact-gupta",
        members: [
          {
            id: "member-gupta-1",
            name: "Rohit Gupta",
            relationship: "self",
            email: "rohit.gupta@email.com",
            phone: "+91 98765 43214",
          },
        ],
        createdAt: new Date("2026-01-28"),
        updatedAt: new Date("2026-01-28"),

        // Meta
        tags: ["Prospect", "Needs Follow-up"],
        notes: "New prospect from website inquiry. Not yet assigned to RM.",
        created_at: "2026-01-28T00:00:00Z",
        updated_at: "2026-01-28T00:00:00Z",
        created_by: "user-admin",
      },
    ];

    ClientService.saveAll(clients);

    console.log("✅ Sample client data initialized successfully!");
    console.log(`Created ${clients.length} sample clients`);
  }

  /**
   * Initialize all sample data
   */
  static initializeAllData() {
    this.initializeSampleClients();
    this.initializeSampleMessages();
    this.initializeSampleTasks();
    this.initializeSampleMeetings();
    this.initializeSampleGoals();

    // Initialize portfolio data
    const { initializeSamplePortfolios } = require('@/data/mock/sample-portfolios');
    initializeSamplePortfolios();
  }

  /**
   * Clear all sample data
   */
  static clearAllData() {
    if (typeof window === "undefined") return;

    const confirmed = confirm(
      "Are you sure you want to clear all data? This cannot be undone."
    );

    if (confirmed) {
      localStorage.removeItem("nrp_crm_clients");
      localStorage.removeItem("nrp_crm_message_threads");
      localStorage.removeItem("nrp_crm_messages");
      localStorage.removeItem("nrp_crm_calendar_events");
      localStorage.removeItem("nrp_crm_tasks");
      localStorage.removeItem("nrp_crm_meetings");
      localStorage.removeItem("nrp_crm_goals");
      console.log("✅ All data cleared");
      window.location.reload();
    }
  }

  /**
   * Get data statistics
   */
  static getDataStats() {
    const clients = ClientService.getAll();
    const threads = MessageService.getAllThreads();
    const messages = MessageService.getAllMessages();
    const tasks = LocalStorageService.get<Task[]>("nrp_crm_tasks", []);
    const meetings = MeetingService.getAll();
    const goals = GoalsService.getAll();

    return {
      clients: clients.length,
      threads: threads.length,
      messages: messages.length,
      internalMessages: messages.filter((m) => m.isInternal).length,
      highPriorityMessages: messages.filter((m) => m.priority === "high").length,
      tasks: tasks.length,
      tasksByStatus: {
        todo: tasks.filter((t) => t.status === "todo").length,
        in_progress: tasks.filter((t) => t.status === "in_progress").length,
        in_review: tasks.filter((t) => t.status === "in_review").length,
        done: tasks.filter((t) => t.status === "done").length,
      },
      meetings: meetings.length,
      goals: goals.length,
    };
  }
}
