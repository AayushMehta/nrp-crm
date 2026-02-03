// data/mock/sample-clients.ts
// Sample client data for demo and development

import { Client } from "@/types/clients";

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: "client-001",
    name: "Sharma Family",
    primary_contact_name: "Rajesh Sharma",
    primary_contact_email: "rajesh.sharma@example.com",
    primary_contact_phone: "+91 98765 43210",
    address: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",

    // Status
    status: "active",
    review_status: "current",
    onboarding_status: "completed",
    kyc_status: "verified",

    // RM Assignment
    assigned_rm_id: "rm-1",
    assigned_rm_name: "Relationship Manager",
    assigned_date: "2024-01-15T00:00:00.000Z",

    // Financial
    total_aum: 15000000,
    invested_amount: 12000000,
    current_value: 15500000,
    unrealized_gain: 3500000,
    unrealized_gain_percent: 29.17,
    one_year_return: 18.5,

    // Service
    tier: "tier_1",
    service_type: "nrp_360",
    risk_profile: "aggressive",

    // Relationship
    last_contact_date: "2025-01-25T00:00:00.000Z",
    next_review_date: "2025-06-15T00:00:00.000Z",
    last_meeting_date: "2025-01-20T00:00:00.000Z",

    // Family interface
    primaryContactId: "family-1",
    members: [
      {
        id: "mem-1",
        userId: "family-1",
        name: "Rajesh Sharma",
        relationship: "self",
        email: "rajesh.sharma@example.com",
        phone: "+91 98765 43210",
      },
      {
        id: "mem-2",
        name: "Priya Sharma",
        relationship: "spouse",
        email: "priya.sharma@example.com",
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-01-25"),

    // Metadata
    notes: "High net worth family. Interested in aggressive growth strategies.",
    tags: ["HNI", "Tech Sector", "Active Investor"],
    created_at: "2024-01-15T00:00:00.000Z",
    updated_at: "2025-01-25T00:00:00.000Z",
    created_by: "admin-1",
  },
  {
    id: "client-002",
    name: "Patel Family",
    primary_contact_name: "Amit Patel",
    primary_contact_email: "amit.patel@example.com",
    primary_contact_phone: "+91 98765 43211",
    address: "456 Park Street",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",

    // Status
    status: "active",
    review_status: "due_soon",
    onboarding_status: "completed",
    kyc_status: "verified",

    // RM Assignment
    assigned_rm_id: "rm-1",
    assigned_rm_name: "Relationship Manager",
    assigned_date: "2024-02-01T00:00:00.000Z",

    // Financial
    total_aum: 8500000,
    invested_amount: 8000000,
    current_value: 8800000,
    unrealized_gain: 800000,
    unrealized_gain_percent: 10.0,
    one_year_return: 12.3,

    // Service
    tier: "tier_2",
    service_type: "nrp_light",
    risk_profile: "moderate",

    // Relationship
    last_contact_date: "2025-01-15T00:00:00.000Z",
    next_review_date: "2025-02-28T00:00:00.000Z",
    last_meeting_date: "2025-01-10T00:00:00.000Z",

    // Family interface
    primaryContactId: "family-2",
    members: [
      {
        id: "mem-3",
        userId: "family-2",
        name: "Amit Patel",
        relationship: "self",
        email: "amit.patel@example.com",
        phone: "+91 98765 43211",
      },
    ],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2025-01-15"),

    // Metadata
    notes: "Conservative investor. Prefers regular income streams.",
    tags: ["Retired", "Regular Income"],
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2025-01-15T00:00:00.000Z",
    created_by: "admin-1",
  },
  {
    id: "client-003",
    name: "Gupta Enterprises",
    primary_contact_name: "Suresh Gupta",
    primary_contact_email: "suresh.gupta@guptaenterprises.com",
    primary_contact_phone: "+91 98765 43212",
    address: "789 Business District",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",

    // Status
    status: "onboarding",
    review_status: "current",
    onboarding_status: "in_progress",
    kyc_status: "submitted",

    // RM Assignment - not assigned yet

    // Financial
    total_aum: 0,

    // Service
    tier: "prospect",
    service_type: "nrp_360",
    risk_profile: "balanced",

    // Family interface
    primaryContactId: "contact-003",
    members: [
      {
        id: "mem-4",
        name: "Suresh Gupta",
        relationship: "self",
        email: "suresh.gupta@guptaenterprises.com",
        phone: "+91 98765 43212",
      },
    ],
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-28"),

    // Metadata
    notes: "Large business family looking to diversify investments. Currently in onboarding.",
    tags: ["Business Owner", "Large Portfolio Potential"],
    created_at: "2025-01-20T00:00:00.000Z",
    updated_at: "2025-01-28T00:00:00.000Z",
    created_by: "admin-1",
  },
  {
    id: "client-004",
    name: "Reddy Family",
    primary_contact_name: "Venkat Reddy",
    primary_contact_email: "venkat.reddy@example.com",
    primary_contact_phone: "+91 98765 43213",
    address: "321 Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",

    // Status
    status: "active",
    review_status: "current",
    onboarding_status: "completed",
    kyc_status: "verified",

    // RM Assignment
    assigned_rm_id: "rm-1",
    assigned_rm_name: "Relationship Manager",
    assigned_date: "2024-03-15T00:00:00.000Z",

    // Financial
    total_aum: 5200000,
    invested_amount: 5000000,
    current_value: 5400000,
    unrealized_gain: 400000,
    unrealized_gain_percent: 8.0,
    one_year_return: 9.5,

    // Service
    tier: "tier_3",
    service_type: "nrp_light",
    risk_profile: "conservative",

    // Relationship
    last_contact_date: "2025-01-10T00:00:00.000Z",
    next_review_date: "2025-07-15T00:00:00.000Z",
    last_meeting_date: "2024-12-15T00:00:00.000Z",

    // Family interface
    primaryContactId: "contact-004",
    members: [
      {
        id: "mem-5",
        name: "Venkat Reddy",
        relationship: "self",
        email: "venkat.reddy@example.com",
        phone: "+91 98765 43213",
      },
      {
        id: "mem-6",
        name: "Lakshmi Reddy",
        relationship: "spouse",
        email: "lakshmi.reddy@example.com",
      },
    ],
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2025-01-10"),

    // Metadata
    notes: "Risk-averse investor. Prefers debt and fixed income.",
    tags: ["Conservative", "Debt Heavy"],
    created_at: "2024-03-15T00:00:00.000Z",
    updated_at: "2025-01-10T00:00:00.000Z",
    created_by: "admin-1",
  },
  {
    id: "client-005",
    name: "Khan Family",
    primary_contact_name: "Farhan Khan",
    primary_contact_email: "farhan.khan@example.com",
    primary_contact_phone: "+91 98765 43214",
    address: "567 Marine Drive",
    city: "Kochi",
    state: "Kerala",
    pincode: "682001",

    // Status
    status: "prospect",
    onboarding_status: "not_started",
    kyc_status: "pending",

    // Financial
    total_aum: 0,

    // Service
    tier: "prospect",
    service_type: "nrp_light",
    risk_profile: "moderate",

    // Family interface
    primaryContactId: "contact-005",
    members: [
      {
        id: "mem-7",
        name: "Farhan Khan",
        relationship: "self",
        email: "farhan.khan@example.com",
        phone: "+91 98765 43214",
      },
    ],
    createdAt: new Date("2025-01-28"),
    updatedAt: new Date("2025-01-28"),

    // Metadata
    notes: "Prospect interested in NRP Light service. Follow up scheduled.",
    tags: ["New Lead", "Follow Up Needed"],
    created_at: "2025-01-28T00:00:00.000Z",
    updated_at: "2025-01-28T00:00:00.000Z",
    created_by: "admin-1",
  },
];

/**
 * Initialize sample clients in localStorage
 */
export function initializeSampleClients() {
  if (typeof window === "undefined") return;

  const existingClients = localStorage.getItem("nrp_crm_clients");

  if (!existingClients) {
    localStorage.setItem("nrp_crm_clients", JSON.stringify(SAMPLE_CLIENTS));
    console.log("✅ Sample clients initialized:", SAMPLE_CLIENTS.length);
  }
}
