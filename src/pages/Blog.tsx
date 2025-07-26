import React from 'react';
import { Link } from 'react-router-dom';
import { getSortedPostsData, PostMetadata } from '../utils/postLoader';

const BlogPage: React.FC = () => {
  // In a real implementation, you would get this data from your post loader utility.
  // For now, we'll use placeholder data that includes the new fields.
  const allPostsData: PostMetadata[] = [
    {
      slug: 'tested-switch-accessories',
      title: 'I Tested 10 Switch Accessories: Here Are the 3 That Are Actually Worth the Money',
      description: 'To save you the trouble, I bought and tested 10 of the most popular Nintendo Switch accessories. Here are the winners.',
      date: '2025-07-26',
      tags: ['Gaming', 'Tech'],
      image: 'https://images.unsplash.com/photo-1554224154-260325c05c0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxuaW50ZW5kbyUyMHN3aXRjaHxlbnwwfHx8fDE2MjkxNzU4OTM&ixlib=rb-1.2.1&q=80&w=1080'
    },
    {
      slug: 'unique-gifts-for-gamers',
      title: 'My Experience Gifting These 5 Unique Items to a Lifelong Gamer',
      description: 'Finding a truly unique gift for a gamer is tough. I went on a mission to find 5 items that arent just another headset or mousepad.',
      date: '2025-07-25',
      tags: ['Gift Guides', 'Gaming'],
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGdhbWluZ3xlbnwwfHx8fDE2MjkxNzU5MjM&ixlib=rb-1.2.1&q=80&w=1080'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {allPostsData.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.slug} className="block group">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform duration-300 ease-in-out group-hover:scale-[1.03] group-hover:shadow-xl">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary px-2 py-1 rounded-full mr-2">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1 mb-4 flex-grow">
                  {post.description}
                </p>
                <p className="text-xs text-gray-400 mt-auto">
                  📅 {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPage; 