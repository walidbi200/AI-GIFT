export interface Post {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  readTime?: string;
  image?: string;
  tags?: string[];
}
