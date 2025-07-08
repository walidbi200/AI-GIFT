// FILE: src/App.tsx
// This is the full, unabridged version with all necessary imports,
// types, and functions to resolve all TypeScript errors.

import { useState, useEffect } from 'react';
import GiftCard from './components/GiftCard';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import FeedbackModal from './components/FeedbackModal';
import RecentSearches from './components/RecentSearches';
import type { GiftSuggestion, FormErrors, ToastType } from './types';
import { GiftService } from './services/giftService';
import { useRecentSearches } from './hooks/useLocalStorage';

function App() {
  const [age, setAge] = useState(25);
  const [occasion, setOccasion] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [budget, setBudget] = useState('');
  const [relationship, setRelationship] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToastMessage('Please fix the errors in the form', 'error');
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    setIsUsingMockData(false);

    try {
      const formData = { age, relationship, occasion, interests: interests.join(', '), budget };
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
      console.error('Error in handleSubmit:', error);
      showToastMessage(
        error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        'error'
      );
      setSuggestions([]); 
      const mockSuggestions = await GiftService.generateMockSuggestions({ age, relationship, occasion, interests: interests.join(', '), budget });
      setSuggestions(mockSuggestions);
      setIsUsingMockData(true);

    } finally {
      setIsLoading(false);
      setHasGeneratedSuggestions(true);
    }
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
    setErrors({});
  };

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    try {
      console.log('Feedback submitted:', { rating, feedback });
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
              <select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.relationship ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select relationship</option>
                {relationships.map((rel) => <option key={rel.value} value={rel.value}>{rel.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">Occasion <span className="text-red-500">*</span></label>
              <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.occasion ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select an occasion</option>
                {occasions.map((occ) => <option key={occ.value} value={occ.value}>{occ.label}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">Interests <span className="text-red-500">*</span></label>
              <input type="text" id="interests" value={currentInterest} onChange={(e) => setCurrentInterest(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && currentInterest.trim()) { e.preventDefault(); if (!interests.includes(currentInterest.trim())) { setInterests([...interests, currentInterest.trim()]); } setCurrentInterest(''); } }} placeholder="Type an interest and press Enter" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.interests ? 'border-red-500' : 'border-gray-300'}`} />
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {interest}
                      <button type="button" onClick={() => setInterests(interests.filter((_, i) => i !== index))} className="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

             <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">Budget (optional)</label>
              <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Enter maximum budget" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${errors.budget ? 'border-red-500' : 'border-gray-300'}`} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isLoading ? (<div className="flex items-center justify-center"><LoadingSpinner size="sm" /> <span className="ml-2">Finding Gifts...</span></div>) : '✨ Recommend Gifts'}
              </button>
              <button type="button" onClick={clearForm} className="w-full bg-transparent border border-slate-300 text-slate-600 font-bold py-3 px-4 rounded-lg hover:bg-slate-100 transition-all">
                🗑️ Clear Form
              </button>
            </div>
          </form>
        </main>

        {isLoading && (
          <div className="w-full">
            <LoadingSpinner size="lg" text="Finding Perfect Gifts..." description="Our AI is analyzing interests and preferences..." showFunMessages={true} />
          </div>
        )}

        {suggestions.length > 0 && !isLoading && (
          <section className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">🎉 Here are a few ideas!</h2>
            <div className="space-y-4 mb-8">
              {suggestions.map((suggestion, index) => (<GiftCard key={suggestion.id} suggestion={suggestion} index={index} />))}
            </div>
             <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <button onClick={() => handleSubmit(new MouseEvent('click') as unknown as React.FormEvent)} disabled={isLoading} className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50">🔁 Regenerate</button>
              <button onClick={copyToClipboard} className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700">📄 Copy List</button>
              <button onClick={() => setShowFeedbackModal(true)} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700">💬 Give Feedback</button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default App;
