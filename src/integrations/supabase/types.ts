export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  },

  public: {
    Tables: {

      // ---------------------------
      // PROFILES
      // ---------------------------
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },

      // ---------------------------
      // NOTEBOOKS
      // ---------------------------
      notebooks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notebooks_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // SOURCES
      // ---------------------------
      sources: {
        Row: {
          id: string;
          notebook_id: string;
          title: string;
          source_type: Database["public"]["Enums"]["source_type"];
          content: string | null;
          file_path: string | null;
          url: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          title: string;
          source_type: Database["public"]["Enums"]["source_type"];
          content?: string | null;
          file_path?: string | null;
          url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          title?: string;
          source_type?: Database["public"]["Enums"]["source_type"];
          content?: string | null;
          file_path?: string | null;
          url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sources_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // CONVERSATIONS
      // ---------------------------
      conversations: {
        Row: {
          id: string;
          notebook_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // MESSAGES
      // ---------------------------
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: Database["public"]["Enums"]["message_role"];
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: Database["public"]["Enums"]["message_role"];
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: Database["public"]["Enums"]["message_role"];
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey",
            columns: ["conversation_id"],
            isOneToOne: false,
            referencedRelation: "conversations",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // NOTES  (YOUR MISSING TABLE)
      // ---------------------------
      notes: {
        Row: {
          id: string;
          notebook_id: string;
          content: string;
          title: string | null;
          source_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          content: string;
          title?: string | null;
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          content?: string;
          title?: string | null;
          source_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_source_id_fkey",
            columns: ["source_id"],
            isOneToOne: false,
            referencedRelation: "sources",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // FLASHCARDS
      // ---------------------------
      flashcards: {
        Row: {
          id: string;
          notebook_id: string;
          front: string;
          back: string;
          source_ids: string[] | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          front: string;
          back: string;
          source_ids?: string[] | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          front?: string;
          back?: string;
          source_ids?: string[] | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // QUIZZES
      // ---------------------------
      quizzes: {
        Row: {
          id: string;
          notebook_id: string;
          title: string;
          questions: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          title: string;
          questions: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          title?: string;
          questions?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          }
        ];
      },

      // ---------------------------
      // REPORTS
      // ---------------------------
      reports: {
        Row: {
          id: string;
          notebook_id: string;
          title: string;
          content: string;
          report_type: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          title: string;
          content: string;
          report_type?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          title?: string;
          content?: string;
          report_type?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_notebook_id_fkey",
            columns: ["notebook_id"],
            isOneToOne: false,
            referencedRelation: "notebooks",
            referencedColumns: ["id"]
          }
        ];
      }
    },

    Views: {
      [_ in never]: never;
    },

    Functions: {
      [_ in never]: never;
    },

    Enums: {
      message_role: "user" | "assistant",
      source_type:
        | "pdf"
        | "document"
        | "website"
        | "link"
        | "youtube"
        | "audio"
        | "text"
        | "google_drive"
        | "google_docs"
        | "google_slides";
    },

    CompositeTypes: {
      [_ in never]: never;
    }
  }
};

export const Constants = {
  public: {
    Enums: {
      message_role: ["user", "assistant"],
      source_type: [
        "pdf",
        "document",
        "website",
        "link",
        "youtube",
        "audio",
        "text",
        "google_drive",
        "google_docs",
        "google_slides"
      ]
    }
  }
} as const;
