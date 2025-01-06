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
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          is_teaching: boolean
          proficiency_level: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          is_teaching: boolean
          proficiency_level: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          is_teaching?: boolean
          proficiency_level?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          teaching_skill_id: string
          learning_skill_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          teaching_skill_id: string
          learning_skill_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          teaching_skill_id?: string
          learning_skill_id?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}