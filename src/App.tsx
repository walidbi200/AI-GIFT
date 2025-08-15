// FILE: src/App.tsx
// This is the final, complete, and unabridged version of your application's
// main component, with all features and correct routing.

import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
import BlogIndex from './pages/BlogIndex';
import BlogPostPage from './pages/BlogPostPage';
import Login from './pages/Login';
import AdminSimple from './pages/AdminSimple';
import BlogGenerator from './components/admin/BlogGenerator';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import SimpleProtectedRoute from './components/auth/SimpleProtectedRoute';
import RecentSearches from './components/RecentSearches';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

// --- Lazy-loaded Components ---
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const BlogIndex = React.lazy(() => import("./pages/BlogIndex"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage"));
const Login = React.lazy(() => import("./pages/Login"));
const AdminDashboard = React.lazy(() => import("./components/admin/AdminDashboard"));
const AdminSimple = React.lazy(() => import("./pages/AdminSimple"));
const BlogGenerator = React.lazy(() => import("./components/admin/BlogGenerator"));
const ProtectedRoute = React.lazy(() => import("./components/auth/ProtectedRoute"));
const SimpleProtectedRoute = React.lazy(() => import("./components/auth/SimpleProtectedRoute"));

// --- Your Actual Hook and Service Imports ---
import type { GiftSuggestion, FormErrors, ToastType } from "./types";
import { GiftService } from "./services/giftService";
import { useRecentSearches } from "./hooks/useLocalStorage";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";

// --- Constants ---
const REFINE_OPTIONS = [
  { label: "More Fun", value: "fun" },
  { label: "More Practical", value: "practical" },
  { label: "Less Expensive", value: "cheap" },
  { label: "More Unique", value: "unique" },
  { label: "More Luxurious", value: "luxury" },
];
const SURPRISE_PERSONAS = [
  {
    age: 45,
    relationship: "Parent",
    occasion: "Birthday",
    interests: ["astronomy", "baking"],
    budget: "100",
    negativeKeywords: "socks, mugs",
  },
  {
    age: 22,
    relationship: "Friend",
    occasion: "Graduation",
    interests: ["gaming", "travel"],
    budget: "50",
    negativeKeywords: "books",
  },
];
const POPULAR_TAGS = [
  "tech",
  "gaming",
  "reading",
  "cooking",
  "travel",
  "movies",
  "music",
  "sports",
  "fitness",
  "fashion",
  "art",
  "photography",
  "gardening",
  "diy crafts",
  "hiking",
  "makeup",
];

// This is the component for your main gift finder page
function HomePage() {
  const { trackGiftGeneration } = useGoogleAnalytics();
  const TOTAL_STEPS = 6;
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(25);
  const [occasion, setOccasion] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState("");
  const [budget, setBudget] = useState("");
  const [relationship, setRelationship] = useState("");
  const [negativeKeywords, setNegativeKeywords] = useState("");
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("success");
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<GiftSuggestion[]>([]);

  // Update filtered suggestions when suggestions or activeFilters change
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions(
        suggestions.filter((s) =>
          activeFilters.every((filter) =>
            (s.reason && s.reason.toLowerCase().includes(filter.toLowerCase())) ||
            (s.description && s.description.toLowerCase().includes(filter.toLowerCase()))
          )
        )
      );
    }
  }, [suggestions, activeFilters]);

  // Toggle filter
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  const occasions = [
    { value: "Birthday", label: "🎂 Birthday" },
    { value: "Anniversary", label: "💕 Anniversary" },
    { value: "Christmas", label: "🎄 Christmas" },
    { value: "Graduation", label: "🎓 Graduation" },
    { value: "Wedding", label: "💒 Wedding" },
    { value: "Baby Shower", label: "👶 Baby Shower" },
    { value: "Housewarming", label: "🏠 Housewarming" },
    { value: "Valentine's Day", label: "💝 Valentine's Day" },
    { value: "Mother's Day", label: "🌷 Mother's Day" },
    { value: "Father's Day", label: "👨‍👧‍👦 Father's Day" },
    { value: "Other", label: "🎁 Other" },
  ];
  const relationships = [
    { value: "Friend", label: "👥 Friend" },
    { value: "Partner", label: "💑 Partner" },
    { value: "Parent", label: "👨‍👩‍👧‍👦 Parent" },
    { value: "Sibling", label: "👫 Sibling" },
    { value: "Coworker", label: "💼 Coworker" },
    { value: "Child", label: "👶 Child" },
    { value: "Other", label: "👤 Other" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!relationship.trim())
      newErrors.relationship = "Please select a relationship";
    if (!occasion.trim()) newErrors.occasion = "Please select an occasion";
    if (interests.length === 0)
      newErrors.interests = "Please enter at least one interest";
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
      showToastMessage("Please fix the errors in the form", "error");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const formData = {
        age,
        relationship,
        occasion,
        interests: interests.join(", "),
        budget,
        negativeKeywords,
      };
      addSearch(formData);
      const response = await fetch("/api/generate-gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const generatedSuggestions = await response.json();
      if (Array.isArray(generatedSuggestions)) {
        setSuggestions(generatedSuggestions);
        showToastMessage(
          `🎉 Found ${generatedSuggestions.length} gift suggestions!`,
          "success",
        );
        trackGiftGeneration(occasion, relationship, interests.length);
      } else {
        throw new Error("Invalid data format received from API.");
      }
    } catch (error) {
      showToastMessage(
        "Failed to generate suggestions. Please try again.",
        "error",
      );
      const mockSuggestions = await GiftService.generateMockSuggestions({
        age,
        relationship,
        occasion,
        interests: interests.join(", "),
        budget,
      });
      setSuggestions(mockSuggestions);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
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
    const persona =
      SURPRISE_PERSONAS[Math.floor(Math.random() * SURPRISE_PERSONAS.length)];
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
      const text = suggestions
        .map((s: GiftSuggestion) => `${s.name} – ${s.description}`)
        .join("\n");
      await navigator.clipboard.writeText(text);
      showToastMessage("Gift list copied to clipboard!", "success");
    } catch (error) {
      showToastMessage("Failed to copy to clipboard", "error");
    }
  };
  const clearForm = () => {
    setAge(25);
    setOccasion("");
    setInterests([]);
    setCurrentInterest("");
    setBudget("");
    setRelationship("");
    setNegativeKeywords("");
    setSuggestions([]);
    setErrors({});
    setIsUsingMockData(false);
    setHasGeneratedSuggestions(false);
  };
  const handleSelectRecentSearch = (search: any) => {
    setAge(search.age);
    setRelationship(search.relationship || "");
    setOccasion(search.occasion);
    setInterests(search.interests.split(", ").filter(Boolean));
    setBudget(search.budget);
    setNegativeKeywords(search.negativeKeywords || "");
    setErrors({});
  };
  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    try {
      showToastMessage("Thank you for your feedback!", "success");
    } catch (error) {
      showToastMessage("Failed to submit feedback", "error");
    }
  };

  // Progress bar width calculation
  const progressPercent = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  // Fade-in animation class
  const fadeInClass = 'transition-all duration-500 opacity-0 translate-y-4 animate-fade-in-up';

  // Popular interests for step 4
  const popularInterests = [
    'Tech', 'Gaming', 'Reading', 'Cooking', 'Travel', 'Movies',
    'Music', 'Sports', 'Fitness', 'Fashion', 'Art', 'Photography',
    'Gardening', 'DIY Crafts', 'Hiking', 'Makeup'
  ];

  // Render loading screen if loading
  if (loading) {
    return <GiftLoadingScreen />;
  }

  return (
    <main className="w-full max-w-2xl mx-auto">
      {/* Animated Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease-in-out' }}
          />
        </div>
        <div className="text-center mt-2 text-sm font-medium text-text-secondary">
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
          <span role="img" aria-label="Gift box icon">🎁</span> Smart Gift Finder
        </h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mt-2">
          Find the perfect gift with AI-powered suggestions
        </p>
      </header>
      <section className="mb-6 text-center animate-fade-in-up">
        <h2 className="font-display text-3xl font-bold text-text-primary">Let's find the perfect gift!</h2>
      </section>
      <section>
        <RecentSearches
          searches={recentSearches}
          onSelectSearch={handleSelectRecentSearch}
          onClearSearches={clearSearches}
        />
      </section>
      <section className="bg-surface rounded-lg shadow-lg p-8 mb-8 border border-border mx-4 sm:mx-0">
        <form onSubmit={handleSubmit} className="space-y-6" role="search" aria-label="Gift recommendation form">
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 rounded-lg text-white text-center font-bold animate-fade-in-up bg-error dark:bg-dark-error">
              Please fill in all required fields.
            </div>
          )}
          {/* Step 1: Recipient Age */}
          {step === 1 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="age" className="block text-base font-medium text-text-secondary mb-2">
                Recipient Age: <span className="text-primary font-bold">{age}</span>
              </label>
              <input type="range" id="age" min="1" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full h-3 bg-border rounded-lg appearance-none cursor-pointer" />
            </div>
          )}
          {/* Step 2: Who is this for? */}
          {step === 2 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="relationship" className="block text-base font-medium text-text-secondary mb-2">
                Who is this for? <span className="text-error">*</span>
              </label>
              <select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={`w-full p-3 min-h-[48px] border rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary text-base ${errors.relationship ? 'border-error' : ''}`} aria-describedby={errors.relationship ? 'relationship-error' : undefined}>
                <option value="">Select relationship</option>
                {relationships.map((rel) => (
                  <option key={rel.value} value={rel.value}>{rel.label}</option>
                ))}
              </select>
              {errors.relationship && (
                <p id="relationship-error" className="text-error text-sm mt-1" role="alert">{errors.relationship}</p>
              )}
            </div>
          )}
          {/* Step 3: Occasion */}
          {step === 3 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="occasion" className="block text-base font-medium text-text-secondary mb-2">
                Occasion <span className="text-error">*</span>
              </label>
              <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className={`w-full p-3 min-h-[48px] border rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary text-base ${errors.occasion ? 'border-error' : ''}`} aria-describedby={errors.occasion ? 'occasion-error' : undefined}>
                <option value="">Select an occasion</option>
                {occasions.map((occ) => (
                  <option key={occ.value} value={occ.value}>{occ.label}</option>
                ))}
              </select>
              {errors.occasion && (
                <p id="occasion-error" className="text-error text-sm mt-1" role="alert">{errors.occasion}</p>
              )}
            </div>
          )}
          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="interests" className="block text-base font-medium text-text-secondary mb-2">
                Interests <span className="text-error">*</span>
              </label>
              <input type="text" id="interests" value={currentInterest} onChange={(e) => setCurrentInterest(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && currentInterest.trim()) { e.preventDefault(); const newInterest = currentInterest.trim().toLowerCase(); if (!interests.includes(newInterest)) { setInterests([...interests, newInterest]); } setCurrentInterest(''); } }} placeholder="Type an interest and press Enter" className={`w-full p-3 min-h-[48px] border rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary text-base ${errors.interests ? 'border-error' : ''}`} aria-describedby={errors.interests ? 'interests-error' : undefined} />
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary border border-secondary rounded-full text-sm font-semibold capitalize min-w-[40px] min-h-[40px] transition-transform duration-150 hover:bg-background active:scale-105 focus:outline-none focus:ring-2 focus:ring-primary" style={{ margin: '4px' }}>
                      {interest}
                      <button type="button" onClick={e => { if (window.navigator.vibrate) window.navigator.vibrate([50]); setInterests(interests.filter((_, i) => i !== index)); }} className="ml-1 text-primary hover:opacity-70 focus:outline-none" aria-label={`Remove ${interest} interest`}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1 mb-2 text-xs text-text-secondary font-medium">Add 1-3 interests</div>
              <div className="mt-4">
                <p className="text-xs text-text-secondary mb-2">Or select from popular interests:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {popularInterests.map((quickInterest) => (
                    <button key={quickInterest} type="button" onClick={e => { if (window.navigator.vibrate) window.navigator.vibrate([50]); const lowerCaseInterest = quickInterest.toLowerCase(); if (!interests.includes(lowerCaseInterest)) { setInterests([...interests, lowerCaseInterest]); } }} className="interest-button bg-white text-primary border border-secondary rounded-full px-4 py-2 m-1 min-w-[40px] min-h-[40px] font-semibold text-sm transition-transform duration-150 hover:bg-background active:scale-105 focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Interest: ${quickInterest}`}>{quickInterest}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Things to avoid */}
          {step === 5 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="negativeKeywords" className="block text-base font-medium text-text-secondary mb-2">Things to avoid <span className="text-text-secondary">(optional)</span></label>
              <input type="text" id="negativeKeywords" value={negativeKeywords} onChange={(e) => setNegativeKeywords(e.target.value)} placeholder="e.g. socks, mugs, books" className="w-full p-3 min-h-[48px] border rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary text-base" />
            </div>
          )}
          {/* Step 6: Budget */}
          {step === 6 && (
            <div className="fade-in animate-fade-in-up">
              <label htmlFor="budget" className="block text-base font-medium text-text-secondary mb-2">Budget (optional)</label>
              <input type="number" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Enter maximum budget" className={`w-full p-3 min-h-[48px] border rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.budget ? 'border-error' : 'border-border'}`} aria-describedby={errors.budget ? 'budget-error' : undefined} />
              {errors.budget && (
                <p id="budget-error" className="text-error text-sm mt-1" role="alert">{errors.budget}</p>
              )}
            </div>
          )}
          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-lg border border-border bg-gray-200 text-text-primary font-bold text-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">Back</button>
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS && (
              <button type="button" onClick={() => setStep(step + 1)} className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-lg shadow hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">Next</button>
            )}
            {step === TOTAL_STEPS && (
              <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-lg shadow hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">Find My Gift</button>
            )}
          </div>
        </form>
      </section>

      {isLoading && <GiftBoxLoader />}
      {/* Results Section */}
      {!isLoading && suggestions.length > 0 && (
        <section className="animate-fade-in-up w-full">
          <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 text-center">
            🎉 Here are a few ideas!
          </h2>
          <nav
            className="flex flex-wrap gap-2 justify-center mb-6"
            aria-label="Refine suggestions"
          >
            {REFINE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={activeFilters.includes(option.label) ? 'primary' : 'outline'}
                size="sm"
                className={activeFilters.includes(option.label) ? 'bg-primary text-white' : ''}
                onClick={() => toggleFilter(option.label)}
              >
                {option.label}
              </Button>
            ))}
          </nav>
          {filteredSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
              <span className="text-5xl mb-4">🤔</span>
              <div className="text-xl font-bold mb-2 text-text-primary">Our AI is stumped!</div>
              <div className="text-text-secondary mb-4">We couldn't find any gifts that match your filters.</div>
              <ul className="text-sm text-text-secondary mb-4 list-disc list-inside">
                <li>Try using broader interests or fewer filters.</li>
                <li>Go back and adjust your search criteria.</li>
                <li>Regenerate to get a new set of ideas.</li>
              </ul>
              <Button onClick={() => setActiveFilters([])} variant="outline" className="font-bold">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredSuggestions.map((suggestion, index) => (
                <article key={suggestion.id}>
                  <GiftCard suggestion={suggestion} index={index} />
                </article>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-light-border dark:border-dark-border">
            <Button
              onClick={() => handleSubmit()}
              disabled={isLoading}
              variant="secondary"
              fullWidth
              className="font-bold"
            >
              🔁 Regenerate
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="primary"
              fullWidth
              className="font-bold"
            >
              📄 Copy List
            </Button>
            <Button
              onClick={() => setShowFeedbackModal(true)}
              variant="outline"
              fullWidth
              className="font-bold"
            >
              💬 Give Feedback
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}

// This is the main App component that handles routing and layout
function App() {
  useGoogleAnalytics();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex flex-col items-center">
        <div className="w-full flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-primary dark:border-dark-primary mx-auto mb-4"></div>
                  <p className="text-light-text-muted dark:text-dark-text-muted">
                    Loading page...
                  </p>
                </div>
              </div>
            }
          >
                              <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<BlogIndex />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/admin" 
                      element={
                        <SimpleProtectedRoute>
                          <AdminSimple />
                        </SimpleProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/blog-generator" 
                      element={
                        <SimpleProtectedRoute>
                          <BlogGenerator />
                        </SimpleProtectedRoute>
                      } 
                    />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
          </Suspense>
        </div>
        <Footer />
      </main>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
