import React from 'react';
import type { BlogPost as BlogPostType } from '../../types/blog';

interface BlogPostProps {
  blog: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ blog }) => {
  if (!blog) return <div>Blog not found</div>;

  return (
    <>
      {/* SEO Metadata */}
      <head>
        <title>{blog.seo.title}</title>
        <meta name="description" content={blog.seo.metaDescription} />
        <meta name="keywords" content={blog.seo.keywords.join(', ')} />
        <link rel="canonical" href={`https://smartgiftfinder.xyz${blog.seo.canonicalUrl}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={blog.seo.openGraph.title} />
        <meta property="og:description" content={blog.seo.openGraph.description} />
        <meta property="og:image" content={blog.seo.openGraph.image} />
        <meta property="og:url" content={`https://smartgiftfinder.xyz${blog.seo.openGraph.url}`} />
        <meta property="og:type" content={blog.seo.openGraph.type} />
        
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blog.seo.schema) }}
        />
      </head>

      <article className="blog-post max-w-4xl mx-auto px-4 py-8">
        <header className="blog-header mb-8">
          <div className="blog-meta flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="date">{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span className="reading-time">{blog.readingTime} min read</span>
            <span className="word-count">{blog.wordCount} words</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>
          
          {blog.featuredImage && (
            <div className="featured-image mb-6">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {blog.description && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {blog.description}
            </p>
          )}
        </header>

        <div className="blog-content prose prose-lg max-w-none">
          {/* Render blog content - convert markdown-like content to HTML */}
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: blog.content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\n- (.*$)/gim, '<br>• $1')
            }} 
          />
        </div>

        <footer className="blog-footer mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="blog-tags">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                <span className="primary-keyword px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {blog.primaryKeyword}
                </span>
                {blog.secondaryKeywords?.map((keyword) => (
                  <span key={keyword} className="secondary-keyword px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            {blog.targetAudience && (
              <div className="blog-audience">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Audience</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {blog.targetAudience}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Published on {new Date(blog.createdAt).toLocaleDateString()}</span>
              <span>Last updated {new Date(blog.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
};

export default BlogPost;
