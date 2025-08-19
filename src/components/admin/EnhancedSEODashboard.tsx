import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface SEOScore {
  overall: number;
  title: number;
  description: number;
  keywords: number;
  readability: number;
  structure: number;
  images: number;
  links: number;
}

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number;
  difficulty: number;
  suggestions: string[];
}

interface InternalLinkSuggestion {
  sourceText: string;
  targetUrl: string;
  targetTitle: string;
  relevance: number;
  context: string;
}

interface OnPageAnalysis {
  score: SEOScore;
  suggestions: string[];
  metaTitle: string;
  metaDescription: string;
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  contentLength: number;
  headingStructure: string[];
  imageCount: number;
  internalLinks: number;
  externalLinks: number;
}

export function EnhancedSEODashboard() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [onPageAnalysis, setOnPageAnalysis] = useState<OnPageAnalysis | null>(null);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState<InternalLinkSuggestion[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('onpage');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/list');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const analyzeOnPageSEO = (post: Post) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const content = post.content;
      const title = post.title;
      const description = post.excerpt || '';
      
      // Calculate SEO scores
      const titleScore = calculateTitleScore(title);
      const descriptionScore = calculateDescriptionScore(description);
      const keywordScore = calculateKeywordScore(content, post.tags);
      const readabilityScore = calculateReadabilityScore(content);
      const structureScore = calculateStructureScore(content);
      const imageScore = post.image ? 100 : 0;
      const linkScore = calculateLinkScore(content);
      
      const overallScore = Math.round(
        (titleScore + descriptionScore + keywordScore + readabilityScore + structureScore + imageScore + linkScore) / 7
      );

      const analysis: OnPageAnalysis = {
        score: {
          overall: overallScore,
          title: titleScore,
          description: descriptionScore,
          keywords: keywordScore,
          readability: readabilityScore,
          structure: structureScore,
          images: imageScore,
          links: linkScore,
        },
        suggestions: generateSEOSuggestions(post, overallScore),
        metaTitle: title,
        metaDescription: description,
        keywordDensity: calculateKeywordDensity(content, post.tags),
        readabilityScore: readabilityScore,
        contentLength: content.split(/\s+/).length,
        headingStructure: extractHeadingStructure(content),
        imageCount: (content.match(/<img/g) || []).length,
        internalLinks: (content.match(/href="\/blog\//g) || []).length,
        externalLinks: (content.match(/href="https?:\/\//g) || []).length,
      };

      setOnPageAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const calculateTitleScore = (title: string): number => {
    const length = title.length;
    if (length >= 30 && length <= 60) return 100;
    if (length >= 20 && length <= 70) return 80;
    if (length >= 10 && length <= 80) return 60;
    return 40;
  };

  const calculateDescriptionScore = (description: string): number => {
    const length = description.length;
    if (length >= 120 && length <= 160) return 100;
    if (length >= 100 && length <= 180) return 80;
    if (length >= 80 && length <= 200) return 60;
    return 40;
  };

  const calculateKeywordScore = (content: string, tags: string[]): number => {
    if (tags.length === 0) return 0;
    
    const keywordCounts = tags.map(tag => {
      const regex = new RegExp(tag, 'gi');
      return (content.match(regex) || []).length;
    });
    
    const totalKeywords = keywordCounts.reduce((sum, count) => sum + count, 0);
    const contentWords = content.split(/\s+/).length;
    const keywordDensity = (totalKeywords / contentWords) * 100;
    
    if (keywordDensity >= 1 && keywordDensity <= 3) return 100;
    if (keywordDensity >= 0.5 && keywordDensity <= 4) return 80;
    if (keywordDensity >= 0.2 && keywordDensity <= 5) return 60;
    return 40;
  };

  const calculateReadabilityScore = (content: string): number => {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = content.toLowerCase().replace(/[^a-z]/g, '').length * 0.4;
    
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    if (fleschScore >= 80) return 100;
    if (fleschScore >= 60) return 80;
    if (fleschScore >= 40) return 60;
    return 40;
  };

  const calculateStructureScore = (content: string): number => {
    const headings = content.match(/<h[1-6][^>]*>/g) || [];
    const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
    const h2Count = (content.match(/<h2[^>]*>/g) || []).length;
    
    let score = 0;
    if (headings.length >= 3) score += 30;
    if (h1Count === 1) score += 30;
    if (h2Count >= 2) score += 40;
    
    return score;
  };

  const calculateLinkScore = (content: string): number => {
    const internalLinks = (content.match(/href="\/blog\//g) || []).length;
    const externalLinks = (content.match(/href="https?:\/\//g) || []).length;
    
    let score = 0;
    if (internalLinks >= 2) score += 50;
    if (externalLinks >= 1) score += 30;
    if (internalLinks + externalLinks >= 3) score += 20;
    
    return score;
  };

  const calculateKeywordDensity = (content: string, tags: string[]): Record<string, number> => {
    const density: Record<string, number> = {};
    const contentWords = content.split(/\s+/).length;
    
    tags.forEach(tag => {
      const regex = new RegExp(tag, 'gi');
      const count = (content.match(regex) || []).length;
      density[tag] = (count / contentWords) * 100;
    });
    
    return density;
  };

  const extractHeadingStructure = (content: string): string[] => {
    const headings = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g) || [];
    return headings.map(h => h.replace(/<[^>]+>/g, '').trim());
  };

  const generateSEOSuggestions = (post: Post, score: number): string[] => {
    const suggestions: string[] = [];
    
    if (score < 70) {
      suggestions.push('Optimize title length (30-60 characters recommended)');
      suggestions.push('Add a compelling meta description (120-160 characters)');
      suggestions.push('Include more relevant keywords naturally in content');
    }
    
    if (post.content.split(/\s+/).length < 300) {
      suggestions.push('Expand content to at least 300 words for better SEO');
    }
    
    if (!post.image) {
      suggestions.push('Add a featured image to improve engagement');
    }
    
    if (post.tags.length < 3) {
      suggestions.push('Add more relevant tags (3-8 recommended)');
    }
    
    const internalLinks = (post.content.match(/href="\/blog\//g) || []).length;
    if (internalLinks < 2) {
      suggestions.push('Add more internal links to improve site structure');
    }
    
    return suggestions;
  };

  const searchKeywords = async () => {
    if (!searchKeyword.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockKeywordData: KeywordData[] = [
        {
          keyword: searchKeyword,
          searchVolume: Math.floor(Math.random() * 10000) + 1000,
          competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          cpc: Math.random() * 5 + 0.5,
          difficulty: Math.floor(Math.random() * 100) + 1,
          suggestions: [
            `${searchKeyword} guide`,
            `best ${searchKeyword}`,
            `${searchKeyword} tips`,
            `${searchKeyword} examples`,
            `how to ${searchKeyword}`,
          ],
        },
        {
          keyword: `${searchKeyword} guide`,
          searchVolume: Math.floor(Math.random() * 5000) + 500,
          competition: 'medium',
          cpc: Math.random() * 3 + 0.3,
          difficulty: Math.floor(Math.random() * 80) + 10,
          suggestions: [
            `${searchKeyword} tutorial`,
            `${searchKeyword} step by step`,
            `${searchKeyword} for beginners`,
          ],
        },
      ];
      
      setKeywordData(mockKeywordData);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateInternalLinkSuggestions = (post: Post) => {
    const suggestions: InternalLinkSuggestion[] = [];
    
    // Find related posts based on tags
    const relatedPosts = posts.filter(p => 
      p.id !== post.id && 
      p.tags.some(tag => post.tags.includes(tag))
    );
    
    relatedPosts.slice(0, 5).forEach(relatedPost => {
      suggestions.push({
        sourceText: relatedPost.title,
        targetUrl: `/blog/${relatedPost.slug}`,
        targetTitle: relatedPost.title,
        relevance: Math.floor(Math.random() * 40) + 60, // 60-100
        context: `Related to ${relatedPost.tags.join(', ')}`,
      });
    });
    
    setInternalLinkSuggestions(suggestions);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };



  const renderOnPageAnalysis = () => (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      {onPageAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Health Score</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(onPageAnalysis.score.overall)} mb-2`}>
                {onPageAnalysis.score.overall}
              </div>
              <div className="text-sm text-gray-600">Overall</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(onPageAnalysis.score.title)} mb-2`}>
                {onPageAnalysis.score.title}
              </div>
              <div className="text-sm text-gray-600">Title</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(onPageAnalysis.score.description)} mb-2`}>
                {onPageAnalysis.score.description}
              </div>
              <div className="text-sm text-gray-600">Description</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(onPageAnalysis.score.keywords)} mb-2`}>
                {onPageAnalysis.score.keywords}
              </div>
              <div className="text-sm text-gray-600">Keywords</div>
            </div>
          </div>
        </div>
      )}

      {/* Content Analysis */}
      {onPageAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Content Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">{onPageAnalysis.contentLength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Readability Score:</span>
                  <span className="font-medium">{onPageAnalysis.readabilityScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images:</span>
                  <span className="font-medium">{onPageAnalysis.imageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Internal Links:</span>
                  <span className="font-medium">{onPageAnalysis.internalLinks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">External Links:</span>
                  <span className="font-medium">{onPageAnalysis.externalLinks}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Keyword Density</h4>
              <div className="space-y-2">
                {Object.entries(onPageAnalysis.keywordDensity).map(([keyword, density]) => (
                  <div key={keyword} className="flex justify-between">
                    <span className="text-gray-600">{keyword}:</span>
                    <span className="font-medium">{density.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Suggestions */}
      {onPageAnalysis && onPageAnalysis.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Suggestions</h3>
          <ul className="space-y-2">
            {onPageAnalysis.suggestions.map((suggestion, index) => (
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

  const renderKeywordResearch = () => (
    <div className="space-y-6">
      {/* Keyword Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Research Tool</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchKeywords()}
            placeholder="Enter a keyword to research..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchKeywords}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Keyword Results */}
      {keywordData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis Results</h3>
          <div className="space-y-4">
            {keywordData.map((keyword, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{keyword.keyword}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    keyword.competition === 'low' ? 'bg-green-100 text-green-800' :
                    keyword.competition === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {keyword.competition} competition
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Search Volume</div>
                    <div className="font-medium">{keyword.searchVolume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="font-medium">{keyword.difficulty}/100</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">CPC</div>
                    <div className="font-medium">${keyword.cpc.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Competition</div>
                    <div className="font-medium capitalize">{keyword.competition}</div>
                  </div>
                </div>
                
                {keyword.suggestions.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Related Keywords:</div>
                    <div className="flex flex-wrap gap-2">
                      {keyword.suggestions.map((suggestion, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm cursor-pointer hover:bg-blue-200"
                          onClick={() => setSearchKeyword(suggestion)}
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInternalLinks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Link Suggestions</h3>
        
        {selectedPost && (
          <div className="mb-4">
            <button
              onClick={() => generateInternalLinkSuggestions(selectedPost)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Suggestions
            </button>
          </div>
        )}
        
        {internalLinkSuggestions.length > 0 ? (
          <div className="space-y-4">
            {internalLinkSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      Link to: {suggestion.targetTitle}
                    </div>
                    <div className="text-sm text-gray-600">
                      Relevance: {suggestion.relevance}/100
                    </div>
                  </div>
                  <Link
                    to={suggestion.targetUrl}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    View Post
                  </Link>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Suggested Anchor Text: "{suggestion.sourceText}"
                </div>
                
                <div className="text-sm text-gray-600">
                  Context: {suggestion.context}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {selectedPost 
              ? 'Click "Generate Suggestions" to find internal linking opportunities'
              : 'Select a post to see internal link suggestions'
            }
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'onpage', label: 'On-Page SEO', icon: '📊' },
    { id: 'keywords', label: 'Keyword Research', icon: '🔍' },
    { id: 'internal-links', label: 'Internal Links', icon: '🔗' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'onpage':
        return renderOnPageAnalysis();
      case 'keywords':
        return renderKeywordResearch();
      case 'internal-links':
        return renderInternalLinks();
      default:
        return renderOnPageAnalysis();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced SEO Dashboard</h1>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Post to Analyze</h3>
          <select
            value={selectedPost?.id || ''}
            onChange={(e) => {
              const post = posts.find(p => p.id === e.target.value);
              setSelectedPost(post || null);
              if (post) {
                analyzeOnPageSEO(post);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a blog post...</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
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
        {isAnalyzing ? (
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
