import React, { useState } from 'react';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';
import { analyzeSEO, assessContentQuality, optimizeContent } from '../../utils/blogAI';
import { generateTopicSuggestions } from '../../utils/aiPrompts';

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

  const handleInputChange = (field: keyof BlogGeneratorForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };





  const generateTopicSuggestion = () => {
    const suggestions = generateTopicSuggestions('general', 'gift-guide');
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
          tone: formData.tone,
          length: formData.length,
          primaryKeyword: formData.primaryKeyword,
          secondaryKeywords: formData.secondaryKeywords
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

      console.log('🔥 Frontend: Setting generated blog data');
      setGeneratedBlog(result);
      setShowPreview(true);
      
      console.log('🔥 Frontend: Analyzing generated content...');
      // Analyze the generated content
      const seo = analyzeSEO(result.content, [result.primaryKeyword]);
      const quality = assessContentQuality(result.content);
      const optimized = optimizeContent(result.content, [result.primaryKeyword]);
      
      setSeoAnalysis(seo);
      setContentQuality(quality);
      setOptimizedContent(optimized.content);
      
      console.log('🔥 Frontend: Blog generation completed successfully');
      showToastMessage('Blog generated successfully!', 'success');
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

  const saveToBlog = async () => {
    if (!generatedBlog) return;

    try {
      // Create a brief from the generated blog
      const brief = {
        title: formData.topic,
        targetAudience: 'General audience',
        goal: 'inform',
        primaryKeyword: formData.primaryKeyword || formData.topic.split(' ')[0],
        secondaryKeywords: formData.secondaryKeywords ? formData.secondaryKeywords.split(',').map(k => k.trim()) : [],
        toneOfVoice: formData.tone,
        outline: [],
        references: [],
        specialNotes: [],
        featuredImage: ''
      };

      console.log('🚀 Sending blog save request:', JSON.stringify(brief, null, 2));

      const response = await fetch('/api/save-to-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brief),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorText = await response.text();
          console.log('📋 Error response text:', errorText);
          
          // Try to parse as JSON for structured error
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              errorMessage = errorJson.message;
            }
            if (errorJson.errors && Array.isArray(errorJson.errors)) {
              errorDetails = errorJson.errors.join(', ');
            }
          } catch (parseError) {
            // If not JSON, use the raw text
            errorMessage = errorText || errorMessage;
          }
        } catch (textError) {
          console.error('❌ Could not read error response:', textError);
        }

        const fullErrorMessage = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        throw new Error(fullErrorMessage);
      }

      // Parse successful response
      let result;
      try {
        const responseText = await response.text();
        console.log('📋 Response text:', responseText);
        
        result = JSON.parse(responseText);
        console.log('✅ Response parsed as JSON:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      // Validate response structure
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Invalid response structure from server');
      }

      if (result.success) {
        const successMessage = result.data?.filePath 
          ? `Blog post saved successfully! View at: ${result.data.filePath}`
          : 'Blog post generated and saved successfully! ✅';
        showToastMessage(successMessage, 'success');
        
        // Log success details
        console.log('🎉 Blog save successful:', {
          postId: result.data?.postId,
          slug: result.data?.slug,
          wordCount: result.data?.wordCount,
          filePath: result.data?.filePath
        });
      } else {
        const errorMessage = result.message || 'Blog generation failed';
        const errorDetails = result.errors && Array.isArray(result.errors) 
          ? `: ${result.errors.join(', ')}`
          : '';
        showToastMessage(`${errorMessage}${errorDetails}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error saving to blog:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to save blog post. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP error! status: 400')) {
          userMessage = 'Invalid blog data. Please check your input and try again.';
        } else if (error.message.includes('HTTP error! status: 500')) {
          userMessage = 'Server error occurred. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Invalid response format')) {
          userMessage = 'Server returned invalid response. Please try again.';
        } else {
          userMessage = error.message;
        }
      }
      
      showToastMessage(userMessage, 'error');
    }
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
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default BlogGenerator;
