import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import RelatedGiftGuides from '../components/RelatedGiftGuides';
import InlineEmailCapture from '../components/InlineEmailCapture';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useTimeOnPage } from '../hooks/useTimeOnPage';
import { analytics } from '../services/analytics';

interface GiftItemProps {
    name: string;
    description: string;
    priceRange: string;
    category: string;
    affiliateLinks: {
        platform: string;
        url: string;
        commission: string;
        featured?: boolean;
    }[];
}

const GiftItem: React.FC<GiftItemProps> = ({ name, description, priceRange, category, affiliateLinks }) => {
    return (
        <div className="border-l-4 border-pink-500 pl-6 my-8">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                    {priceRange}
                </span>
            </div>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="flex flex-wrap gap-3">
                {affiliateLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        onClick={() => {
                            analytics.affiliateLinkClicked({
                                giftName: name,
                                platform: link.platform,
                                position: index + 1,
                                page: window.location.pathname,
                                commission: link.commission,
                            });
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${link.featured
                            ? 'bg-pink-600 text-white hover:bg-pink-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {link.featured && '💖 '}
                        {link.platform} {link.featured && '- Recommended'}
                    </a>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Category: {category}
            </p>
        </div>
    );
};

export default function GiftsForGirlfriend() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What are romantic gifts for girlfriend?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Romantic gifts often focus on thoughtfulness and personalization. A custom star map of your first date, a weekend getaway surprise, or a piece of jewelry engraved with a special message are all deeply romantic choices that show you've put heart into the selection."
                }
            },
            {
                "@type": "Question",
                "name": "What should I get my girlfriend for her birthday?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Birthday gifts should match her unique personality. If she loves self-care, a luxury spa gift set is perfect. If she's a fashionista, a designer accessory like a watch or handbag is a great choice. For a sentimental touch, consider a custom photo album of your time together."
                }
            },
            {
                "@type": "Question",
                "name": "What are thoughtful gifts to show I care?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Thoughtful gifts are about noticing the little things. It could be a subscription to her favorite magazine, a cozy cashmere sweater for cold nights, or even a 'planned' night out that takes all the decision-making off her plate."
                }
            },
            {
                "@type": "Question",
                "name": "What are the best gifts for a new girlfriend?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "In a new relationship, opt for gifts that are sweet but not overwhelming. Luxury candles, a high-end chocolate box, or tickets to a concert or movie you both want to see are ideal ways to celebrate without making things 'too serious' too fast."
                }
            },
            {
                "@type": "Question",
                "name": "What gifts do girlfriends actually want?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Most girlfriends appreciate gifts that show you know them. This means paying attention to their 'wish list'—whether it's a specific brand of skincare, a hobby they want to start, or a place they've mentioned they want to visit."
                }
            }
        ]
    };

    useScrollDepth('gifts-for-girlfriend');
    useTimeOnPage('gifts-for-girlfriend');

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.smartgiftfinder.xyz/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Gifts for Girlfriend",
                "item": "https://www.smartgiftfinder.xyz/gifts-for-girlfriend"
            }
        ]
    };

    return (
        <>
            <Helmet>
                <title>Best Gifts for Girlfriend [2025] - 25+ Romantic & Thoughtful Ideas</title>
                <meta name="title" content="Best Gifts for Girlfriend [2025] - 25+ Romantic & Thoughtful Ideas" />
                <meta name="description" content="Find 25+ romantic gift ideas your girlfriend will cherish. From personalized jewelry to experiences, show her how much you care." />
                <meta name="keywords" content="gifts for girlfriend, romantic gifts for girlfriend, birthday gifts for girlfriend, best gifts for girlfriend 2025, anniversary gifts for girlfriend" />
                <link rel="canonical" href="https://www.smartgiftfinder.xyz/gifts-for-girlfriend" />

                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://www.smartgiftfinder.xyz/gifts-for-girlfriend" />
                <meta property="og:title" content="Best Gifts for Girlfriend [2025] - Romantic Ideas" />
                <meta property="og:description" content="Romantic and thoughtful gift ideas for your girlfriend." />
                <meta property="og:image" content="https://www.smartgiftfinder.xyz/images/gifts-for-girlfriend-og.jpg" />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.smartgiftfinder.xyz/gifts-for-girlfriend" />
                <meta property="twitter:title" content="Best Gifts for Girlfriend [2025]" />
                <meta property="twitter:description" content="Romantic and thoughtful gift ideas." />
                <meta property="twitter:image" content="https://www.smartgiftfinder.xyz/images/gifts-for-girlfriend-twitter.jpg" />

                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <article className="max-w-4xl mx-auto px-4 py-12">
                <nav className="text-sm mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-gray-600">
                        <li>
                            <Link to="/" className="hover:text-pink-600">Home</Link>
                        </li>
                        <li>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="text-gray-900 font-medium">Gifts for Girlfriend</li>
                    </ol>
                </nav>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Best Gifts for Girlfriend [2025] - 25+ Romantic & Thoughtful Ideas
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Looking for something that says "I love you" and "I've been paying attention"?
                        Our 2025 girlfriend gift guide features everything from timeless jewelry to
                        romantic weekend getaways. Show her she's special with the perfect surprise.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 Updated: February 2026</span>
                        <span>⏱️ 10 min read</span>
                        <span>🎁 25+ romantic ideas</span>
                    </div>
                </header>

                <AffiliateDisclosure />
                <InlineEmailCapture placement="top" pageType="landing" />

                <div className="bg-pink-50 p-6 rounded-lg mb-12 border-l-4 border-pink-500 text-pink-900">
                    <h2 className="text-xl font-semibold mb-4">Inside This Gift Guide</h2>
                    <ul className="space-y-2">
                        <li><a href="#jewelry" className="text-pink-600 hover:underline">→ Jewelry & Timeless Accessories</a></li>
                        <li><a href="#beauty" className="text-pink-600 hover:underline">→ Beauty & Luxurious Self-Care</a></li>
                        <li><a href="#fashion" className="text-pink-600 hover:underline">→ Classy Fashion & Style</a></li>
                        <li><a href="#romantic" className="text-pink-600 hover:underline">→ Unforgettable Romantic Experiences</a></li>
                        <li><a href="#personalized" className="text-pink-600 hover:underline">→ Personalized & Heartfelt Mementos</a></li>
                        <li><a href="#budget" className="text-pink-600 hover:underline">→ Thoughtful Budget Gems (Under $50)</a></li>
                        <li><a href="#faq" className="text-pink-600 hover:underline">→ Girlfriend Gift FAQ</a></li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="lead">
                        The best gift for a girlfriend is one that shows you understand her passions,
                        dreams, and the little things that make her smile. Whether she's into high-end
                        fashion, cozy nights in, or adventurous weekends out, the key is the thought
                        behind the gesture.
                    </p>

                    <section id="jewelry" className="mt-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Jewelry & Accessories</h2>
                        <p className="mb-8">Timeless pieces she'll wear every day as a reminder of your love.</p>

                        <GiftItem
                            name="Initial Charm Necklace in Gold"
                            description="A delicate gold-plated chain with her initial (or yours). Minimalist, trendy, and incredibly personal. Perfect for layering with other necklaces she already owns."
                            priceRange="$40-120"
                            category="Jewelry"
                            affiliateLinks={[
                                { platform: "Personalization Mall", url: "https://personalizationmall.com/necklaces", commission: "8%", featured: true },
                                { platform: "Etsy", url: "https://etsy.com/gold-initial-necklace", commission: "4%" }
                            ]}
                        />

                        <GiftItem
                            name="Designer Minimalist Watch"
                            description="A sleek, feminine watch with a rose gold or silver finish. Sophisticated enough for work but stylish enough for weekend brunch."
                            priceRange="$100-300"
                            category="Fashion"
                            affiliateLinks={[
                                { platform: "Nordstrom", url: "https://nordstrom.com/womens-watches", commission: "8%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/womens-designer-watch", commission: "3%" }
                            ]}
                        />

                        <GiftItem
                            name="Birthstone Stud Earrings"
                            description="Help her celebrate her birth month with vibrant gemstone studs. High-quality craftsmanship in sterling silver or gold settings."
                            priceRange="$50-250"
                            category="Jewelry"
                            affiliateLinks={[
                                { platform: "Blue Nile", url: "https://bluenile.com/gemstone-earrings", commission: "5%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/birthstone-earrings", commission: "3%" }
                            ]}
                        />

                        <GiftItem
                            name="Personalized Engraved Bracelet"
                            description="A simple cuff or chain bracelet engraved with your anniversary date or a short meaningful phrase. A subtle but powerful sentimental gift."
                            priceRange="$40-100"
                            category="Jewelry"
                            affiliateLinks={[
                                { platform: "Personalization Mall", url: "https://personalizationmall.com/bracelets", commission: "8%", featured: true }
                            ]}
                        />
                    </section>

                    <section id="beauty" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Beauty & Luxurious Self-Care</h2>
                        <p className="mb-8">Indulgent gifts that bring the spa experience into her home.</p>

                        <GiftItem
                            name="Luxury Skincare Rejuvenation Set"
                            description="A curated collection of high-end serums, creams, and masks from top brands like Tatcha or Drunk Elephant. Perfect for her nightly ritual."
                            priceRange="$100-250"
                            category="Beauty"
                            affiliateLinks={[
                                { platform: "Sephora", url: "https://sephora.com/skincare-sets", commission: "5%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/luxury-skincare-set", commission: "3%" }
                            ]}
                        />

                        <GiftItem
                            name="Silk Pillowcase and Eye Mask Set"
                            description="The ultimate beauty sleep upgrade. Silk reduces hair breakage and skincare absorption, making her feel like she's sleeping in a 5-star hotel."
                            priceRange="$40-90"
                            category="Lifestyle"
                            affiliateLinks={[
                                { platform: "Amazon", url: "https://amazon.com/silk-pillowcase", commission: "3%", featured: true },
                                { platform: "Nordstrom", url: "https://nordstrom.com/silk-pillowcase", commission: "8%" }
                            ]}
                        />

                        <GiftItem
                            name="Signature Designer Fragrance"
                            description="Choose a scent that matches her vibe—whether it's floral, woody, or fresh. A classic bottle from Chanel or Dior is a staple of any vanity."
                            priceRange="$80-180"
                            category="Perfume"
                            affiliateLinks={[
                                { platform: "Sephora", url: "https://sephora.com/fragrance", commission: "5%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/womens-perfume", commission: "3%" }
                            ]}
                        />
                    </section>

                    <section id="fashion" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Fashion & Style</h2>
                        <p className="mb-8">Chic essentials that help her look and feel her best.</p>

                        <GiftItem
                            name="Ultra-Soft Cashmere Sweater"
                            description="A timeless wardrobe staple that feels like a hug. Choose a neutral color like camel, grey, or cream for maximum versatility."
                            priceRange="$100-250"
                            category="Fashion"
                            affiliateLinks={[
                                { platform: "Nordstrom", url: "https://nordstrom.com/cashmere-sweaters", commission: "8%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/cashmere-sweater", commission: "3%" }
                            ]}
                        />

                        <GiftItem
                            name="Designer Leather Handbag"
                            description="A high-quality crossbody or tote bag that elevates her everyday style. Look for premium materials and classic silhouettes."
                            priceRange="$150-500"
                            category="Fashion"
                            affiliateLinks={[
                                { platform: "Nordstrom", url: "https://nordstrom.com/handbags", commission: "8%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/coach-handbags", commission: "3%" }
                            ]}
                        />
                    </section>
                    <InlineEmailCapture placement="middle" pageType="landing" />

                    <section id="romantic" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Romantic Experiences</h2>
                        <p className="mb-8">Escape the routine with memories that will last a lifetime.</p>

                        <GiftItem
                            name="Weekend Getaway Package"
                            description="Surprise her with a planned weekend escape to a cozy cabin, beach house, or vibrant city. The planning is part of the gift."
                            priceRange="$300-1,000"
                            category="Experience"
                            affiliateLinks={[
                                { platform: "Airbnb", url: "https://airbnb.com/giftcards", commission: "Varies", featured: true },
                                { platform: "Viator", url: "https://viator.com/weekend-getaways", commission: "8%" }
                            ]}
                        />

                        <GiftItem
                            name="Couples Spa & Massage Day"
                            description="A day of shared relaxation including massages, facials, and spa access. A perfect way to reconnect and de-stress together."
                            priceRange="$200-450"
                            category="Experience"
                            affiliateLinks={[
                                { platform: "Groupon", url: "https://groupon.com/spas", commission: "8%", featured: true }
                            ]}
                        />

                        <GiftItem
                            name="Intimate Cooking Class for Two"
                            description="Learn a new cuisine together while enjoying good wine and even better company. Fun, interactive, and delicious."
                            priceRange="$100-200"
                            category="Experience"
                            affiliateLinks={[
                                { platform: "Viator", url: "https://viator.com/cooking-classes", commission: "8%", featured: true }
                            ]}
                        />
                    </section>

                    <section id="personalized" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Personalized & Sentimental</h2>
                        <p className="mb-8">Gifts that tell the story of your unique relationship.</p>

                        <GiftItem
                            name="Custom Photo Book of Your Adventures"
                            description="Candid shots from your travels, dates, and everyday moments. A tangible collection of your shared history that she'll treasure forever."
                            priceRange="$30-80"
                            category="Sentimental"
                            affiliateLinks={[
                                { platform: "Personalization Mall", url: "https://personalizationmall.com/photo-gifts", commission: "8%", featured: true },
                                { platform: "Amazon", url: "https://amazon.com/custom-photo-book", commission: "3%" }
                            ]}
                        />

                        <GiftItem
                            name="Engraved Keepsake Jewelry Box"
                            description="A beautiful glass or wood box for her treasures, engraved with her name or a romantic quote."
                            priceRange="$40-70"
                            category="Home"
                            affiliateLinks={[
                                { platform: "Personalization Mall", url: "https://personalizationmall.com/keepsake-box", commission: "8%", featured: true }
                            ]}
                        />
                    </section>

                    <section id="budget" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Budget-Friendly Gems (Under $50)</h2>
                        <p className="mb-8">Thoughtful surprises that don't need a massive price tag.</p>

                        <GiftItem
                            name="Luxury Soy Candle Set"
                            description="High-end scents that transform her room into a sanctuary. Look for artisanal brands with beautiful packaging."
                            priceRange="$25-45"
                            category="Home"
                            affiliateLinks={[
                                { platform: "Amazon", url: "https://amazon.com/luxury-candles", commission: "3%", featured: true }
                            ]}
                        />

                        <GiftItem
                            name="Cozy Sherpa Throw Blanket"
                            description="Super soft and perfect for movie nights on the couch. A practical gift that she'll use every single evening."
                            priceRange="$30-50"
                            category="Home"
                            affiliateLinks={[
                                { platform: "Amazon", url: "https://amazon.com/sherpa-blanket", commission: "3%", featured: true }
                            ]}
                        />
                    </section>

                    <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-8 rounded-xl text-center my-16 shadow-md border border-pink-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Want a Custom Recommendation?</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Know her style but not sure what's missing? Our AI Gift Finder takes her
                            interests, age, and your budget to find a truly one-of-a-kind gift.
                        </p>
                        <Link to="/" className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition">
                            Ask our AI Gift Finder →
                        </Link>
                    </div>

                    <section id="faq" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Girlfriend Gift FAQ</h2>
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the best anniversary gift for a girlfriend?</h3>
                                <p className="text-gray-700 underline-offset-4 decoration-pink-300 decoration-2 underline">Personalized jewelry or a romantic experience like a weekend trip are top choices for anniversaries.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">How much should I spend on a birthday gift for her?</h3>
                                <p className="text-gray-700">The amount matters less than the thought. A well-chosen $50 gift she LOVES is better than a generic $200 gift that doesn't fit her style.</p>
                            </div>
                        </div>
                    </section>

                    <RelatedGiftGuides currentPage="gifts-for-girlfriend" />
                </div>
            </article>
        </>
    );
}
