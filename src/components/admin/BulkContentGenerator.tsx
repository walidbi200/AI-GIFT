import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface BulkGenerationRequest {
  keywords: string[];
  template: string;
  count: number;
  audience: string;
  tone: string;
  scheduleType: 'immediate' | 'scheduled' | 'spread';
  startDate?: string;
  endDate?: string;
  publishInterval?: number; // days between posts
}

interface GenerationJob {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  totalPosts: number;
  completedPosts: number;
  posts: Post[];
  error?: string;
  scheduledPublishDate?: string;
}

interface ContentCalendarEvent {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'scheduled' | 'published';
  type: 'blog' | 'social' | 'newsletter';
  tags: string[];
}

export function BulkContentGenerator() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [generationRequest, setGenerationRequest] =
    useState<BulkGenerationRequest>({
      keywords: [],
      template: 'gift-guide',
      count: 5,
      audience: 'general',
      tone: 'friendly',
      scheduleType: 'immediate',
    });
  const [activeJobs, setActiveJobs] = useState<GenerationJob[]>([]);
  const [contentCalendar, setContentCalendar] = useState<
    ContentCalendarEvent[]
  >([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: 'gift-guide',
      name: 'Gift Guide',
      description: 'Comprehensive gift recommendations for specific occasions',
    },
    {
      id: 'trending',
      name: 'Trending Topics',
      description: 'Current trending gift ideas and popular items',
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'How-to guides and gift selection advice',
    },
    {
      id: 'seasonal',
      name: 'Seasonal/Holiday',
      description: 'Holiday-specific gift guides and recommendations',
    },
    {
      id: 'demographic',
      name: 'Demographic Specific',
      description: 'Gift guides tailored to specific audiences',
    },
    {
      id: 'budget',
      name: 'Budget Focused',
      description: 'Affordable gift options and money-saving tips',
    },
    {
      id: 'luxury',
      name: 'Luxury Premium',
      description: 'High-end and premium gift recommendations',
    },
  ];

  const audiences = [
    { id: 'general', name: 'General Audience' },
    { id: 'parents', name: 'Parents' },
    { id: 'couples', name: 'Couples' },
    { id: 'professionals', name: 'Professionals' },
    { id: 'students', name: 'Students' },
    { id: 'seniors', name: 'Seniors' },
    { id: 'children', name: 'Children' },
  ];

  const tones = [
    { id: 'friendly', name: 'Friendly & Approachable' },
    { id: 'professional', name: 'Professional & Formal' },
    { id: 'casual', name: 'Casual & Relaxed' },
    { id: 'enthusiastic', name: 'Enthusiastic & Energetic' },
    { id: 'helpful', name: 'Helpful & Informative' },
  ];

  useEffect(() => {
    // Load mock content calendar data
    loadContentCalendar();
  }, []);

  const loadContentCalendar = () => {
    const mockEvents: ContentCalendarEvent[] = [
      {
        id: '1',
        title: 'Holiday Gift Guide 2024',
        date: '2024-12-15',
        status: 'scheduled',
        type: 'blog',
        tags: ['holiday', 'gifts', '2024'],
      },
      {
        id: '2',
        title: 'Tech Gifts for Gamers',
        date: '2024-12-10',
        status: 'published',
        type: 'blog',
        tags: ['tech', 'gaming', 'gifts'],
      },
      {
        id: '3',
        title: 'Social Media: Gift Ideas Post',
        date: '2024-12-12',
        status: 'draft',
        type: 'social',
        tags: ['social', 'gifts'],
      },
    ];
    setContentCalendar(mockEvents);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      setGenerationRequest((prev) => ({ ...prev, keywords: updatedKeywords }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const updatedKeywords = keywords.filter((k) => k !== keywordToRemove);
    setKeywords(updatedKeywords);
    setGenerationRequest((prev) => ({ ...prev, keywords: updatedKeywords }));
  };

  const generateBulkContent = async () => {
    if (generationRequest.keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }

    setIsGenerating(true);
    const jobId = `job_${Date.now()}`;

    const newJob: GenerationJob = {
      id: jobId,
      status: 'pending',
      progress: 0,
      totalPosts: generationRequest.count,
      completedPosts: 0,
      posts: [],
    };

    setActiveJobs((prev) => [...prev, newJob]);

    try {
      // Simulate bulk generation
      for (let i = 0; i < generationRequest.count; i++) {
        // Update job status
        setActiveJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: 'generating',
                  progress: ((i + 1) / generationRequest.count) * 100,
                }
              : job
          )
        );

        // Simulate API call for each post
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const keyword =
          generationRequest.keywords[i % generationRequest.keywords.length];
        const template = templates.find(
          (t) => t.id === generationRequest.template
        );

        const generatedPost: Post = {
          slug: `${keyword.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
          title: `${keyword} Gift Guide - Complete Recommendations`,
          description: `Discover the best ${keyword} gifts for every occasion. Our comprehensive guide includes top picks, budget options, and unique ideas.`,
          date: new Date().toISOString(),
          author: 'AI Assistant',
          tags: [keyword, 'gifts', 'guide', template?.id || 'general'],
          readTime: Math.floor(Math.random() * 8) + 3,
          featured: i === 0,
          image: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800&h=600&fit=crop`,
          content: `# ${keyword} Gift Guide\n\nThis comprehensive guide covers everything you need to know about ${keyword} gifts...`,
          url: `/blog/${keyword.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
          body: `# ${keyword} Gift Guide\n\nThis comprehensive guide covers everything you need to know about ${keyword} gifts...`,
        };

        // Update job with generated post
        setActiveJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  completedPosts: i + 1,
                  posts: [...job.posts, generatedPost],
                  status:
                    i === generationRequest.count - 1
                      ? 'completed'
                      : 'generating',
                }
              : job
          )
        );

        // Add to content calendar if scheduled
        if (generationRequest.scheduleType !== 'immediate') {
          const publishDate = calculatePublishDate(i);
          addToContentCalendar(generatedPost, publishDate);
        }
      }
    } catch (error) {
      setActiveJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: 'failed', error: 'Generation failed' }
            : job
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatePublishDate = (index: number): string => {
    const baseDate = new Date(generationRequest.startDate || new Date());
    const interval = generationRequest.publishInterval || 1;
    const publishDate = new Date(baseDate);
    publishDate.setDate(publishDate.getDate() + index * interval);
    return publishDate.toISOString().split('T')[0];
  };

  const addToContentCalendar = (post: Post, publishDate: string) => {
    const calendarEvent: ContentCalendarEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      title: post.title,
      date: publishDate,
      status: 'scheduled',
      type: 'blog',
      tags: post.tags,
    };
    setContentCalendar((prev) => [...prev, calendarEvent]);
  };

  const publishAllPosts = async (jobId: string) => {
    const job = activeJobs.find((j) => j.id === jobId);
    if (!job) return;

    // Simulate publishing all posts
    for (const post of job.posts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Publishing: ${post.title}`);
    }

    // Update content calendar status
    setContentCalendar((prev) =>
      prev.map((event) =>
        job.posts.some((post) => post.title === event.title)
          ? { ...event, status: 'published' as const }
          : event
      )
    );
  };

  const getEventsForDate = (date: string) => {
    return contentCalendar.filter((event) => event.date === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                Bulk Content Generator
              </h1>
              <p className="mt-2 text-gray-600">
                Generate multiple blog posts from keywords and templates
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Settings */}
          <div className="space-y-6">
            {/* Keywords */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Keywords
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
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
                  {keywords.map((keyword) => (
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
            </div>

            {/* Generation Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generation Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    value={generationRequest.template}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({
                        ...prev,
                        template: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Posts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={generationRequest.count}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({
                        ...prev,
                        count: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={generationRequest.audience}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({
                        ...prev,
                        audience: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {audiences.map((audience) => (
                      <option key={audience.id} value={audience.id}>
                        {audience.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={generationRequest.tone}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({
                        ...prev,
                        tone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tones.map((tone) => (
                      <option key={tone.id} value={tone.id}>
                        {tone.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishing Schedule
                  </label>
                  <select
                    value={generationRequest.scheduleType}
                    onChange={(e) =>
                      setGenerationRequest((prev) => ({
                        ...prev,
                        scheduleType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Publish Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                    <option value="spread">Spread Over Time</option>
                  </select>
                </div>

                {generationRequest.scheduleType !== 'immediate' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={generationRequest.startDate || ''}
                        onChange={(e) =>
                          setGenerationRequest((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {generationRequest.scheduleType === 'spread' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days Between Posts
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={generationRequest.publishInterval || 1}
                          onChange={(e) =>
                            setGenerationRequest((prev) => ({
                              ...prev,
                              publishInterval: parseInt(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={generateBulkContent}
                  disabled={isGenerating || keywords.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating
                    ? 'Generating...'
                    : `Generate ${generationRequest.count} Posts`}
                </button>
              </div>
            </div>
          </div>

          {/* Active Jobs & Content Calendar */}
          <div className="space-y-6">
            {/* Active Jobs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Jobs
              </h2>

              {activeJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No active generation jobs
                </p>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}
                        >
                          {job.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {job.completedPosts}/{job.totalPosts} posts
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {job.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            Generated {job.posts.length} posts
                          </div>
                          <button
                            onClick={() => publishAllPosts(job.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Publish All
                          </button>
                        </div>
                      )}

                      {job.status === 'failed' && (
                        <div className="text-sm text-red-600">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content Calendar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Content Calendar
              </h2>

              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">{event.type}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No events scheduled for this date
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
