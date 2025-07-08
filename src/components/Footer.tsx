import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-2xl mx-auto text-center py-8 mt-8 border-t border-slate-200">
      <p className="text-sm text-slate-500">
        &copy; {currentYear} Smart Gift Finder. All Rights Reserved.
      </p>
      <div className="flex justify-center gap-4 mt-2">
        <Link to="/about" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          About
        </Link>
        <span className="text-slate-400">|</span>
        <Link to="/contact" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          Contact
        </Link>
        <span className="text-slate-400">|</span>
        <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer; 