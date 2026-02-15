// Team Management Service
// Handles client team assignments (Multiple RMs + Back-Office)

import type { ClientTeam, TeamMember, TeamStats } from '@/types/teams';
import { LocalStorageService } from '../storage/localStorage';

const STORAGE_KEY = 'nrp_crm_client_teams';

export class TeamService {
  /**
   * Create a new team for a client/family
   */
  static createTeam(
    familyId: string,
    familyName: string,
    clientId: string,
    members: Omit<TeamMember, 'joined_at'>[]
  ): ClientTeam {
    const teams = this.getAllTeams();

    const team: ClientTeam = {
      id: `team-${Date.now()}`,
      client_id: clientId,
      family_id: familyId,
      family_name: familyName,
      team_members: members.map((member) => ({
        ...member,
        joined_at: new Date().toISOString(),
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    teams.push(team);
    this.saveTeams(teams);

    return team;
  }

  /**
   * Get team for a specific family
   */
  static getTeamByFamily(familyId: string): ClientTeam | null {
    const teams = this.getAllTeams();
    return teams.find((team) => team.family_id === familyId) || null;
  }

  /**
   * Get team by team ID
   */
  static getTeamById(teamId: string): ClientTeam | null {
    const teams = this.getAllTeams();
    return teams.find((team) => team.id === teamId) || null;
  }

  /**
   * Get all families for a specific user (RM or Back Office)
   */
  static getFamiliesForUser(userId: string): ClientTeam[] {
    const teams = this.getAllTeams();
    return teams.filter((team) =>
      team.team_members.some((member) => member.user_id === userId)
    );
  }

  /**
   * Get all teams for a specific role
   */
  static getTeamsByRole(role: 'rm' | 'back_office'): ClientTeam[] {
    const teams = this.getAllTeams();
    return teams.filter((team) =>
      team.team_members.some((member) => member.user_role === role)
    );
  }

  /**
   * Add a member to an existing team
   */
  static addTeamMember(
    teamId: string,
    member: Omit<TeamMember, 'joined_at'>
  ): ClientTeam | null {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (teamIndex === -1) return null;

    // Check if member already exists
    const exists = teams[teamIndex].team_members.some(
      (m) => m.user_id === member.user_id
    );

    if (exists) {
      throw new Error('Member already exists in team');
    }

    teams[teamIndex].team_members.push({
      ...member,
      joined_at: new Date().toISOString(),
    });

    teams[teamIndex].updated_at = new Date().toISOString();

    this.saveTeams(teams);
    return teams[teamIndex];
  }

  /**
   * Remove a member from a team
   */
  static removeTeamMember(teamId: string, userId: string): ClientTeam | null {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (teamIndex === -1) return null;

    teams[teamIndex].team_members = teams[teamIndex].team_members.filter(
      (member) => member.user_id !== userId
    );

    teams[teamIndex].updated_at = new Date().toISOString();

    this.saveTeams(teams);
    return teams[teamIndex];
  }

  /**
   * Update member role or primary status
   */
  static updateTeamMember(
    teamId: string,
    userId: string,
    updates: Partial<Omit<TeamMember, 'user_id' | 'user_name' | 'joined_at'>>
  ): ClientTeam | null {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (teamIndex === -1) return null;

    const memberIndex = teams[teamIndex].team_members.findIndex(
      (m) => m.user_id === userId
    );

    if (memberIndex === -1) return null;

    teams[teamIndex].team_members[memberIndex] = {
      ...teams[teamIndex].team_members[memberIndex],
      ...updates,
    };

    teams[teamIndex].updated_at = new Date().toISOString();

    this.saveTeams(teams);
    return teams[teamIndex];
  }

  /**
   * Set primary RM (unsets other primary RMs)
   */
  static setPrimaryRM(teamId: string, userId: string): ClientTeam | null {
    const teams = this.getAllTeams();
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (teamIndex === -1) return null;

    // Unset all primary flags
    teams[teamIndex].team_members = teams[teamIndex].team_members.map(
      (member) => ({
        ...member,
        is_primary: member.user_id === userId && member.user_role === 'rm',
      })
    );

    teams[teamIndex].updated_at = new Date().toISOString();

    this.saveTeams(teams);
    return teams[teamIndex];
  }

  /**
   * Get team statistics
   */
  static getTeamStats(): TeamStats {
    const teams = this.getAllTeams();

    const rmCounts: Record<string, number> = {};

    teams.forEach((team) => {
      team.team_members.forEach((member) => {
        if (member.user_role === 'rm') {
          rmCounts[member.user_id] = (rmCounts[member.user_id] || 0) + 1;
        }
      });
    });

    const allMembers = teams.flatMap((team) => team.team_members);
    const uniqueMembers = Array.from(
      new Set(allMembers.map((m) => m.user_id))
    );

    return {
      total_families: teams.length,
      total_team_members: uniqueMembers.length,
      rm_count: allMembers.filter((m) => m.user_role === 'rm').length,
      back_office_count: allMembers.filter((m) => m.user_role === 'back_office')
        .length,
      teams_by_rm: rmCounts,
    };
  }

  /**
   * Check if user has access to family
   */
  static hasAccessToFamily(userId: string, familyId: string): boolean {
    const team = this.getTeamByFamily(familyId);
    if (!team) return false;

    return team.team_members.some((member) => member.user_id === userId);
  }

  /**
   * Delete a team
   */
  static deleteTeam(teamId: string): boolean {
    const teams = this.getAllTeams();
    const filteredTeams = teams.filter((team) => team.id !== teamId);

    if (filteredTeams.length === teams.length) return false;

    this.saveTeams(filteredTeams);
    return true;
  }

  /**
   * Get all teams
   */
  static getAllTeams(): ClientTeam[] {
    return LocalStorageService.get<ClientTeam[]>(STORAGE_KEY, []);
  }

  /**
   * Save teams to storage
   */
  private static saveTeams(teams: ClientTeam[]): void {
    LocalStorageService.set(STORAGE_KEY, teams);
  }

  /**
   * Clear all teams (for testing)
   */
  static clearAllTeams(): void {
    LocalStorageService.set(STORAGE_KEY, []);
  }
}
