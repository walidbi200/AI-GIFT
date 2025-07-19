// FILE: src/components/RecentSearches.tsx

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
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 mb-8 border border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Recent Searches</h3>
        <button
          onClick={onClearSearches}
          className="text-sm text-slate-500 dark:text-dark-text-muted hover:text-indigo-600 dark:hover:text-dark-primary transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {searches.map((search, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-dark-border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors cursor-pointer"
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
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {search.age} years old
                  </span>
                  {search.relationship && (
                    <>
                      <span className="text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-dark-text-muted">{search.relationship}</span>
                    </>
                  )}
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-sm text-gray-600 dark:text-dark-text-muted">{search.occasion}</span>
                  {search.budget && (
                    <>
                      <span className="text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-dark-text-muted">${search.budget}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-dark-text-muted truncate">
                  {search.interests}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">
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