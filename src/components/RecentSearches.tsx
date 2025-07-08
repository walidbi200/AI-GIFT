import React from 'react'

interface RecentSearch {
  age: number
  relationship?: string
  occasion: string
  interests: string
  budget: string
  timestamp: number
}

interface RecentSearchesProps {
  searches: RecentSearch[]
  onSelectSearch: (search: Omit<RecentSearch, 'timestamp'>) => void
  onClearSearches: () => void
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ 
  searches, 
  onSelectSearch, 
  onClearSearches 
}) => {
  if (searches.length === 0) return null

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
        <button
          onClick={onClearSearches}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {searches.map((search, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSelectSearch({
              age: search.age,
              relationship: search.relationship,
              occasion: search.occasion,
              interests: search.interests,
              budget: search.budget
            })}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {search.age} years old
                  </span>
                  {search.relationship && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{search.relationship}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{search.occasion}</span>
                  {search.budget && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">${search.budget}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {search.interests}
                </p>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                {formatTime(search.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentSearches 