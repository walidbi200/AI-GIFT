import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

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
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as Omit<PostMetadata, 'slug'>),
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostData(slug: string): Post {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    ...(matterResult.data as Omit<PostMetadata, 'slug'>),
  };
} 