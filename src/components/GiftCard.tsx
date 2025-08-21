// FILE: src/components/GiftCard.tsx
import type { GiftSuggestion } from "../types";
import React from "react";

// Define the props that the GiftCard component will accept
interface GiftCardProps {
  suggestion: GiftSuggestion;
  index: number;
}

// The GiftCard component with enhanced modern styling and no image dependencies
const GiftCard = ({ suggestion, index }: GiftCardProps) => {
  // Animation delay for a staggered effect
  const animationDelay = `${index * 100}ms`;

  return (
    <article
      className="group border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 animate-fade-in-up bg-gradient-to-br from-blue-50 to-purple-50"
      style={{ animationDelay }}
    >
      {/* Content Container */}
      <div className="p-6">
        {/* Header with badge and title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gift Idea</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {suggestion.name}
            </h2>
          </div>
          {suggestion.tag && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {suggestion.tag}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {suggestion.description}
        </p>

        {/* Price and reason if available */}
        {suggestion.price && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              {suggestion.price}
            </span>
          </div>
        )}
        
        {suggestion.reason && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 italic">
              💡 {suggestion.reason}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <a
            href={suggestion.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold text-center shadow-sm hover:shadow-md"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Find on Amazon
            </span>
          </a>
          
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                `${suggestion.name} - ${suggestion.description}`,
              )
            }
            className="p-3 text-gray-500 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
            title="Copy to clipboard"
            aria-label={`Copy ${suggestion.name} details to clipboard`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(GiftCard);
