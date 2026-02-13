import React from 'react';
import { Link } from 'react-router-dom';

interface RelatedGuide {
    title: string;
    description: string;
    url: string;
}

interface RelatedGiftGuidesProps {
    currentPage: string;
}

export default function RelatedGiftGuides({ currentPage }: RelatedGiftGuidesProps) {
    const allGuides: Record<string, RelatedGuide> = {
        'gifts-for-mom': {
            title: 'Gifts for Mom',
            description: 'Thoughtful ideas for your mother',
            url: '/gifts-for-mom'
        },
        'gifts-for-dad': {
            title: 'Gifts for Dad',
            description: 'Practical gifts he\'ll use',
            url: '/gifts-for-dad'
        },
        'birthday-gifts': {
            title: 'Birthday Gifts',
            description: 'Perfect for any birthday',
            url: '/birthday-gifts'
        },
        'anniversary-gifts': {
            title: 'Anniversary Gifts',
            description: 'Romantic anniversary ideas',
            url: '/anniversary-gifts'
        },
        'gifts-for-boyfriend': {
            title: 'Gifts for Boyfriend',
            description: 'Ideas he\'ll actually love',
            url: '/gifts-for-boyfriend'
        },
        'gifts-for-girlfriend': {
            title: 'Gifts for Girlfriend',
            description: 'Romantic and thoughtful ideas',
            url: '/gifts-for-girlfriend'
        },
        'unique-gifts': {
            title: 'Unique Gifts',
            description: 'Creative and memorable gift ideas',
            url: '/unique-gifts'
        }
    };

    const relatedGuides = Object.entries(allGuides)
        .filter(([key]) => key !== currentPage)
        .slice(0, 3)
        .map(([, guide]) => guide);

    return (
        <div className="mt-16 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                More Gift Guides
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
                {relatedGuides.map((guide) => (
                    <Link
                        key={guide.url}
                        to={guide.url}
                        className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition"
                    >
                        <h4 className="font-semibold text-gray-900 mb-2">{guide.title}</h4>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
