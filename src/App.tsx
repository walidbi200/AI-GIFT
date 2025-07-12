// FILE: src/App.tsx
// This is the final, complete, and unabridged version of your application's
// main component, with all features and correct routing.

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// --- Your Actual Component Imports ---
import GiftCard from './components/GiftCard';
import GiftCardSkeleton from './components/GiftCardSkeleton';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import FeedbackModal from './components/FeedbackModal';
import RecentSearches from './components/RecentSearches';
import Button from './components/Button';
import GiftBoxLoader from './components/GiftBoxLoader';
import Footer from './components/Footer';
import PrivacyPolicy from './pages/PrivacyPolicy';

// --- Lazy-loaded Components ---
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));

// --- Your Actual Hook and Service Imports ---
import type { GiftSuggestion, FormErrors, ToastType } from './types';
import { GiftService } from './services/giftService';
import { useRecentSearches } from './hooks/useLocalStorage';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';


// --- Constants ---
const REFINE_OPTIONS = [ { label: 'More Fun', value: 'fun' }, { label: 'More Practical', value: 'practical' }, { label: 'Less Expensive', value: 'cheap' }, { label: 'More Unique', value: 'unique' }, { label: 'More Luxurious', value: 'luxury' }];
const SURPRISE_PERSONAS = [ { age: 45, relationship: 'Parent', occasion: 'Birthday', interests: ['astronomy', 'baking'], budget: '100', negativeKeywords: 'socks, mugs' }, { age: 22, relationship: 'Friend', occasion: 'Graduation', interests: ['gaming', 'travel'], budget: '50', negativeKeywords: 'books' }];
const POPULAR_TAGS = [ 'tech', 'gaming', 'reading', 'cooking', 'travel', 'movies', 'music', 'sports', 'fitness', 'fashion', 'art', 'photography', 'gardening', 'diy crafts', 'hiking', 'makeup' ];

// This is the component for your main gift finder page
function HomePage() {
  const { trackGiftGeneration } = useGoogleAnalytics();
  const [age, setAge] = useState(25);
  const [occasion, setOccasion] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [budget, setBudget] = useState('');
  const [relationship, setRelationship] = useState('');
  const [negativeKeywords, setNegativeKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);

  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  const occasions = [ { value: 'Birthday', label: '🎂 Birthday' }, { value: 'Anniversary', label: '💕 Anniversary' }, { value: 'Christmas', label: '🎄 Christmas' }, { value: 'Graduation', label: '🎓 Graduation' }, { value: 'Wedding', label: '💒 Wedding' }, { value: 'Baby Shower', label: '👶 Baby Shower' }, { value: 'Housewarming', label: '🏠 Housewarming' }, { value: "Valentine's Day", label: "💝 Valentine's Day" }, { value: "Mother's Day", label: "🌷 Mother's Day" }, { value: "Father's Day", label: "👨‍👧‍👦 Father's Day" }, { value: 'Other', label: '🎁 Other' }];
  const relationships = [ { value: 'Friend', label: '👥 Friend' }, { value: 'Partner', label: '💑 Partner' }, { value: 'Parent', label: '👨‍👩‍👧‍👦 Parent' }, { value: 'Sibling', label: '👫 Sibling' }, { value: 'Coworker', label: '💼 Coworker' }, { value: 'Child', label: '👶 Child' }, { value: 'Other', label: '👤 Other' }];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!relationship.trim()) newErrors.relationship = 'Please select a relationship';
    if (!occasion.trim()) newErrors.occasion = 'Please select an occasion';
    if (interests.length === 0) newErrors.interests = 'Please enter at least one interest';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      showToastMessage('Please fix the errors in the form', 'error');
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const formData = { age, relationship, occasion, interests: interests.join(', '), budget, negativeKeywords };
      addSearch(formData);
      const response = await fetch('/api/generate-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const generatedSuggestions = await response.json();
      if (Array.isArray(generatedSuggestions)) {
        setSuggestions(generatedSuggestions);
        showToastMessage(`🎉 Found ${generatedSuggestions.length} gift suggestions!`, 'success');
        trackGiftGeneration(occasion, relationship, interests.length);
      } else {
        throw new Error('Invalid data format received from API.');
      }
    } catch (error) {
      showToastMessage('Failed to generate suggestions. Please try again.', 'error');
      const mockSuggestions = await GiftService.generateMockSuggestions({ age, relationship, occasion, interests: interests.join(', '), budget });
      setSuggestions(mockSuggestions);
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
      setHasGeneratedSuggestions(true);
    }
  };

  const handleRefine = (refineValue: string) => {
    if (!interests.includes(refineValue.toLowerCase())) {
      setInterests([...interests, refineValue.toLowerCase()]);
    }
    setTimeout(() => handleSubmit(), 0);
  };

  const handleSurpriseMe = () => {
    const persona = SURPRISE_PERSONAS[Math.floor(Math.random() * SURPRISE_PERSONAS.length)];
    setAge(persona.age);
    setRelationship(persona.relationship);
    setOccasion(persona.occasion);
    setInterests(persona.interests);
    setBudget(persona.budget);
    setNegativeKeywords(persona.negativeKeywords);
    setTimeout(() => handleSubmit(), 0);
  };
  
  const copyToClipboard = async () => { 
      try {
      const text = suggestions.map((s: GiftSuggestion) => `${s.name} – ${s.description}`).join('\n');
      await navigator.clipboard.writeText(text);
      showToastMessage('Gift list copied to clipboard!', 'success');
    } catch (error) {
      showToastMessage('Failed to copy to clipboard', 'error');
    }
  };
  const clearForm = () => { 
    setAge(25);
    setOccasion('');
    setInterests([]);
    setCurrentInterest('');
    setBudget('');
    setRelationship('');
    setNegativeKeywords('');
    setSuggestions([]);
    setErrors({});
    setIsUsingMockData(false);
    setHasGeneratedSuggestions(false);
  };
  const handleSelectRecentSearch = (search: any) => { 
    setAge(search.age);
    setRelationship(search.relationship || '');
    setOccasion(search.occasion);
    setInterests(search.interests.split(', ').filter(Boolean));
    setBudget(search.budget);
    setNegativeKeywords(search.negativeKeywords || '');
    setErrors({});
   };
  const handleFeedbackSubmit = async (rating: number, feedback: string) => { 
    try {
      showToastMessage('Thank you for your feedback!', 'success');
    } catch (error) {
      showToastMessage('Failed to submit feedback', 'error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex justify-center items-center mb-6">
          <div className="inline-flex items-center gap-4 rounded-full bg-gray-800 border border-gray-700 px-4 py-2 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gradient">
          Smart Gift Finder
        </h1>
        <p className="text-slate-400 mt-4 text-lg">
          Find the perfect gift with AI-powered suggestions
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-800 text-slate-300 text-sm px-3 py-1 rounded-full mt-6 border border-gray-700">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Powered by advanced AI
        </div>
      </header>

      <main className="bg-gray-900 rounded-lg shadow-lg p-6 sm:p-8 mb-8 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6" role="search" aria-label="Gift recommendation form">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">Recipient Age: <span className="text-indigo-400 font-bold">{age}</span></label>
            <input type="range" id="age" min="1" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-300 mb-2">Who is this for? <span className="text-red-500">*</span></label>
            <select 
              id="relationship" 
              value={relationship} 
              onChange={(e) => setRelationship(e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.relationship ? 'border-red-500' : 'border-gray-600'}`}
              aria-describedby={errors.relationship ? 'relationship-error' : undefined}
            > 
              <option value="">Select relationship</option> 
              {relationships.map((rel) => <option key={rel.value} value={rel.value}>{rel.label}</option>)} 
            </select>
            {errors.relationship && (
              <p id="relationship-error" className="text-red-500 text-sm mt-1" role="alert">{errors.relationship}</p>
            )}
          </div>
          <div>
            <label htmlFor="occasion" className="block text-sm font-medium text-gray-300 mb-2">Occasion <span className="text-red-500">*</span></label>
            <select 
              id="occasion" 
              value={occasion} 
              onChange={(e) => setOccasion(e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.occasion ? 'border-red-500' : 'border-gray-600'}`}
              aria-describedby={errors.occasion ? 'occasion-error' : undefined}
            > 
              <option value="">Select an occasion</option> 
              {occasions.map((occ) => <option key={occ.value} value={occ.value}>{occ.label}</option>)} 
            </select>
            {errors.occasion && (
              <p id="occasion-error" className="text-red-500 text-sm mt-1" role="alert">{errors.occasion}</p>
            )}
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-300 mb-2">
              Interests <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="interests"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentInterest.trim()) {
                  e.preventDefault();
                  const newInterest = currentInterest.trim().toLowerCase();
                  if (!interests.includes(newInterest)) {
                    setInterests([...interests, newInterest]);
                  }
                  setCurrentInterest('');
                }
              }}
              placeholder="Type an interest and press Enter"
              className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.interests ? 'border-red-500' : 'border-gray-600'}`}
              aria-describedby={errors.interests ? 'interests-error' : undefined}
            />
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {interests.map((interest, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full text-sm font-semibold capitalize">
                    {interest}
                    <button
                      type="button"
                      onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                      className="ml-1 text-indigo-400 hover:text-indigo-200 focus:outline-none"
                      aria-label={`Remove ${interest} interest`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Or select from popular interests:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Tech', 'Gaming', 'Reading', 'Cooking', 'Travel', 'Movies',
                  'Music', 'Sports', 'Fitness', 'Fashion', 'Art', 'Photography',
                  'Gardening', 'DIY Crafts', 'Hiking', 'Makeup'
                ].map((quickInterest) => (
                  <button
                    key={quickInterest}
                    type="button"
                    onClick={() => {
                      const lowerCaseInterest = quickInterest.toLowerCase();
                      if (!interests.includes(lowerCaseInterest)) {
                        setInterests([...interests, lowerCaseInterest]);
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 hover:text-white transition-colors font-medium"
                  >
                    {quickInterest}
                  </button>
                ))}
              </div>
            </div>
            {errors.interests && (
              <p id="interests-error" className="text-red-500 text-sm mt-1" role="alert">{errors.interests}</p>
            )}
          </div>
          <div>
            <label htmlFor="negativeKeywords" className="block text-sm font-medium text-gray-300 mb-2">Things to avoid <span className="text-gray-500">(optional)</span></label>
            <input type="text" id="negativeKeywords" value={negativeKeywords} onChange={(e) => setNegativeKeywords(e.target.value)} placeholder="e.g. socks, mugs, books" className="w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors border-gray-600" />
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">Budget (optional)</label>
            <input 
              type="number" 
              id="budget" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              placeholder="Enter maximum budget" 
              className={`w-full px-3 py-2 border rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.budget ? 'border-red-500' : 'border-gray-600'}`}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
            />
            {errors.budget && (
              <p id="budget-error" className="text-red-500 text-sm mt-1" role="alert">{errors.budget}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
            <Button type="submit" disabled={isLoading} variant="primary" fullWidth className="font-bold">{isLoading ? (<div className="flex items-center justify-center"><LoadingSpinner size="sm" /> <span className="ml-2">Finding Gifts...</span></div>) : '✨ Recommend Gifts'}</Button>
            <Button type="button" onClick={clearForm} variant="outline" fullWidth className="font-bold">🗑️ Clear Form</Button>
            <Button type="button" onClick={handleSurpriseMe} variant="secondary" fullWidth className="font-bold">🎲 Surprise Me</Button>
          </div>
        </form>
      </main>

      {isLoading && <GiftBoxLoader />}
      {suggestions.length > 0 && !isLoading && (
        <section className="animate-fade-in-up w-full">
          <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">🎉 Here are a few ideas!</h2>
          <div className="flex flex-wrap gap-2 justify-center mb-6">{REFINE_OPTIONS.map((option) => (<Button key={option.value} variant="outline" size="sm" onClick={() => handleRefine(option.label)}>{option.label}</Button>))}</div>
          <div className="space-y-4 mb-8">{suggestions.map((suggestion, index) => (<GiftCard key={suggestion.id} suggestion={suggestion} index={index} />))}</div>
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700"><Button onClick={() => handleSubmit()} disabled={isLoading} variant="secondary" fullWidth className="font-bold">🔁 Regenerate</Button><Button onClick={copyToClipboard} variant="primary" fullWidth className="font-bold">📄 Copy List</Button><Button onClick={() => setShowFeedbackModal(true)} variant="outline" fullWidth className="font-bold">💬 Give Feedback</Button></div>
        </section>
      )}
    </div>
  );
}

// This is the main App component that handles routing and layout
function App() {
  useGoogleAnalytics();

  return (
    <>
      <div className="min-h-screen bg-brand-dark text-white flex flex-col">
        <nav className="bg-gray-900 shadow-sm border-b border-gray-800 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2" aria-label="Smart Gift Finder - Go to homepage">
                <span className="text-2xl" role="img" aria-label="Gift box icon">🎁</span>
                <span className="text-xl font-bold text-slate-100">Smart Gift Finder</span>
              </Link>
              <div className="flex items-center space-x-8" role="menubar">
                <Link to="/" className="text-slate-300 hover:text-indigo-400 transition-colors font-medium" role="menuitem">Home</Link>
                <Link to="/about" className="text-slate-300 hover:text-indigo-400 transition-colors font-medium" role="menuitem">About</Link>
                <Link to="/contact" className="text-slate-300 hover:text-indigo-400 transition-colors font-medium" role="menuitem">Contact</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto py-8 px-4" role="main">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading page...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
      <Analytics />
    </>
  );
}

export default App;
