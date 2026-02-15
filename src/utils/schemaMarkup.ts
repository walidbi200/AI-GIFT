export const schemaMarkup = {
    // Organization Schema (Homepage only)
    organization: () => ({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Smart Gift Finder",
        "url": "https://www.smartgiftfinder.xyz",
        "logo": "https://www.smartgiftfinder.xyz/logo.png",
        "description": "AI-powered gift recommendation platform helping you find the perfect gift for any occasion",
        "foundingDate": "2025",
        "sameAs": [
            "https://twitter.com/smartgiftfinder",
            "https://pinterest.com/smartgiftfinder"
        ]
    }),

    // WebSite with SearchAction (Homepage only)
    website: () => ({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Smart Gift Finder",
        "url": "https://www.smartgiftfinder.xyz",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.smartgiftfinder.xyz/?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    }),

    // BreadcrumbList (All pages except homepage)
    breadcrumbs: (items: Array<{ name: string; url: string }>) => ({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    }),

    // FAQPage (For pages with FAQ sections)
    faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    }),

    // Article Schema (Blog posts)
    article: (data: {
        headline: string;
        description: string;
        datePublished: string;
        dateModified: string;
        image?: string;
    }) => ({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.headline,
        "description": data.description,
        "datePublished": data.datePublished,
        "dateModified": data.dateModified,
        "image": data.image || "https://www.smartgiftfinder.xyz/smart-gift-finder-og.jpg",
        "author": {
            "@type": "Organization",
            "name": "Smart Gift Finder"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Smart Gift Finder",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.smartgiftfinder.xyz/logo.png"
            }
        }
    }),

    // CollectionPage (Landing pages)
    collectionPage: (data: {
        name: string;
        description: string;
        url: string;
    }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": data.name,
        "description": data.description,
        "url": data.url
    })
};

// Helper function
export function injectSchema(schema: object): string {
    return JSON.stringify(schema);
}
