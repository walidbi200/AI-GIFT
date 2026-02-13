import React, { useState } from 'react';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';

// Interfaces for our data structures
interface GeneratedBlog {
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  wordCount: number;
}

interface BlogGeneratorForm {
  topic: string;
  tone: 'professional' | 'casual' | 'friendly' | 'expert';
  length: 'short' | 'medium' | 'long';
  primaryKeyword: string;
  secondaryKeywords: string;
}

// Helper function to calculate SEO score dynamically
const calculateSeoScore = (blog: GeneratedBlog | null): number => {
  if (!blog) return 0;
  let score = 0;
  if (blog.title.length > 30 && blog.title.length < 60) score += 25;
  if (blog.description.length > 120 && blog.description.length < 160) score += 25;
  if (blog.wordCount > 500) score += 20;
  if (blog.tags.length >= 3) score += 15;
  if (blog.content.includes(blog.primaryKeyword)) score += 15;
  return Math.min(100, score);
};

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
  const [isSaving, setIsSaving] = useState(false);

  // SEO score is now derived state, calculated whenever the blog content changes
  const seoScore = calculateSeoScore(generatedBlog);

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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.topic.trim() || !formData.primaryKeyword.trim()) {
      showToastMessage('Topic and Primary Keyword are required.', 'error');
      return false;
    }
    return true;
  };

  const generateBlog = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGeneratedBlog(null);

    try {
      const response = await fetch('/api/blog/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate blog post.');
      }

      setGeneratedBlog(result.blog);
      showToastMessage('Blog post generated successfully!', 'success');

    } catch (error) {
      console.error('Error generating blog:', error);
      showToastMessage(error instanceof Error ? error.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!generatedBlog) {
      showToastMessage('Please generate a blog first', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedBlog)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      showToastMessage(`Blog saved successfully! View at: /blog/${result.blog.slug}`, 'success');
    } catch (error) {
      showToastMessage(`Error saving blog: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Blog Generator</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Content Parameters</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Topic *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="e.g., Tech gifts for professionals"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                <select
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {lengthOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Writing Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {toneOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Keyword *</label>
                <input
                  type="text"
                  value={formData.primaryKeyword}
                  onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                  placeholder="e.g., tech gifts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Keywords</label>
                <input
                  type="text"
                  value={formData.secondaryKeywords}
                  onChange={(e) => handleInputChange('secondaryKeywords', e.target.value)}
                  placeholder="e.g., gadgets, electronics, presents"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={generateBlog}
                disabled={isGenerating}
                className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Blog Post'}
              </Button>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Preview & Analysis</h2>

              {isGenerating && <p>Generating content, please wait...</p>}

              {generatedBlog && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">SEO Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">SEO Score:</span>
                        <span className={`ml-2 font-semibold ${getScoreColor(seoScore)}`}>
                          {seoScore}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Word Count:</span>
                        <span className="ml-2 font-semibold">{generatedBlog.wordCount}</span>
                      </div>
                    </div>
                  </div>

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

                  <div className="flex gap-2">
                    <Button onClick={() => setShowPreview(!showPreview)} className="flex-1 py-2 bg-gray-600 text-white hover:bg-gray-700">
                      {showPreview ? 'Hide' : 'Show'} Full Preview
                    </Button>
                    <Button onClick={handleSaveBlog} className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700" disabled={isSaving}>
                      {isSaving ? 'Saving...' : '🚀 Save & Publish'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showPreview && generatedBlog && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Content Preview</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: generatedBlog.content }} />
              </div>
            </div>
          )}
        </div>
      </div>

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
