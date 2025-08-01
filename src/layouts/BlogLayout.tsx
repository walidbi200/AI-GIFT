import React from "react";
import { Link } from "react-router-dom";

// This component provides a consistent header and footer for all blog pages.
const BlogLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header from the new design */}
      <header className="bg-white py-4 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Smart Gift Finder
          </Link>
          <nav className="space-x-6">
            <Link
              to="/blog"
              className="text-lg text-gray-500 hover:text-gray-800 transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/about"
              className="text-lg text-gray-500 hover:text-gray-800 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-lg text-gray-500 hover:text-gray-800 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* The main content of each page will be rendered here */}
      <main className="max-w-5xl mx-auto py-12 px-4">{children}</main>

      {/* Footer from the new design */}
      <footer className="bg-white py-8 mt-12 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-500">
            � 2025 Smart Gift Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogLayout;
