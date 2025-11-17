export interface ContentFilter {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: string;
  status?: string;
  type?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface ListContent {
  id: string;
  title: string;
  body: object;
  type: string;
  status: string;
  thumbnail_url?: string;
  publish_date?: string;
  created_at: string;
  updated_at: string;
  affiliate_link?: string;
  ai_generated_text?: string;
  blog?: {
    content_id: string;
    author_id: string;
    author: {
      email: string;
      id: string;
      username: string;
    };
    tags: string[];
    excerpt: string;
    read_time: number;
    created_at: string;
    updated_at: string;
  };
}
