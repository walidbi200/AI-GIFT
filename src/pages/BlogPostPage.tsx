import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BlogPost from '../components/blog/BlogPost';
import { getAllPosts, getPostBySlug } from '../utils/blogContent';
import type { Post } from '../types/post';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No post slug provided');
      setIsLoading(false);
      return;
    }

    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load the specific post
      const loadedPost = getPostBySlug(slug!);
      
      if (!loadedPost) {
        setError('Post not found');
        setIsLoading(false);
        return;
      }

      setPost(loadedPost);

      // Load related posts (posts with similar tags, excluding current post)
      const allPosts = getAllPosts();
      const related = allPosts
        .filter(p => p.slug !== slug && p.tags.some(tag => loadedPost.tags.includes(tag)))
        .sort((a, b) => {
          // Sort by number of matching tags, then by date
          const aMatches = a.tags.filter(tag => loadedPost.tags.includes(tag)).length;
          const bMatches = b.tags.filter(tag => loadedPost.tags.includes(tag)).length;
          
          if (aMatches !== bMatches) {
            return bMatches - aMatches;
          }
          
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 3);

      setRelatedPosts(related);
    } catch (err) {
      setError('Failed to load post');
      console.error('Error loading post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogPost post={post} relatedPosts={relatedPosts} />
      </div>
    </div>
  );
};

export default BlogPostPage;
