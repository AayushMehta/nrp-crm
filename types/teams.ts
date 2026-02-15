// Team Management Types
// Support for Multiple RMs + Back-Office team structure

export interface ClientTeam {
  id: string;
  client_id: string;
  family_id: string;
  family_name: string;
  team_members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  user_name: string;
  user_role: 'rm' | 'back_office';
  is_primary: boolean; // Primary RM flag
  joined_at: string;
}

export interface TeamStats {
  total_families: number;
  total_team_members: number;
  rm_count: number;
  back_office_count: number;
  teams_by_rm: Record<string, number>; // RM ID -> family count
}

export interface TeamAssignment {
  team_id: string;
  family_id: string;
  member_id: string;
  assigned_at: string;
  assigned_by: string;
}
