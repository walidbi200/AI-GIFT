import React from 'react';

const GiftBoxLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
    <div className="relative flex items-center justify-center">
      {/* Gift box base */}
      <div className="w-20 h-16 bg-pink-400 rounded-b-lg shadow-lg relative z-10 animate-bounce">
        {/* Box shadow */}
        <div className="absolute left-0 right-0 -bottom-3 mx-auto w-16 h-3 bg-pink-300 rounded-full blur-sm opacity-60 z-0" />
      </div>
      {/* Gift box lid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-pink-500 rounded-t-lg shadow-md animate-gift-lid" style={{ animationDelay: '0.2s' }} />
      {/* Ribbon vertical */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-24 bg-yellow-400 rounded-full z-20 animate-pulse-slow" />
      {/* Ribbon horizontal */}
      <div className="absolute top-8 left-0 w-20 h-4 bg-yellow-400 rounded-full z-20 animate-pulse-slow" />
      {/* Bow */}
      <svg className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-10 z-30" viewBox="0 0 64 40" fill="none">
        <ellipse cx="16" cy="20" rx="16" ry="10" fill="#fbbf24" className="animate-pulse-slow" />
        <ellipse cx="48" cy="20" rx="16" ry="10" fill="#fbbf24" className="animate-pulse-slow" />
        <rect x="28" y="10" width="8" height="20" rx="4" fill="#f59e42" />
      </svg>
    </div>
    <div className="mt-8 text-lg font-semibold text-pink-500 animate-fade-in-up">Finding the perfect gifts for you...</div>
    <div className="text-sm text-slate-500 mt-2 animate-fade-in">Our AI is wrapping up your recommendations!</div>
  </div>
);

export default GiftBoxLoader; 