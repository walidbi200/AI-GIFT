import { useState, useEffect } from 'react'
import GiftCard from './components/GiftCard'
import LoadingSpinner from './components/LoadingSpinner'
import Toast from './components/Toast'
import FeedbackModal from './components/FeedbackModal'
import RecentSearches from './components/RecentSearches'
import ThemeToggle from './components/ThemeToggle'
import FormInput from './components/FormInput'
import Button from './components/Button'
import type { GiftSuggestion, FormErrors, ToastType } from './types'
import { GiftService } from './services/giftService'
import { useRecentSearches } from './hooks/useLocalStorage'
import { performance, analytics } from './utils/performance'

function App() {
  const [age, setAge] = useState(25)
  const [occasion, setOccasion] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [currentInterest, setCurrentInterest] = useState('')
  const [budget, setBudget] = useState('')
  const [relationship, setRelationship] = useState('')
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<ToastType>('success')
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const { recentSearches, addSearch, clearSearches } = useRecentSearches()

  const occasions = [
    { value: 'Birthday', label: '🎂 Birthday' },
    { value: 'Anniversary', label: '💕 Anniversary' },
    { value: 'Christmas', label: '🎄 Christmas' },
    { value: 'Graduation', label: '🎓 Graduation' },
    { value: 'Wedding', label: '💒 Wedding' },
    { value: 'Baby Shower', label: '👶 Baby Shower' },
    { value: 'Housewarming', label: '🏠 Housewarming' },
    { value: 'Valentine\'s Day', label: '💝 Valentine\'s Day' },
    { value: 'Mother\'s Day', label: '🌷 Mother\'s Day' },
    { value: 'Father\'s Day', label: '👨‍👧‍👦 Father\'s Day' },
    { value: 'Other', label: '🎁 Other' }
  ]

  const relationships = [
    { value: 'Friend', label: '👥 Friend' },
    { value: 'Partner', label: '💑 Partner' },
    { value: 'Parent', label: '👨‍👩‍👧‍👦 Parent' },
    { value: 'Sibling', label: '👫 Sibling' },
    { value: 'Coworker', label: '💼 Coworker' },
    { value: 'Child', label: '👶 Child' },
    { value: 'Other', label: '👤 Other' }
  ]

  // Icons for form inputs
  const icons = {
    age: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    relationship: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    occasion: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    interests: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    budget: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    )
  }

  useEffect(() => {
    performance.trackPageView('AI Gift Recommender')
  }, [])

  // Real-time validation
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'relationship':
        return !value.trim() ? 'Please select a relationship' : undefined
      case 'occasion':
        return !value.trim() ? 'Please select an occasion' : undefined
      case 'interests':
        return interests.length === 0 ? 'Please enter at least one interest' : undefined
      case 'budget':
        if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
          return 'Please enter a valid budget amount'
        }
        return undefined
      default:
        return undefined
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    newErrors.relationship = validateField('relationship', relationship)
    newErrors.occasion = validateField('occasion', occasion)
    newErrors.interests = validateField('interests', interests)
    newErrors.budget = validateField('budget', budget)
    
    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors]
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const showToastMessage = (message: string, type: ToastType) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  // Real-time error clearing
  useEffect(() => {
    if (errors.relationship && relationship) {
      setErrors(prev => ({ ...prev, relationship: undefined }))
    }
  }, [relationship, errors.relationship])

  useEffect(() => {
    if (errors.occasion && occasion) {
      setErrors(prev => ({ ...prev, occasion: undefined }))
    }
  }, [occasion, errors.occasion])

  useEffect(() => {
    if (errors.interests && interests.length > 0) {
      setErrors(prev => ({ ...prev, interests: undefined }))
    }
  }, [interests, errors.interests])

  useEffect(() => {
    if (errors.budget && budget) {
      setErrors(prev => ({ ...prev, budget: undefined }))
    }
  }, [budget, errors.budget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      showToastMessage('Please fix the errors in the form', 'error')
      return
    }
    
    setIsLoading(true)
    setSuggestions([])
    setIsUsingMockData(false)
    setShowResults(false)
    
    const startTime = Date.now()
    
    try {
      const formData = { age, relationship, occasion, interests: interests.join(', '), budget }
      addSearch(formData)
      
      let suggestions: GiftSuggestion[]
      try {
        suggestions = await GiftService.generateGiftSuggestions(formData)
        performance.trackApiCall('generate_gifts', startTime)
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError)
        suggestions = await GiftService.generateMockSuggestions(formData)
        setIsUsingMockData(true)
        showToastMessage('Using demo data - AI service not configured', 'info')
      }
      
      setSuggestions(suggestions)
      setHasGeneratedSuggestions(true)
      setShowResults(true)
      
      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      
      showToastMessage(`🎉 Found ${suggestions.length} perfect gift suggestions!`, 'success')
      analytics.trackGiftSuggestions(suggestions.length, occasion, !!budget)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      performance.trackError(error as Error, 'generate_suggestions')
      showToastMessage(error instanceof Error ? error.message : 'Failed to generate suggestions. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const text = suggestions.map((s: GiftSuggestion) => `${s.name} – ${s.description}`).join('\n')
      await navigator.clipboard.writeText(text)
      showToastMessage('Gift list copied to clipboard!', 'success')
      analytics.trackCopyToClipboard(suggestions.length)
    } catch (error) {
      showToastMessage('Failed to copy to clipboard', 'error')
    }
  }

  const clearForm = () => {
    setAge(25)
    setOccasion('')
    setInterests([])
    setCurrentInterest('')
    setBudget('')
    setRelationship('')
    setSuggestions([])
    setErrors({})
    setIsUsingMockData(false)
    setHasGeneratedSuggestions(false)
    setShowResults(false)
  }

  const handleSelectRecentSearch = (search: any) => {
    setAge(search.age)
    setRelationship(search.relationship || '')
    setOccasion(search.occasion)
    setInterests(search.interests.split(', ').filter(Boolean))
    setBudget(search.budget)
    setErrors({})
  }

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    try {
      console.log('Feedback submitted:', { rating, feedback })
      analytics.trackFeedback(rating, feedback.length > 0)
      showToastMessage('Thank you for your feedback!', 'success')
    } catch (error) {
      showToastMessage('Failed to submit feedback', 'error')
    }
  }

  const handleInterestAdd = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()])
      setCurrentInterest('')
    }
  }

  const handleInterestRemove = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ThemeToggle />
      
      <Toast message={toastMessage} type={toastType} isVisible={showToast} onClose={() => setShowToast(false)} />
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} onSubmit={handleFeedbackSubmit} />

      {/* Main Container */}
      <div className="flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          
          {/* Enhanced Header */}
          <header className="text-center mb-12">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                🎁 AI Gift Recommender
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Discover personalized gift recommendations powered by artificial intelligence. 
                Get thoughtful, unique gift ideas for any occasion.
              </p>
            </div>
          </header>

          <RecentSearches searches={recentSearches} onSelectSearch={handleSelectRecentSearch} onClearSearches={clearSearches} />

          {/* Enhanced Form Card */}
          <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-8 mb-8 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Age Slider */}
              <FormInput
                label="Recipient Age"
                type="range"
                value={age}
                onChange={setAge}
                min={1}
                max={100}
                icon={icons.age}
              />

              {/* Relationship Select */}
              <FormInput
                label="Who is this for?"
                type="select"
                value={relationship}
                onChange={setRelationship}
                options={relationships}
                required
                error={errors.relationship}
                icon={icons.relationship}
                placeholder="Select relationship"
              />

              {/* Occasion Select */}
              <FormInput
                label="Occasion"
                type="select"
                value={occasion}
                onChange={setOccasion}
                options={occasions}
                required
                error={errors.occasion}
                icon={icons.occasion}
                placeholder="Select an occasion"
              />

              {/* Interests Input */}
              <div className="space-y-3">
                <FormInput
                  label="Interests"
                  type="text"
                  value={currentInterest}
                  onChange={setCurrentInterest}
                  placeholder="Type an interest and press Enter"
                  required
                  error={errors.interests}
                  icon={icons.interests}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleInterestAdd()
                    }
                  }}
                />
                
                {interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interests.map((interest, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium animate-scale-in"
                      >
                        {interest}
                        <button 
                          type="button" 
                          onClick={() => handleInterestRemove(index)}
                          className="ml-1 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Input */}
              <FormInput
                label="Budget (optional)"
                type="number"
                value={budget}
                onChange={setBudget}
                placeholder="Enter maximum budget"
                error={errors.budget}
                icon={icons.budget}
              />

              {/* Enhanced Button Group */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  loading={isLoading}
                  icon="✨"
                  fullWidth
                  className="sm:flex-1"
                >
                  {isLoading ? 'Finding Gifts...' : 'Recommend Gifts'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearForm}
                  icon="🗑️"
                  fullWidth
                  className="sm:flex-1"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </main>

          {/* Loading State */}
          {isLoading && (
            <div className="w-full animate-fade-in">
              <LoadingSpinner size="lg" text="Finding Perfect Gifts..." description="Our AI is analyzing interests and preferences..." showFunMessages={true} />
            </div>
          )}

          {/* Enhanced Results Display */}
          {showResults && suggestions.length > 0 && !isLoading && (
            <section id="results-section" className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  🎉 Here are your personalized gift ideas!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We found {suggestions.length} perfect gifts based on your preferences
                </p>
              </div>
              
              <div className="grid gap-6 mb-8">
                {suggestions.map((suggestion, index) => (
                  <GiftCard key={suggestion.id} suggestion={suggestion} index={index} />
                ))}
              </div>
              
              {/* Action Buttons for Results */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="secondary"
                  onClick={handleSubmit}
                  loading={isLoading}
                  icon="🔁"
                  fullWidth
                  className="sm:flex-1"
                >
                  Regenerate
                </Button>
                <Button
                  variant="primary"
                  onClick={copyToClipboard}
                  icon="📄"
                  fullWidth
                  className="sm:flex-1"
                >
                  Copy List
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackModal(true)}
                  icon="💬"
                  fullWidth
                  className="sm:flex-1"
                >
                  Give Feedback
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default App