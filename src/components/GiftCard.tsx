// FILE: src/components/GiftCard.tsx
import type { GiftSuggestion } from "../types";
import React from "react";

// Define the props that the GiftCard component will accept
interface GiftCardProps {
  suggestion: GiftSuggestion;
  index: number;
}

// The GiftCard component with enhanced modern styling and dark mode support
const GiftCard = ({ suggestion, index }: GiftCardProps) => {
  // Animation delay for a staggered effect
  const animationDelay = `${index * 100}ms`;
  const imageUrl = suggestion.imageUrl || 'https://via.placeholder.com/300x200?text=Gift+Image';

  return (
    <article
      className="bg-surface border border-border rounded-lg shadow-md flex flex-col items-stretch transition-all duration-300 hover:shadow-lg hover:scale-[1.03] animate-fade-in-up"
      style={{ animationDelay }}
    >
      <img
        src={imageUrl}
        alt={suggestion.name}
        className="w-full h-48 object-cover rounded-t-lg mb-4"
        loading="lazy"
      />
      <div className="flex-1 flex flex-col px-4 pb-4">
        <header>
          <h2 className="text-lg font-bold text-text-primary mb-1 truncate">{suggestion.name}</h2>
          {suggestion.price && (
            <div className="text-base font-semibold text-text-secondary mb-2">{suggestion.price}</div>
          )}
        </header>
        <section>
          <p className="text-text-secondary text-sm mb-3 line-clamp-3">{suggestion.description}</p>
        </section>
        <footer className="mt-auto flex items-center gap-2">
          <a
            href={suggestion.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90 transition-colors text-xs font-semibold"
          >
            <span>View Product</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`${suggestion.name} - ${suggestion.description}`)}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-background"
            title="Copy to clipboard"
            aria-label={`Copy ${suggestion.name} details to clipboard`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </footer>
      </div>
    </article>
  );
};

export default React.memo(GiftCard);
