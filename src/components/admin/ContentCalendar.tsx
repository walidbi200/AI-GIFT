import { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'published' | 'draft' | 'scheduled';
  status: string;
}

interface ContentCalendarProps {
  events?: CalendarEvent[];
}

export function ContentCalendar({ events = [] }: ContentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Tech Gifts Guide',
      date: new Date().toISOString(),
      type: 'published',
      status: 'Published'
    },
    {
      id: '2',
      title: 'Holiday Gift Ideas',
      date: new Date(Date.now() + 86400000).toISOString(),
      type: 'scheduled',
      status: 'Scheduled'
    },
    {
      id: '3',
      title: 'Gaming Accessories Review',
      date: new Date(Date.now() - 86400000).toISOString(),
      type: 'draft',
      status: 'Draft'
    }
  ];

  const allEvents = [...mockEvents, ...events];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 dark:bg-gray-700 p-2 text-center text-sm font-medium text-gray-900 dark:text-white">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 bg-white dark:bg-gray-800 ${
                day ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(event.type)}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(day).length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{getEventsForDate(day).length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Content</h3>
        <div className="space-y-3">
          {allEvents
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event.type)}`}>
                  {event.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your content schedule</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ← Previous
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Next →
        </button>
      </div>

      {/* Calendar View */}
      {view === 'month' ? renderMonthView() : renderListView()}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Create New Post</div>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium">Schedule Post</div>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">View Analytics</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
