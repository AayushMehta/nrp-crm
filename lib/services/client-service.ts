// lib/services/client-service.ts
// Business logic for client management

import {
  Client,
  ClientFilter,
  ClientStats,
  ClientCreateData,
  ClientUpdateData,
  ClientStatus,
  ReviewStatus,
} from "@/types/clients";
import { LocalStorageService } from "@/lib/storage/localStorage";

const STORAGE_KEY = "nrp_crm_clients";

export class ClientService {
  /**
   * Get all clients
   */
  static getAll(): Client[] {
    return LocalStorageService.get<Client[]>(STORAGE_KEY, []);
  }

  /**
   * Get client by ID
   */
  static getById(id: string): Client | null {
    const clients = this.getAll();
    return clients.find((c) => c.id === id) || null;
  }

  /**
   * Create a new client
   */
  static create(data: ClientCreateData, createdBy: string): Client {
    const newClient: Client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      primary_contact_name: data.primary_contact_name,
      primary_contact_email: data.primary_contact_email,
      primary_contact_phone: data.primary_contact_phone,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,

      // RM assignment
      assigned_rm_id: data.assigned_rm_id,
      assigned_rm_name: data.assigned_rm_id ? this.getRMName(data.assigned_rm_id) : undefined,
      assigned_date: data.assigned_rm_id ? new Date().toISOString() : undefined,

      // Status
      status: "prospect",
      onboarding_status: "not_started",
      kyc_status: "pending",

      // Financial
      total_aum: 0,
      tier: data.tier || "prospect",
      service_type: data.service_type || "nrp_light",
      risk_profile: data.risk_profile || "moderate",

      // Family interface compatibility
      primaryContactId: `contact-${Date.now()}`,
      members: [{
        id: `member-${Date.now()}`,
        name: data.primary_contact_name,
        relationship: "self",
        email: data.primary_contact_email,
        phone: data.primary_contact_phone,
      }],
      createdAt: new Date(),
      updatedAt: new Date(),

      // Metadata
      notes: data.notes,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy,
    };

    const clients = this.getAll();
    clients.push(newClient);
    LocalStorageService.set(STORAGE_KEY, clients);

    return newClient;
  }

  /**
   * Update a client
   */
  static update(id: string, updates: ClientUpdateData): Client | null {
    const clients = this.getAll();
    const index = clients.findIndex((c) => c.id === id);

    if (index === -1) return null;

    const updated = {
      ...clients[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update RM name if RM ID changed
    if (updates.assigned_rm_id && updates.assigned_rm_id !== clients[index].assigned_rm_id) {
      updated.assigned_rm_name = this.getRMName(updates.assigned_rm_id);
      updated.assigned_date = new Date().toISOString();
    }

    // Update review status based on next_review_date
    if (updates.next_review_date) {
      updated.review_status = this.calculateReviewStatus(updates.next_review_date);
    }

    clients[index] = updated;
    LocalStorageService.set(STORAGE_KEY, clients);

    return updated;
  }

  /**
   * Delete a client
   */
  static delete(id: string): boolean {
    const clients = this.getAll();
    const filtered = clients.filter((c) => c.id !== id);

    if (filtered.length < clients.length) {
      LocalStorageService.set(STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }

  /**
   * Get clients based on role and filters
   */
  static getClients(
    userRole: "admin" | "rm" | "family",
    userId?: string,
    filters?: ClientFilter
  ): Client[] {
    let clients = this.getAll();

    // Role-based filtering
    if (userRole === "rm" && userId) {
      clients = clients.filter((c) => c.assigned_rm_id === userId);
    }

    if (userRole === "family" && userId) {
      // Family users see only their own client record
      clients = clients.filter((c) => c.id === userId || c.primaryContactId === userId);
    }

    // Apply additional filters
    if (filters) {
      clients = this.applyFilters(clients, filters);
    }

    return clients;
  }

  /**
   * Apply filters to client list
   */
  private static applyFilters(clients: Client[], filters: ClientFilter): Client[] {
    let filtered = clients;

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter((c) => statuses.includes(c.status));
    }

    if (filters.tier) {
      const tiers = Array.isArray(filters.tier) ? filters.tier : [filters.tier];
      filtered = filtered.filter((c) => tiers.includes(c.tier));
    }

    if (filters.assigned_rm_id) {
      filtered = filtered.filter((c) => c.assigned_rm_id === filters.assigned_rm_id);
    }

    if (filters.service_type) {
      filtered = filtered.filter((c) => c.service_type === filters.service_type);
    }

    if (filters.review_status) {
      filtered = filtered.filter((c) => c.review_status === filters.review_status);
    }

    if (filters.kyc_status) {
      filtered = filtered.filter((c) => c.kyc_status === filters.kyc_status);
    }

    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.primary_contact_name.toLowerCase().includes(query) ||
          c.primary_contact_email.toLowerCase().includes(query) ||
          c.primary_contact_phone.includes(query) ||
          c.assigned_rm_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Get client statistics
   */
  static getStats(userRole: "admin" | "rm", userId?: string): ClientStats {
    const clients = this.getClients(userRole, userId);

    const by_status: Record<ClientStatus, number> = {
      active: 0,
      inactive: 0,
      prospect: 0,
      onboarding: 0,
      churned: 0,
    };

    const by_tier: Record<string, number> = {
      tier_1: 0,
      tier_2: 0,
      tier_3: 0,
      prospect: 0,
    };

    const by_service_type: Record<string, number> = {
      nrp_light: 0,
      nrp_360: 0,
    };

    const by_review_status: Record<ReviewStatus, number> = {
      current: 0,
      due_soon: 0,
      overdue: 0,
    };

    let total_aum = 0;
    let total_clients_with_rm = 0;
    let onboarding_in_progress = 0;

    clients.forEach((c) => {
      by_status[c.status]++;
      by_tier[c.tier]++;
      by_service_type[c.service_type]++;

      if (c.review_status) {
        by_review_status[c.review_status]++;
      }

      total_aum += c.total_aum || 0;

      if (c.assigned_rm_id) {
        total_clients_with_rm++;
      }

      if (c.onboarding_status === "in_progress") {
        onboarding_in_progress++;
      }
    });

    return {
      total: clients.length,
      by_status,
      by_tier: by_tier as Record<any, number>,
      by_service_type: by_service_type as Record<any, number>,
      by_review_status,
      total_aum,
      average_aum: clients.length > 0 ? total_aum / clients.length : 0,
      total_clients_with_rm,
      onboarding_in_progress,
    };
  }

  /**
   * Assign client to RM
   */
  static assignToRM(clientId: string, rmId: string): Client | null {
    return this.update(clientId, {
      assigned_rm_id: rmId,
    });
  }

  /**
   * Update client status
   */
  static updateStatus(clientId: string, status: ClientStatus): Client | null {
    return this.update(clientId, { status });
  }

  /**
   * Calculate review status based on next review date
   */
  private static calculateReviewStatus(nextReviewDate: string): ReviewStatus {
    const now = new Date();
    const reviewDate = new Date(nextReviewDate);
    const daysUntilReview = Math.floor(
      (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilReview < 0) return "overdue";
    if (daysUntilReview <= 30) return "due_soon";
    return "current";
  }

  /**
   * Get RM name (mock - in real app, fetch from user service)
   */
  private static getRMName(rmId: string): string {
    // Mock implementation - in real app, fetch from user service
    const rmNames: Record<string, string> = {
      "user-rm": "Rajesh Kumar",
      "rm-1": "Priya Sharma",
      "rm-2": "Amit Patel",
    };
    return rmNames[rmId] || "Unassigned";
  }

  /**
   * Save all clients (for bulk operations)
   */
  static saveAll(clients: Client[]): void {
    LocalStorageService.set(STORAGE_KEY, clients);
  }

  /**
   * Get clients due for review
   */
  static getDueForReview(userRole: "admin" | "rm", userId?: string): Client[] {
    const clients = this.getClients(userRole, userId);
    return clients.filter((c) => c.review_status === "due_soon" || c.review_status === "overdue");
  }

  /**
   * Get top clients by AUM
   */
  static getTopClients(userRole: "admin" | "rm", userId?: string, limit: number = 10): Client[] {
    const clients = this.getClients(userRole, userId);
    return clients
      .sort((a, b) => (b.total_aum || 0) - (a.total_aum || 0))
      .slice(0, limit);
  }
}
