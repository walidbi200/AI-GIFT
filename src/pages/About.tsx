import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const About: React.FC = () => {
  useEffect(() => {
    // Update document title for SEO
    document.title =
      'About - Smart Gift Finder | AI-Powered Gift Recommendations';

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Learn about Smart Gift Finder - an AI-powered platform that helps you find the perfect gifts for your loved ones. Discover how our technology works and the story behind our creation.'
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
              🎁 Smart Gift Finder
            </h1>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-4">
            About Our Mission
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Making gift-giving thoughtful, personal, and effortless through the
            power of artificial intelligence.
          </p>
        </header>
        <main className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="prose prose-slate max-w-none">
            {/* What We Do Section */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="text-indigo-600 mr-3">✨</span>
                What We Do
              </h3>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Smart Gift Finder is an innovative platform that
                  revolutionizes the way you discover and choose gifts for your
                  loved ones. We understand that finding the perfect gift can be
                  challenging, time-consuming, and sometimes overwhelming.
                </p>
                <p>
                  Our platform takes the guesswork out of gift-giving by
                  analyzing the recipient's age, interests, occasion, and budget
                  to generate personalized gift recommendations that are
                  thoughtful, relevant, and meaningful.
                </p>
                <p>
                  Whether you're shopping for a birthday, anniversary, holiday,
                  or any special occasion, our AI-powered system helps you find
                  gifts that truly resonate with the person you care about.
                </p>
              </div>
            </section>

            {/* How AI Works Section */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="text-indigo-600 mr-3">🤖</span>
                How Our AI Works
              </h3>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Our advanced artificial intelligence system uses sophisticated
                  algorithms to analyze multiple factors and generate
                  personalized gift suggestions. Here's how it works:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Personal Analysis:</strong> We consider the
                    recipient's age, relationship to you, and specific interests
                    to understand their preferences and lifestyle.
                  </li>
                  <li>
                    <strong>Occasion Context:</strong> Different occasions call
                    for different types of gifts. Our AI understands the context
                    and suggests appropriate options for birthdays,
                    anniversaries, holidays, and more.
                  </li>
                  <li>
                    <strong>Budget Optimization:</strong> We respect your budget
                    constraints while ensuring quality and thoughtfulness in
                    every recommendation.
                  </li>
                  <li>
                    <strong>Continuous Learning:</strong> Our system learns from
                    user feedback and preferences to improve recommendations
                    over time.
                  </li>
                </ul>
                <p>
                  The result is a curated list of gift ideas that are not only
                  practical but also deeply personal and meaningful to the
                  recipient.
                </p>
              </div>
            </section>

            {/* Our Story Section */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="text-indigo-600 mr-3">📖</span>
                Our Story
              </h3>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  Smart Gift Finder was born from a simple observation:
                  gift-giving should bring joy, not stress. Too often, people
                  find themselves staring at endless product listings, unsure of
                  what to choose or whether their gift will be appreciated.
                </p>
                <p>
                  We recognized that the key to great gift-giving lies in
                  understanding the recipient on a deeper level - their
                  passions, their lifestyle, and what makes them unique. This
                  insight led us to develop an AI system that could analyze
                  these factors and suggest gifts that truly matter.
                </p>
                <p>
                  Today, Smart Gift Finder helps thousands of people discover
                  thoughtful, personalized gifts that strengthen relationships
                  and create lasting memories. We're proud to be part of making
                  gift-giving more meaningful and less stressful for everyone.
                </p>
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mt-6">
                  <p className="text-indigo-800 font-medium">
                    This project was created with love and code by Walid Bichri.
                  </p>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="text-indigo-600 mr-3">💝</span>
                Our Values
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Personalization
                  </h4>
                  <p className="text-slate-700">
                    Every gift recommendation is tailored to the individual,
                    ensuring that each suggestion reflects the recipient's
                    unique personality and preferences.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Thoughtfulness
                  </h4>
                  <p className="text-slate-700">
                    We believe that the best gifts are those that show you truly
                    understand and care about the person you're giving to.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Accessibility
                  </h4>
                  <p className="text-slate-700">
                    Our platform is free to use and designed to be accessible to
                    everyone, regardless of their technical expertise or budget.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Innovation
                  </h4>
                  <p className="text-slate-700">
                    We continuously improve our AI technology to provide better,
                    more accurate gift recommendations and enhance the user
                    experience.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
        <section className="text-center mb-8">
          <p className="text-slate-600 mb-6">
            Ready to find the perfect gift? Start your personalized gift search
            today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                🎁 Start Finding Gifts
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                💬 Get in Touch
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default About;
