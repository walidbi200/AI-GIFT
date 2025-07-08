// FILE: src/App.tsx
// This is the final, corrected version that properly structures the router
// and the page components to ensure everything displays correctly.

import { useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// --- Mock Components (replace with your actual imports) ---
const GiftCard = ({ suggestion }: { suggestion: any }) => <div className="p-4 border rounded-lg bg-white shadow-sm">{suggestion.name}</div>;
const GiftCardSkeleton = () => <div className="p-4 border rounded-lg bg-gray-200 animate-pulse h-24"></div>;
const RecentSearches = ({ onClearSearches }: { onClearSearches: () => void }) => <div className="mb-4 p-4 bg-slate-100 rounded-lg">Recent searches... <button onClick={onClearSearches} className="text-sm text-blue-500 ml-4">Clear</button></div>;
const Footer = () => <footer className="text-center p-4 mt-8 border-t">© 2025 Smart Gift Finder</footer>;
const About = () => <div className="p-8"><h1>About Us</h1><p>This is the about page.</p></div>;
const Contact = () => <div className="p-8"><h1>Contact Us</h1><p>This is the contact page.</p></div>;
// --- End of Mock Components ---


// This is the component for your main gift finder page
function HomePage() {
  const [age, setAge] = useState(25);
  const [occasion, setOccasion] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuggestions([
        { id: 1, name: '🎧 Wireless Headphones' },
        { id: 2, name: '📚 Bestselling Novel' },
        { id: 3, name: '🪴 Succulent Plant Set' },
      ]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          🎁 Smart Gift Finder
        </h1>
        <p className="text-slate-600 mt-2">
          Find the perfect gift with AI-powered suggestions
        </p>
      </header>

      <RecentSearches onClearSearches={() => console.log('clear')} />

      <main className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Slider */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Recipient Age: <span className="text-indigo-600 font-bold">{age}</span></label>
            <input type="range" id="age" min="1" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* Other form fields like Occasion, Interests, etc. would go here */}

          <div className="pt-4 border-t">
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-md">
              {isLoading ? 'Finding Gifts...' : '✨ Recommend Gifts'}
            </button>
          </div>
        </form>
      </main>

      {isLoading && (
        <div className="space-y-4">
          <GiftCardSkeleton />
          <GiftCardSkeleton />
          <GiftCardSkeleton />
        </div>
      )}

      {suggestions.length > 0 && !isLoading && (
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">🎉 Here are a few ideas!</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <GiftCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// This is the main App component that handles routing and layout
function App() {
  // This hook is just an example for analytics setup
  const location = useLocation();
  useEffect(() => {
    console.log(`Page changed to: ${location.pathname}`);
    // This is where you would send a page view event to Google Analytics
  }, [location]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navigation Header */}
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

        {/* This is where the different pages will be rendered */}
        <main className="flex-grow container mx-auto py-8 px-4">
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
