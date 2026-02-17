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

const GiftItem: React.FC<GiftItemProps> = ({
  name,
  description,
  priceRange,
  category,
  affiliateLinks,
}) => {
  return (
    <div className="border-l-4 border-red-500 pl-6 my-8">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
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
            className={`px-4 py-2 rounded-lg font-medium transition ${
              link.featured
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {link.featured && '🏆 '}
            {link.platform} {link.featured && '- Best Deal'}
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">Category: {category}</p>
    </div>
  );
};

export default function AnniversaryGifts() {
  useScrollDepth('anniversary-gifts');
  useTimeOnPage('anniversary-gifts');

  return (
    <>
      <Helmet>
        <title>
          Best Anniversary Gifts [2025] - Romantic Ideas by Year | Smart Gift
          Finder
        </title>
        <meta
          name="title"
          content="Best Anniversary Gifts [2025] - Romantic Ideas by Year | Smart Gift Finder"
        />
        <meta
          name="description"
          content="💑 Find perfect anniversary gifts by year (1st, 5th, 10th...)! Romantic experiences, personalized keepsakes & luxury ideas. Free AI recommendations ⚡"
        />
        <meta
          name="keywords"
          content="anniversary gifts, wedding anniversary gifts, gifts by year, paper anniversary gifts, wood anniversary gifts, romantic gifts for partner"
        />
        <link
          rel="canonical"
          href="https://www.smartgiftfinder.xyz/anniversary-gifts"
        />

        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content="https://www.smartgiftfinder.xyz/anniversary-gifts"
        />
        <meta
          property="og:title"
          content="Best Anniversary Gifts [2025] - Romantic Ideas by Year"
        />
        <meta
          property="og:description"
          content="💑 Find perfect anniversary gifts! Traditional themes & modern romantic ideas."
        />
        <meta
          property="og:image"
          content="https://www.smartgiftfinder.xyz/images/anniversary-gifts-og.jpg"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://www.smartgiftfinder.xyz/anniversary-gifts"
        />
        <meta
          property="twitter:title"
          content="Best Anniversary Gifts [2025]"
        />
        <meta
          property="twitter:description"
          content="Romantic anniversary gift ideas for every milestone."
        />
        <meta
          property="twitter:image"
          content="https://www.smartgiftfinder.xyz/images/anniversary-gifts-twitter.jpg"
        />

        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.collectionPage({
              name: 'Best Anniversary Gifts',
              description:
                'Curated collection of the best anniversary gift ideas for 2025',
              url: 'https://www.smartgiftfinder.xyz/anniversary-gifts',
            })
          )}
        </script>
        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.breadcrumbs([
              { name: 'Home', url: 'https://www.smartgiftfinder.xyz/' },
              {
                name: 'Anniversary Gifts',
                url: 'https://www.smartgiftfinder.xyz/anniversary-gifts',
              },
            ])
          )}
        </script>
        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.faqPage([
              {
                question: 'What are traditional anniversary gifts?',
                answer:
                  'Traditional anniversary gifts follow a meaningful theme for each year: Paper (1st), Cotton (2nd), Leather (3rd), Fruit/Flowers (4th), Wood (5th), Tin/Aluminum (10th), Crystal (15th), China (20th), Silver (25th), Pearl (30th), Ruby (40th), and Gold (50th).',
              },
              {
                question: 'What are good anniversary gifts for him?',
                answer:
                  'Good anniversary gifts for him include personalized watches, high-quality leather goods, experience days (driving, flying, tasting), tech gadgets, or sentimental items like a framed map of where you met or a custom photo book of your time together.',
              },
              {
                question: 'What are romantic anniversary gift ideas for her?',
                answer:
                  'Romantic gifts for her include jewelry (especially with significant stones), a surprise weekend getaway, a spa day, a handwritten love letter with a preserved rose, or recreating your first date. Personalized gifts showing you remember small details are always romantic.',
              },
              {
                question: 'How much should I spend on an anniversary gift?',
                answer:
                  "There's no set rule for anniversary spending. It depends on your budget and how long you've been together. For newer relationships, $50-$100 is common. For milestone anniversaries (10, 20, 25 years), couples often splurge on larger gifts or trips. The thought matters more than the price tag.",
              },
            ])
          )}
        </script>
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link to="/" className="hover:text-red-600">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">Anniversary Gifts</li>
          </ol>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Best Anniversary Gifts [2025] - Romantic Ideas by Year
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Celebrate your enduring love with a gift that speaks from the heart.
            From traditional milestone gifts like paper and wood to modern
            romantic experiences, find the perfect way to say "I love you" all
            over again.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>📅 Updated: February 2026</span>
            <span>⏱️ 10 min read</span>
            <span>🎁 25+ gift ideas</span>
          </div>
        </header>

        <AffiliateDisclosure />
        <InlineEmailCapture placement="top" pageType="landing" />

        <div className="bg-red-50 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <ul className="space-y-2">
            <li>
              <a href="#milestones" className="text-red-600 hover:underline">
                → Gifts by Year (1st, 5th, 10th, 25th)
              </a>
            </li>
            <li>
              <a href="#romantic" className="text-red-600 hover:underline">
                → Romantic Experiences
              </a>
            </li>
            <li>
              <a href="#jewelry" className="text-red-600 hover:underline">
                → Jewelry & Watches
              </a>
            </li>
            <li>
              <a href="#personalized" className="text-red-600 hover:underline">
                → Personalized Couple Gifts
              </a>
            </li>
            <li>
              <a href="#faq" className="text-red-600 hover:underline">
                → Frequently Asked Questions
              </a>
            </li>
          </ul>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="lead">
            Every anniversary is a milestone worth celebrating. Whether it's
            your first year of marriage or your golden anniversary, choosing the
            right gift shows your partner how much you cherish your journey
            together.
          </p>

          <section id="milestones" className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Traditional Gifts by Year
            </h2>
            <p className="mb-8">
              Following the traditional anniversary gift themes adds a layer of
              meaning and history to your celebration.
            </p>

            <GiftItem
              name="1st Year: Custom Star Map (Paper)"
              description="A beautiful print showing exactly how the stars aligned on your wedding night (or first date). Framed and ready to hang. A romantic and meaningful 'paper' gift."
              priceRange="$40-80"
              category="Home Decor"
              affiliateLinks={[
                {
                  platform: 'The Night Sky',
                  url: 'https://thenightsky.com',
                  commission: '10%',
                  featured: true,
                },
                {
                  platform: 'Etsy',
                  url: 'https://etsy.com/star-map',
                  commission: '4%',
                },
              ]}
            />

            <GiftItem
              name="5th Year: Engraved Cutting Board (Wood)"
              description="A high-quality wooden cutting board engraved with your family name and established date. Practical, durable, and follows the traditional 'wood' theme perfectly."
              priceRange="$50-100"
              category="Kitchen"
              affiliateLinks={[
                {
                  platform: 'Personalization Mall',
                  url: 'https://personalizationmall.com/cutting-board',
                  commission: '8%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/engraved-cutting-board',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="10th Year: Aluminum Carry-On Suitcase (Tin/Aluminum)"
              description="A sleek, durable aluminum carry-on suitcase. Perfect for the couple that loves to travel together. Modern, stylish, and built to last a lifetime."
              priceRange="$250-500"
              category="Travel"
              affiliateLinks={[
                {
                  platform: 'Away Travel',
                  url: 'https://awaytravel.com/aluminum',
                  commission: '5%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/aluminum-suitcase',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="25th Year: Silver Picture Frame (Silver)"
              description="A sterling silver picture frame holding a favorite photo from your 25 years together. Elegant and timeless. Engrave it with '25 Years' for an extra special touch."
              priceRange="$100-200"
              category="Home Decor"
              affiliateLinks={[
                {
                  platform: 'Pottery Barn',
                  url: 'https://potterybarn.com/silver-frames',
                  commission: '5%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/silver-frame',
                  commission: '3%',
                },
              ]}
            />
          </section>

          <section id="romantic" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Romantic Experiences
            </h2>
            <p className="mb-8">
              Create new memories together with these romantic experience gifts.
              Time spent together is often the most precious gift of all.
            </p>

            <GiftItem
              name="Couple's Spa Day"
              description="A relaxing day of pampering for two. Includes couple's massage, facials, and access to spa amenities. Reconnect and unwind together in a tranquil setting."
              priceRange="$250-500"
              category="Experience"
              affiliateLinks={[
                {
                  platform: 'Groupon',
                  url: 'https://groupon.com/spas',
                  commission: '8%',
                  featured: true,
                },
                {
                  platform: 'Virgin Experience Days',
                  url: 'https://virginexperiencedays.com/spa',
                  commission: '10%',
                },
              ]}
            />

            <GiftItem
              name="Weekend Getaway Gift Card"
              description="A gift card for Airbnb or a luxury hotel chain. Plan a romantic weekend escape to a cozy cabin, a beach resort, or a vibrant city. The anticipation is part of the fun."
              priceRange="$200-500+"
              category="Travel"
              affiliateLinks={[
                {
                  platform: 'Airbnb',
                  url: 'https://airbnb.com/giftcards',
                  commission: 'Varies',
                  featured: true,
                },
                {
                  platform: 'Hotels.com',
                  url: 'https://hotels.com/giftcards',
                  commission: '4%',
                },
              ]}
            />

            <GiftItem
              name="Private Chef Dinner at Home"
              description="Hire a private chef to come to your home and prepare a gourmet multi-course meal. Enjoy a restaurant-quality experience in the intimacy of your own dining room."
              priceRange="$200-400"
              category="Experience"
              affiliateLinks={[
                {
                  platform: 'Take a Chef',
                  url: 'https://takeachef.com',
                  commission: '5%',
                  featured: true,
                },
              ]}
            />
          </section>

          <section id="jewelry" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Jewelry & Watches
            </h2>
            <p className="mb-8">
              Timeless pieces that symbolize your lasting love. Jewelry is a
              classic anniversary gift for a reason.
            </p>

            <GiftItem
              name="Diamond Anniversary Band"
              description="A stunning diamond ring to stack with her wedding band. Symbolizes the renewal of vows and ongoing commitment. Available in white, yellow, or rose gold."
              priceRange="$500-2,000"
              category="Jewelry"
              affiliateLinks={[
                {
                  platform: 'Blue Nile',
                  url: 'https://bluenile.com/anniversary-rings',
                  commission: '5%',
                  featured: true,
                },
                {
                  platform: 'James Allen',
                  url: 'https://jamesallen.com/rings',
                  commission: '5%',
                },
              ]}
            />

            <GiftItem
              name="Luxury Watch for Him"
              description="A sophisticated timepiece that he'll wear every day. Choose a classic chronograph or a modern dress watch. A practical reminder of your time together."
              priceRange="$300-1,000"
              category="Watches"
              affiliateLinks={[
                {
                  platform: 'Nordstrom',
                  url: 'https://nordstrom.com/mens-watches',
                  commission: '8%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/luxury-mens-watch',
                  commission: '3%',
                },
              ]}
            />
          </section>
          <InlineEmailCapture placement="middle" pageType="landing" />

          <section id="personalized" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Personalized Couple Gifts
            </h2>
            <p className="mb-8">
              Celebrate your unique bond with gifts made just for the two of
              you.
            </p>

            <GiftItem
              name="Custom Soundwave Art"
              description="A visual representation of your wedding vows, first dance song, or simply 'I love you' recorded in your voice. A highly personal and artistic gift."
              priceRange="$40-100"
              category="Art"
              affiliateLinks={[
                {
                  platform: 'Etsy',
                  url: 'https://etsy.com/soundwave-art',
                  commission: '4%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Personalized Adventure Map"
              description="A map where you can pin all the places you've traveled together. A wonderful way to visualize your past adventures and plan future ones."
              priceRange="$50-90"
              category="Home Decor"
              affiliateLinks={[
                {
                  platform: 'Uncommon Goods',
                  url: 'https://uncommongoods.com/adventure-map',
                  commission: '6%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/travel-map',
                  commission: '3%',
                },
              ]}
            />
          </section>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-xl text-center my-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Find Something Truly Unique
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our AI gift finder can help you discover unique anniversary gift
              ideas based on your partner's interests and the number of years
              you've been together.
            </p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition"
            >
              Get Personalized Anniversary Ideas →
            </Link>
          </div>

          <InternalLinks currentPage="/anniversary-gifts" className="my-12" />

          <section id="faq" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What are traditional anniversary gifts by year?
                </h3>
                <p className="text-gray-700">
                  The traditional anniversary gifts are: 1st - Paper, 5th -
                  Wood, 10th - Tin/Aluminum, 25th - Silver, 50th - Gold. These
                  materials symbolize the strength and durability of the
                  marriage as it grows over time.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What is a good 1st anniversary gift?
                </h3>
                <p className="text-gray-700">
                  The traditional 1st anniversary gift is paper. Great ideas
                  include personalized stationery, a custom map of where you
                  met, a book of love poems, tickets to a show (paper!), or a
                  framed wedding photo. The modern alternative is clocks.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What should I get my husband for our anniversary?
                </h3>
                <p className="text-gray-700">
                  For your husband, consider a personalized watch, a weekend
                  getaway, a stylish leather bag, tech gadgets he's been eyeing,
                  or an experience you can share together like a tasting menu
                  dinner. Focus on things that celebrate your time together.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What are romantic anniversary gift ideas?
                </h3>
                <p className="text-gray-700">
                  Romantic anniversary gifts include a couple's spa day, a
                  surprise trip, jewelry with a meaningful engraving, a custom
                  star map of your wedding night, a handwritten love letter, or
                  recreating your first date. Often, the effort and thought
                  count more than the price.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
