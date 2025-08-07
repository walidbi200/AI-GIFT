// Blog post types and interfaces
export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number;
  featured?: boolean;
  image: string;
  content: string;
  url: string;
  body: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph?: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
}

export interface BlogPageProps {
  posts: Post[];
  featuredPosts?: Post[];
  currentPage?: number;
  totalPages?: number;
  selectedTag?: string;
  searchQuery?: string;
}

export interface BlogPostPageProps {
  post: Post;
  relatedPosts?: Post[];
}

export interface ContentlayerPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readTime: number;
  image: string;
  url: string;
  body: string;
}

export interface ContentLoadingState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

// Fallback post for error states
export const FALLBACK_POST: Post = {
  slug: 'error',
  title: 'Post Not Found',
  description: 'The requested blog post could not be found.',
  date: new Date().toISOString(),
  author: 'Smart Gift Finder',
  tags: ['error'],
  readTime: 1,
  image: '/images/blog/placeholder.jpg',
  content: 'This post could not be loaded.',
  url: '/blog/error',
  body: 'This post could not be loaded.',
};
