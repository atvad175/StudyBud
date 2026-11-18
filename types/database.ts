/**
 * StudyBud database contract.
 * Mirrors supabase/migrations/20261117090000_studybud_core_reconciliation.sql.
 *
 * `profiles` and `focus_sessions` are extended in place: the legacy columns
 * (first_name/last_name/nickname/age and duration_seconds/category/mode) are
 * kept so the older Vite app shares the same database without data loss.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StudyBudTier = 'free' | 'scholar' | 'elite'

export interface Flashcard {
  id: string
  question: string
  answer: string
}

/** Shape stored in `study_materials.ai_summary`. */
export interface FlashcardPayload {
  cards: Flashcard[]
  model: string
  generated_at: string
}

export type ProfileRow = {
  id: string
  username: string
  school_house: string | null
  grade_section: string | null
  tier: StudyBudTier
  first_name: string | null
  last_name: string | null
  nickname: string | null
  age: number | null
  created_at: string
  updated_at: string
}

export type HabitRow = {
  id: string
  user_id: string
  title: string
  streak_count: number
  completed_dates: string[]
  created_at: string
  updated_at: string
}

export type FocusSessionRow = {
  id: number
  user_id: string
  duration_minutes: number | null
  duration_seconds: number | null
  category: string | null
  mode: string | null
  created_at: string
}

export type StudyMaterialRow = {
  id: string
  user_id: string
  title: string
  content: string
  ai_summary: Json | null
  created_at: string
}

export type SchoolHouseRow = {
  id: string
  house_name: string
  total_points: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          username: string
          school_house?: string | null
          grade_section?: string | null
          tier?: StudyBudTier
          first_name?: string | null
          last_name?: string | null
          nickname?: string | null
          age?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          school_house?: string | null
          grade_section?: string | null
          tier?: StudyBudTier
          first_name?: string | null
          last_name?: string | null
          nickname?: string | null
          age?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      habits: {
        Row: HabitRow
        Insert: {
          id?: string
          user_id: string
          title: string
          streak_count?: number
          completed_dates?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          streak_count?: number
          completed_dates?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: FocusSessionRow
        Insert: {
          id?: number
          user_id: string
          duration_minutes?: number | null
          duration_seconds?: number | null
          category?: string | null
          mode?: string | null
          created_at?: string
        }
        Update: {
          duration_minutes?: number | null
          duration_seconds?: number | null
          category?: string | null
          mode?: string | null
        }
        Relationships: []
      }
      study_materials: {
        Row: StudyMaterialRow
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          ai_summary?: Json | null
          created_at?: string
        }
        Update: {
          title?: string
          content?: string
          ai_summary?: Json | null
        }
        Relationships: []
      }
      school_houses: {
        Row: SchoolHouseRow
        Insert: {
          id?: string
          house_name: string
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          house_name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_house_points: {
        Args: { p_points: number }
        Returns: number | null
      }
    }
    Enums: {
      studybud_tier: StudyBudTier
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
