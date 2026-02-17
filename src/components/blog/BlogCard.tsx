import React from 'react';
import { Link } from 'react-router-dom';

interface BlogCardProps {
  blog: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    readingTime: number;
    wordCount: number;
    createdAt: string;
    primaryKeyword: string;
    targetAudience?: string;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="blog-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {blog.featuredImage && (
        <div className="blog-image relative h-48 overflow-hidden">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="blog-content p-6">
        <div className="blog-meta flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="reading-time">{blog.readingTime} min read</span>
          <span className="word-count">{blog.wordCount} words</span>
          <span className="date">
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {blog.title}
        </h3>

        <p className="excerpt text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        <div className="blog-tags flex flex-wrap gap-2 mb-4">
          <span className="primary-keyword px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {blog.primaryKeyword}
          </span>
          {blog.targetAudience && (
            <span className="audience px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {blog.targetAudience}
            </span>
          )}
        </div>

        <Link
          to={`/blog/${blog.slug}`}
          className="read-more inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Read More
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
