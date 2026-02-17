import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';

// Mock functions since blogContent utility was removed
const getAllPosts = async () => {
  // Mock implementation - return empty array since we removed the blog storage
  return [];
};

// Mock functions since seoUtils utility was removed
const calculateSEOScore = (content: string, keywords: string[]) => ({
  overall: 85,
  title: 90,
  description: 80,
  keywords: 88,
  readability: 82,
});

const analyzeKeywordDensity = (content: string, keywords: string[]) => ({
  primary: 2.1,
  secondary: 1.5,
  suggestions: ['Increase primary keyword usage'],
});

const checkContentQuality = (content: string) => ({
  score: 88,
  readability: 'Good',
  structure: 'Excellent',
  engagement: 'High',
});

const generateMetaDescription = (content: string, keywords: string[]) =>
  'A comprehensive guide about the topic with valuable insights and practical advice.';

const suggestInternalLinks = (content: string, existingPosts: any[]) => [
  { text: 'related topic', url: '/blog/related-topic' },
  { text: 'similar guide', url: '/blog/similar-guide' },
];

const analyzeCompetitors = (keyword: string) => ({
  difficulty: 'Medium',
  volume: 'High',
  opportunities: ['Long-tail variations', 'Local SEO'],
});

const findContentGaps = (keyword: string, existingContent: any[]) => [
  'Missing FAQ section',
  'No video content',
  'Lack of case studies',
];

interface SEOMetrics {
  score: number;
  title: string;
  description: string;
  keywords: string[];
  suggestions: string[];
}

interface SEODashboardProps {
  selectedPost?: Post;
}

export function SEODashboard({ selectedPost }: SEODashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');
  const [seoAnalysis, setSeoAnalysis] = useState<any | null>(null);
  const [keywordOptimizations, setKeywordOptimizations] = useState<any[]>([]);
  const [contentGaps, setContentGaps] = useState<any | null>(null);
  const [competitorInsights, setCompetitorInsights] = useState<any[]>([]);
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState<any[]>(
    []
  );
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics | null>(null);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      setSelectedPostSlug(selectedPost.slug);
      analyzePostSEO(selectedPost);
    }
  }, [selectedPost]);

  const loadPosts = () => {
    const allPosts = getAllPosts();
    setPosts(allPosts);

    // Set default target keywords
    const defaultKeywords = [
      'gift ideas',
      'birthday gifts',
      'christmas gifts',
      'anniversary gifts',
    ];
    setTargetKeywords(defaultKeywords);
  };

  const analyzePostSEO = (post: Post) => {
    setIsLoading(true);

    try {
      // Calculate SEO score
      const seoScore = calculateSEOScore(post.content, targetKeywords);

      // Analyze keyword optimization
      const optimizations = analyzeKeywordDensity(post.content, targetKeywords);

      // Generate internal link suggestions
      const linkSuggestions = suggestInternalLinks(post.content, posts);

      // Get SEO metrics
      const metrics = {
        score: 85,
        title: 'Sample Title',
        description: generateMetaDescription(post.content, targetKeywords),
        keywords: ['gift', 'birthday', 'christmas'],
        suggestions: ['Optimize title length', 'Add meta description'],
      };

      // Generate meta description
      const metaDescription = generateMetaDescription(
        post.content,
        targetKeywords
      );

      setSeoAnalysis({
        score: seoScore.overall,
        suggestions: generateSEOSuggestions(post, seoScore.overall),
        metaDescription,
        keywordDensity: {},
        internalLinks: linkSuggestions.map((s) => s.url),
        contentGaps: [],
        competitorInsights: [],
      });

      setKeywordOptimizations(optimizations);
      setInternalLinkSuggestions(linkSuggestions);
      setSeoMetrics(metrics);
    } catch (error) {
      console.error('Error analyzing SEO:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSEOSuggestions = (post: Post, score: number): string[] => {
    const suggestions: string[] = [];

    if (score < 50) {
      suggestions.push('Optimize title length (30-60 characters)');
      suggestions.push('Add meta description (120-160 characters)');
      suggestions.push('Increase content length (minimum 300 words)');
    }

    if (post.tags.length < 3) {
      suggestions.push('Add more relevant tags (3-8 recommended)');
    }

    if (!post.image) {
      suggestions.push('Add a featured image for better engagement');
    }

    if (post.content.split(/\s+/).length < 300) {
      suggestions.push('Expand content to improve SEO value');
    }

    return suggestions;
  };

  const analyzeContentGapsForAllPosts = () => {
    const gaps = findContentGaps('gift ideas', posts);
    setContentGaps(gaps);
  };

  const analyzeCompetitors = () => {
    const insights = analyzeCompetitors('gift ideas');
    setCompetitorInsights(insights);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !targetKeywords.includes(newKeyword.trim())) {
      setTargetKeywords((prev) => [...prev, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setTargetKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'SEO Overview', icon: '📊' },
    { id: 'keywords', label: 'Keyword Analysis', icon: '🔍' },
    { id: 'content-gaps', label: 'Content Gaps', icon: '📝' },
    { id: 'competitors', label: 'Competitor Analysis', icon: '🏆' },
    { id: 'internal-links', label: 'Internal Links', icon: '🔗' },
    { id: 'performance', label: 'Performance', icon: '📈' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* SEO Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          SEO Health Score
        </h3>
        {seoAnalysis ? (
          <div className="text-center">
            <div
              className={`text-6xl font-bold ${getScoreColor(seoAnalysis.score)} mb-2`}
            >
              {seoAnalysis.score}
            </div>
            <div className="text-sm text-gray-600 mb-4">out of 100</div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(seoAnalysis.score)} ${getScoreColor(seoAnalysis.score)}`}
            >
              {seoAnalysis.score >= 80
                ? 'Excellent'
                : seoAnalysis.score >= 60
                  ? 'Good'
                  : 'Needs Improvement'}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Select a post to analyze
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={analyzeContentGapsForAllPosts}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">
              Content Gap Analysis
            </div>
            <div className="text-sm text-gray-600">
              Find missing content opportunities
            </div>
          </button>
          <button
            onClick={analyzeCompetitors}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">Competitor Analysis</div>
            <div className="text-sm text-gray-600">
              Analyze competitor content
            </div>
          </button>
        </div>
      </div>

      {/* SEO Suggestions */}
      {seoAnalysis && seoAnalysis.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            SEO Suggestions
          </h3>
          <ul className="space-y-2">
            {seoAnalysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderKeywordAnalysis = () => (
    <div className="space-y-6">
      {/* Target Keywords */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Target Keywords
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a keyword..."
          />
          <button
            onClick={addKeyword}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetKeywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Keyword Optimizations */}
      {keywordOptimizations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Keyword Optimization
          </h3>
          <div className="space-y-4">
            {keywordOptimizations.map((optimization, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {optimization.primaryKeyword}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        optimization.competition === 'low'
                          ? 'bg-green-100 text-green-800'
                          : optimization.competition === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {optimization.competition} competition
                    </span>
                    <span className="text-sm text-gray-600">
                      Score: {optimization.optimizationScore}/100
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Search Volume: {optimization.searchVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Related Keywords: {optimization.relatedKeywords.join(', ')}
                </div>
                {optimization.suggestions.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Suggestions:
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {optimization.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContentGaps = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Content Gap Analysis
          </h3>
          <button
            onClick={analyzeContentGapsForAllPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Analyze Gaps
          </button>
        </div>

        {contentGaps ? (
          <div className="space-y-6">
            {/* Missing Keywords */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {contentGaps.map((gap, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Low Competition Keywords */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Low Competition Opportunities
              </h4>
              <div className="flex flex-wrap gap-2">
                {contentGaps.map((gap, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Trending Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {contentGaps.map((gap, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Seasonal Opportunities */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Seasonal Opportunities
              </h4>
              <div className="flex flex-wrap gap-2">
                {contentGaps.map((gap, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Click "Analyze Gaps" to find content opportunities
          </div>
        )}
      </div>
    </div>
  );

  const renderCompetitorAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Competitor Analysis
          </h3>
          <button
            onClick={analyzeCompetitors}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Analyze Competitors
          </button>
        </div>

        {competitorInsights.length > 0 ? (
          <div className="space-y-4">
            {competitorInsights.map((insight, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {insight.keyword}
                  </h4>
                  <span className="text-sm text-gray-600">
                    Est. Traffic: {insight.estimatedTraffic.toLocaleString()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  Competitor URLs: {insight.competitorUrls.length}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">
                      Content Gaps:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insight.contentGaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">
                      Opportunities:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {insight.opportunities.map((opportunity, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Click "Analyze Competitors" to get insights
          </div>
        )}
      </div>
    </div>
  );

  const renderInternalLinks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Internal Link Suggestions
        </h3>

        {internalLinkSuggestions.length > 0 ? (
          <div className="space-y-4">
            {internalLinkSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      Link to: {suggestion.url}
                    </div>
                    <div className="text-sm text-gray-600">
                      Relevance: {suggestion.relevance}/100
                    </div>
                  </div>
                  <Link
                    to={`/blog/${suggestion.url.split('/').pop()}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    View Post
                  </Link>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  Suggested Anchor Text: "{suggestion.text}"
                </div>

                <div className="text-sm text-gray-600">
                  Context: {suggestion.context}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a post to see internal link suggestions
          </div>
        )}
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          SEO Performance Metrics
        </h3>

        {seoMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {seoMetrics.pageViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Page Views</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {seoMetrics.organicTraffic.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Organic Traffic</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {seoMetrics.clickThroughRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Click-Through Rate</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {seoMetrics.bounceRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(seoMetrics.averageTimeOnPage)}s
              </div>
              <div className="text-sm text-gray-600">Avg. Time on Page</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {Object.keys(seoMetrics.keywordRankings).length}
              </div>
              <div className="text-sm text-gray-600">Tracked Keywords</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Select a post to view performance metrics
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'keywords':
        return renderKeywordAnalysis();
      case 'content-gaps':
        return renderContentGaps();
      case 'competitors':
        return renderCompetitorAnalysis();
      case 'internal-links':
        return renderInternalLinks();
      case 'performance':
        return renderPerformance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SEO Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Advanced SEO analysis and optimization tools
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Post Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Post to Analyze
          </h3>
          <select
            value={selectedPostSlug}
            onChange={(e) => {
              const post = posts.find((p) => p.slug === e.target.value);
              if (post) {
                setSelectedPostSlug(e.target.value);
                analyzePostSEO(post);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a blog post...</option>
            {posts.map((post) => (
              <option key={post.slug} value={post.slug}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing SEO...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
