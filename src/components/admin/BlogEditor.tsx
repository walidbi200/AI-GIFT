import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface BlogEditorProps {
  post?: Post;
  onSave?: (post: Post) => void;
  onPublish?: (post: Post) => void;
}

interface EditorState {
  title: string;
  description: string;
  content: string;
  tags: string[];
  author: string;
  featured: boolean;
  image: string;
  slug: string;
  newTag: string;
  isPreviewMode: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  seoScore: number;
  seoSuggestions: string[];
  imageUploadProgress: number;
  isImageUploading: boolean;
  // Optimistic UI state
  optimisticSave: boolean;
  optimisticPublish: boolean;
  lastSavedContent: string;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  autoSaveInterval: number | null;
}

export function BlogEditor({ post, onSave, onPublish }: BlogEditorProps) {
  const [state, setState] = useState<EditorState>({
    title: post?.title || '',
    description: post?.description || '',
    content: post?.content || '',
    tags: post?.tags || [],
    author: post?.author || 'Admin',
    featured: post?.featured || false,
    image: post?.image || '',
    slug: post?.slug || '',
    newTag: '',
    isPreviewMode: false,
    isSaving: false,
    isPublishing: false,
    seoScore: 0,
    seoSuggestions: [],
    imageUploadProgress: 0,
    isImageUploading: false,
    // Optimistic UI state
    optimisticSave: false,
    optimisticPublish: false,
    lastSavedContent: post?.content || '',
    hasUnsavedChanges: false,
    autoSaveEnabled: true,
    autoSaveInterval: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Generate slug from title
  useEffect(() => {
    if (state.title && !state.slug) {
      const slug = state.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setState(prev => ({ ...prev, slug }));
    }
  }, [state.title, state.slug]);

  // SEO Analysis
  useEffect(() => {
    analyzeSEO();
  }, [state.title, state.description, state.content, state.tags]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = state.content !== state.lastSavedContent;
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, [state.content, state.lastSavedContent]);

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSaveEnabled && state.hasUnsavedChanges && state.content.length > 100) {
      const interval = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      setState(prev => ({ ...prev, autoSaveInterval: interval as any }));

      return () => {
        if (interval) clearTimeout(interval);
      };
    }
  }, [state.content, state.hasUnsavedChanges, state.autoSaveEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.autoSaveInterval) {
        clearTimeout(state.autoSaveInterval);
      }
    };
  }, [state.autoSaveInterval]);

  const analyzeSEO = () => {
    const suggestions: string[] = [];
    let score = 0;

    // Title analysis
    if (state.title.length < 30) {
      suggestions.push('Title should be at least 30 characters long');
    } else if (state.title.length > 60) {
      suggestions.push('Title should be under 60 characters for optimal SEO');
    } else {
      score += 20;
    }

    // Description analysis
    if (state.description.length < 120) {
      suggestions.push('Meta description should be at least 120 characters');
    } else if (state.description.length > 160) {
      suggestions.push('Meta description should be under 160 characters');
    } else {
      score += 20;
    }

    // Content analysis
    const wordCount = state.content.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push('Content should be at least 300 words for better SEO');
    } else if (wordCount > 2000) {
      suggestions.push('Consider breaking up very long content into sections');
    } else {
      score += 30;
    }

    // Tags analysis
    if (state.tags.length < 3) {
      suggestions.push('Add at least 3 relevant tags');
    } else {
      score += 15;
    }

    // Image analysis
    if (state.image) {
      score += 15;
    } else {
      suggestions.push('Add a featured image for better engagement');
    }

    setState(prev => ({
      ...prev,
      seoScore: Math.min(100, score),
      seoSuggestions: suggestions,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, isImageUploading: true, imageUploadProgress: 0 }));

    // Simulate image upload with progress
    const simulateUpload = () => {
      return new Promise<string>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setState(prev => ({ ...prev, imageUploadProgress: progress }));
          
          if (progress >= 100) {
            clearInterval(interval);
            // Generate a placeholder URL (in real app, this would be the uploaded image URL)
            const imageUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800&h=600&fit=crop`;
            resolve(imageUrl);
          }
        }, 100);
      });
    };

    try {
      const imageUrl = await simulateUpload();
      setState(prev => ({
        ...prev,
        image: imageUrl,
        isImageUploading: false,
        imageUploadProgress: 0,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isImageUploading: false,
        imageUploadProgress: 0,
      }));
    }
  };

  const addTag = () => {
    if (state.newTag.trim() && !state.tags.includes(state.newTag.trim())) {
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, state.newTag.trim()],
        newTag: '',
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAutoSave = async () => {
    if (!state.hasUnsavedChanges || state.content.length < 100) return;

    try {
      // Optimistic update - show saved state immediately
      setState(prev => ({ 
        ...prev, 
        optimisticSave: true,
        lastSavedContent: prev.content,
        hasUnsavedChanges: false
      }));

      // Simulate auto-save API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Hide optimistic indicator after successful save
      setTimeout(() => {
        setState(prev => ({ ...prev, optimisticSave: false }));
      }, 2000);

    } catch (error) {
      // Revert optimistic update on error
      setState(prev => ({ 
        ...prev, 
        optimisticSave: false,
        hasUnsavedChanges: true
      }));
      console.error('Auto-save failed:', error);
    }
  };

  const handleSave = async () => {
    // Optimistic update
    setState(prev => ({ 
      ...prev, 
      isSaving: true,
      optimisticSave: true,
      lastSavedContent: prev.content,
      hasUnsavedChanges: false
    }));
    
    try {
      const postData: Post = {
        slug: state.slug,
        title: state.title,
        description: state.description,
        date: new Date().toISOString(),
        author: state.author,
        tags: state.tags,
        readTime: Math.ceil(state.content.split(/\s+/).length / 200),
        featured: state.featured,
        image: state.image,
        content: state.content,
        url: `/blog/${state.slug}`,
        body: state.content,
      };

      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(postData);
      
      // Hide optimistic indicator after successful save
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isSaving: false,
          optimisticSave: false
        }));
      }, 2000);
    } catch (error) {
      // Revert optimistic update on error
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        optimisticSave: false,
        hasUnsavedChanges: true
      }));
    }
  };

  const handlePublish = async () => {
    // Optimistic update
    setState(prev => ({ 
      ...prev, 
      isPublishing: true,
      optimisticPublish: true,
      lastSavedContent: prev.content,
      hasUnsavedChanges: false
    }));
    
    try {
      const postData: Post = {
        slug: state.slug,
        title: state.title,
        description: state.description,
        date: new Date().toISOString(),
        author: state.author,
        tags: state.tags,
        readTime: Math.ceil(state.content.split(/\s+/).length / 200),
        featured: state.featured,
        image: state.image,
        content: state.content,
        url: `/blog/${state.slug}`,
        body: state.content,
      };

      // Simulate publish delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onPublish?.(postData);
      
      // Hide optimistic indicator after successful publish
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isPublishing: false,
          optimisticPublish: false
        }));
      }, 2000);
    } catch (error) {
      // Revert optimistic update on error
      setState(prev => ({ 
        ...prev, 
        isPublishing: false,
        optimisticPublish: false,
        hasUnsavedChanges: true
      }));
    }
  };

  const insertText = (text: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newContent = state.content.substring(0, start) + text + state.content.substring(end);
      setState(prev => ({ ...prev, content: newContent }));
      
      // Set cursor position after inserted text
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(start + text.length, start + text.length);
        }
      }, 0);
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
                {post ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              <p className="mt-2 text-gray-600">
                Write, edit, and optimize your blog content
              </p>
              {/* Optimistic UI indicators */}
              <div className="mt-2 flex items-center space-x-4">
                {state.optimisticSave && (
                  <div className="flex items-center text-green-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    <span className="text-sm">Auto-saving...</span>
                  </div>
                )}
                {state.optimisticPublish && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Publishing...</span>
                  </div>
                )}
                {state.hasUnsavedChanges && (
                  <div className="flex items-center text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                    <span className="text-sm">Unsaved changes</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={state.title}
                    onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog post title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={state.description}
                    onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter meta description for SEO..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={state.slug}
                    onChange={(e) => setState(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="blog-post-url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={state.author}
                    onChange={(e) => setState(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={state.featured}
                    onChange={(e) => setState(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured Post
                  </label>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
                    className={`px-3 py-1 text-sm rounded ${
                      state.isPreviewMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {state.isPreviewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
              </div>

              {!state.isPreviewMode ? (
                <div>
                  {/* Toolbar */}
                  <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-2">
                    <button
                      onClick={() => insertText('**Bold Text**')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Bold
                    </button>
                    <button
                      onClick={() => insertText('*Italic Text*')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Italic
                    </button>
                    <button
                      onClick={() => insertText('[Link Text](https://example.com)')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Link
                    </button>
                    <button
                      onClick={() => insertText('![Alt Text](image-url)')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Image
                    </button>
                    <button
                      onClick={() => insertText('# Heading 1\n\n')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => insertText('## Heading 2\n\n')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => insertText('- List item\n')}
                      className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      List
                    </button>
                  </div>

                  <textarea
                    ref={editorRef}
                    value={state.content}
                    onChange={(e) => setState(prev => ({ ...prev, content: e.target.value }))}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Write your blog post content here... Use Markdown formatting."
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[400px]">
                    <h1>{state.title}</h1>
                    <p className="text-gray-600">{state.description}</p>
                    <hr className="my-4" />
                    <div dangerouslySetInnerHTML={{ __html: state.content }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={state.newTag}
                    onChange={(e) => setState(prev => ({ ...prev, newTag: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {state.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.isImageUploading}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 disabled:opacity-50"
                >
                  {state.isImageUploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Uploading... {state.imageUploadProgress}%</span>
                    </div>
                  ) : (
                    'Choose Image or Drag & Drop'
                  )}
                </button>

                {state.image && (
                  <div className="relative">
                    <img
                      src={state.image}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      onClick={() => setState(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Analysis</h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{state.seoScore}</div>
                  <div className="text-sm text-gray-600">SEO Score</div>
                </div>

                {state.seoSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h3>
                    <ul className="space-y-1">
                      {state.seoSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start">
                          <span className="mr-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={state.isSaving || !state.title || !state.content}
                  className={`w-full px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    state.optimisticSave 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {state.optimisticSave ? '✓ Saved!' : state.isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={state.isPublishing || !state.title || !state.content}
                  className={`w-full px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    state.optimisticPublish 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {state.optimisticPublish ? '✓ Published!' : state.isPublishing ? 'Publishing...' : 'Publish Post'}
                </button>

                {/* Auto-save toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Auto-save</span>
                  <button
                    onClick={() => setState(prev => ({ ...prev, autoSaveEnabled: !prev.autoSaveEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state.autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        state.autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Word Count */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Words:</span>
                  <span className="font-medium">{state.content.split(/\s+/).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Characters:</span>
                  <span className="font-medium">{state.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reading Time:</span>
                  <span className="font-medium">
                    {Math.ceil(state.content.split(/\s+/).length / 200)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tags:</span>
                  <span className="font-medium">{state.tags.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
