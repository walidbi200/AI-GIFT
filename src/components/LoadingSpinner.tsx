import React, { useState, useEffect } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  description?: string
  showFunMessages?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  description,
  showFunMessages = false
}) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  
  const funMessages = [
    "🎁 Consulting the gift gurus...",
    "✨ Channeling gift-giving magic...",
    "🧠 Analyzing recipient preferences...",
    "🎯 Finding the perfect match...",
    "🌟 Discovering hidden gems...",
    "💫 Crafting personalized suggestions...",
    "🎪 Searching through gift wonderland...",
    "🔮 Predicting gift success rates..."
  ]

  useEffect(() => {
    if (showFunMessages) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % funMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [showFunMessages])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const displayText = showFunMessages ? funMessages[currentMessage] : text

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Enhanced spinner with multiple rings */}
      <div className="relative mb-6">
        <div className={`animate-spin rounded-full border-4 border-purple-100 ${sizeClasses[size]}`}></div>
        <div className={`animate-spin rounded-full border-4 border-transparent border-t-purple-600 absolute top-0 left-0 ${sizeClasses[size]}`} style={{ animationDuration: '1s' }}></div>
        <div className={`animate-spin rounded-full border-2 border-transparent border-t-indigo-400 absolute top-1 left-1 ${sizeClasses[size]}`} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
      </div>
      
      {displayText && (
        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center animate-pulse">
          {displayText}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Progress dots */}
      {showFunMessages && (
        <div className="flex gap-2 mt-4">
          {funMessages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentMessage 
                  ? 'bg-purple-600 scale-125' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner 