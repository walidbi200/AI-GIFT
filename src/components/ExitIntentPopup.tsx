import React, { useState, useEffect } from 'react';
import EmailSignupForm from './EmailSignupForm';

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        // Check if already shown in this session
        const shown = sessionStorage.getItem('exitPopupShown');
        if (shown) {
            setHasShown(true);
            return;
        }

        // Track mouse movement
        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger if mouse is leaving from top of page
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true);
                setHasShown(true);
                sessionStorage.setItem('exitPopupShown', 'true');
            }
        };

        // Add delay before activating (5 seconds)
        const timer = setTimeout(() => {
            document.addEventListener('mouseleave', handleMouseLeave);
        }, 5000);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hasShown]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in shadow-2xl">
                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Close popup"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="mb-6 text-center">
                    <div className="text-5xl mb-4">🎁</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Wait! Don't Leave Empty-Handed
                    </h2>
                    <p className="text-gray-600">
                        Get our <strong>Ultimate Gift Guide</strong> with 50+ curated gift ideas for every occasion. Completely free!
                    </p>
                </div>

                <EmailSignupForm
                    variant="popup"
                    source="exit-intent"
                    headline=""
                    description=""
                    buttonText="Send Me The Free Guide"
                    incentive="✨ Instant download • No spam • Unsubscribe anytime"
                />
            </div>
        </div>
    );
}
