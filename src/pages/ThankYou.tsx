import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function ThankYou() {
    return (
        <>
            <Helmet>
                <title>Thank You for Subscribing! | Smart Gift Finder</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                    <div className="text-6xl mb-6">🎉</div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        You're All Set!
                    </h1>

                    <p className="text-xl text-gray-600 mb-8">
                        Check your inbox for your <strong>FREE Ultimate Gift Guide</strong>.
                        We've just sent it to you!
                    </p>

                    <div className="bg-blue-50 p-6 rounded-lg mb-8">
                        <p className="text-sm text-gray-700 mb-2">
                            <strong>What happens next?</strong>
                        </p>
                        <ul className="text-left text-sm text-gray-600 space-y-2">
                            <li>✅ Check your email for the gift guide (check spam if needed)</li>
                            <li>✅ Add us to your contacts so you never miss our tips</li>
                            <li>✅ Reply to any email with questions - we read every one!</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            While You're Here...
                        </h2>
                        <p className="text-gray-600">
                            Check out our most popular gift guides:
                        </p>

                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                            <Link
                                to="/gifts-for-mom"
                                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition"
                            >
                                <div className="text-3xl mb-2">👩</div>
                                <h3 className="font-semibold">Gifts for Mom</h3>
                            </Link>

                            <Link
                                to="/gifts-for-dad"
                                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:shadow-lg transition"
                            >
                                <div className="text-3xl mb-2">👨</div>
                                <h3 className="font-semibold">Gifts for Dad</h3>
                            </Link>

                            <Link
                                to="/unique-gifts"
                                className="p-4 border-2 border-teal-200 rounded-lg hover:border-teal-500 hover:shadow-lg transition"
                            >
                                <div className="text-3xl mb-2">✨</div>
                                <h3 className="font-semibold">Unique Gifts</h3>
                            </Link>
                        </div>

                        <Link
                            to="/"
                            className="inline-block mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Try Our AI Gift Finder →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
