import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BlogPostCardProps {
  slug: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  tags: string[];
  author: string;
  readTime: string;
}

/**
 * BlogPostCard - A modern, reusable card component for displaying blog post previews
 * 
 * Features:
 * - Clean, Medium-inspired design
 * - Hover animations and visual feedback
 * - Image fallback handling for broken/missing images
 * - Fully accessible with proper ARIA labels
 * - Responsive design that works on all screen sizes
 */
const BlogPostCard: React.FC<BlogPostCardProps> = ({
  slug,
  title,
  summary,
  image,
  date,
  tags,
  author,
  readTime,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle image load error - show fallback
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <Link
      to={`/blog/${slug}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] overflow-hidden border border-gray-100"
      aria-label={`Read article: ${title}`}
    >
      {/* Image Section */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {!imageError ? (
          <>
            {/* Loading placeholder */}
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 text-gray-400">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Actual image */}
            <img
              src={image}
              alt={title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </>
        ) : (
          /* Fallback placeholder for broken images */
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium">Article Image</p>
            </div>
          </div>
        )}

        {/* Tags overlay */}
        {tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h2>

        {/* Summary */}
        <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
          {summary}
        </p>

        {/* Meta information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">{author}</span>
            <span>•</span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard; 