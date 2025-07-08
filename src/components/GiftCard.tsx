import React from 'react'
import type { GiftSuggestion } from '../types'

interface GiftCardProps {
  suggestion: GiftSuggestion
  index: number
}

const GiftCard: React.FC<GiftCardProps> = ({ suggestion, index }) => {
  // Extract emoji from gift name if present
  const getEmoji = (name: string) => {
    const emojiMatch = name.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)
    return emojiMatch ? emojiMatch[0] : '🎁'
  }

  const emoji = getEmoji(suggestion.name)
  const nameWithoutEmoji = suggestion.name.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim()

  return (
    <div 
      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-102 bg-white relative overflow-hidden group"
      style={{ 
        animationDelay: `${index * 150}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full opacity-50 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{emoji}</span>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{nameWithoutEmoji}</h3>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">{suggestion.description}</p>
            
            <div className="flex items-center gap-3">
              <a
                href={suggestion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <span>View Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${suggestion.name} - ${suggestion.description}`)
                }}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Copy</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Gift category badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Gift #{index + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GiftCard 