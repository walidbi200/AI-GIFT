    // FILE: src/App.tsx
    // This is the corrected version with the extra <Router> removed.

    import { useState, useEffect, useMemo } from 'react';
    import { Routes, Route, Link } from 'react-router-dom';
    import GiftCard from './components/GiftCard';
    import GiftCardSkeleton from './components/GiftCardSkeleton';
    import LoadingSpinner from './components/LoadingSpinner';
    import Toast from './components/Toast';
    import FeedbackModal from './components/FeedbackModal';
    import RecentSearches from './components/RecentSearches';
    import type { GiftSuggestion, FormErrors, ToastType } from './types';
    import { GiftService } from './services/giftService';
    import { useRecentSearches } from './hooks/useLocalStorage';
    import { Analytics } from '@vercel/analytics/react';
    import Button from './components/Button';
    import GiftBoxLoader from './components/GiftBoxLoader';
    import Footer from './components/Footer';
    import About from './pages/About';
    import Contact from './pages/Contact';
    import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

    // --- All of your constants and helper components remain the same ---
    const REFINE_OPTIONS = [ { label: 'More Fun', value: 'fun' } /* ... */ ];
    const SURPRISE_PERSONAS = [ { age: 45, relationship: 'Parent', occasion: 'Birthday', interests: ['astronomy', 'baking'] } /* ... */ ];
    const POPULAR_TAGS = [ 'tech', 'gaming', 'reading', 'cooking', 'travel' /* ... */ ];

    function HomePage() {
      // ... All of your existing state and helper functions for HomePage go here ...
      const [age, setAge] = useState(25);
      const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
      const handleSubmit = async (e?: React.FormEvent) => { /* ... implementation ... */ };
      
      return (
        <div className="flex flex-col items-center w-full p-4">
            <header className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                🎁 Smart Gift Finder
              </h1>
              <p className="text-slate-600 mt-2">
                Find the perfect gift with AI-powered suggestions
              </p>
            </header>
            {/* The rest of your HomePage JSX for the form and results... */}
        </div>
      )
    }

    // This is the main App component that handles routing
    function App() {
      useGoogleAnalytics();

      return (
        <>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl">🎁</span>
                    <span className="text-xl font-bold text-slate-900">Smart Gift Finder</span>
                  </Link>
                  <div className="flex items-center space-x-8">
                    <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                      Home
                    </Link>
                    <Link to="/about" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                      About
                    </Link>
                    <Link to="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </main>
            
            <Footer />
          </div>
          <Analytics />
        </>
      );
    }

    export default App;
    