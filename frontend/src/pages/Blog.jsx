import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { LoadingState, ErrorState } from '../components/States';
import { getBlogPosts } from '../api/client';

export default function Blog() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch(() => setError(true));
  }, []);

  return (
    <Layout>
      <section className="bg-ink text-cream py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl"><em>Insights</em></h1>
          <p className="mt-4 text-cream/75 max-w-xl">
            Notes on workforce technology, hiring and where AI actually helps.
          </p>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          {error && <ErrorState />}
          {!error && !posts && <LoadingState label="Loading posts…" />}
          {posts && posts.length === 0 && (
            <p className="text-muted">No posts published yet — check back soon.</p>
          )}
          {posts && posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block py-8 border-t border-ink/10 last:border-b group"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="text-2xl group-hover:text-gold transition-colors">{post.title}</h2>
                {post.publishedAt && (
                  <span className="text-xs text-muted shrink-0">
                    {new Date(post.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              {post.excerpt && <p className="mt-2 text-muted text-[15px] max-w-xl">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}