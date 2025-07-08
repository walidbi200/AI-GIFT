import type { GiftSuggestion } from '../types';

// Define the props that the GiftCard component will accept
interface GiftCardProps {
  suggestion: GiftSuggestion;
  index: number;
}

// The GiftCard component, combining your features with the new design system
const GiftCard = ({ suggestion, index }: GiftCardProps) => {
  // Your excellent function to extract an emoji from the gift name
  const getEmoji = (name: string) => {
    const emojiMatch = name.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
    return emojiMatch ? emojiMatch[0] : '🎁';
  };

  const emoji = getEmoji(suggestion.name);
  const nameWithoutEmoji = suggestion.name.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim();

  // Animation delay for a staggered effect
  const animationDelay = `${index * 100}ms`;

  return (
    // Main card container with consistent styling
    <div 
      className="bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in-up"
      style={{ animationDelay }}
    >
      <div className="flex items-start gap-4">
        {/* Emoji */}
        <div className="text-3xl mt-1">
          {emoji}
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Gift Name */}
          <h3 className="text-lg font-bold text-slate-800">
            {nameWithoutEmoji}
          </h3>
          
          {/* Gift Description */}
          <p className="text-slate-600 mt-1 mb-4">
            {suggestion.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <a
              href={suggestion.link || `https://www.google.com/search?q=${encodeURIComponent(suggestion.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-all text-sm font-semibold"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <button
              onClick={() => navigator.clipboard.writeText(`${suggestion.name} - ${suggestion.description}`)}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
              title="Copy to clipboard"
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