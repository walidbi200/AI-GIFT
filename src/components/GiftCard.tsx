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
      className="card-container group border border-border rounded-lg shadow-md flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay }}
    >
      {/* Hero Image Container */}
      <div className="image-wrapper relative h-48">
        {/* Dynamic Badge */}
        {suggestion.tag && (
          <div className="absolute top-3 left-3 bg-secondary text-white px-2.5 py-1 rounded-full text-xs font-bold z-10 shadow">
            {suggestion.tag}
          </div>
        )}
        <img
          src={imageUrl}
          alt={suggestion.name}
          className="w-full h-full object-cover rounded-t-lg"
          loading="lazy"
        />
        {/* Quick Actions Overlay (optional, placeholder) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity duration-300 z-20">
          {/* Example: Wishlist button */}
          <button className="bg-white/80 hover:bg-white text-primary rounded-full p-2 shadow-lg transition-colors duration-200 mr-2" title="Add to Wishlist">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </button>
        </div>
      </div>
      {/* Content Container */}
      <div className="flex-1 flex flex-col px-4 pb-4 pt-4">
        <header>
          <h2 className="text-lg font-bold text-text-primary mb-1 truncate">{suggestion.name}</h2>
          {suggestion.price && (
            <div className="text-base font-semibold text-text-secondary mb-2">{suggestion.price}</div>
          )}
        </header>
        <section className="flex-grow">
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
