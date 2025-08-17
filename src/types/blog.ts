// Blog-related TypeScript interfaces
// This replaces the types that were previously in blogUtils.ts

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  secondaryKeywords?: string[];
  targetAudience?: string;
  toneOfVoice?: string;
  featuredImage?: string;
  galleryImages?: string[];
  wordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  success: boolean;
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BlogSaveResponse {
  success: boolean;
  blog?: BlogPost;
  error?: string;
}

export interface BlogDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
  deletedPost?: {
    id: number;
    title: string;
  };
}
