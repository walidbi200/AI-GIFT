import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';

// Mock function since aiPrompts utility was removed
const generateTopicSuggestions = async (keyword: string): Promise<string[]> => {
  // Mock implementation - return basic suggestions
  return [
    `${keyword} guide`,
    `Best ${keyword} tips`,
    `${keyword} for beginners`,
    `Advanced ${keyword} techniques`
  ];
};

// Mock functions since blogAI utility was removed
const analyzeSEO = (content: string, keywords: string[]) => ({
  score: 85,
  titleScore: 90,
  descriptionScore: 80,
  keywordDensity: 2.1,
  suggestions: ['Add more internal links', 'Include more related keywords']
});

const assessContentQuality = (content: string) => ({
  score: 88,
  readability: 'Good',
  structure: 'Excellent',
  engagement: 'High',
  suggestions: ['Add more examples', 'Include statistics']
});

const optimizeContent = (content: string, keywords: string[]) => ({
  content: content,
  score: 90,
  suggestions: ['Content optimized successfully']
});

interface GeneratedBlog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  wordCount: number;
  seoAnalysis?: {
    titleLength: number;
    descriptionLength: number;
    hasKeywordInTitle: boolean;
    estimatedReadTime: string;
  };
}

interface BlogGeneratorForm {
  topic: string;
  tone: 'professional' | 'casual' | 'friendly' | 'expert';
  length: 'short' | 'medium' | 'long';
  primaryKeyword: string;
  secondaryKeywords: string;
}

const BlogGenerator: React.FC = () => {
  const [formData, setFormData] = useState<BlogGeneratorForm>({
    topic: '',
    tone: 'friendly',
    length: 'medium',
    primaryKeyword: '',
    secondaryKeywords: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [contentQuality, setContentQuality] = useState<any>(null);
  const [_optimizedContent, setOptimizedContent] = useState<string>('');
  const [savedBlogs, setSavedBlogs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const lengthOptions = [
    { value: 'short', label: 'Short (800-1200 words)' },
    { value: 'medium', label: 'Medium (1200-1800 words)' },
    { value: 'long', label: 'Long (1800+ words)' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional & Authoritative' },
    { value: 'casual', label: 'Casual & Conversational' },
    { value: 'friendly', label: 'Friendly & Approachable' },
    { value: 'expert', label: 'Expert & Informative' }
  ];



  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // New save function for the file-based system
  const saveBlogToSystem = async (blogData: any) => {
    try {
      setIsSaving(true);
      console.log('💾 Saving blog to system...');
      
      // Save via API route
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Blog saved successfully:', result.blog?.filename);
        
        // Update local state
        setSavedBlogs(prev => [result.blog, ...prev]);
        
        // Reset form
        
        showToastMessage(`Blog published successfully! View at: /blog/${result.blog?.slug}`, 'success');
        return { success: true, blog: result.blog };
      } else {
        throw new Error(result.error || 'Failed to save blog');
      }
    } catch (error) {
      console.error('❌ Error saving blog:', error);
      showToastMessage(`Error saving blog: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSaving(false);
    }
  };

  // Replace your existing save button click handler with:
  const handleSaveBlog = async () => {
    if (!generatedBlog) {
      showToastMessage('Please generate a blog first', 'error');
      return;
    }
    
    const result = await saveBlogToSystem(generatedBlog);
    
    if (result.success) {
      showToastMessage(`Blog saved successfully! ID: ${result.blog?.id}`, 'success');
    } else {
      showToastMessage(`Error saving blog: ${result.error}`, 'error');
    }
  };

  const handleInputChange = (field: keyof BlogGeneratorForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };





  const generateTopicSuggestion = async () => {
    const suggestions = await generateTopicSuggestions('gifts');
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    handleInputChange('topic', randomSuggestion);
  };

  const validateForm = (): boolean => {
    if (!formData.topic.trim()) {
      showToastMessage('Please enter a topic', 'error');
      return false;
    }
    if (formData.topic.length < 3) {
      showToastMessage('Topic must be at least 3 characters long', 'error');
      return false;
    }
    if (!formData.primaryKeyword.trim()) {
      showToastMessage('Please enter a primary keyword', 'error');
      return false;
    }
    return true;
  };

  const generateBlog = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedBlog(null);
    setSeoAnalysis(null);
    setContentQuality(null);
    setOptimizedContent('');

    try {
      // Simulate blog generation (replace with actual AI generation)
      const mockBlog: GeneratedBlog = {
        title: formData.topic,
        description: `A comprehensive guide about ${formData.topic} for ${formData.tone} readers.`,
        content: `
          <h2>Introduction</h2>
          <p>Welcome to our comprehensive guide about ${formData.topic}. This article is designed to provide valuable insights and practical advice.</p>
          
          <h2>Key Points</h2>
          <p>Here are the main aspects we'll cover:</p>
          <ul>
            <li>Understanding the basics</li>
            <li>Best practices and tips</li>
            <li>Common mistakes to avoid</li>
            <li>Advanced techniques</li>
          </ul>
          
          <h2>Understanding the Basics</h2>
          <p>Before diving deep into ${formData.topic}, it's important to understand the fundamental concepts.</p>
          
          <h2>Best Practices</h2>
          <p>Follow these proven strategies to achieve the best results.</p>
          
          <h2>Common Mistakes</h2>
          <p>Avoid these pitfalls that many people encounter.</p>
          
          <h2>Advanced Techniques</h2>
          <p>Once you've mastered the basics, explore these advanced approaches.</p>
          
          <h2>Conclusion</h2>
          <p>${formData.topic} is an important topic that requires careful consideration and proper implementation.</p>
        `,
        tags: [formData.primaryKeyword, 'guide', 'tips', 'best practices'],
        primaryKeyword: formData.primaryKeyword,
        wordCount: 450,
        seoAnalysis: {
          titleLength: formData.topic.length,
          descriptionLength: 120,
          hasKeywordInTitle: formData.topic.toLowerCase().includes(formData.primaryKeyword.toLowerCase()),
          estimatedReadTime: '2 min read'
        }
      };

      setGeneratedBlog(mockBlog);

      // Simulate SEO analysis
      const mockSeoAnalysis = {
        score: 85,
        titleScore: 90,
        descriptionScore: 80,
        keywordDensity: 2.1,
        suggestions: [
          'Consider adding more internal links',
          'Include more related keywords',
          'Optimize meta description length'
        ]
      };
      setSeoAnalysis(mockSeoAnalysis);

      // Simulate content quality assessment
      const mockContentQuality = {
        score: 88,
        readability: 'Good',
        structure: 'Excellent',
        engagement: 'High',
        suggestions: [
          'Add more examples',
          'Include statistics or data',
          'Consider adding a FAQ section'
        ]
      };
      setContentQuality(mockContentQuality);

      showToastMessage('Blog post generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating blog:', error);
      showToastMessage(
        error instanceof Error ? error.message : 'Failed to generate blog',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove saveToBlog function - no longer needed

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Blog Generator</h1>
          
          {/* Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Content Parameters</h2>
              
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Topic *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="e.g., Tech gifts for professionals"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={generateTopicSuggestion}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Suggest
                  </Button>
                </div>
              </div>

              {/* Content Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Length
                </label>
                <select
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {lengthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Writing Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {toneOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Keyword *
                </label>
                <input
                  type="text"
                  value={formData.primaryKeyword}
                  onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                  placeholder="e.g., tech gifts, birthday presents"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Keywords
                </label>
                <input
                  type="text"
                  value={formData.secondaryKeywords}
                  onChange={(e) => handleInputChange('secondaryKeywords', e.target.value)}
                  placeholder="e.g., gadgets, electronics, presents"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateBlog}
                disabled={isGenerating}
                className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Blog Post'}
              </Button>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Preview & Analysis</h2>
              
              {generatedBlog && (
                <div className="space-y-4">
                  {/* SEO Analysis */}
                  {seoAnalysis && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">SEO Analysis</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">SEO Score:</span>
                          <span className={`ml-2 font-semibold ${getSeoScoreColor(seoAnalysis.score)}`}>
                            {seoAnalysis.score}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Readability:</span>
                          <span className="ml-2 font-semibold">{seoAnalysis.readability}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Word Count:</span>
                          <span className="ml-2 font-semibold">{generatedBlog.wordCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="ml-2 font-semibold">{generatedBlog.seoAnalysis?.estimatedReadTime || 'N/A'}</span>
                        </div>
                      </div>
                      {seoAnalysis.suggestions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Suggestions:</span>
                          <ul className="text-sm text-gray-700 mt-1">
                            {seoAnalysis.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Quality */}
                  {contentQuality && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Content Quality</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Overall Score:</span>
                          <span className={`ml-2 font-semibold ${getQualityScoreColor(contentQuality.score)}`}>
                            {contentQuality.score}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Grammar:</span>
                          <span className="ml-2 font-semibold">{contentQuality.grammarScore}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Structure:</span>
                          <span className="ml-2 font-semibold">{contentQuality.structureScore}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Engagement:</span>
                          <span className="ml-2 font-semibold">{contentQuality.engagementScore}/100</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Content Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Generated Content</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600 text-sm">Title:</span>
                        <p className="font-medium">{generatedBlog.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Description:</span>
                        <p className="text-sm">{generatedBlog.description}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {generatedBlog.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 py-2 bg-gray-600 text-white hover:bg-gray-700"
                    >
                      {showPreview ? 'Hide' : 'Show'} Full Preview
                    </Button>
                    <Button
                      onClick={handleSaveBlog}
                      className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700"
                    >
                      Save to Blog
                    </Button>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 py-2 bg-gray-600 text-white hover:bg-gray-700"
                    >
                      {showPreview ? 'Hide' : 'Show'} Full Preview
                    </Button>
                    <Button
                      onClick={handleSaveBlog}
                      className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Publishing...' : '🚀 Publish Blog'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Content Preview */}
          {showPreview && generatedBlog && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Content Preview</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  <h1>{generatedBlog.title}</h1>
                  <p className="text-gray-600 mb-4">{generatedBlog.description}</p>
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ 
                      __html: generatedBlog.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default BlogGenerator;
