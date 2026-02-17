import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import InlineEmailCapture from '../InlineEmailCapture';

interface BlogPostProps {
  title: string;
  description: string;
  publishDate: string;
  readTime: string;
  children: React.ReactNode;
  slug: string;
}

export default function StaticBlogPost({
  title,
  description,
  publishDate,
  readTime,
  children,
  slug,
}: BlogPostProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link to="/blog" className="hover:text-blue-600">
              Blog
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">{title}</li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📅 {publishDate}</span>
          <span>⏱️ {readTime} min read</span>
        </div>
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <InlineEmailCapture placement="top" pageType="blog" />
        {children}
        <InlineEmailCapture placement="bottom" pageType="blog" />
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl text-center my-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Find the Perfect Gift?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Use our AI-powered gift finder to get personalized recommendations
          based on the recipient's interests and your budget. Get 5 unique gift
          ideas in under 60 seconds!
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Try Our Free Gift Finder →
        </Link>
      </div>

      {/* Related Posts */}
      <div className="mt-16 border-t pt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Related Articles
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* These will be dynamic based on other blog posts */}
          <Link
            to="/blog/ultimate-gift-giving-guide"
            className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <h4 className="font-semibold text-gray-900 mb-2">
              The Ultimate Gift Giving Guide
            </h4>
            <p className="text-sm text-gray-600">
              50+ gift ideas for every person and occasion
            </p>
          </Link>

          <Link
            to="/blog/gift-giving-psychology"
            className="p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition"
          >
            <h4 className="font-semibold text-gray-900 mb-2">
              The Psychology of Gift Giving
            </h4>
            <p className="text-sm text-gray-600">
              Research-backed strategies for choosing better gifts
            </p>
          </Link>
        </div>
      </div>

      {/* More Gift Guides */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Browse Gift Guides
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Link
            to="/gifts-for-mom"
            className="p-4 border rounded-lg hover:border-blue-500 transition text-center"
          >
            <div className="text-3xl mb-2">👩</div>
            <h4 className="font-semibold text-sm">Gifts for Mom</h4>
          </Link>
          <Link
            to="/gifts-for-dad"
            className="p-4 border rounded-lg hover:border-green-500 transition text-center"
          >
            <div className="text-3xl mb-2">👨</div>
            <h4 className="font-semibold text-sm">Gifts for Dad</h4>
          </Link>
          <Link
            to="/birthday-gifts"
            className="p-4 border rounded-lg hover:border-purple-500 transition text-center"
          >
            <div className="text-3xl mb-2">🎂</div>
            <h4 className="font-semibold text-sm">Birthday Gifts</h4>
          </Link>
          <Link
            to="/unique-gifts"
            className="p-4 border rounded-lg hover:border-teal-500 transition text-center"
          >
            <div className="text-3xl mb-2">✨</div>
            <h4 className="font-semibold text-sm">Unique Gifts</h4>
          </Link>
        </div>
      </div>
    </article>
  );
}
