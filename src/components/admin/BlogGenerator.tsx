import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';
import { analyzeSEO, assessContentQuality, optimizeContent } from '../../utils/blogAI';
import { generateTopicSuggestions } from '../../utils/aiPrompts';

interface GeneratedBlog {
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  estimatedReadingTime: number;
  suggestedFeaturedImage: string;
}

interface BlogGeneratorForm {
  topic: string;
  audience: 'parents' | 'young-adults' | 'professionals' | 'seniors' | 'general';
  contentLength: '800-1200' | '1200-1800' | '1800+';
  tone: 'professional' | 'casual' | 'friendly' | 'expert';
  keywords: string[];
  contentType: 'gift-guide' | 'trending' | 'problem-solving' | 'holiday-seasonal' | 'demographic-specific' | 'budget-focused' | 'luxury-premium';
}

const BlogGenerator: React.FC = () => {
  const [formData, setFormData] = useState<BlogGeneratorForm>({
    topic: '',
    audience: 'general',
    contentLength: '1200-1800',
    tone: 'friendly',
    keywords: [],
    contentType: 'gift-guide'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [keywordInput, setKeywordInput] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [contentQuality, setContentQuality] = useState<any>(null);
  const [optimizedContent, setOptimizedContent] = useState<string>('');

  const audienceOptions = [
    { value: 'parents', label: 'Parents & Families' },
    { value: 'young-adults', label: 'Young Adults & Millennials' },
    { value: 'professionals', label: 'Working Professionals' },
    { value: 'seniors', label: 'Seniors & Older Adults' },
    { value: 'general', label: 'General Audience' }
  ];

  const contentLengthOptions = [
    { value: '800-1200', label: 'Short (800-1200 words)' },
    { value: '1200-1800', label: 'Medium (1200-1800 words)' },
    { value: '1800+', label: 'Long (1800+ words)' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional & Authoritative' },
    { value: 'casual', label: 'Casual & Conversational' },
    { value: 'friendly', label: 'Friendly & Approachable' },
    { value: 'expert', label: 'Expert & Informative' }
  ];

  const contentTypeOptions = [
    { value: 'gift-guide', label: 'Gift Guide' },
    { value: 'trending', label: 'Trending Topics' },
    { value: 'problem-solving', label: 'Problem Solving' },
    { value: 'holiday-seasonal', label: 'Holiday & Seasonal' },
    { value: 'demographic-specific', label: 'Demographic Specific' },
    { value: 'budget-focused', label: 'Budget Focused' },
    { value: 'luxury-premium', label: 'Luxury & Premium' }
  ];

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleInputChange = (field: keyof BlogGeneratorForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      handleInputChange('keywords', [...formData.keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleInputChange('keywords', formData.keywords.filter(k => k !== keyword));
  };

  const generateTopicSuggestion = () => {
    const suggestions = generateTopicSuggestions(formData.audience, formData.contentType);
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
    if (formData.keywords.length === 0) {
      showToastMessage('Please add at least one keyword', 'error');
      return false;
    }
    return true;
  };

  const generateBlog = async () => {
    console.log('🔥 Frontend: Starting blog generation with:', formData);
    
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedBlog(null);
    setSeoAnalysis(null);
    setContentQuality(null);

    try {
      console.log('🔥 Frontend: Making API request to /api/generate-blog');
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          audience: formData.audience,
          contentLength: formData.contentLength,
          tone: formData.tone,
          keywords: formData.keywords,
          contentType: formData.contentType
        }),
      });

      console.log('🔥 Frontend: API response status:', response.status);
      console.log('🔥 Frontend: API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Frontend: API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('🔥 Frontend: Received blog data:', result);

      if (result.success && result.data) {
        console.log('🔥 Frontend: Setting generated blog data');
        setGeneratedBlog(result.data);
        setShowPreview(true);
        
        console.log('🔥 Frontend: Analyzing generated content...');
        // Analyze the generated content
        const seo = analyzeSEO(result.data.content, result.data.keywords);
        const quality = assessContentQuality(result.data.content);
        const optimized = optimizeContent(result.data.content, result.data.keywords);
        
        setSeoAnalysis(seo);
        setContentQuality(quality);
        setOptimizedContent(optimized.content);
        
        console.log('🔥 Frontend: Blog generation completed successfully');
        showToastMessage('Blog generated successfully!', 'success');
      } else {
        console.log('❌ Frontend: Invalid response format:', result);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('💥 Frontend: Blog generation failed:', error);
      showToastMessage(
        error instanceof Error ? error.message : 'Failed to generate blog',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToBlog = () => {
    if (!generatedBlog) return;

    // In a real implementation, this would save to your content management system
    // For now, we'll just show a success message
    showToastMessage('Blog saved successfully! (This would save to your CMS in production)', 'success');
  };

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

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {contentTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => handleInputChange('audience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {audienceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Length
                </label>
                <select
                  value={formData.contentLength}
                  onChange={(e) => handleInputChange('contentLength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {contentLengthOptions.map(option => (
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

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Add keyword and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
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
                          <span className={`ml-2 font-semibold ${getSeoScoreColor(seoAnalysis.seoScore)}`}>
                            {seoAnalysis.seoScore}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Readability:</span>
                          <span className="ml-2 font-semibold">{seoAnalysis.readabilityScore.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Word Count:</span>
                          <span className="ml-2 font-semibold">{seoAnalysis.contentLength}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="ml-2 font-semibold">{generatedBlog.estimatedReadingTime} min</span>
                        </div>
                      </div>
                      {seoAnalysis.suggestions.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-600 text-sm">Suggestions:</span>
                          <ul className="text-sm text-gray-700 mt-1">
                            {seoAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
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
                          <span className={`ml-2 font-semibold ${getQualityScoreColor(contentQuality.overallScore)}`}>
                            {contentQuality.overallScore}/100
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
                      onClick={saveToBlog}
                      className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700"
                    >
                      Save to Blog
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
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default BlogGenerator;
