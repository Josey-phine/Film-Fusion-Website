import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBlogPosts } from '../services/blogService';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchBlogPosts();
      setPosts(data);
      setLoading(false);
    };
    loadPosts();
  }, []);

  if (loading) {
    return <div className="text-center mt-12 text-xl text-amber-400 animate-pulse">Loading articles...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 text-white">
      <h1 className="text-3xl font-bold mb-2 border-l-4 border-cyan pl-3">FilmFusion Editorial & Blog</h1>
      <p className="text-slate mb-8">Discover movie insights, daily highlights, and deep-dive recommendations.</p>

      {posts.length === 0 ? (
        <div className="text-center text-slate py-12">No blog posts available yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className="bg-slate/30 rounded-xl overflow-hidden border border-slate/40 hover:border-cyan transition-all duration-300 flex flex-col group"
            >
              {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan/20 text-cyan mb-3 inline-block">
                    {post.type ? post.type.replace('_', ' ') : 'Article'}
                  </span>
                  <h2 className="text-xl font-bold group-hover:text-cyan transition-colors mb-2">{post.title}</h2>
                  <p className="text-slate text-sm line-clamp-3">{post.excerpt || post.content}</p>
                </div>
                <div className="mt-4 text-amber-400 text-sm font-semibold flex items-center gap-1">
                  Read Article →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}