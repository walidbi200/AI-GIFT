import React from 'react';
import type { BlogPost as BlogPostType } from '../../types/blog';

interface BlogPostProps {
  blog: BlogPostType;
  relatedPosts?: BlogPostType[];
  previousPost?: { slug: string; title: string };
  nextPost?: { slug: string; title: string };
}

const BlogPost: React.FC<BlogPostProps> = ({
  blog,
  relatedPosts = [],
  previousPost,
  nextPost,
}) => {
  if (!blog) return <div>Blog not found</div>;

  // Calculate reading time (assuming 200 words per minute)
  const readingTime = Math.ceil(blog.wordCount / 200);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Process content to add product callouts
  const processContent = (content: string) => {
    return (
      content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-4xl font-bold text-gray-900 mt-12 mb-6">$1</h1>'
        )
        .replace(/\n- (.*$)/gim, '<br>• $1')
        // Add product callout styling for specific patterns
        .replace(
          /<h2>(.*?)<\/h2>\s*<p>(.*?)<\/p>/g,
          '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2><div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8"><p class="text-gray-700 leading-relaxed">$2</p></div>'
        )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Metadata */}
      <head>
        <title>{blog.title}</title>
        <meta name="description" content={blog.description} />
        <meta name="keywords" content={blog.tags.join(', ')} />
        <link
          rel="canonical"
          href={`https://smartgiftfinder.xyz/blog/${blog.slug}`}
        />

        {/* Open Graph */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.description} />
        <meta property="og:image" content={blog.featuredImage} />
        <meta
          property="og:url"
          content={`https://smartgiftfinder.xyz/blog/${blog.slug}`}
        />
        <meta property="og:type" content="article" />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: blog.title,
              description: blog.description,
              image: blog.featuredImage,
              author: {
                '@type': 'Organization',
                name: 'Smart Gift Finder',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Smart Gift Finder',
              },
              datePublished: blog.createdAt,
              dateModified: blog.updatedAt,
              wordCount: blog.wordCount,
            }),
          }}
        />
      </head>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Post Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
            {blog.title}
          </h1>

          {blog.description && (
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              {blog.description}
            </p>
          )}

          <div className="flex items-center justify-center text-sm text-gray-500 space-x-4">
            <span>Published on {formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
            {blog.wordCount && (
              <>
                <span>•</span>
                <span>{blog.wordCount} words</span>
              </>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {blog.featuredImage && (
          <div className="mb-12">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="markdown-content font-serif text-lg text-gray-800 leading-relaxed"
            style={{ lineHeight: '1.75' }}
            dangerouslySetInnerHTML={{
              __html: processContent(blog.content),
            }}
          />
        </div>

        {/* Tags Section */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        {(previousPost || nextPost) && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {previousPost ? (
                <a
                  href={`/blog/${previousPost.slug}`}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="mr-2">←</span>
                  <div>
                    <div className="text-xs text-gray-400">Previous Post</div>
                    <div className="font-medium">{previousPost.title}</div>
                  </div>
                </a>
              ) : (
                <div></div>
              )}

              {nextPost ? (
                <a
                  href={`/blog/${nextPost.slug}`}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors text-right"
                >
                  <div>
                    <div className="text-xs text-gray-400">Next Post</div>
                    <div className="font-medium">{nextPost.title}</div>
                  </div>
                  <span className="ml-2">→</span>
                </a>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6">
            <span className="text-sm text-gray-500">Share this post:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://smartgiftfinder.xyz/blog/${blog.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://smartgiftfinder.xyz/blog/${blog.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://smartgiftfinder.xyz/blog/${blog.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Related Posts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-white"
                >
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {formatDate(post.createdAt)} •{' '}
                    {Math.ceil(post.wordCount / 200)} min read
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
