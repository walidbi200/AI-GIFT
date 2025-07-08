// FILE: src/App.tsx
// This is the full, unabridged version with all necessary imports and features,
// including the enhanced "Interests" section and Vercel Analytics.

import { useState, useEffect, useMemo } from 'react';
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

const REFINE_OPTIONS = [
  { label: 'More Fun', value: 'fun' },
  { label: 'More Practical', value: 'practical' },
  { label: 'Less Expensive', value: 'cheap' },
  { label: 'More Unique', value: 'unique' },
  { label: 'More Luxurious', value: 'luxury' },
];

const SURPRISE_PERSONAS = [
  { age: 45, relationship: 'Parent', occasion: 'Birthday', interests: ['astronomy', 'baking'], budget: '100', negativeKeywords: 'socks, mugs' },
  { age: 22, relationship: 'Friend', occasion: 'Graduation', interests: ['gaming', 'travel'], budget: '50', negativeKeywords: 'books' },
  { age: 30, relationship: 'Partner', occasion: 'Anniversary', interests: ['jazz', 'cooking'], budget: '200', negativeKeywords: 'flowers' },
  { age: 60, relationship: 'Other', occasion: 'Retirement', interests: ['gardening', 'photography'], budget: '150', negativeKeywords: 'tools' },
  { age: 12, relationship: 'Child', occasion: 'Christmas', interests: ['lego', 'science'], budget: '40', negativeKeywords: 'clothes' },
];

const POPULAR_TAGS = [
  'tech', 'gaming', 'reading', 'cooking', 'travel', 'movies',
  'music', 'sports', 'fitness', 'fashion', 'art', 'photography',
  'gardening', 'diy crafts', 'hiking', 'makeup', 'science', 'lego', 'baking', 'jazz', 'astronomy', 'gardening', 'photography', 'diy', 'tools', 'lego', 'clothes', 'flowers', 'books', 'socks', 'mugs', 'tools', 'clothes', 'flowers', 'books', 'socks', 'mugs'
];

function App() {
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

  const occasions = [
    { value: 'Birthday', label: '🎂 Birthday' },
    { value: 'Anniversary', label: '💕 Anniversary' },
    { value: 'Christmas', label: '🎄 Christmas' },
    { value: 'Graduation', label: '🎓 Graduation' },
    { value: 'Wedding', label: '💒 Wedding' },
    { value: 'Baby Shower', label: '👶 Baby Shower' },
    { value: 'Housewarming', label: '🏠 Housewarming' },
    { value: "Valentine's Day", label: "💝 Valentine's Day" },
    { value: "Mother's Day", label: "🌷 Mother's Day" },
    { value: "Father's Day", label: "👨‍👧‍👦 Father's Day" },
    { value: 'Other', label: '🎁 Other' }
  ];

  const relationships = [
    { value: 'Friend', label: '👥 Friend' },
    { value: 'Partner', label: '💑 Partner' },
    { value: 'Parent', label: '👨‍👩‍👧‍👦 Parent' },
    { value: 'Sibling', label: '👫 Sibling' },
    { value: 'Coworker', label: '💼 Coworker' },
    { value: 'Child', label: '👶 Child' },
    { value: 'Other', label: '👤 Other' }
  ];

  // For Interests auto-complete
  const filteredInterestSuggestions = useMemo(() => {
    if (!currentInterest.trim()) return [];
    const lower = currentInterest.trim().toLowerCase();
    return POPULAR_TAGS.filter(
      tag => tag.startsWith(lower) && !interests.includes(tag)
    ).slice(0, 5);
  }, [currentInterest, interests]);

  // For Negative Keywords auto-complete
  const [negativeInput, setNegativeInput] = useState('');
  const negativeKeywordsArr = negativeKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const filteredNegativeSuggestions = useMemo(() => {
    if (!negativeInput.trim()) return [];
    const lower = negativeInput.trim().toLowerCase();
    return POPULAR_TAGS.filter(
      tag => tag.startsWith(lower) && !negativeKeywordsArr.includes(tag)
    ).slice(0, 5);
  }, [negativeInput, negativeKeywordsArr]);

  // Dynamic preview summary
  const previewSummary = useMemo(() => {
    if (!relationship && !occasion && interests.length === 0) return '';
    let summary = 'Finding a gift';
    if (age) summary += ` for a ${age}-year-old`;
    if (relationship) summary += ` ${relationship.toLowerCase()}`;
    if (occasion) summary += ` for their ${occasion.toLowerCase()}`;
    if (interests.length > 0) summary += ` who is interested in ${interests.join(' and ')}`;
    return summary + '.';
  }, [age, relationship, occasion, interests]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!relationship.trim()) newErrors.relationship = 'Please select a relationship';
    if (!occasion.trim()) newErrors.occasion = 'Please select an occasion';
    if (interests.length === 0) newErrors.interests = 'Please enter at least one interest';
    if (budget && (isNaN(Number(budget)) || Number(budget) <= 0)) newErrors.budget = 'Please enter a valid budget amount';
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
    setIsUsingMockData(false);
    try {
      const formData = { age, relationship, occasion, interests: interests.join(', '), budget, negativeKeywords };
      addSearch(formData);
      const response = await fetch('/api/generate-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const generatedSuggestions = await response.json();
      if (Array.isArray(generatedSuggestions)) {
        setSuggestions(generatedSuggestions);
        showToastMessage(`🎉 Found ${generatedSuggestions.length} gift suggestions!`, 'success');
      } else {
        throw new Error('Invalid data format received from API.');
      }
    } catch (error) {
      showToastMessage('Failed to generate suggestions. Please try again.', 'error');
      setSuggestions([]);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans">
      <Toast message={toastMessage} type={toastType} isVisible={showToast} onClose={() => setShowToast(false)} />
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSubmit={handleFeedbackSubmit} />
      <div className="w-full max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            🎁 AI Gift Recommender
          </h1>
          <p className="text-slate-600 mt-2">
            Find the perfect gift with AI-powered suggestions
          </p>
        </header>
        <RecentSearches searches={recentSearches} onSelectSearch={handleSelectRecentSearch} onClearSearches={clearSearches} />
        <main className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">Recipient Age: <span className="text-indigo-600 font-bold">{age}</span></label>
              <input type="range" id="age" min="1" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">Who is this for? <span className="text-red-500">*</span></label>
              <select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.relationship ? 'border-red-500' : 'border-gray-300'}`}> <option value="">Select relationship</option> {relationships.map((rel) => <option key={rel.value} value={rel.value}>{rel.label}</option>)} </select>
            </div>
            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">Occasion <span className="text-red-500">*</span></label>
              <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.occasion ? 'border-red-500' : 'border-gray-300'}`}> <option value="">Select an occasion</option> {occasions.map((occ) => <option key={occ.value} value={occ.value}>{occ.label}</option>)} </select>
            </div>
            
            {/* --- ENHANCED INTERESTS SECTION --- */}
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
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
                    const val = currentInterest.trim().toLowerCase();
                    if (!interests.includes(val)) {
                      setInterests([...interests, val]);
                    }
                    setCurrentInterest('');
                  }
                }}
                placeholder="Type an interest and press Enter"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.interests ? 'border-red-500' : 'border-gray-300'}`}
                autoComplete="off"
              />
              {/* Auto-complete suggestions for interests */}
              {filteredInterestSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredInterestSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setInterests([...interests, tag]);
                        setCurrentInterest('');
                      }}
                      className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors font-medium min-h-[32px] min-w-[32px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {interest}
                      <button
                        type="button"
                        onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Or select from popular interests:</p>
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
                      className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors font-medium"
                    >
                      {quickInterest}
                    </button>
                  ))}
                </div>
              </div>
              {errors.interests && (
                <p className="text-red-500 text-sm mt-1">{errors.interests}</p>
              )}
            </div>
            {/* --- END OF ENHANCED INTERESTS SECTION --- */}
            <div>
              <label htmlFor="negativeKeywords" className="block text-sm font-medium text-slate-500 mb-2">Things to avoid <span className="text-slate-500">(optional)</span></label>
              <input
                type="text"
                id="negativeKeywords"
                value={negativeKeywords}
                onChange={e => {
                  setNegativeKeywords(e.target.value);
                  setNegativeInput(e.target.value.split(',').pop() || '');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && negativeInput.trim()) {
                    e.preventDefault();
                    const val = negativeInput.trim().toLowerCase();
                    if (!negativeKeywordsArr.includes(val)) {
                      setNegativeKeywords(
                        negativeKeywordsArr.concat(val).join(', ')
                      );
                    }
                    setNegativeInput('');
                  }
                }}
                placeholder="e.g. socks, mugs, books"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors border-gray-300"
                autoComplete="off"
              />
              {/* Auto-complete suggestions for negative keywords */}
              {filteredNegativeSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredNegativeSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setNegativeKeywords(
                          negativeKeywordsArr.concat(tag).join(', ')
                        );
                        setNegativeInput('');
                      }}
                      className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors font-medium min-h-[32px] min-w-[32px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">Budget <span className="text-slate-500">(in USD, optional)</span></label>
              <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 50 (in USD)" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.budget ? 'border-red-500' : 'border-gray-300'}`} />
              <p className="text-xs text-slate-500 mt-1">Enter your budget in US dollars (USD).</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button type="submit" disabled={isLoading} variant="primary" fullWidth className="font-bold">
                {isLoading ? (<div className="flex items-center justify-center"><LoadingSpinner size="sm" /> <span className="ml-2">Finding Gifts...</span></div>) : '✨ Recommend Gifts'}
              </Button>
              <Button type="button" onClick={clearForm} variant="outline" fullWidth className="font-bold">
                🗑️ Clear Form
              </Button>
              <Button type="button" onClick={handleSurpriseMe} variant="secondary" fullWidth className="font-bold">
                🎲 Surprise Me
              </Button>
            </div>
          </form>
        </main>
        {/* Dynamic Preview Summary */}
        {previewSummary && (
          <div className="my-6 p-4 bg-slate-100 rounded-lg text-slate-700 text-center text-base font-medium shadow-sm">
            {previewSummary}
          </div>
        )}
        {isLoading && (
          <GiftBoxLoader />
        )}
        {suggestions.length > 0 && !isLoading && (
          <section className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">🎉 Here are a few ideas!</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {REFINE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 min-h-[48px] min-w-[48px]"
                  onClick={() => handleRefine(option.label)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="space-y-4 mb-8">
              {suggestions.map((suggestion, index) => (<GiftCard key={suggestion.id} suggestion={suggestion} index={index} />))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button onClick={() => handleSubmit()} disabled={isLoading} variant="secondary" fullWidth className="font-bold">🔁 Regenerate</Button>
              <Button onClick={copyToClipboard} variant="primary" fullWidth className="font-bold">📄 Copy List</Button>
              <Button onClick={() => setShowFeedbackModal(true)} variant="outline" fullWidth className="font-bold">💬 Give Feedback</Button>
            </div>
          </section>
        )}
      </div>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;