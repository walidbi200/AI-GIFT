import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BlogPost from '../components/blog/BlogPost';
import type { BlogPost as BlogPostType } from '../types/blog';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [previousPost, setPreviousPost] = useState<{ slug: string; title: string } | null>(null);
  const [nextPost, setNextPost] = useState<{ slug: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      navigate('/404');
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the main post
        const response = await fetch(`/api/blog?slug=${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            navigate('/404');
          }
          throw new Error('Failed to fetch post data.');
        }

        const data = await response.json();
        setPost(data.post);
        document.title = `${data.post.title} - Smart Gift Finder`;

        // Fetch related posts
        try {
          const relatedResponse = await fetch('/api/blog?limit=6');
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            const filteredRelated = relatedData.posts
              .filter((p: BlogPostType) => p.slug !== slug)
              .slice(0, 3);
            setRelatedPosts(filteredRelated);
          }
        } catch (err) {
          console.warn('Failed to fetch related posts:', err);
        }

        // Fetch navigation posts (previous/next)
        try {
          const allPostsResponse = await fetch('/api/blog?limit=100');
          if (allPostsResponse.ok) {
            const allPostsData = await allPostsResponse.json();
            const currentIndex = allPostsData.posts.findIndex((p: BlogPostType) => p.slug === slug);

            if (currentIndex > 0) {
              setPreviousPost({
                slug: allPostsData.posts[currentIndex - 1].slug,
                title: allPostsData.posts[currentIndex - 1].title
              });
            }

            if (currentIndex < allPostsData.posts.length - 1) {
              setNextPost({
                slug: allPostsData.posts[currentIndex + 1].slug,
                title: allPostsData.posts[currentIndex + 1].title
              });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch navigation posts:', err);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Could not load the blog post."}</p>
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BlogPost
      blog={post}
      relatedPosts={relatedPosts}
      previousPost={previousPost || undefined}
      nextPost={nextPost || undefined}
    />
  );
};

export default BlogPostPage;
