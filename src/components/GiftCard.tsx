import type { GiftSuggestion } from '../types';

// Define the props that the GiftCard component will accept
interface GiftCardProps {
  suggestion: GiftSuggestion;
  index: number;
}

// The GiftCard component with enhanced modern styling and dark mode support
const GiftCard = ({ suggestion, index }: GiftCardProps) => {
  // Function to extract an emoji from the gift name
  const getEmoji = (name: string) => {
    const emojiMatch = name.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
    return emojiMatch ? emojiMatch[0] : '🎁';
  };

  const emoji = getEmoji(suggestion.name);
  const nameWithoutEmoji = suggestion.name.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim();

  // Animation delay for a staggered effect
  const animationDelay = `${index * 100}ms`;

  return (
    // Main card container with enhanced styling and hover effects
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-large hover:scale-105 animate-fade-in-up group"
      style={{ animationDelay }}
    >
      <div className="flex items-start gap-4">
        {/* Emoji with enhanced styling */}
        <div className="text-4xl mt-1 flex-shrink-0 animate-float">
          {emoji}
        </div>
        
        {/* Main Content with improved spacing */}
        <div className="flex-1 min-w-0">
          {/* Gift Name with enhanced typography */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {nameWithoutEmoji}
          </h3>
          
          {/* Gift Description with better readability */}
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            {suggestion.description}
          </p>

          {/* Action Buttons with improved styling */}
          <div className="flex items-center gap-3">
            <a
              href={suggestion.link || `https://www.google.com/search?q=${encodeURIComponent(suggestion.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all duration-200 text-sm font-semibold group-hover:bg-primary-600 group-hover:text-white dark:group-hover:bg-primary-500"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <button
              onClick={() => navigator.clipboard.writeText(`${suggestion.name} - ${suggestion.description}`)}
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Copy to clipboard"
              aria-label={`Copy ${nameWithoutEmoji} details to clipboard`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCard;