import matter from 'gray-matter';

export interface PostMetadata {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  image: string;
  author: string;
  readTime: string;
}

export interface Post extends PostMetadata {
  content: string;
}

export function getSortedPostsData(): PostMetadata[] {
  const modules = import.meta.glob('/src/content/posts/*.md', { query: '?raw', import: 'default', eager: true });

  const allPostsData = Object.entries(modules).map(([path, rawContent]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const { data } = matter(rawContent as string);

    return {
      slug,
      ...(data as Omit<PostMetadata, 'slug'>),
    };
  });

  return allPostsData.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

export function getPostData(slug: string): Post | undefined {
  const modules = import.meta.glob('/src/content/posts/*.md', { query: '?raw', import: 'default', eager: true });
  const postPath = `/src/content/posts/${slug}.md`;

  const rawContent = modules[postPath] as string | undefined;

  if (rawContent) {
    const { data, content } = matter(rawContent);

    return {
      slug,
      content,
      ...(data as Omit<PostMetadata, 'slug'>),
    };
  }

  return undefined;
} 