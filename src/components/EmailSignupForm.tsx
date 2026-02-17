import React, { useState } from 'react';

interface EmailSignupFormProps {
  variant?: 'inline' | 'popup' | 'sidebar';
  source?: string;
  headline?: string;
  description?: string;
  buttonText?: string;
  incentive?: string;
}

export default function EmailSignupForm({
  variant = 'inline',
  source = 'unknown',
  headline = 'Get Free Gift Ideas',
  description = 'Join 10,000+ smart gift givers. Get our best gift ideas delivered weekly!',
  buttonText = 'Get Free Gift Guide',
  incentive = '📧 Plus: Instant access to our Ultimate Gift Guide PDF',
}: EmailSignupFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Track conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'email_signup', {
            method: source,
            value: 1,
          });
        }

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setStatus('success');
          // Clear form
          setEmail('');
          setName('');
        }
      } else {
        const data = await response.json();
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const baseClasses = {
    inline: 'bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl',
    popup: 'bg-white',
    sidebar: 'bg-gray-50 p-6 rounded-lg border-2 border-blue-200',
  };

  if (status === 'success') {
    return (
      <div className={`${baseClasses[variant]} text-center`}>
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're In!</h3>
        <p className="text-gray-600 mb-4">
          Check your inbox for your free gift guide. We can't wait to help you
          find the perfect gifts!
        </p>
        <p className="text-sm text-gray-500">
          (If you don't see it, check your spam folder)
        </p>
      </div>
    );
  }

  return (
    <div className={baseClasses[variant]}>
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {headline}
        </h3>
        <p className="text-gray-600 mb-2">{description}</p>
        {incentive && (
          <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-4 py-2 rounded-full">
            {incentive}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {variant !== 'sidebar' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {status === 'loading' ? 'Subscribing...' : buttonText}
        </button>

        {status === 'error' && (
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        )}

        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. Unsubscribe anytime. No spam, ever.
        </p>
      </form>
    </div>
  );
}
