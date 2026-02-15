import React, { useState, useEffect } from 'react';

export default function StickyEmailBar() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        const dismissed = sessionStorage.getItem('emailBarDismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // Show after scrolling 30% of page
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 30) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem('emailBarDismissed', 'true');
    };

    if (isDismissed || !isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 shadow-2xl z-40 animate-slide-up">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="font-semibold text-sm md:text-base">
                        🎁 Get our FREE Ultimate Gift Guide with 50+ ideas!
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="#email-signup"
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm whitespace-nowrap"
                    >
                        Get It Free
                    </a>

                    <button
                        onClick={handleDismiss}
                        className="text-white hover:text-blue-200 transition"
                        aria-label="Dismiss"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
