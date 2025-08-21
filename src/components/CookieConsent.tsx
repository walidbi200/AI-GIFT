import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onDecline?: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    setIsVisible(false);
    onAccept?.(allAccepted);
    
    // Trigger analytics if accepted
    if (allAccepted.analytics) {
      enableAnalytics();
    }
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    setIsVisible(false);
    onAccept?.(preferences);
    
    // Trigger analytics if accepted
    if (preferences.analytics) {
      enableAnalytics();
    }
  };

  const handleDecline = () => {
    const declined: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(declined));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    setIsVisible(false);
    onDecline?.();
  };

  const enableAnalytics = () => {
    // Enable Google Analytics or other tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              We use cookies to enhance your experience
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We use cookies and similar technologies to provide, protect, and improve our services. 
              By clicking "Accept All", you consent to our use of cookies for analytics, marketing, and functional purposes. 
              You can customize your preferences or learn more in our{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>.
            </p>
            
            {showDetails && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreference('analytics', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Used to deliver personalized advertisements and track campaign performance.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreference('marketing', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Functional Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Enable enhanced functionality and personalization.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => updatePreference('functional', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {showDetails ? 'Hide Details' : 'Customize'}
            </button>
            
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Decline All
            </button>
            
            <button
              onClick={handleAcceptSelected}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Accept Selected
            </button>
            
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cookie management utilities
export const CookieManager = {
  getConsent: (): CookiePreferences | null => {
    if (typeof window === 'undefined') return null;
    const consent = localStorage.getItem('cookie-consent');
    return consent ? JSON.parse(consent) : null;
  },

  hasConsent: (type: keyof CookiePreferences): boolean => {
    const consent = CookieManager.getConsent();
    return consent ? consent[type] : false;
  },

  updateConsent: (preferences: CookiePreferences): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  },

  clearConsent: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
  },

  getConsentDate: (): Date | null => {
    if (typeof window === 'undefined') return null;
    const date = localStorage.getItem('cookie-consent-date');
    return date ? new Date(date) : null;
  },

  isConsentExpired: (maxAgeDays: number = 365): boolean => {
    const consentDate = CookieManager.getConsentDate();
    if (!consentDate) return true;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - consentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > maxAgeDays;
  },
};
