// Types for blog post content management
// This should match the Contentlayer schema in contentlayer.config.ts

export interface Post {
  slug: string;
  title: string;
  description: string;
  content?: string; // For markdown content
  body?: {
    html: string;
    raw: string;
  }; // For Contentlayer processed content
  date: string;
  author: string;
  readTime: number; // Changed to number to match contentlayer schema
  image: string; // Changed from optional to required to match schema
  tags: string[]; // Changed from optional to required to match schema
  url: string; // Added computed field from Contentlayer
}

// Utility type for content loading states
export interface ContentLoadingState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

// Type for Contentlayer generated content
export interface ContentlayerPost extends Omit<Post, "content"> {
  body: {
    html: string;
    raw: string;
  };
  _raw: {
    flattenedPath: string;
    sourceFileName: string;
    sourceFileDir: string;
  };
}

// Type guard to check if content is from Contentlayer
export function isContentlayerPost(post: unknown): post is ContentlayerPost {
  return Boolean(
    post &&
    typeof post === "object" &&
    post !== null &&
    "body" in post &&
    "_raw" in post
  );
}

// Fallback post data for development
export const FALLBACK_POST: Post = {
  slug: "sample-post",
  title: "Sample Blog Post",
  description:
    "This is a sample post shown when Contentlayer content is not available.",
  date: new Date().toISOString().split("T")[0],
  author: "Smart Gift Finder Team",
  readTime: 3,
  image: "/images/blog/placeholder.svg",
  tags: ["Sample"],
  url: "/blog/sample-post",
  content:
    "# Sample Content\n\nThis is sample content shown during development.",
};
