
import { Link } from 'react-router-dom';

interface InternalLinksProps {
  currentPage: string;
  className?: string;
}

const allGiftPages = [
  { title: 'Gifts for Mom', url: '/gifts-for-mom', emoji: '👩' },
  { title: 'Gifts for Dad', url: '/gifts-for-dad', emoji: '👨' },
  { title: 'Birthday Gifts', url: '/birthday-gifts', emoji: '🎂' },
  { title: 'Anniversary Gifts', url: '/anniversary-gifts', emoji: '💑' },
  { title: 'Gifts for Boyfriend', url: '/gifts-for-boyfriend', emoji: '💙' },
  { title: 'Gifts for Girlfriend', url: '/gifts-for-girlfriend', emoji: '💝' },
  { title: 'Unique Gifts', url: '/unique-gifts', emoji: '✨' },
];

export default function InternalLinks({
  currentPage,
  className = '',
}: InternalLinksProps) {
  // Show 3 related pages (exclude current page)
  const relatedPages = allGiftPages
    .filter((page) => page.url !== currentPage)
    .slice(0, 3);

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        More Gift Guides You'll Love
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {relatedPages.map((page) => (
          <Link
            key={page.url}
            to={page.url}
            className="group bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="text-3xl mb-2">{page.emoji}</div>
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {page.title}
            </h4>
            <span className="text-sm text-blue-600 group-hover:underline">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
