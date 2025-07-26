import React from 'react';
import { Link } from 'react-router-dom';
import type { GiftSuggestion } from '../types';
import GiftCard from '../components/GiftCard';
import Button from '../components/Button';

interface WishlistPageProps {
  wishlist: GiftSuggestion[];
  onRemoveFromWishlist: (id: number) => void;
  onClearWishlist: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ wishlist, onRemoveFromWishlist, onClearWishlist }) => {
  return (
    <div>
      {wishlist.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {wishlist.map((suggestion, index) => (
              <div key={suggestion.id} className="relative">
                <GiftCard suggestion={suggestion} index={index} />
                <button
                  onClick={() => onRemoveFromWishlist(suggestion.id)}
                  className="absolute top-4 right-4 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button onClick={onClearWishlist} variant="outline">
              Clear Wishlist
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center bg-light-surface dark:bg-dark-surface rounded-lg p-8">
          <p className="text-light-text-muted dark:text-dark-text-muted mb-4">Your wishlist is currently empty.</p>
          <Link to="/">
            <Button variant="primary">Find Gifts</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 