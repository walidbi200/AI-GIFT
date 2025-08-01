// Centralized content loading utility with proper type safety
import {
  Post,
  ContentlayerPost,
  ContentLoadingState,
  FALLBACK_POST,
} from '../types/post';

interface ContentlayerExports {
  allPosts: ContentlayerPost[];
  Post: unknown; // Contentlayer type constructor
}

// Error types for better debugging
export enum ContentLoadingError {
  BUILD_REQUIRED = 'CONTENTLAYER_BUILD_REQUIRED',
  POSTS_MISSING = 'CONTENTLAYER_POSTS_MISSING',
  INVALID_FORMAT = 'CONTENTLAYER_INVALID_FORMAT',
  IMPORT_FAILED = 'CONTENTLAYER_IMPORT_FAILED',
}

interface ContentError {
  code: ContentLoadingError;
  message: string;
  suggestion: string;
}

// Format read time from number to readable string
export function formatReadTime(minutes: number): string {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

// Safely load Contentlayer content with proper error handling
export function loadContentlayerPosts(): ContentLoadingState {
  try {
    // Dynamic import with type assertion
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const contentlayer = require('@/.contentlayer/generated') as ContentlayerExports;

    if (!contentlayer.allPosts) {
      const error: ContentError = {
        code: ContentLoadingError.POSTS_MISSING,
        message: 'allPosts is not available in Contentlayer exports',
        suggestion: 'Run "npm run content:build" to generate blog content',
      };

      console.warn('⚠️ Contentlayer:', error.message);
      console.info('💡', error.suggestion);

      return {
        posts: [FALLBACK_POST],
        isLoading: false,
        error: `${error.code}: ${error.message}`,
      };
    }

    if (!Array.isArray(contentlayer.allPosts)) {
      const error: ContentError = {
        code: ContentLoadingError.INVALID_FORMAT,
        message: 'allPosts is not an array',
        suggestion: 'Check your contentlayer.config.ts configuration',
      };

      console.warn(
        '⚠️ Contentlayer:',
        error.message,
        'Got:',
        typeof contentlayer.allPosts,
      );
      console.info('💡', error.suggestion);

      return {
        posts: [FALLBACK_POST],
        isLoading: false,
        error: `${error.code}: ${error.message}`,
      };
    }

    // Convert Contentlayer posts to our Post interface
    const posts: Post[] = contentlayer.allPosts.map(
      (contentlayerPost: ContentlayerPost) => ({
        slug: contentlayerPost.slug,
        title: contentlayerPost.title,
        description: contentlayerPost.description,
        date: contentlayerPost.date,
        author: contentlayerPost.author,
        readTime: contentlayerPost.readTime,
        image: contentlayerPost.image,
        tags: contentlayerPost.tags,
        url: contentlayerPost.url,
        body: contentlayerPost.body,
      }),
    );

    console.info(`✅ Contentlayer: Successfully loaded ${posts.length} posts`);

    return {
      posts,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Categorize the error
    let contentError: ContentError;

    if (errorMessage.includes('Cannot resolve module')) {
      contentError = {
        code: ContentLoadingError.BUILD_REQUIRED,
        message: 'Contentlayer generated files not found',
        suggestion:
          'Run "npm run content:build" to generate content from markdown files',
      };
    } else {
      contentError = {
        code: ContentLoadingError.IMPORT_FAILED,
        message: `Failed to import Contentlayer: ${errorMessage}`,
        suggestion: 'Check if Contentlayer is properly configured and built',
      };
    }

    console.warn('⚠️ Contentlayer Error:', contentError.code);
    console.warn('📝 Details:', contentError.message);
    console.info('💡 Solution:', contentError.suggestion);

    // In development, show additional debug info
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Debug Information');
      console.info('Original error:', error);
      console.info('Expected path: .contentlayer/generated');
      console.info(
        'Available commands: npm run content:build, npm run content:dev',
      );
      console.groupEnd();
    }

    return {
      posts: [FALLBACK_POST],
      isLoading: false,
      error: `${contentError.code}: ${contentError.message}`,
    };
  }
}

// Get a single post by slug with type safety
export function getPostBySlug(slug: string): Post | null {
  const { posts, error } = loadContentlayerPosts();

  if (error) {
    console.warn(
      `⚠️ Content loading failed while looking for "${slug}":`,
      error,
    );
  }

  return posts.find((post) => post.slug === slug) ?? null;
}

// Sort posts by date (newest first)
export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

// Format date consistently across the app
export function formatPostDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    console.warn('⚠️ Invalid date format:', dateString);
    return dateString; // Fallback to original string
  }
}
