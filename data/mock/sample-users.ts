// data/mock/sample-users.ts
// Sample users for demo and development

import { UserPersona, User, Family } from "@/types/auth";

export const SAMPLE_USERS: UserPersona[] = [
  // Admin User
  {
    user: {
      id: "admin-1",
      email: "admin@nrpcrm.com",
      username: "admin",
      name: "Admin User",
      role: "admin",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    },
    credentials: {
      username: "admin",
      password: "admin123",
    },
    description: "System Administrator with full access",
  },

  // Relationship Manager
  {
    user: {
      id: "rm-1",
      email: "rm@nrpcrm.com",
      username: "rm",
      name: "Relationship Manager",
      role: "rm",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    },
    credentials: {
      username: "rm",
      password: "rm123",
    },
    description: "Relationship Manager handling client accounts",
  },

  // Back Office User
  {
    user: {
      id: "bo-1",
      email: "backoffice@nrpcrm.com",
      username: "backoffice",
      name: "Back Office",
      role: "back_office",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    },
    credentials: {
      username: "backoffice",
      password: "bo123",
    },
    description: "Back Office staff handling assigned tasks and clients",
  },

  // Family User 1
  {
    user: {
      id: "family-1",
      email: "sharma@example.com",
      username: "sharma",
      name: "Rajesh Sharma",
      familyId: "fam-001",
      role: "family",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    },
    family: {
      id: "fam-001",
      name: "Sharma Family",
      primaryContactId: "family-1",
      members: [
        {
          id: "mem-1",
          userId: "family-1",
          name: "Rajesh Sharma",
          relationship: "self",
          email: "sharma@example.com",
          phone: "+91 98765 43210",
        },
        {
          id: "mem-2",
          name: "Priya Sharma",
          relationship: "spouse",
          email: "priya.sharma@example.com",
        },
      ],
      assignedRMId: "rm-1",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    },
    credentials: {
      username: "sharma",
      password: "demo123",
    },
    description: "Family client with active onboarding",
  },

  // Family User 2
  {
    user: {
      id: "family-2",
      email: "patel@example.com",
      username: "patel",
      name: "Amit Patel",
      familyId: "fam-002",
      role: "family",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date(),
    },
    family: {
      id: "fam-002",
      name: "Patel Family",
      primaryContactId: "family-2",
      members: [
        {
          id: "mem-3",
          userId: "family-2",
          name: "Amit Patel",
          relationship: "self",
          email: "patel@example.com",
          phone: "+91 98765 43211",
        },
      ],
      assignedRMId: "rm-1",
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date(),
    },
    credentials: {
      username: "patel",
      password: "demo123",
    },
    description: "Family client - established account",
  },
];

/**
 * Authenticate user with username/password
 */
export function authenticateUser(
  username: string,
  password: string
): UserPersona | null {
  const user = SAMPLE_USERS.find(
    (u) =>
      (u.user.username === username || u.user.email === username) &&
      u.credentials.password === password
  );

  return user || null;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): UserPersona | null {
  return SAMPLE_USERS.find((u) => u.user.id === id) || null;
}

/**
 * Initialize sample users in storage
 */
export function initializeSampleUsers() {
  if (typeof window === "undefined") return;

  const { userStorage } = require("@/lib/storage/localStorage");
  const existingUsers = userStorage.getAll();

  if (existingUsers.length === 0) {
    userStorage.save(SAMPLE_USERS);
    console.log("✅ Sample users initialized:", SAMPLE_USERS.length);
  }
}
