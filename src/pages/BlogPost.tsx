import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostData, Post } from '../utils/postLoader';
import { marked } from 'marked';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) return <div>Post not found!</div>;

  const post: Post = getPostData(slug);
  const htmlContent = marked(post.content);

  return (
    <div className="space-y-6">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default BlogPost; 