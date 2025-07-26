import matter from 'gray-matter';

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  image: string;
}

export interface Post extends PostMetadata {
  content: string;
}

export function getSortedPostsData(): PostMetadata[] {
  const modules = import.meta.glob('/src/content/posts/*.md', { eager: true, as: 'raw' });

  const allPostsData = Object.entries(modules).map(([path, rawContent]) => {
    const slug = path.split('/').pop()!.replace(/.md$/, '');
    const { data } = matter(rawContent);

    return {
      slug,
      ...(data as Omit<PostMetadata, 'slug'>),
    };
  });

  return allPostsData.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

export function getPostData(slug: string): Post | undefined {
  const modules = import.meta.glob('/src/content/posts/*.md', { eager: true, as: 'raw' });
  const postPath = `/src/content/posts/${slug}.md`;

  if (modules[postPath]) {
    const rawContent = modules[postPath];
    const { data, content } = matter(rawContent);

    return {
      slug,
      content,
      ...(data as Omit<PostMetadata, 'slug'>),
    };
  }

  return undefined;
} 