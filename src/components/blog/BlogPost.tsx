import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import { formatPostDate, formatReadTime } from '../../utils/blogContent';

interface BlogPostProps {
  post: Post;
  relatedPosts?: Post[];
}

const BlogPost: React.FC<BlogPostProps> = ({ post, relatedPosts = [] }) => {
  useEffect(() => {
    // Update document title and meta tags for SEO
    document.title = `${post.title} - Smart Gift Finder Blog`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', post.description);
    }

    // Add Open Graph meta tags
    addMetaTag('og:title', post.title);
    addMetaTag('og:description', post.description);
    addMetaTag('og:image', post.image);
    addMetaTag('og:type', 'article');
    addMetaTag('og:url', window.location.href);

    // Add Twitter Card meta tags
    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:title', post.title);
    addMetaTag('twitter:description', post.description);
    addMetaTag('twitter:image', post.image);

    // Add article structured data
    addStructuredData();

    // Scroll to top when post changes
    window.scrollTo(0, 0);
  }, [post]);

  const addMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const addStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      image: post.image,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Smart Gift Finder',
        logo: {
          '@type': 'ImageObject',
          url: '/favicon-32x32.png',
        },
      },
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href,
      },
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  const sharePost = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    const description = encodeURIComponent(post.description);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${description}%0A%0A${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link to="/blog" className="hover:text-indigo-600 transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium truncate">
            {post.title}
          </li>
        </ol>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          {post.description}
        </p>

        {/* Meta Information */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatPostDate(post.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatReadTime(post.readTime)}</span>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Share:</span>
            <button
              onClick={() => sharePost('twitter')}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button
              onClick={() => sharePost('facebook')}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              onClick={() => sharePost('linkedin')}
              className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
            <button
              onClick={() => sharePost('email')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Share via Email"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Copy link"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="mb-8">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="w-full h-64 md:h-96 rounded-lg shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                <div class="text-center">
                  <div class="text-6xl mb-4">📝</div>
                  <div class="text-xl text-gray-600 font-medium">Blog Post</div>
                </div>
              </div>
            `;
          }}
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>

      {/* Author Bio */}
      <div className="bg-gray-50 rounded-lg p-6 mb-12">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-lg">
              {post.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">About {post.author}</h3>
            <p className="text-gray-600 text-sm">
              Gift-giving expert and founder of Smart Gift Finder. Passionate about helping people find the perfect gifts for their loved ones.
            </p>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.slice(0, 3).map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                to={`/blog/${relatedPost.slug}`}
                className="group block"
              >
                <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedPost.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{formatPostDate(relatedPost.date)}</span>
                      <span>{formatReadTime(relatedPost.readTime)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-center text-white mt-12">
        <h2 className="text-2xl font-bold mb-4">Need Help Finding the Perfect Gift?</h2>
        <p className="text-indigo-100 mb-6">
          Use our AI-powered gift finder to get personalized recommendations for any occasion.
        </p>
        <Link
          to="/"
          className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          🎁 Find Gifts Now
        </Link>
      </section>
    </article>
  );
};

export default BlogPost;
