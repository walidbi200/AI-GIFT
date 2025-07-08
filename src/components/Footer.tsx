import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-2xl mx-auto text-center py-8 mt-8 border-t border-slate-200">
      <p className="text-sm text-slate-500">
        &copy; {currentYear} AI Gift Recommender. All Rights Reserved.
      </p>
      <div className="flex justify-center gap-4 mt-2">
        <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          About
        </a>
        <span className="text-slate-400">|</span>
        <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer; 