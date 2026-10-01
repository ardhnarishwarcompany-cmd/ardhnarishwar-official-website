import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getBlogPostBySlug, mediaUrl } from '../api/client';
import { emphasizeLastWord } from '../utils/emphasize';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPost(null);
    setError(null);
    getBlogPostBySlug(slug)
      .then(setPost)
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <Layout>
        <ErrorState message="We couldn't find that post." />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 px-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/blog" className="text-sm text-muted hover:text-gold">← All insights</Link>
          <h1 className="mt-6 text-3xl md:text-4xl">{emphasizeLastWord(post.title)}</h1>
          <div className="mt-4 text-sm text-muted flex gap-3">
            {post.author && <span>{post.author}</span>}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            )}
          </div>
          {post.coverImageUrl && (
            <img src={mediaUrl(post.coverImageUrl)} alt="" className="mt-8 w-full rounded-sm" />
          )}
          <div className="mt-10 text-[16px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </section>
    </Layout>
  );
}