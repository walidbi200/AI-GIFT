import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
// RelatedGiftGuides removed in favor of InternalLinks
import InlineEmailCapture from '../components/InlineEmailCapture';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useTimeOnPage } from '../hooks/useTimeOnPage';
import { analytics } from '../services/analytics';
import { schemaMarkup, injectSchema } from '../utils/schemaMarkup';
import InternalLinks from '../components/seo/InternalLinks';

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
        <div className="border-l-4 border-purple-500 pl-6 my-8">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
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
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {link.featured && '🏆 '}
                        {link.platform} {link.featured && '- Best Choice'}
                    </a>
                ))}
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Category: {category}
            </p>
        </div>
    );
};

export default function BirthdayGifts() {
    useScrollDepth('birthday-gifts');
    useTimeOnPage('birthday-gifts');

    return (
        <>
            <Helmet>
                <title>Best Birthday Gift Ideas [2025] - Unique Presents for Everyone | Smart Gift Finder</title>
                <meta name="title" content="Best Birthday Gift Ideas [2025] - Unique Presents for Everyone | Smart Gift Finder" />
                <meta name="description" content="🎂 Find the perfect birthday gift for anyone! Curated ideas for him, her, kids, and friends. Unique, personalized, and budget-friendly options. Free AI recommendations ⚡" />
                <meta name="keywords" content="birthday gifts, birthday gift ideas, box gifts, gifts for her birthday, gifts for him birthday, milestone birthday gifts" />
                <link rel="canonical" href="https://www.smartgiftfinder.xyz/birthday-gifts" />

                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://www.smartgiftfinder.xyz/birthday-gifts" />
                <meta property="og:title" content="Best Birthday Gift Ideas [2025] - Unique Presents for Everyone" />
                <meta property="og:description" content="🎂 Find the perfect birthday gift for anyone! Curated ideas for every budget and personality." />
                <meta property="og:image" content="https://www.smartgiftfinder.xyz/images/birthday-gifts-og.jpg" />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.smartgiftfinder.xyz/birthday-gifts" />
                <meta property="twitter:title" content="Best Birthday Gift Ideas [2025]" />
                <meta property="twitter:description" content="🎂 Find the perfect birthday gift for anyone! Curated ideas for every budget." />
                <meta property="twitter:image" content="https://www.smartgiftfinder.xyz/images/birthday-gifts-twitter.jpg" />

                <script type="application/ld+json">
                    {injectSchema(schemaMarkup.collectionPage({
                        name: "Best Birthday Gift Ideas",
                        description: "Curated collection of the best birthday gift ideas for 2025",
                        url: "https://www.smartgiftfinder.xyz/birthday-gifts"
                    }))}
                </script>
                <script type="application/ld+json">
                    {injectSchema(schemaMarkup.breadcrumbs([
                        { name: "Home", url: "https://www.smartgiftfinder.xyz/" },
                        { name: "Birthday Gifts", url: "https://www.smartgiftfinder.xyz/birthday-gifts" }
                    ]))}
                </script>
                <script type="application/ld+json">
                    {injectSchema(schemaMarkup.faqPage([
                        {
                            question: "What are the best birthday gifts for her?",
                            answer: "The best birthday gifts for her depend on her personality. For sentimental types, personalized jewelry or photo albums are great. For practical women, consider high-quality kitchen gadgets or tech accessories. Luxury spa sets and experience gifts are almost always appreciated."
                        },
                        {
                            question: "What are unique birthday gift ideas?",
                            answer: "Unique birthday gift ideas include custom star maps of their birth date, personalized comic books, DNA ancestry kits, cooking classes, subscription boxes for their specific hobby, or a surprise weekend getaway. Look for gifts that offer an experience or a personal touch."
                        },
                        {
                            question: "How do I choose a birthday gift for someone who has everything?",
                            answer: "For someone who has everything, focus on consumables (gourmet food, fine wine), experiences (tickets to a show, lessons), or charitable donations in their name. Personalized items that can't be bought in stores are also excellent choices."
                        },
                        {
                            question: "What is a good budget for a birthday gift?",
                            answer: "A good budget for a birthday gift varies by relationship. For acquaintances or coworkers, $20-$30 is appropriate. For friends and family, $30-$100 is common. For partners or milestone birthdays, $100+ is typical. Remember, thoughtfulness matters more than price."
                        }
                    ]))}
                </script>
            </Helmet>

            <article className="max-w-4xl mx-auto px-4 py-12">
                <nav className="text-sm mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-gray-600">
                        <li>
                            <Link to="/" className="hover:text-purple-600">Home</Link>
                        </li>
                        <li>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="text-gray-900 font-medium">Birthday Gifts</li>
                    </ol>
                </nav>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Best Birthday Gift Ideas [2025] - Unique Presents for Everyone
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Make their special day unforgettable with our curated list of birthday gift ideas.
                        Whether you're shopping for a partner, parent, friend, or coworker, we have unique
                        suggestions for every personality and budget.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 Updated: February 2026</span>
                        <span>⏱️ 12 min read</span>
                        <span>🎁 30+ gift ideas</span>
                    </div>
                </header>

                <AffiliateDisclosure />
                <InlineEmailCapture placement="top" pageType="landing" />

                <div className="bg-purple-50 p-6 rounded-lg mb-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Navigation</h2>
                    <ul className="space-y-2">
                        <li><a href="#for-her" className="text-purple-600 hover:underline">→ Gifts for Her</a></li>
                        <li><a href="#for-him" className="text-purple-600 hover:underline">→ Gifts for Him</a></li>
                        <li><a href="#milestone" className="text-purple-600 hover:underline">→ Milestone Birthdays (30th, 40th, 50th)</a></li>
                        <li><a href="#kids" className="text-purple-600 hover:underline">→ Gifts for Kids & Teens</a></li>
                        <li><a href="#friends" className="text-purple-600 hover:underline">→ Fun Gifts for Friends</a></li>
                        <li><a href="#faq" className="text-purple-600 hover:underline">→ Frequently Asked Questions</a></li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="lead">
                        Birthdays are the perfect opportunity to show how much you care. But finding the right
                        gift can be stressful. We've organized the best gift ideas of 2025 by recipient and
                        age to make your shopping easy and fun.
                    </p>

                    <section id="for-her" className="mt-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Birthday Gifts for Her
                        </h2>
                        <p className="mb-8">
                            Whether she's your wife, girlfriend, mom, or sister, she deserves something special.
                            These gifts range from luxurious pampering to thoughtful keepsakes.
                        </p>

                        <GiftItem
                            name="Luxury Silk Pajama Set"
                            description="100% mulberry silk pajama set that feels incredible against the skin. Thermoregulating and hypoallergenic. A devastatingly chic upgrade to her loungewear collection."
                            priceRange="$120-200"
                            category="Fashion"
                            affiliateLinks={[
                                {
                                    platform: "Nordstrom",
                                    url: "https://nordstrom.com/silk-pajamas",
                                    commission: "8%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/silk-pajamas",
                                    commission: "3%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="Professional Blow Dryer Brush"
                            description="The viral hair tool that dries and styles in one step. Gives a salon-quality blowout at home in half the time. Perfect for busy women who want to look their best."
                            priceRange="$40-60"
                            category="Beauty"
                            affiliateLinks={[
                                {
                                    platform: "Ulta Beauty",
                                    url: "https://ulta.com/blow-dryer-brush",
                                    commission: "5%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/blow-dryer-brush",
                                    commission: "3%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="Personalized Initial Necklace"
                            description="Delicate gold or silver chain with her initial. Simple, elegant, and perfect for everyday wear. A thoughtful personal touch without being over the top."
                            priceRange="$30-80"
                            category="Jewelry"
                            affiliateLinks={[
                                {
                                    platform: "Etsy",
                                    url: "https://etsy.com/initial-necklace",
                                    commission: "4%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/initial-necklace",
                                    commission: "3%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="Subscription Box for Her Interests"
                            description="Choose from beauty (Birchbox), books (Book of the Month), or lifestyle (FabFitFun). The gift that keeps on giving month after month. Shows you know what she loves."
                            priceRange="$15-50/mo"
                            category="Subscription"
                            affiliateLinks={[
                                {
                                    platform: "Cratejoy",
                                    url: "https://cratejoy.com",
                                    commission: "10%",
                                    featured: true
                                }
                            ]}
                        />
                    </section>

                    <section id="for-him" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Birthday Gifts for Him
                        </h2>
                        <p className="mb-8">
                            Finding a gift for the man who has everything is a challenge. These practical
                            and cool gifts are sure to impress him.
                        </p>

                        <GiftItem
                            name="Craft Beer Brewing Kit"
                            description="Everything he needs to brew his own beer at home. Includes fermentation jug, ingredients, and instructions. A fun hobby starter for beer lovers."
                            priceRange="$40-80"
                            category="Hobbies"
                            affiliateLinks={[
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/beer-brewing-kit",
                                    commission: "3%",
                                    featured: true
                                },
                                {
                                    platform: "Uncommon Goods",
                                    url: "https://uncommongoods.com/beer-kit",
                                    commission: "6%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="High-Performance Gaming Mouse"
                            description="Ergonomic gaming mouse with programmable buttons and ultra-fast response time. Essential for PC gamers. Available in wired or wireless options."
                            priceRange="$50-100"
                            category="Electronics"
                            affiliateLinks={[
                                {
                                    platform: "Best Buy",
                                    url: "https://bestbuy.com/gaming-mouse",
                                    commission: "1%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/gaming-mouse",
                                    commission: "3%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="Portable Campfire Pit"
                            description="Compact, smokeless portable fire pit for camping, beach trips, or the backyard. Easy to set up and clean. Great for the outdoorsy guy."
                            priceRange="$80-150"
                            category="Outdoor"
                            affiliateLinks={[
                                {
                                    platform: "REI",
                                    url: "https://rei.com/fire-pits",
                                    commission: "5%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/portable-fire-pit",
                                    commission: "3%"
                                }
                            ]}
                        />
                    </section>

                    <section id="milestone" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Milestone Birthdays
                        </h2>
                        <p className="mb-8">
                            Turning 30, 40, or 50 is a big deal. Mark the occasion with these memorable
                            and significant gifts.
                        </p>

                        <GiftItem
                            name="Vintage Newspaper from Their Birth Date"
                            description="An original newspaper from the day they were born. Framed and ready to display. A fascinating look back in time and a unique conversation piece."
                            priceRange="$40-100"
                            category="Keepsake"
                            affiliateLinks={[
                                {
                                    platform: "Uncommon Goods",
                                    url: "https://uncommongoods.com/birthday-newspaper",
                                    commission: "6%",
                                    featured: true
                                }
                            ]}
                        />

                        <GiftItem
                            name="Bucket List Experience"
                            description="Skydiving, race car driving, hot air balloon ride, or a scenic flight. Give them an adventure they'll never forget. Perfect for entering a new decade."
                            priceRange="$200-500"
                            category="Experience"
                            affiliateLinks={[
                                {
                                    platform: "Virgin Experience Days",
                                    url: "https://virginexperiencedays.com",
                                    commission: "10%",
                                    featured: true
                                }
                            ]}
                        />

                        <GiftItem
                            name="Premium Aged Spirit"
                            description="A bottle of Scotch, Bourbon, or Wine aged for the same number of years as their birthday (e.g., 30-year-old Scotch). A sophisticated and celebratory gift."
                            priceRange="$100-500+"
                            category="Food & Drink"
                            affiliateLinks={[
                                {
                                    platform: "ReserveBar",
                                    url: "https://reservebar.com",
                                    commission: "5%",
                                    featured: true
                                }
                            ]}
                        />
                    </section>
                    <InlineEmailCapture placement="middle" pageType="landing" />

                    <section id="kids" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Gifts for Kids & Teens
                        </h2>
                        <p className="mb-8">
                            From toddlers to teenagers, finding the cool gift can make you the favorite relative.
                        </p>

                        <GiftItem
                            name="Building Block Robot Kit"
                            description="STEM toy that lets kids build and code their own robot. Educational and incredibly fun. Teaches programming basics through play."
                            priceRange="$80-150"
                            category="Toys & Games"
                            affiliateLinks={[
                                {
                                    platform: "LEGO",
                                    url: "https://lego.com",
                                    commission: "3%",
                                    featured: true
                                },
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/robot-kit",
                                    commission: "3%"
                                }
                            ]}
                        />

                        <GiftItem
                            name="Instant Print Camera"
                            description="Retro-style camera that prints photos instantly. Fun for parties and scrapbooking. Popular with teens who love capturing memories."
                            priceRange="$60-90"
                            category="Electronics"
                            affiliateLinks={[
                                {
                                    platform: "Amazon",
                                    url: "https://amazon.com/instax",
                                    commission: "3%",
                                    featured: true
                                }
                            ]}
                        />
                    </section>

                    <section id="friends" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Fun Gifts for Friends
                        </h2>
                        <p className="mb-8">
                            Show your bestie some love with these fun and thoughtful ideas.
                        </p>

                        <GiftItem
                            name="Custom Pet Portrait"
                            description="A custom illustration of their beloved pet. Available in various artistic styles. A guaranteed hit for any pet parent."
                            priceRange="$30-60"
                            category="Art"
                            affiliateLinks={[
                                {
                                    platform: "Etsy",
                                    url: "https://etsy.com/pet-portrait",
                                    commission: "4%",
                                    featured: true
                                }
                            ]}
                        />
                    </section>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-xl text-center my-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Need More Ideas?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Our AI gift finder can generate personalized birthday gift ideas based on
                            age, hobbies, and personality traits. Try it now for free!
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition"
                        >
                            Get AI Birthday Suggestions →
                        </Link>
                    </div>

                    <InternalLinks currentPage="/birthday-gifts" className="my-12" />

                    <section id="faq" className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    What are the best birthday gifts for her?
                                </h3>
                                <p className="text-gray-700">
                                    The best birthday gifts for her depend on her personality. For sentimental types,
                                    personalized jewelry or photo albums are great. For practical women, consider
                                    high-quality kitchen gadgets or tech accessories. Luxury spa sets and experience
                                    gifts are almost always appreciated.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    What are unique birthday gift ideas?
                                </h3>
                                <p className="text-gray-700">
                                    Unique birthday gift ideas include custom star maps of their birth date, personalized
                                    comic books, DNA ancestry kits, cooking classes, subscription boxes for their
                                    specific hobby, or a surprise weekend getaway. Look for gifts that offer an
                                    experience or a personal touch.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    How do I choose a birthday gift for someone who has everything?
                                </h3>
                                <p className="text-gray-700">
                                    For someone who has everything, focus on consumables (gourmet food, fine wine),
                                    experiences (tickets to a show, lessons), or charitable donations in their name.
                                    Personalized items that can't be bought in stores are also excellent choices.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    What is a good budget for a birthday gift?
                                </h3>
                                <p className="text-gray-700">
                                    A good budget for a birthday gift varies by relationship. For acquaintances
                                    or coworkers, $20-$30 is appropriate. For friends and family, $30-$100 is common.
                                    For partners or milestone birthdays, $100+ is typical. Remember, thoughtfulness
                                    matters more than price.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </article>
        </>
    );
}
