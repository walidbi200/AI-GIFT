import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
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

const GiftItem: React.FC<GiftItemProps> = ({
  name,
  description,
  priceRange,
  category,
  affiliateLinks,
}) => {
  return (
    <div className="border-l-4 border-green-500 pl-6 my-8">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
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
              // Track affiliate click
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
                ? 'bg-green-600 text-white hover:bg-green-700'
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

import { schemaMarkup, injectSchema } from '../utils/schemaMarkup';
import InternalLinks from '../components/seo/InternalLinks';

// ... (keep intermediate content)

export default function GiftsForDad() {
  useScrollDepth('gifts-for-dad');
  useTimeOnPage('gifts-for-dad');

  return (
    <>
      <Helmet>
        <title>
          Best Gifts for Dad [2025] - 25+ Ideas He'll Use | Smart Gift Finder
        </title>
        <meta
          name="title"
          content="Best Gifts for Dad [2025] - 25+ Ideas He'll Use | Smart Gift Finder"
        />
        <meta
          name="description"
          content="🎁 Perfect gifts for dad 2025! 25+ practical ideas from $10-$500. Tech gadgets, tools, experiences he'll love. Free recommendations ⚡"
        />
        <meta
          name="keywords"
          content="gifts for dad, father's day gifts, birthday gifts for dad, gift ideas for dad, best gifts for father"
        />
        <link
          rel="canonical"
          href="https://www.smartgiftfinder.xyz/gifts-for-dad"
        />

        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content="https://www.smartgiftfinder.xyz/gifts-for-dad"
        />
        <meta
          property="og:title"
          content="Best Gifts for Dad [2025] - 25+ Practical Ideas"
        />
        <meta
          property="og:description"
          content="🎁 Unique & practical gifts for dad! Tech, tools, experiences & more. AI-powered recommendations."
        />
        <meta
          property="og:image"
          content="https://www.smartgiftfinder.xyz/images/gifts-for-dad-og.jpg"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="https://www.smartgiftfinder.xyz/gifts-for-dad"
        />
        <meta property="twitter:title" content="Best Gifts for Dad [2025]" />
        <meta
          property="twitter:description"
          content="25+ practical gift ideas for dad"
        />
        <meta
          property="twitter:image"
          content="https://www.smartgiftfinder.xyz/images/gifts-for-dad-twitter.jpg"
        />

        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.collectionPage({
              name: 'Best Gifts for Dad',
              description: 'Discover 25+ practical gift ideas for dad',
              url: 'https://www.smartgiftfinder.xyz/gifts-for-dad',
            })
          )}
        </script>
        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.breadcrumbs([
              { name: 'Home', url: 'https://www.smartgiftfinder.xyz/' },
              {
                name: 'Gifts for Dad',
                url: 'https://www.smartgiftfinder.xyz/gifts-for-dad',
              },
            ])
          )}
        </script>
        <script type="application/ld+json">
          {injectSchema(
            schemaMarkup.faqPage([
              {
                question: 'What are the best gifts for dad?',
                answer:
                  'The best gifts for dad are often practical, gadget-oriented, or tied to his hobbies. Think grilling accessories, smart home devices, high-quality tools, whiskey sets, or personalized leather goods.',
              },
              {
                question: 'What should I get my dad for his birthday?',
                answer:
                  "For dad's birthday, consider upgrading something he uses daily, like a wallet or coffee maker. Alternatively, gift him an experience like a brewery tour, golf lesson, or tickets to a sports game.",
              },
              {
                question:
                  'What are unique gifts for the dad who has everything?',
                answer:
                  'For the dad who has everything, go for unique consumable gifts like a hot sauce subscription or craft beer box. Personalized items like an engraved hammer or custom family portrait are also great choices.',
              },
              {
                question: 'What are good gifts for dad under $50?',
                answer:
                  'Great gifts for dad under $50 include digital tire pressure gauges, BBQ spice rub sets, personalized keychains, funny socks, or a high-quality insulated tumbler.',
              },
              {
                question: "What is a good Father's Day gift?",
                answer:
                  "A good Father's Day gift shows appreciation for his role. Classic options include grooming kits, watches, or tech gadgets. Adding a personal note or card makes it even more special.",
              },
            ])
          )}
        </script>
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link to="/" className="hover:text-green-600">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">Gifts for Dad</li>
          </ol>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Best Gifts for Dad [2025] - Ideas He'll Actually Use
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Skip the tie and get dad something he'll genuinely appreciate. From
            tech gadgets to outdoor gear, these 25+ gift ideas are practical,
            thoughtful, and perfect for Father's Day, birthdays, or just because
            he deserves it.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>📅 Updated: February 2026</span>
            <span>⏱️ 10 min read</span>
            <span>🎁 25+ gift ideas</span>
          </div>
        </header>

        <AffiliateDisclosure />
        <InlineEmailCapture placement="top" pageType="landing" />

        <div className="bg-green-50 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <ul className="space-y-2">
            <li>
              <a href="#tech" className="text-green-600 hover:underline">
                → Tech Gadgets & Electronics
              </a>
            </li>
            <li>
              <a href="#hobbies" className="text-green-600 hover:underline">
                → Hobby & Outdoor Gear
              </a>
            </li>
            <li>
              <a href="#experiences" className="text-green-600 hover:underline">
                → Experience Gifts
              </a>
            </li>
            <li>
              <a href="#practical" className="text-green-600 hover:underline">
                → Practical Everyday Items
              </a>
            </li>
            <li>
              <a href="#budget" className="text-green-600 hover:underline">
                → Budget-Friendly Under $50
              </a>
            </li>
            <li>
              <a href="#faq" className="text-green-600 hover:underline">
                → Frequently Asked Questions
              </a>
            </li>
          </ul>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="lead">
            Finding the perfect gift for dad doesn't have to be difficult.
            Whether he's a tech enthusiast, outdoor adventurer, DIY expert, or
            just enjoys the simple things, this guide has something for every
            type of dad.
          </p>

          <section id="tech" className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Tech Gadgets & Electronics
            </h2>
            <p className="mb-8">
              Dads love practical tech that makes life easier or enhances their
              favorite activities. These gadgets combine functionality with cool
              factor.
            </p>

            <GiftItem
              name="Premium Wireless Noise-Canceling Headphones"
              description="High-quality over-ear headphones with active noise cancellation, 30-hour battery life, and supreme comfort. Perfect for music lovers, commuters, or dads who need peace and quiet. Premium sound quality rivals top brands at a better price."
              priceRange="$150-300"
              category="Electronics"
              affiliateLinks={[
                {
                  platform: 'Best Buy',
                  url: 'https://bestbuy.com/wireless-headphones',
                  commission: '1%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/wireless-headphones',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Smart Watch with Fitness Tracking"
              description="Feature-rich smartwatch that tracks fitness, monitors heart rate, receives notifications, and has GPS. Water-resistant with week-long battery life. Great for active dads who want to stay connected and healthy."
              priceRange="$200-450"
              category="Electronics"
              affiliateLinks={[
                {
                  platform: 'Best Buy',
                  url: 'https://bestbuy.com/smart-watches',
                  commission: '1%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/smart-watches',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Portable Bluetooth Speaker"
              description="Waterproof Bluetooth speaker with 360-degree sound and 20-hour battery. Perfect for the garage, backyard BBQs, camping trips, or anywhere dad enjoys music. Compact yet powerful audio quality."
              priceRange="$80-150"
              category="Electronics"
              affiliateLinks={[
                {
                  platform: 'Best Buy',
                  url: 'https://bestbuy.com/bluetooth-speakers',
                  commission: '1%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/bluetooth-speakers',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Tablet for Reading and Entertainment"
              description="Lightweight tablet perfect for reading, streaming shows, browsing recipes, or checking sports scores. Long battery life and crisp display. Ideal for dads who love their downtime."
              priceRange="$150-350"
              category="Electronics"
              affiliateLinks={[
                {
                  platform: 'Best Buy',
                  url: 'https://bestbuy.com/tablets',
                  commission: '1%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/tablets',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="High-Speed Phone Charging Station"
              description="Multi-device charging station with fast wireless charging pads and USB ports. Organizes all his devices in one spot. Keeps the nightstand or desk clutter-free while ensuring everything stays charged."
              priceRange="$40-80"
              category="Electronics"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/charging-station',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />
          </section>

          <section id="hobbies" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Hobby & Outdoor Gear
            </h2>
            <p className="mb-8">
              Support dad's hobbies with gear that enhances his favorite
              activities, whether that's grilling, fishing, golf, or working in
              the garage.
            </p>

            <GiftItem
              name="Premium BBQ Tool Set"
              description="Professional-grade stainless steel grilling tools including spatula, tongs, fork, and basting brush. Comes in a durable carrying case. Perfect for the dad who takes his grilling seriously."
              priceRange="$50-90"
              category="Outdoor"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/bbq-tools',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Quality Multi-Tool with Leather Sheath"
              description="Premium multi-tool with 15+ functions including knife, pliers, screwdrivers, wire cutters, and bottle opener. Stainless steel construction with lifetime warranty. Every dad needs one of these."
              priceRange="$60-120"
              category="Tools"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/multi-tool',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Insulated Tumbler for Hot or Cold Drinks"
              description="Double-wall vacuum insulated tumbler keeps drinks cold for 24 hours or hot for 12 hours. Fits in car cup holder. Perfect for coffee on the commute or cold beer while grilling."
              priceRange="$30-50"
              category="Drinkware"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/insulated-tumbler',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Premium Golf Accessories Kit"
              description="Complete golf gift set with personalized golf balls, tees, divot tool, ball marker, and towel. Comes in a nice presentation box. Ideal for golf-loving dads."
              priceRange="$45-75"
              category="Sports"
              affiliateLinks={[
                {
                  platform: 'Fanatics',
                  url: 'https://fanatics.com/golf-accessories',
                  commission: '6%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/golf-accessories',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Workshop Tool Organizer System"
              description="Magnetic tool holder and organizer for the garage or workshop. Keeps tools visible, accessible, and organized. Heavy-duty construction mounts easily to walls. Makes finding the right tool effortless."
              priceRange="$35-60"
              category="Tools"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/tool-organizer',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />
          </section>

          <section id="experiences" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Experience Gifts Dad Will Remember
            </h2>
            <p className="mb-8">
              Sometimes the best gifts aren't things, but memories. These
              experience gifts give dad something to look forward to and stories
              to tell.
            </p>

            <GiftItem
              name="Brewery or Distillery Tour with Tasting"
              description="Guided tour of a local craft brewery or distillery with behind-the-scenes access and tasting flight. Learn about the brewing process while sampling premium beers or spirits. Great for craft beer or whiskey enthusiasts."
              priceRange="$50-100"
              category="Experiences"
              affiliateLinks={[
                {
                  platform: 'Virgin Experience Days',
                  url: 'https://virginexperiencedays.com/brewery-tours',
                  commission: '10%',
                  featured: true,
                },
                {
                  platform: 'Groupon',
                  url: 'https://groupon.com/brewery-tours',
                  commission: '8%',
                },
              ]}
            />

            <GiftItem
              name="Golf Lesson with Pro Instructor"
              description="Private or semi-private golf lesson with PGA professional. Includes video analysis, personalized tips, and practice time. Perfect for improving his game or getting started in golf."
              priceRange="$75-150"
              category="Experiences"
              affiliateLinks={[
                {
                  platform: 'Virgin Experience Days',
                  url: 'https://virginexperiencedays.com/golf-lessons',
                  commission: '10%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Sports Game Tickets"
              description="Tickets to see his favorite team play live. Choose from baseball, basketball, football, or hockey. Nothing beats the excitement of live sports. Make it extra special with premium seating."
              priceRange="$100-500"
              category="Experiences"
              affiliateLinks={[
                {
                  platform: 'Fanatics',
                  url: 'https://fanatics.com/tickets',
                  commission: '6%',
                  featured: true,
                },
                {
                  platform: 'StubHub',
                  url: 'https://stubhub.com',
                  commission: 'Varies',
                },
              ]}
            />

            <GiftItem
              name="Fishing Charter Experience"
              description="Half-day or full-day fishing charter with experienced captain and all equipment provided. Great for avid anglers or dads who want to try something new. Most charters include fish cleaning service."
              priceRange="$200-400"
              category="Experiences"
              affiliateLinks={[
                {
                  platform: 'Virgin Experience Days',
                  url: 'https://virginexperiencedays.com/fishing',
                  commission: '10%',
                  featured: true,
                },
              ]}
            />
          </section>
          <InlineEmailCapture placement="middle" pageType="landing" />

          <section id="practical" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Practical Gifts for Everyday Use
            </h2>
            <p className="mb-8">
              These useful gifts make dad's daily routine better and remind him
              you care every time he uses them.
            </p>

            <GiftItem
              name="Quality Leather Wallet"
              description="Slim bifold or trifold wallet made from genuine leather. RFID blocking technology protects credit cards. Classic design with multiple card slots and bill compartment. Develops beautiful patina over time."
              priceRange="$40-80"
              category="Accessories"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/leather-wallet',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Premium Coffee Maker with Thermal Carafe"
              description="Programmable coffee maker with thermal carafe that keeps coffee hot for hours. Customizable brew strength, auto-start timer, and easy cleanup. Makes mornings better for coffee-loving dads."
              priceRange="$80-150"
              category="Kitchen"
              affiliateLinks={[
                {
                  platform: 'Best Buy',
                  url: 'https://bestbuy.com/coffee-makers',
                  commission: '1%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/coffee-makers',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Personalized Whiskey Decanter Set"
              description="Elegant whiskey decanter with matching glasses, all personalized with his name or initials. Comes in a wooden presentation box. Perfect for the dad who appreciates a good pour."
              priceRange="$70-120"
              category="Barware"
              affiliateLinks={[
                {
                  platform: 'Personalization Mall',
                  url: 'https://personalizationmall.com/whiskey-decanter',
                  commission: '8%',
                  featured: true,
                },
                {
                  platform: 'Etsy',
                  url: 'https://etsy.com/whiskey-decanter',
                  commission: '4%',
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/whiskey-decanter',
                  commission: '3%',
                },
              ]}
            />

            <GiftItem
              name="Electric Wine Opener Gift Set"
              description="Rechargeable electric wine opener with foil cutter, aerator, and pourer. Opens bottles in seconds with the press of a button. Includes charging base and elegant storage case."
              priceRange="$30-60"
              category="Kitchen"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/wine-opener',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />
          </section>

          <section id="budget" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Budget-Friendly Gifts Under $50
            </h2>
            <p className="mb-8">
              You don't need to spend a fortune to get dad something great.
              These thoughtful gifts under $50 show you care without breaking
              the bank.
            </p>

            <GiftItem
              name="Craft Beer Sampler Pack"
              description="Curated selection of 12 craft beers from local or regional breweries. Includes variety of styles from IPAs to stouts. Perfect for beer enthusiasts who love trying new brews."
              priceRange="$25-40"
              category="Food & Drink"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/craft-beer',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Funny Graphic T-Shirt Collection"
              description="Comfortable cotton t-shirt with humorous dad joke or hobby-related graphic. Multiple sizes and colors available. Great for weekends and casual wear."
              priceRange="$20-35"
              category="Apparel"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/funny-tshirts',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Premium BBQ Sauce and Rub Gift Set"
              description="Gourmet BBQ sauce and dry rub collection from award-winning pitmasters. Includes multiple flavors and heat levels. Perfect for grillmasters who love experimenting with new flavors."
              priceRange="$30-45"
              category="Food"
              affiliateLinks={[
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/bbq-sauce-set',
                  commission: '3%',
                  featured: true,
                },
              ]}
            />

            <GiftItem
              name="Personalized Keychain Multi-Tool"
              description="Compact multi-tool keychain with bottle opener, screwdrivers, and ruler. Engraved with name or special message. Practical gift he'll use daily."
              priceRange="$15-30"
              category="Accessories"
              affiliateLinks={[
                {
                  platform: 'Personalization Mall',
                  url: 'https://personalizationmall.com/keychain',
                  commission: '8%',
                  featured: true,
                },
                {
                  platform: 'Amazon',
                  url: 'https://amazon.com/keychain-tool',
                  commission: '3%',
                },
              ]}
            />
          </section>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl text-center my-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Not Sure What Dad Would Like?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Use our AI-powered gift finder to get personalized recommendations
              based on dad's hobbies, interests, and your budget. Get 5 unique
              gift ideas in seconds!
            </p>
            <Link
              to="/"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            >
              Find Dad's Perfect Gift →
            </Link>
          </div>

          <InternalLinks currentPage="/gifts-for-dad" className="my-12" />

          <section id="faq" className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What are the best gifts for dad?
                </h3>
                <p className="text-gray-700">
                  The best gifts for dad include tech gadgets, tools for
                  hobbies, experience gifts like sports tickets or brewery
                  tours, personalized items, and quality accessories. Consider
                  his interests, lifestyle, and what he actually needs or wants
                  rather than generic "dad gifts."
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What should I get my dad for his birthday?
                </h3>
                <p className="text-gray-700">
                  For dad's birthday, consider a nice watch, wireless
                  headphones, grilling accessories, a personalized whiskey glass
                  set, sports memorabilia, or an experience like golf lessons or
                  a fishing trip. Practical gifts that match his hobbies tend to
                  be most appreciated.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What are good Father's Day gifts under $50?
                </h3>
                <p className="text-gray-700">
                  Great Father's Day gifts under $50 include multi-tools, BBQ
                  sauce gift sets, personalized keychains, portable phone
                  chargers, craft beer samplers, funny t-shirts, quality coffee
                  or tea, and books on topics he enjoys. Focus on thoughtful
                  items that match his interests.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What do you get a dad who has everything?
                </h3>
                <p className="text-gray-700">
                  For dads who have everything, focus on experiences (concert
                  tickets, cooking classes, adventure activities), consumables
                  (premium coffee, craft beer, gourmet snacks), subscriptions
                  (streaming services, magazines), or donations to his favorite
                  charity in his name. Memories and experiences are often more
                  valuable than physical items.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What should I avoid when buying gifts for dad?
                </h3>
                <p className="text-gray-700">
                  Avoid novelty ties (unless he actually wears them), generic
                  gift cards without thought, anything he already has, cheap
                  tools that won't last, or gifts that feel like obligations
                  (like work-related items). Also avoid joke gifts unless you're
                  sure they match his sense of humor. Focus on quality over
                  quantity and match his actual interests.
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
