export type Database = {
  public: {
    Tables: {
      library_books: {
        Row: {
          id: string;
          user_id: string;
          google_id: string;
          title: string;
          authors: string[];
          description: string;
          published_year: string | null;
          cover_url: string | null;
          page_count: number | null;
          categories: string[];
          status: "want-to-read" | "reading" | "finished";
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          google_id: string;
          title: string;
          authors?: string[];
          description?: string;
          published_year?: string | null;
          cover_url?: string | null;
          page_count?: number | null;
          categories?: string[];
          status?: "want-to-read" | "reading" | "finished";
          added_at?: string;
        };
        Update: {
          title?: string;
          authors?: string[];
          description?: string;
          published_year?: string | null;
          cover_url?: string | null;
          page_count?: number | null;
          categories?: string[];
          status?: "want-to-read" | "reading" | "finished";
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
