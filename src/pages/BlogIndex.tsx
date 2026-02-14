import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function BlogIndex() {
  const posts = [
    {
      title: "The Ultimate Gift Giving Guide: 50+ Ideas for Every Occasion",
      description: "Comprehensive guide covering 50+ gift ideas organized by recipient, occasion, and budget.",
      slug: "ultimate-gift-giving-guide",
      date: "February 13, 2026",
      readTime: "12",
      category: "Guides"
    },
    {
      title: "How to Choose the Perfect Gift: A Psychology-Backed Approach",
      description: "Discover the science behind great gift giving and learn research-backed strategies.",
      slug: "gift-giving-psychology",
      date: "February 13, 2026",
      readTime: "10",
      category: "Psychology"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Gift Giving Blog - Tips, Guides & Ideas | Smart Gift Finder</title>
        <meta name="description" content="Expert gift giving advice, comprehensive guides, and psychology-backed strategies to help you choose the perfect present for any occasion." />
        <link rel="canonical" href="https://www.smartgiftfinder.xyz/blog" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gift Giving Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert advice, comprehensive guides, and insights to help you become a better gift giver
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">{post.readTime} min read</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600">
                {post.title}
              </h2>

              <p className="text-gray-600 mb-4">
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{post.date}</span>
                <span className="text-blue-600 font-medium">
                  Read More →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
