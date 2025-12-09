// Blog related types for SEO and content management

export interface BlogCategory {
  id: number;
  name_display: string; // "Mentalidad Espartana"
  slug: string; // "mentalidad-y-disciplina"
  description?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPostMetadata {
  meta_title?: string; // Override for title tag
  meta_description?: string; // For meta description
  slug_canonical?: string; // Canonical URL
  expertise_areas?: string[]; // Author's expertise areas
  tags?: string[]; // Tags for categorization
  reading_time_minutes?: number; // Reading time estimation
  // view_count removed as not in DB
  cover_image_alt?: string; // Alt text for featured image
}

export interface BlogPost extends BlogPostMetadata {
  id: number;
  slug: string;
  title: string;
  content: string; // Markdown or HTML
  excerpt?: string;
  cover_image?: string;
  author_id: number;
  category_slug?: string; // Slug de la categoría
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  is_published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPostWithRelations extends BlogPost {
  author: {
    id: number;
    name?: string;
    avatar_id?: string;
    bio?: string;
    email: string;
    socialLinks: SocialLink[];
  };
  // category removed, using category_slug directly
  relatedPosts?: BlogPost[];
}

export interface SocialLink {
  id: number;
  user_id: number;
  platform: string; // linkedin, twitter, github, etc.
  url: string; // Full URL to social profile
  created_at: Date;
}

export interface BlogBreadcrumb {
  label: string;
  url: string;
  active?: boolean;
}

export interface BlogSEOSchema {
  title: string; // Page title
  description: string; // Meta description
  image?: string; // OG image
  canonical?: string; // Canonical URL
  breadcrumbs?: BlogBreadcrumb[];
  author?: {
    name: string;
    url?: string;
    socialLinks?: string[];
  };
  published_at?: Date;
  updated_at?: Date;
  article_section?: string;
  keywords?: string[];
}

export interface BlogListingOptions {
  category_slug?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort_by?: "recent" | "popular" | "featured";
}

export interface BlogListingResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
  category?: BlogCategory;
}
