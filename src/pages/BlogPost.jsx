import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostBySlug } from '../services/blogService';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchPostBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    loadPost();
  }, [slug]);

  if (loading) {
    return <div className="text-center mt-12 text-xl text-amber-400 animate-pulse">Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-slate mb-6">The article you are looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="px-6 py-3 bg-cyan text-navy font-bold rounded-lg hover:bg-cyan/80 transition-all">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4 text-white">
      {/* Back Link */}
      <Link to="/blog" className="text-amber-400 hover:text-amber-300 transition-colors text-sm mb-6 inline-block">
        ← Back to all articles
      </Link>

      {/* Article Header */}
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan/20 text-cyan mb-4 inline-block">
        {post.type ? post.type.replace('_', ' ') : 'Article'}
      </span>
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-slate text-sm mb-8">Published on {new Date(post.publishedAt || Date.now()).toLocaleDateString()}</p>

      {/* Cover Image */}
      {post.coverImage && (
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-96 object-cover rounded-2xl mb-8 border border-slate/40 shadow-xl" 
        />
      )}

      {/* Video SEO Placeholder Section (Ready for future video uploads) */}
      <div className="mb-8 p-6 bg-slate/20 rounded-2xl border border-slate/40">
        <h3 className="text-lg font-bold text-cyan mb-2">Featured Video Breakdown</h3>
        <p className="text-slate text-sm mb-4">Video review and SEO breakdown coming soon.</p>
        <div className="relative aspect-video bg-slate/40 rounded-xl overflow-hidden flex items-center justify-center border border-slate/50">
          <span className="text-slate/60 text-sm italic">Video player placeholder</span>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-slate leading-relaxed space-y-4">
        {post.content}
      </div>
    </article>
  );
}