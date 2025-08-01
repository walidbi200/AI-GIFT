import React from "react";
import { Link } from "react-router-dom";
import BlogLayout from "../layouts/BlogLayout";
import { Post } from "../types/post";
import {
  loadContentlayerPosts,
  sortPostsByDate,
  formatPostDate,
  formatReadTime,
} from "../utils/contentLoader";

const BlogPage: React.FC = () => {
  const { posts, error } = loadContentlayerPosts();
  const sortedPosts = sortPostsByDate(posts);

  return (
    <BlogLayout>
      <div className="space-y-16">
        {sortedPosts.map((post: Post) => (
          <Link
            to={`/blog/${post.slug}`}
            key={post.slug}
            className="block group"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Post Text Content */}
              <div className="md:col-span-2">
                <p className="font-semibold text-sm mb-2">{post.author}</p>
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-black transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 mt-2 hidden md:block">
                  {post.description}
                </p>
                <p className="text-gray-400 text-sm mt-4">
                  {formatPostDate(post.date)} · {formatReadTime(post.readTime)}
                </p>
              </div>
              {/* Post Image */}
              <div className="md:col-span-1">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md shadow-sm"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {sortedPosts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No articles yet
          </h3>
          <p className="text-gray-600">
            {error
              ? 'Run "npm run content:build" to generate blog posts from your markdown files.'
              : "Check back soon for new content!"}
          </p>
          {error && <p className="text-sm text-red-500 mt-2">Debug: {error}</p>}
        </div>
      )}
    </BlogLayout>
  );
};

export default BlogPage;
