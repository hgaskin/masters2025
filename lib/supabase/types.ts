export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          clerk_id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      
      golfers: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          external_id: string | null
          external_system: string | null
        }
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          external_id?: string | null
          external_system?: string | null
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          external_id?: string | null
          external_system?: string | null
        }
        Relationships: []
      }
      
      tournaments: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          course: string | null
          location: string | null
          status: string | null
          current_round: number | null
          cut_line: string | null
          year: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          course?: string | null
          location?: string | null
          status?: string | null
          current_round?: number | null
          cut_line?: string | null
          year: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          course?: string | null
          location?: string | null
          status?: string | null
          current_round?: number | null
          cut_line?: string | null
          year?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      
      tournament_golfers: {
        Row: {
          id: string
          tournament_id: string
          golfer_id: string
          odds: number | null
          tournament_rank: number | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          golfer_id: string
          odds?: number | null
          tournament_rank?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          golfer_id?: string
          odds?: number | null
          tournament_rank?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_golfers_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_golfers_golfer_id_fkey"
            columns: ["golfer_id"]
            isOneToOne: false
            referencedRelation: "golfers"
            referencedColumns: ["id"]
          }
        ]
      }
      
      tournament_scores: {
        Row: {
          id: string
          golfer_id: string
          tournament_id: string
          round: number
          score: number
          thru: number | null
          r1_score: number | null
          r2_score: number | null
          r3_score: number | null
          r4_score: number | null
          today_score: number | null
          position: string | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          golfer_id: string
          tournament_id: string
          round: number
          score: number
          thru?: number | null
          r1_score?: number | null
          r2_score?: number | null
          r3_score?: number | null
          r4_score?: number | null
          today_score?: number | null
          position?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          golfer_id?: string
          tournament_id?: string
          round?: number
          score?: number
          thru?: number | null
          r1_score?: number | null
          r2_score?: number | null
          r3_score?: number | null
          r4_score?: number | null
          today_score?: number | null
          position?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_scores_golfer_id_fkey"
            columns: ["golfer_id"]
            isOneToOne: false
            referencedRelation: "golfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_scores_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
      
      pools: {
        Row: {
          id: string
          name: string
          description: string | null
          entry_fee: number
          tournament_id: string
          created_at: string
          updated_at: string | null
          admin_id: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          entry_fee: number
          tournament_id: string
          created_at?: string
          updated_at?: string | null
          admin_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          entry_fee?: number
          tournament_id?: string
          created_at?: string
          updated_at?: string | null
          admin_id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pools_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pools_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
      
      pool_rules: {
        Row: {
          id: string
          pool_id: string
          golfers_required: number
          max_picks_per_group: number | null
          groups_required: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          pool_id: string
          golfers_required: number
          max_picks_per_group?: number | null
          groups_required?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          pool_id?: string
          golfers_required?: number
          max_picks_per_group?: number | null
          groups_required?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_rules_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          }
        ]
      }
      
      golfer_groups: {
        Row: {
          id: string
          tournament_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golfer_groups_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
      
      golfer_group_assignments: {
        Row: {
          id: string
          group_id: string
          golfer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          golfer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          golfer_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "golfer_group_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "golfer_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "golfer_group_assignments_golfer_id_fkey"
            columns: ["golfer_id"]
            isOneToOne: false
            referencedRelation: "golfers"
            referencedColumns: ["id"]
          }
        ]
      }
      
      entries: {
        Row: {
          id: string
          pool_id: string
          user_id: string
          created_at: string
          updated_at: string | null
          has_paid: boolean
        }
        Insert: {
          id?: string
          pool_id: string
          user_id: string
          created_at?: string
          updated_at?: string | null
          has_paid?: boolean
        }
        Update: {
          id?: string
          pool_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string | null
          has_paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "entries_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      
      picks: {
        Row: {
          id: string
          entry_id: string
          golfer_id: string
          selection_order: number | null
          group_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          entry_id: string
          golfer_id: string
          selection_order?: number | null
          group_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          entry_id?: string
          golfer_id?: string
          selection_order?: number | null
          group_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picks_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_golfer_id_fkey"
            columns: ["golfer_id"]
            isOneToOne: false
            referencedRelation: "golfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "golfer_groups"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 