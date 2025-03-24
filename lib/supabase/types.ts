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
      pools: {
        Row: {
          id: string
          name: string
          description: string | null
          entry_fee: number
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
          }
        ]
      }
      golfers: {
        Row: {
          id: string
          name: string
          rank: number | null
          odds: number | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          external_id: string | null
        }
        Insert: {
          id?: string
          name: string
          rank?: number | null
          odds?: number | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          external_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          rank?: number | null
          odds?: number | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          external_id?: string | null
        }
        Relationships: []
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
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          entry_id: string
          golfer_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          entry_id?: string
          golfer_id?: string
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
          }
        ]
      }
      tournament_scores: {
        Row: {
          id: string
          golfer_id: string
          round: number
          score: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          golfer_id: string
          round: number
          score: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          golfer_id?: string
          round?: number
          score?: number
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
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
} 