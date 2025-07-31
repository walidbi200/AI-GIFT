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

// This function gets metadata for all posts and sorts them by date
export function getSortedPostsData(): PostMetadata[] {
  const modules = import.meta.glob('/src/content/posts/*.md', { eager: true });

  const allPostsData = Object.values(modules).map((module: any) => {
    const { frontmatter } = module;
    return {
      slug: frontmatter.slug,
      ...frontmatter,
    } as PostMetadata;
  });

  return allPostsData.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

// This function gets the full content for a single post
export function getPostData(slug: string): Post | undefined {
  const modules = import.meta.glob('/src/content/posts/*.md', { eager: true });

  for (const path in modules) {
    const module: any = modules[path];
    if (module.frontmatter.slug === slug) {
      return {
        slug: module.frontmatter.slug,
        content: module.default, // The HTML content
        ...module.frontmatter,
      } as Post;
    }
  }

  return undefined;
} 