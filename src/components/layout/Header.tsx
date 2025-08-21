import React, { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy-policy", label: "Privacy Policy" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center space-x-2"
          aria-label="Smart Gift Finder - Go to homepage"
        >
          <span className="text-2xl" role="img" aria-label="Gift box icon">
            🎁
          </span>
          <span className="text-xl font-display font-bold">
            Smart Gift Finder
          </span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8" role="menubar">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-text-secondary hover:text-primary font-medium transition-colors"
              role="menuitem"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="h-6 w-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden bg-surface border-t border-border px-4 pb-4 flex flex-col space-y-2 animate-fade-in"
          role="menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-text-secondary hover:text-primary font-medium transition-colors py-2"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
