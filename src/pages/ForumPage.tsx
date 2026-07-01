import { useEffect, useState, type FormEvent } from 'react';
import { Home, Leaf, Layers, ShoppingBag, Wrench, Settings, HelpCircle, Plus, Search, SlidersHorizontal, Heart, MessageSquare, Share2, MoreHorizontal, Bell, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  title: string;
  body: string;
  image_url: string | null;
  tags: string[];
  likes: number;
  comments: number;
  posted_ago: string;
}

interface Props {
  onNavigate: (page: string) => void;
}

const sidebarItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'crops', icon: Leaf, label: 'Crops' },
  { id: 'soil', icon: Layers, label: 'Soil' },
  { id: 'market', icon: ShoppingBag, label: 'Market' },
  { id: 'equipment', icon: Wrench, label: 'Equipment' },
];

export default function ForumPage({ onNavigate }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeNav, setActiveNav] = useState('market');
  const [search, setSearch] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState({
    author_name: '',
    author_role: 'Farmer',
    title: '',
    body: '',
    image_url: '',
    tags: '',
  });

  useEffect(() => {
    // Keep UI responsive even if Supabase env vars are missing.
    if (!supabase) return;

    supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
      })
      .then(() => undefined, () => {
        // swallow errors so the page doesn't blank
      });

  }, []);



  const handleSubmitPost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = draft.title.trim();
    const body = draft.body.trim();
    const authorName = draft.author_name.trim();

    if (!title || !body || !authorName) {
      return;
    }

    setSubmitting(true);

    const newPost: Post = {
      id: `${Date.now()}`,
      author_name: authorName,
      author_role: draft.author_role.trim() || 'Farmer',
      author_avatar: null,
      title,
      body,
      image_url: draft.image_url.trim() || null,
      tags: draft.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      likes: 0,
      comments: 0,
      posted_ago: 'just now',
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          author_name: newPost.author_name,
          author_role: newPost.author_role,
          author_avatar: newPost.author_avatar,
          title: newPost.title,
          body: newPost.body,
          image_url: newPost.image_url,
          tags: newPost.tags,
          likes: newPost.likes,
          comments: newPost.comments,
          posted_ago: newPost.posted_ago,
        })
        .select('*')
        .single();

      if (!error && data) {
        setPosts(prev => [data as Post, ...prev]);
      }
    } else {
      setPosts(prev => [newPost, ...prev]);
    }

    setDraft({ author_name: '', author_role: 'Farmer', title: '', body: '', image_url: '', tags: '' });
    setShowComposer(false);
    setSubmitting(false);
  };

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-forest-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0 flex flex-col bg-forest-900 border-r border-neon-green/10">
        {/* Brand */}
        <div className="p-4 border-b border-neon-green/10">
          <h1 className="text-lg font-bold text-white">AgriLens</h1>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 bg-neon-green/10 border border-neon-green/25 rounded flex items-center justify-center">
              <Leaf size={11} className="text-neon-green" />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-medium leading-tight">Field Navigator</p>
              <p className="text-[8px] font-mono text-neon-green/60 uppercase tracking-wider">Active Stewardship</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {sidebarItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`sidebar-item ${activeNav === id ? 'active' : ''}`}
            >
              <Icon size={15} className="flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-neon-green/10 flex flex-col gap-0.5">
          <button className="sidebar-item">
            <Settings size={14} />
            <span className="text-sm">Settings</span>
          </button>
          <button className="sidebar-item">
            <HelpCircle size={14} />
            <span className="text-sm">Support</span>
          </button>
        </div>

        {/* New Post btn */}
        <div className="p-3 pt-0">
          <button
            onClick={() => setShowComposer(true)}
            className="outline-btn w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={14} className="text-neon-green" />
            New Post
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-forest-900 border-b border-neon-green/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-neon-green">Farmer Community Forum</h2>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg bg-forest-800/60 border border-white/10 flex items-center justify-center hover:border-neon-green/30 transition-colors">
              <Bell size={15} className="text-white/50" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-green" />
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 bg-forest-800/60 border border-white/10 rounded-lg px-3 py-1.5 hover:border-neon-green/30 transition-colors"
            >
              <User size={13} className="text-white/50" />
              <span className="text-xs text-white/50">Account</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* Search + actions */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search agricultural insights..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-forest-800/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-neon-green/35 transition-colors"
              />
            </div>
            <button className="outline-btn px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm whitespace-nowrap">
              <SlidersHorizontal size={14} className="text-neon-green/70" />
              Filters
            </button>
            <button
              onClick={() => setShowComposer(true)}
              className="neon-btn px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Plus size={14} />
              New Post
            </button>
          </div>

          {/* Posts */}
          <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="card-dark rounded-xl p-8 text-center">
                <p className="text-sm text-white/30 font-mono">Loading posts...</p>
              </div>
            ) : filtered.map(post => (
              <article key={post.id} className="card-dark rounded-xl overflow-hidden hover:border-neon-green/30 transition-colors">
                <div className="p-5">
                  {/* Author row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-neon-green/30 flex-shrink-0" style={{ boxShadow: '0 0 10px rgba(57,211,83,0.2)' }}>
                        {post.author_avatar
                          ? <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-neon-green/20 flex items-center justify-center text-neon-green text-sm font-bold">{post.author_name[0]}</div>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{post.author_name}</p>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{post.posted_ago} &bull; {post.author_role}</p>
                      </div>
                    </div>
                    <button className="text-white/30 hover:text-white/60 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Title + body */}
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{post.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{post.body}</p>

                  {/* Image */}
                  {post.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden h-44 relative">
                      <img src={post.image_url} alt="Post" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 grid-bg opacity-20" />
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-mono text-neon-green border border-neon-green/30 rounded px-2 py-0.5 uppercase tracking-wider bg-neon-green/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5 px-5 py-3 border-t border-neon-green/8">
                  <button className="flex items-center gap-1.5 text-white/35 hover:text-red-400 transition-colors">
                    <Heart size={14} />
                    <span className="text-xs">{post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors">
                    <MessageSquare size={14} />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="ml-auto text-white/25 hover:text-white/50 transition-colors">
                    <Share2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neon-green/20 bg-forest-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-neon-green/70">Community Post</p>
                <h3 className="text-xl font-semibold text-white">Share a farm update</h3>
              </div>
              <button
                onClick={() => setShowComposer(false)}
                className="rounded-lg border border-white/10 p-2 text-white/40 hover:text-white/70"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={draft.author_name}
                  onChange={e => setDraft({ ...draft, author_name: e.target.value })}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
                />
                <input
                  value={draft.author_role}
                  onChange={e => setDraft({ ...draft, author_role: e.target.value })}
                  placeholder="Role (e.g. Farmer, Agronomist)"
                  className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
                />
              </div>

              <input
                value={draft.title}
                onChange={e => setDraft({ ...draft, title: e.target.value })}
                placeholder="Post title"
                className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
              />

              <textarea
                value={draft.body}
                onChange={e => setDraft({ ...draft, body: e.target.value })}
                placeholder="Share what’s happening on your farm, your insights, and what other farmers should know."
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={draft.image_url}
                  onChange={e => setDraft({ ...draft, image_url: e.target.value })}
                  placeholder="Image URL (optional)"
                  className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
                />
                <input
                  value={draft.tags}
                  onChange={e => setDraft({ ...draft, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="w-full rounded-xl border border-white/10 bg-forest-800/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/35"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="neon-btn rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? 'Posting...' : 'Publish post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
