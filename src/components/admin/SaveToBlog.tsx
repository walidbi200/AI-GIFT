import React, { useState } from 'react';
import Button from '../Button';
import Toast from '../Toast';

interface EditorialBrief {
  title: string;
  targetAudience: string;
  goal: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  toneOfVoice: string;
  outline: string[];
  references: string[];
  specialNotes: string[];
  featuredImage?: string;
}

interface SaveToBlogResponse {
  success: boolean;
  filePath?: string;
  warnings: string[];
  wordpressPublished: boolean;
  message: string;
}

const SaveToBlog: React.FC = () => {
  const [brief, setBrief] = useState<EditorialBrief>({
    title: '',
    targetAudience: '',
    goal: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    toneOfVoice: 'friendly',
    outline: [],
    references: [],
    specialNotes: [],
    featuredImage: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [result, setResult] = useState<SaveToBlogResponse | null>(null);

  const toneOptions = [
    { value: 'friendly', label: 'Friendly' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'expert', label: 'Expert' },
    { value: 'playful', label: 'Playful' }
  ];

  const goalOptions = [
    { value: 'inform', label: 'Inform' },
    { value: 'persuade', label: 'Persuade' },
    { value: 'entertain', label: 'Entertain' },
    { value: 'rank', label: 'Rank for keywords' }
  ];

  const handleInputChange = (field: keyof EditorialBrief, value: string | string[]) => {
    setBrief(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof EditorialBrief, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setBrief(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const validateForm = (): boolean => {
    if (!brief.title.trim()) {
      showToastMessage('Title is required', 'error');
      return false;
    }
    if (!brief.targetAudience.trim()) {
      showToastMessage('Target audience is required', 'error');
      return false;
    }
    if (!brief.goal.trim()) {
      showToastMessage('Goal is required', 'error');
      return false;
    }
    if (!brief.primaryKeyword.trim()) {
      showToastMessage('Primary keyword is required', 'error');
      return false;
    }
    return true;
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/save-to-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brief),
      });

      const result: SaveToBlogResponse = await response.json();

      if (result.success) {
        showToastMessage('Blog post generated and saved successfully!', 'success');
        setResult(result);
      } else {
        showToastMessage(result.message || 'Blog generation failed', 'error');
        setResult(result);
      }
    } catch (error) {
      console.error('Error saving to blog:', error);
      showToastMessage('Failed to generate blog post. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setBrief({
      title: '',
      targetAudience: '',
      goal: '',
      primaryKeyword: '',
      secondaryKeywords: [],
      toneOfVoice: 'friendly',
      outline: [],
      references: [],
      specialNotes: [],
      featuredImage: ''
    });
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Save to Blog</h1>
        <p className="text-gray-600">
          Generate and save blog posts using AI with humanization and SEO optimization.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={brief.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SEO-optimized title here"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {brief.title.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Keyword *
            </label>
            <input
              type="text"
              value={brief.primaryKeyword}
              onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Main keyword to target"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              value={brief.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Who will read this content?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal *
            </label>
            <select
              value={brief.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a goal</option>
              {goalOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Keywords
            </label>
            <input
              type="text"
              value={brief.secondaryKeywords.join(', ')}
              onChange={(e) => handleArrayInputChange('secondaryKeywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone of Voice
            </label>
            <select
              value={brief.toneOfVoice}
              onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {toneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Structure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outline (Optional)
          </label>
          <textarea
            value={brief.outline.join('\n')}
            onChange={(e) => handleArrayInputChange('outline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="1. [H2 Heading 1]&#10;2. [H2 Heading 2]&#10;3. [H2 Heading 3]"
          />
          <p className="text-xs text-gray-500 mt-1">
            One heading per line, numbered
          </p>
        </div>

        {/* References and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              References & Sources
            </label>
            <textarea
              value={brief.references.join('\n')}
              onChange={(e) => handleArrayInputChange('references', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="https://example.com&#10;https://source.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              One URL per line
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Notes
            </label>
            <textarea
              value={brief.specialNotes.join('\n')}
              onChange={(e) => handleArrayInputChange('specialNotes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="- Include at least 1 image&#10;- Add internal links to related posts"
            />
            <p className="text-xs text-gray-500 mt-1">
              One note per line, starting with dash
            </p>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image URL (Optional)
          </label>
          <input
            type="url"
            value={brief.featuredImage}
            onChange={(e) => handleInputChange('featuredImage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Blog Post...
              </span>
            ) : (
              'Generate & Save Blog Post'
            )}
          </Button>
          
          <Button
            type="button"
            onClick={clearForm}
            className="px-6 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Clear Form
          </Button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Results</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">{result.message}</span>
            </div>

            {result.filePath && (
              <div className="text-sm text-gray-600">
                <strong>File saved:</strong> {result.filePath}
              </div>
            )}

            {result.wordpressPublished && (
              <div className="text-sm text-green-600">
                ✅ Published to WordPress successfully
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default SaveToBlog;
