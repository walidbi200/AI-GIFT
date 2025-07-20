import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="bg-surface border-t border-border py-6 mt-8">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-text-secondary text-sm">
      <div className="mb-2 md:mb-0">
        &copy; {new Date().getFullYear()} Smart Gift Finder
      </div>
      <nav className="flex space-x-4">
        <Link to="/about" className="hover:text-primary">
          About
        </Link>
        <Link to="/privacy-policy" className="hover:text-primary">
          Privacy Policy
        </Link>
        <Link to="/contact" className="hover:text-primary">
          Contact
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
