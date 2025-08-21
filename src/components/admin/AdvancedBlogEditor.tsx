import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useDebounce } from '../../hooks/useDebounce';

interface BlogPost {
  id?: number;
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  targetAudience: string;
  toneOfVoice: string;
  featuredImage: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface AdvancedBlogEditorProps {
  initialPost?: BlogPost;
  onSave: (post: BlogPost) => Promise<void>;
  onPublish: (post: BlogPost) => Promise<void>;
  onSchedule: (post: BlogPost, date: string) => Promise<void>;
}

const AdvancedBlogEditor: React.FC<AdvancedBlogEditorProps> = ({
  initialPost,
  onSave,
  onPublish,
  onSchedule
}) => {
  const [post, setPost] = useState<BlogPost>(initialPost || {
    title: '',
    description: '',
    content: '',
    tags: [],
    primaryKeyword: '',
    targetAudience: 'general',
    toneOfVoice: 'professional',
    featuredImage: '',
    status: 'draft'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [versionHistory, setVersionHistory] = useState<BlogPost[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const debouncedPost = useDebounce(post, 2000);
  const editorRef = useRef<any>(null);

  // Auto-save functionality
  useEffect(() => {
    if (debouncedPost && debouncedPost.title && debouncedPost.content) {
      handleAutoSave();
    }
  }, [debouncedPost]);

  const handleAutoSave = async () => {
    if (post.title && post.content) {
      setSaveStatus('saving');
      try {
        await onSave(post);
        setSaveStatus('saved');
        
        // Add to version history
        setVersionHistory(prev => [...prev.slice(-9), { ...post, id: Date.now() }]);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }
  };

  const handleContentChange = (content: string) => {
    setPost(prev => ({ ...prev, content }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost(prev => ({ ...prev, title: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(prev => ({ ...prev, description: e.target.value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setPost(prev => ({ ...prev, tags }));
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost(prev => ({ ...prev, primaryKeyword: e.target.value }));
  };

  const handleTargetAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPost(prev => ({ ...prev, targetAudience: e.target.value }));
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPost(prev => ({ ...prev, toneOfVoice: e.target.value }));
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost(prev => ({ ...prev, featuredImage: e.target.value }));
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await onSave(post);
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await onPublish({ ...post, status: 'published' });
      setPost(prev => ({ ...prev, status: 'published' }));
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate) return;
    
    setIsSaving(true);
    try {
      await onSchedule({ ...post, status: 'scheduled' }, scheduledDate);
      setPost(prev => ({ ...prev, status: 'scheduled', scheduledDate }));
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Schedule failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFromAI = () => {
    // This will be integrated with the AI Blog Generator
    window.open('/admin/blog-generator', '_blank');
  };

  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Advanced Blog Editor</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-green-500' :
                  saveStatus === 'saving' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {saveStatus === 'saved' ? 'All changes saved' :
                   saveStatus === 'saving' ? 'Saving...' : 'Save failed'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowVersionHistory(true)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                📋 Version History
              </button>
              <button
                onClick={handleImportFromAI}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Import from AI
              </button>
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Schedule
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isSaving ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              
              {/* Title Input */}
              <div className="p-6 border-b">
                <input
                  type="text"
                  placeholder="Enter your blog post title..."
                  value={post.title}
                  onChange={handleTitleChange}
                  className="w-full text-3xl font-bold text-gray-900 border-none outline-none placeholder-gray-400"
                />
              </div>

              {/* Description Input */}
              <div className="p-6 border-b">
                <textarea
                  placeholder="Enter a brief description of your blog post..."
                  value={post.description}
                  onChange={handleDescriptionChange}
                  rows={3}
                  className="w-full text-gray-700 border-none outline-none resize-none placeholder-gray-400"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="p-6">
                <Editor
                  onInit={(_evt: any, editor: any) => editorRef.current = editor}
                  value={post.content}
                  onEditorChange={handleContentChange}
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    images_upload_handler: handleImageUpload,
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    paste_data_images: true
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* SEO Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Keyword</label>
                    <input
                      type="text"
                      value={post.primaryKeyword}
                      onChange={handleKeywordChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                    <select
                      value={post.targetAudience}
                      onChange={handleTargetAudienceChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="developers">Developers</option>
                      <option value="designers">Designers</option>
                      <option value="marketers">Marketers</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tone of Voice</label>
                    <select
                      value={post.toneOfVoice}
                      onChange={handleToneChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="authoritative">Authoritative</option>
                      <option value="conversational">Conversational</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  value={post.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
                <input
                  type="url"
                  placeholder="Enter image URL..."
                  value={post.featuredImage}
                  onChange={handleFeaturedImageChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Post Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Post Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      post.status === 'draft' ? 'bg-gray-400' :
                      post.status === 'published' ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">{post.status}</span>
                  </div>
                  {post.scheduledDate && (
                    <p className="text-sm text-gray-600">
                      Scheduled for: {new Date(post.scheduledDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Post</h3>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduledDate}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Version History</h3>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {versionHistory.map((version, index) => (
                  <div key={version.id} className="border-b py-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Version {versionHistory.length - index} - {new Date(version.id!).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setPost(version);
                          setShowVersionHistory(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Restore
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{version.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedBlogEditor;
