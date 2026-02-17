import React, { useState, useEffect } from 'react';
import Button from '../Button';
import Toast from '../Toast';
import type { ToastType } from '../../types';

interface SavedBlog {
  id: number;
  slug: string;
  filename: string;
  createdAt: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  primaryKeyword: string;
  wordCount: number;
  status: string;
  targetAudience?: string;
  toneOfVoice?: string;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<SavedBlog[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [selectedBlog, setSelectedBlog] = useState<SavedBlog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSavedBlogs();
  }, []);

  const loadSavedBlogs = () => {
    try {
      const savedBlogs = JSON.parse(localStorage.getItem('savedBlogs') || '[]');
      setBlogs(savedBlogs);
    } catch (error) {
      console.error('Error loading saved blogs:', error);
      showToastMessage('Error loading saved blogs', 'error');
    }
  };

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const deleteBlog = (blogId: number) => {
    try {
      const updatedBlogs = blogs.filter((blog) => blog.id !== blogId);
      setBlogs(updatedBlogs);
      localStorage.setItem('savedBlogs', JSON.stringify(updatedBlogs));
      showToastMessage('Blog deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting blog:', error);
      showToastMessage('Error deleting blog', 'error');
    }
  };

  const viewBlogDetails = (blog: SavedBlog) => {
    setSelectedBlog(blog);
    setShowDetails(true);
  };

  const exportBlog = (blog: SavedBlog) => {
    try {
      const blogData = JSON.stringify(blog, null, 2);
      const blob = new Blob([blogData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blog.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToastMessage('Blog exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting blog:', error);
      showToastMessage('Error exporting blog', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Saved Blogs ({blogs.length})
            </h1>
            <Button
              onClick={loadSavedBlogs}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Refresh
            </Button>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No blogs saved yet
              </h3>
              <p className="text-gray-600">
                Generate and save your first blog post to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {blog.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {blog.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4 text-sm text-gray-600">
                    <p>
                      <strong>Keyword:</strong> {blog.primaryKeyword}
                    </p>
                    <p>
                      <strong>Word Count:</strong> {blog.wordCount}
                    </p>
                    <p>
                      <strong>Created:</strong>{' '}
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                    {blog.targetAudience && (
                      <p>
                        <strong>Audience:</strong> {blog.targetAudience}
                      </p>
                    )}
                    {blog.toneOfVoice && (
                      <p>
                        <strong>Tone:</strong> {blog.toneOfVoice}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => viewBlogDetails(blog)}
                      className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => exportBlog(blog)}
                      className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 text-sm"
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => deleteBlog(blog.id)}
                      className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blog Details Modal */}
        {showDetails && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedBlog.title}
                  </h2>
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">{selectedBlog.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Content
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: selectedBlog.content
                            .replace(/\n/g, '<br>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {selectedBlog.id}
                    </div>
                    <div>
                      <strong>Slug:</strong> {selectedBlog.slug}
                    </div>
                    <div>
                      <strong>Filename:</strong> {selectedBlog.filename}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedBlog.status}
                    </div>
                    <div>
                      <strong>Word Count:</strong> {selectedBlog.wordCount}
                    </div>
                    <div>
                      <strong>Created:</strong>{' '}
                      {new Date(selectedBlog.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => exportBlog(selectedBlog)}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    Export JSON
                  </Button>
                  <Button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default BlogList;
