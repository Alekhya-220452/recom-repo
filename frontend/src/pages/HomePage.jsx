import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Search, Star, Users, Briefcase, Shield, Zap,
  ArrowRight, CheckCircle, TrendingUp, Globe, Award, BadgeCheck, Newspaper, DollarSign, Clock, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { icon: '💻', label: 'Web Development', count: '1.2k+ jobs' },
  { icon: '🎨', label: 'UI/UX Design', count: '850+ jobs' },
  { icon: '📱', label: 'Mobile Apps', count: '640+ jobs' },
  { icon: '🤖', label: 'AI & Machine Learning', count: '420+ jobs' },
  { icon: '📊', label: 'Data Science', count: '380+ jobs' },
  { icon: '✍️', label: 'Content Writing', count: '920+ jobs' },
  { icon: '📣', label: 'Digital Marketing', count: '710+ jobs' },
  { icon: '🔒', label: 'Cybersecurity', count: '290+ jobs' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', role: 'Frontend Developer', avatar: 'S', rating: 5,
    text: 'Nexlance changed my career. I found amazing clients and grew my income by 3x within 6 months.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Marcus Johnson', role: 'Product Manager at TechCorp', avatar: 'M', rating: 5,
    text: 'We hire exclusively through Nexlance. The quality of talent here is truly exceptional.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Priya Patel', role: 'Full-Stack Engineer', avatar: 'P', rating: 5,
    text: 'The proposal system is so smooth. I book 3–4 new clients every week with minimal effort.',
    color: 'from-emerald-500 to-teal-600',
  },
];

const STATS = [
  { value: '50K+', label: 'Freelancers', icon: <Users className="w-5 h-5" /> },
  { value: '12K+', label: 'Jobs Posted', icon: <Briefcase className="w-5 h-5" /> },
  { value: '$8M+', label: 'Paid Out', icon: <TrendingUp className="w-5 h-5" /> },
  { value: '120+', label: 'Countries', icon: <Globe className="w-5 h-5" /> },
];

const RANKINGS = [
  { rank: '#1', label: 'Best Freelance Platform 2025', org: 'ProductHunt', color: 'from-orange-500 to-red-500' },
  { rank: '#3', label: 'Top Remote Work Tool', org: 'Forbes', color: 'from-blue-500 to-indigo-600' },
  { rank: '#7', label: 'Best SaaS Platform', org: 'G2 Awards', color: 'from-emerald-500 to-teal-600' },
  { rank: 'Top 10', label: 'Most Trusted Marketplace', org: 'TechCrunch', color: 'from-violet-500 to-purple-600' },
];

const PRESS_LOGOS = ['Forbes', 'TechCrunch', 'Wired', 'Bloomberg', 'Reuters', 'Inc.'];

const FEATURES = [
  {
    icon: <DollarSign className="w-7 h-7 text-emerald-400" />,
    title: 'Competitive Rates',
    desc: 'Set your own rates. Earn what you deserve with transparent, escrow-protected payments.',
    color: 'from-emerald-500/10 to-teal-500/5',
    border: 'border-emerald-500/15',
  },
  {
    icon: <Clock className="w-7 h-7 text-blue-400" />,
    title: 'Work on Your Schedule',
    desc: 'Full flexibility — take on projects that fit your lifestyle, from anywhere in the world.',
    color: 'from-blue-500/10 to-indigo-500/5',
    border: 'border-blue-500/15',
  },
  {
    icon: <Sparkles className="w-7 h-7 text-amber-400" />,
    title: 'Build Your Reputation',
    desc: 'Every completed project adds to your verified profile. Grow your credibility over time.',
    color: 'from-amber-500/10 to-orange-500/5',
    border: 'border-amber-500/15',
  },
  {
    icon: <Shield className="w-7 h-7 text-purple-400" />,
    title: 'Protected & Secure',
    desc: 'Your earnings are protected from day one. We ensure fair pay for every project.',
    color: 'from-purple-500/10 to-violet-500/5',
    border: 'border-purple-500/15',
  },
];

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [supportData, setSupportData] = React.useState({ subject: '', category: 'Payment Issue', description: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.q.value;
    navigate(`/jobs?q=${encodeURIComponent(q)}`);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!supportData.subject || !supportData.description) {
      setSubmitStatus('error'); setErrorMessage('Please fill in all required fields.'); return;
    }
    setSubmitting(true); setSubmitStatus(null); setErrorMessage('');
    try {
      const response = await fetch('http://localhost:8000/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(supportData),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setSupportData({ subject: '', category: 'Payment Issue', description: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error'); setErrorMessage(errorData.detail || 'Submission failed.');
      }
    } catch (err) {
      setSubmitStatus('error'); setErrorMessage('Network error. Check your connection.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════
          HERO — Strong Upwork/Fiverr style freelance office bg
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* ─── HERO BACKGROUND — warm collab photo, same as freelancer section ─── */}
        <div className="absolute inset-0"
             style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)' }}>

          {/* Same warm collaborative photo used in the freelancer section */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=95&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: '60% center',
              filter: 'brightness(0.72) saturate(1.15) contrast(1.02)',
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=95&auto=format&fit=crop';
            }}
          />

          {/* Left text scrim — dark on left, fades so right photo shows clearly */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(100deg, rgba(2,6,23,0.92) 0%, rgba(7,14,36,0.85) 28%, rgba(5,10,30,0.55) 50%, rgba(0,0,0,0.15) 68%, transparent 100%)',
          }} />
          {/* Top nav fade */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-slate-950/55 to-transparent" />
          {/* Bottom stats-bar fade */}
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-52 w-full">
          {/* Max width capped at ~half screen so right photo shows through */}
          <div className="max-w-[600px]">

            {/* Live activity badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-semibold mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              2,400+ freelancers hired this week
            </div>

            {/* Main headline — large left-aligned like Upwork/Fiverr */}
            <h1 className="font-black text-white mb-6 leading-[0.9] uppercase"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-0.04em',
                fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
              }}>
              Find the<br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>perfect</span><br />
              freelancer.
            </h1>

            <p className="text-blue-100/80 text-xl md:text-2xl mb-10 max-w-xl leading-relaxed font-medium">
              Work with the world's best talent — vetted professionals for every project, big or small.
            </p>

            {/* Search Bar — Upwork-style white bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mb-8">
              <div className="flex bg-white rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/40">
                <div className="flex-1 flex items-center gap-3 px-6">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Search for any skill or job title..."
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base font-medium outline-none py-4"
                  />
                </div>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 text-sm uppercase tracking-wider transition-all active:scale-[0.97] whitespace-nowrap">
                  Search
                </button>
              </div>
            </form>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <span className="text-white/60 text-base font-medium">Popular:</span>
              {['React Developer', 'UI Designer', 'Python', 'Mobile Apps', 'AI/ML'].map(term => (
                <button key={term} onClick={() => navigate(`/jobs?q=${term}`)}
                  className="text-sm font-semibold text-white/75 hover:text-white border border-white/25 hover:border-white/50 px-4 py-2 rounded-full transition-all hover:bg-white/10">
                  {term}
                </button>
              ))}
            </div>

            {/* CTA Buttons — premium animated */}
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/dashboard"
                  className="group relative inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-full text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.6)] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 15px -3px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>
                  {/* Shine effect */}
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-45deg] group-hover:animate-[shine_1.5s_ease-out]" />
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </Link>
              ) : (
                <>
                  {/* Primary — gradient pill with realistic shine + glow */}
                  <Link to="/signup"
                    className="group relative inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-full text-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.6)] active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                      boxShadow: '0 4px 15px -3px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}>
                    {/* Shine effect */}
                    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-45deg] group-hover:animate-[shine_1.5s_ease-out]" />
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </Link>

                  {/* Secondary — glass pill */}
                  <Link to="/jobs"
                    className="group relative inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-full text-lg overflow-hidden transition-all duration-300 backdrop-blur-md active:scale-95 hover:bg-white/10 hover:-translate-y-1 border border-white/20"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      boxShadow: '0 4px 15px -3px rgba(0,0,0,0.2)',
                    }}>
                    <span className="relative z-10">Browse Jobs</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 justify-center group">
                  <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400 group-hover:bg-blue-500/25 transition-colors border border-blue-500/20">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-white font-black text-2xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                    <div className="text-white/50 text-sm font-semibold">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
                  className="flex items-center gap-2.5 px-5 py-3 bg-white/[0.05] border border-white/[0.09] rounded-xl hover:bg-white/[0.09] transition-all cursor-default group">
                  <span className="text-white/65 font-bold text-base group-hover:text-white/90 transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_55%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-bold uppercase tracking-widest mb-5">Explore Categories</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
              Browse by Category
            </h2>
            <p className="text-white/50 text-lg font-medium max-w-md mx-auto">
              Find the perfect talent or project across any industry
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} to={`/jobs?category=${encodeURIComponent(cat.label)}`}
                className="group flex flex-col items-center p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] hover:bg-blue-500/[0.08] hover:border-blue-500/25 transition-all duration-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/[0.06] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0">{cat.icon}</div>
                <h3 className="text-sm font-bold text-white/75 text-center mb-3 group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{cat.label}</h3>
                <div className="bg-blue-500/10 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">{cat.count}</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/jobs" className="inline-flex items-center gap-2.5 text-white/50 font-semibold text-base hover:text-white transition-all group">
              View all categories <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FREELANCER FEATURES — Mindrift-style (Image 4)
          Full-bleed with photo, why freelancers choose us
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background photo — premium focused freelancer at workstation, distinct from hero */}
        <div className="absolute inset-0"
             style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
          {/*
            Cinematic shot: freelancer focused at a beautiful dual-monitor setup,
            warm ambient desk lighting, bokeh background — totally different vibe from hero.
            Primary photo + two fallbacks to guarantee something always loads.
          */}
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=95&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: '55% 40%',
              filter: 'brightness(0.68) saturate(1.2) contrast(1.06)',
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&q=95&auto=format&fit=crop';
              e.target.onError = () => {
                e.target.src = 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1920&q=95&auto=format&fit=crop';
              };
            }}
          />
          {/* Strong left-side text scrim, vivid right reveals the photo */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(105deg, rgba(2,6,23,0.94) 0%, rgba(4,10,30,0.88) 25%, rgba(3,8,24,0.55) 48%, rgba(0,0,0,0.18) 66%, transparent 100%)',
          }} />
          {/* Subtle teal/emerald tint to echo the green brand CTA */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 75% 60%, rgba(16,185,129,0.07) 0%, transparent 55%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-emerald-300 text-sm font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4" /> For Freelancers
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
              Share what you know,<br />
              <span style={{ background: 'linear-gradient(135deg,#34d399,#059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                shape what's next
              </span>
            </h2>
            <p className="text-white/60 text-xl leading-relaxed font-medium">
              Help clients build great products — leverage your expertise, earn on your terms, and grow your career on a platform built for professionals.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              {/* Emerald premium pill */}
              <Link to="/signup?role=freelancer"
                className="group relative inline-flex items-center gap-3 text-slate-950 font-bold px-9 py-4 rounded-full text-base overflow-hidden transition-all duration-300 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 0 0 1px rgba(16,185,129,0.4), 0 8px 28px rgba(16,185,129,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                }}>
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                <span className="relative z-10 flex items-center gap-3">
                  Apply Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </Link>
              <Link to="/jobs"
                className="group relative inline-flex items-center gap-3 text-white font-bold px-9 py-4 rounded-full text-base overflow-hidden transition-all duration-300 active:scale-[0.97] backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.2)',
                }}>
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 0 0 1px rgba(255,255,255,0.3)' }} />
                <span className="relative z-10">Browse Jobs</span>
              </Link>
            </div>
          </div>

          {/* 4 Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title}
                className={`group rounded-[1.5rem] border p-7 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br ${f.color} ${f.border} backdrop-blur-xl`}
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 16px 40px rgba(0,0,0,0.4)' }}>
                <div className="mb-5 p-3 bg-white/[0.07] rounded-xl border border-white/[0.08] w-fit">
                  {f.icon}
                </div>
                <h3 className="text-base font-black text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-white/60 text-sm font-bold uppercase tracking-widest mb-5">Simple Process</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
              How It Works
            </h2>
            <p className="text-white/50 text-lg font-medium">Simple steps for seamless collaboration</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* For Clients */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-blue-500/10 hover:border-blue-500/25 transition-all duration-500"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>For Clients</h3>
                  <p className="text-white/45 text-base font-medium mt-1">Hire the best talent</p>
                </div>
              </div>
              <div className="space-y-7">
                {[
                  { step: '01', title: 'Post a Job', desc: 'Define your project goals and requirements in minutes.' },
                  { step: '02', title: 'Select Talent', desc: 'Choose from a curated pool of vetted professionals.' },
                  { step: '03', title: 'Secure Payments', desc: 'Funds held in escrow until work is complete.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 group/item">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 border border-white/[0.08] group-hover/item:scale-105 transition-transform shadow-lg shadow-blue-500/15">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/signup?role=client"
                  className="group relative inline-flex items-center justify-center w-full gap-3 text-white/80 font-bold px-8 py-4 rounded-full text-base overflow-hidden transition-all duration-300 hover:text-white backdrop-blur-md"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.12)',
                  }}>
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 0 0 1px rgba(255,255,255,0.25)' }} />
                  <span className="relative z-10 flex items-center gap-2">Get Started as Client <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              </div>
            </div>

            {/* For Freelancers */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-500"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>For Freelancers</h3>
                  <p className="text-emerald-400/60 text-base font-medium mt-1">Find your next project</p>
                </div>
              </div>
              <div className="space-y-7">
                {[
                  { step: '01', title: 'Create Profile', desc: 'Showcase your skills and professional experience.' },
                  { step: '02', title: 'Apply for Jobs', desc: 'Find projects that match your expertise perfectly.' },
                  { step: '03', title: 'Get Paid', desc: 'Complete work and receive secure, fast payments.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 group/item">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 border border-white/[0.08] group-hover/item:scale-105 transition-transform shadow-lg shadow-emerald-500/15">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/signup?role=freelancer"
                  className="group relative inline-flex items-center justify-center w-full gap-3 text-white/80 font-bold px-8 py-4 rounded-full text-base overflow-hidden transition-all duration-300 hover:text-emerald-300 backdrop-blur-md"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.12)',
                  }}>
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                    style={{ background: 'rgba(16,185,129,0.05)', boxShadow: '0 0 0 1px rgba(16,185,129,0.25)' }} />
                  <span className="relative z-10 flex items-center gap-2">Join as Freelancer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLIENT STORIES — Vibrant HD photo bg + floating UI mockups
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '820px', paddingTop: '90px', paddingBottom: '90px' }}>

        {/* ── BACKGROUND: vivid abstract tech/network HD photo ── */}
        <div className="absolute inset-0"
             style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=95&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center center', filter: 'brightness(0.38) saturate(1.6) contrast(1.15)' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1920&q=95&auto=format&fit=crop';
            }}
          />
          {/* Deep overlay — keeps everything readable */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(2,6,23,0.72) 0%, rgba(7,14,50,0.55) 50%, rgba(2,6,23,0.68) 100%)'
          }}/>
          {/* Vibrant color bleed from photo */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 30%, rgba(139,92,246,0.14) 0%, transparent 50%)'
          }}/>
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-slate-950 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950 to-transparent"/>
        </div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — heading + review cards */}
            <div>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-blue-300 text-sm font-bold uppercase tracking-widest mb-8"
                style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(96,165,250,0.25)', backdropFilter: 'blur(12px)' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"/>
                Verified Client Reviews
              </div>

              <h2 className="font-black text-white mb-5 uppercase leading-[0.88]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em', fontSize: 'clamp(2.6rem, 4vw, 4.2rem)' }}>
                Trusted by<br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 55%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  specialists
                </span><br />
                worldwide.
              </h2>
              <p className="text-white/55 text-lg font-medium mb-10 leading-relaxed max-w-md">
                Real reviews from our global community — from New York to Singapore.
              </p>

              {/* Review cards */}
              <div className="flex flex-col gap-4">
                {TESTIMONIALS.map((t, idx) => (
                  <div key={t.name}
                    className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.015] hover:-translate-y-1"
                    style={{
                      borderRadius: '18px',
                      background: 'rgba(4,10,36,0.85)',
                      backdropFilter: 'blur(32px)',
                      WebkitBackdropFilter: 'blur(32px)',
                      border: '1px solid rgba(96,165,250,0.18)',
                      boxShadow: '0 0 0 1px rgba(59,130,246,0.06), 0 12px 40px rgba(0,0,0,0.65)',
                      marginLeft: `${[0, 24, 12][idx]}px`,
                    }}>
                    <div className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(96,165,250,0.5) 50%, transparent 90%)' }}/>
                    <div className="flex items-start gap-4 p-5">
                      <div className="flex-shrink-0 relative">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-lg border-2 border-white/15 shadow-lg`}>
                          {t.avatar}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.name}</p>
                          <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest px-2.5 py-1 rounded-md"
                            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(96,165,250,0.22)' }}>Verified</span>
                        </div>
                        <p className="text-xs text-blue-400/60 font-medium mb-2">{t.role}</p>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>)}
                          <span className="text-xs text-white/35 font-bold ml-1.5">{t.rating}.0</span>
                        </div>
                        <p className="text-white/72 text-sm font-medium leading-relaxed italic">"{t.text}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — floating UI mockup panels like Image 2 */}
            <div className="relative hidden lg:flex items-center justify-center" style={{ minHeight: '580px' }}>

              {/* Ambient glow behind mockups */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.20) 0%, rgba(59,130,246,0.10) 35%, transparent 70%)'
              }}/>

              {/* ── MOCKUP PANEL 1 — top left: Client posting a job ── */}
              <div className="absolute top-8 left-0 w-64 animate-float"
                style={{
                  background: 'rgba(5,12,40,0.92)', backdropFilter: 'blur(28px)',
                  border: '1px solid rgba(96,165,250,0.25)', borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)',
                  animationDelay: '0s',
                }}>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm border border-white/15">A</div>
                    <div>
                      <p className="text-xs font-black text-white">Alex R. <span className="text-white/30 font-normal">@client</span></p>
                      <div className="flex gap-0.5 mt-0.5">{[...Array(5)].map((_,i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400"/>)}</div>
                    </div>
                  </div>
                  <div className="bg-white/[0.06] rounded-xl px-3.5 py-2.5 mb-3 border border-white/[0.06]">
                    <p className="text-xs text-white/60 font-medium">I need a React dashboard built</p>
                  </div>
                  <button className="w-full py-2 rounded-xl text-xs font-black text-white uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}>
                    Post a Project
                  </button>
                </div>
              </div>

              {/* ── MOCKUP PANEL 2 — center: Freelancer profile card ── */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 z-10 animate-float"
                style={{
                  background: 'rgba(5,12,42,0.95)', backdropFilter: 'blur(32px)',
                  border: '1px solid rgba(139,92,246,0.35)', borderRadius: '22px',
                  boxShadow: '0 28px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.12), 0 0 40px rgba(99,102,241,0.15)',
                  animationDelay: '1s',
                }}>
                <div className="absolute top-0 left-0 right-0 h-px rounded-t-[22px]"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)' }}/>
                <div className="p-5">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl border-2 border-purple-400/30 shadow-xl relative">
                      S
                      <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950"/>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sofia M.</p>
                      <p className="text-xs text-purple-400/80 font-medium">UI/UX Designer</p>
                      <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400"/>)}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-lg font-black text-white">$95</p>
                      <p className="text-[10px] text-white/30 font-bold">/hr</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['Figma','React','CSS'].map(s => (
                      <span key={s} className="text-[10px] font-black px-2.5 py-1 rounded-lg text-purple-300 uppercase tracking-wider"
                        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.22)' }}>{s}</span>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-xs font-black text-white uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}>
                    View Profile
                  </button>
                </div>
              </div>

              {/* ── MOCKUP PANEL 3 — bottom right: Payment confirmed ── */}
              <div className="absolute bottom-10 right-0 w-60 animate-float"
                style={{
                  background: 'rgba(5,14,38,0.92)', backdropFilter: 'blur(28px)',
                  border: '1px solid rgba(16,185,129,0.28)', borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)',
                  animationDelay: '2s',
                }}>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm border border-emerald-400/20">P</div>
                    <div>
                      <p className="text-xs font-black text-white">Priya P. <span className="text-white/30 font-normal">@pixelperfect</span></p>
                      <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400"/>)}</div>
                    </div>
                    <span className="ml-auto text-sm font-black text-emerald-400">$30/h</span>
                  </div>
                  <div className="bg-emerald-500/[0.08] rounded-xl px-3 py-2 mb-3 border border-emerald-500/[0.15] flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"/>
                    <p className="text-xs text-emerald-300 font-bold">Payment secured!</p>
                  </div>
                  <button className="w-full py-2 rounded-xl text-xs font-black text-white uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
                    Pay Securely
                  </button>
                </div>
              </div>

              {/* ── Connection dots between panels ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 480 580" style={{ opacity: 0.4 }}>
                <defs>
                  <filter id="cl2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <line x1="140" y1="110" x2="230" y2="240" stroke="#818cf8" strokeWidth="1.2" strokeDasharray="5,4" filter="url(#cl2)"/>
                <line x1="350" y1="330" x2="280" y2="300" stroke="#34d399" strokeWidth="1.2" strokeDasharray="5,4" filter="url(#cl2)"/>
                <circle cx="140" cy="110" r="3.5" fill="#60a5fa" filter="url(#cl2)"/>
                <circle cx="350" cy="330" r="3.5" fill="#34d399" filter="url(#cl2)"/>
              </svg>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ADVANTAGES — Premium HD background + green accents
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28">

        {/* ── BACKGROUND: premium abstract tech / circuit board HD ── */}
        <div className="absolute inset-0"
             style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=2560&q=95&auto=format&fit=crop&crop=center"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: 'center center',
              filter: 'brightness(0.12) saturate(1.4) contrast(1.2) hue-rotate(140deg)',
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=2560&q=95&auto=format&fit=crop';
              e.target.onError = () => {
                e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=2560&q=95&auto=format&fit=crop';
              };
            }}
          />

          {/* Deep dark overlay so cards are readable */}
          <div className="absolute inset-0" style={{
            background: 'rgba(2,8,18,0.72)'
          }}/>

          {/* Radial emerald glow from center — matches green accent */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.09) 0%, rgba(5,150,105,0.04) 40%, transparent 70%)',
          }}/>

          {/* Subtle moving pulse lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{ transform: `translateY(${(scrollY - 3000) * 0.06}px)` }}>
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse-line"/>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse-line" style={{ animationDelay: '1.8s' }}/>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse-line" style={{ animationDelay: '3.5s' }}/>
          </div>

          {/* Top + bottom blends */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-950 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-emerald-300/80 text-sm font-bold uppercase tracking-widest mb-6"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.22)',
                backdropFilter: 'blur(12px)',
              }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Why Nexlance
            </div>

            <h2 className="font-black text-white mb-4 uppercase leading-tight"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '-0.04em',
                fontSize: 'clamp(2.6rem, 5vw, 4.5rem)',
              }}>
              Our{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Advantages
              </span>
            </h2>
            <p className="text-white/50 text-lg font-medium">Built for serious professionals</p>
          </div>

          {/* Advantage cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Shield className="w-6 h-6 text-emerald-400" />,
                iconBg: 'rgba(16,185,129,0.1)',
                iconBorder: 'rgba(16,185,129,0.2)',
                title: 'Secure Escrow',
                desc: 'Payment protection through validated escrow until project completion and approval.',
                accentColor: 'rgba(16,185,129,0.15)',
              },
              {
                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                iconBg: 'rgba(234,179,8,0.1)',
                iconBorder: 'rgba(234,179,8,0.2)',
                title: 'Smart Matching',
                desc: 'Advanced algorithms connect requirements with the most qualified professional profiles.',
                accentColor: 'rgba(234,179,8,0.10)',
              },
              {
                icon: <Star className="w-6 h-6 text-amber-400" />,
                iconBg: 'rgba(245,158,11,0.1)',
                iconBorder: 'rgba(245,158,11,0.2)',
                title: 'Reputation System',
                desc: 'Cross-verified reviews ensure complete accountability across the entire network.',
                accentColor: 'rgba(245,158,11,0.10)',
              },
              {
                icon: <Globe className="w-6 h-6 text-cyan-400" />,
                iconBg: 'rgba(6,182,212,0.1)',
                iconBorder: 'rgba(6,182,212,0.2)',
                title: 'Global Reach',
                desc: 'Access vetted talent from 120+ countries spanning every skill and industry.',
                accentColor: 'rgba(6,182,212,0.10)',
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
                iconBg: 'rgba(16,185,129,0.1)',
                iconBorder: 'rgba(16,185,129,0.2)',
                title: 'Zero Risk',
                desc: 'Approval-based systems guarantee your satisfaction before funds are released.',
                accentColor: 'rgba(16,185,129,0.12)',
              },
              {
                icon: <Users className="w-6 h-6 text-violet-400" />,
                iconBg: 'rgba(139,92,246,0.1)',
                iconBorder: 'rgba(139,92,246,0.2)',
                title: '24/7 Support',
                desc: 'Dedicated support team available around the clock for immediate assistance.',
                accentColor: 'rgba(139,92,246,0.10)',
              },
            ].map((item) => (
              <div key={item.title}
                className="group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 hover:-translate-y-1.5"
                style={{
                  background: 'rgba(3,12,30,0.75)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 20px 48px rgba(0,0,0,0.5)',
                }}>
                {/* Hover corner glow */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(16,185,129,0.5) 50%, transparent 90%)' }}/>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
                  style={{ background: item.accentColor }}/>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                    boxShadow: `0 0 20px ${item.iconBg}`,
                  }}>
                  {item.icon}
                </div>

                {/* Text */}
                <h3 className="text-base font-black text-white mb-3 uppercase tracking-wide relative z-10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed relative z-10 group-hover:text-white/70 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA — premium full-bleed photo, perfectly tuned text
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '640px' }}>

        {/* ── BACKGROUND: premium HD image — vibrant professional success ── */}
        <div className="absolute inset-0">
          {/*
            Split-tone dramatic: person silhouetted against massive floor-to-ceiling
            window at blue hour, city lights below — "the world is yours" energy.
            Unique, cinematic, 100% relevant to career opportunity CTA.
          */}
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=2560&q=98&auto=format&fit=crop&crop=center"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: 'center 35%',
              filter: 'brightness(0.38) saturate(1.3) contrast(1.15)',
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=2560&q=98&auto=format&fit=crop';
              e.target.onError = () => {
                e.target.src = 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2560&q=98&auto=format&fit=crop';
              };
            }}
          />
          {/* Center vignette — text in middle stays readable */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.80) 100%)',
          }}/>
          {/* Top + bottom section blends */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-slate-950 to-transparent"/>
          <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-950 to-transparent"/>
          {/* Warm amber city-light glow at base — echoes the building lights */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 90%, rgba(245,158,11,0.10) 0%, rgba(234,88,12,0.05) 35%, transparent 60%)',
          }}/>
          {/* Cool blue brand wash at top */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 10%, rgba(37,99,235,0.10) 0%, transparent 50%)',
          }}/>
        </div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-36">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-blue-300/80 text-sm font-bold uppercase tracking-widest mb-10"
            style={{
              background: 'rgba(37,99,235,0.10)',
              border: '1px solid rgba(96,165,250,0.22)',
              backdropFilter: 'blur(12px)',
            }}>
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Join the top 1% of global talent
          </div>

          {/* Headline */}
          <h2 className="font-black text-white mb-8 leading-[0.9] uppercase"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.04em',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            }}>
            Your next big<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              opportunity
            </span><br />
            awaits.
          </h2>

          {/* Sub-text */}
          <p className="text-white/65 text-xl mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
            The world's best projects are waiting for people like you. Take the first step — it takes less than 2 minutes to get started.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Primary — blue gradient matching brand */}
            <Link to="/signup"
              className="group relative inline-flex items-center gap-3 text-white font-bold px-11 py-4 rounded-full text-lg overflow-hidden transition-all duration-300 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 8px 32px rgba(37,99,235,0.50), 0 2px 8px rgba(0,0,0,0.3)',
              }}>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </Link>

            {/* Secondary — frosted glass */}
            <Link to="/jobs"
              className="group relative inline-flex items-center gap-3 text-white/80 font-bold px-11 py-4 rounded-full text-lg overflow-hidden transition-all duration-300 active:scale-[0.97] backdrop-blur-md hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.22)',
              }}>
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 0 0 1px rgba(255,255,255,0.35)' }} />
              <span className="relative z-10">Browse Jobs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SUPPORT & COMPLAINTS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.1] p-10 lg:p-14 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.5)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.05] blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                Support & Complaints
              </h2>
              <p className="text-white/45 text-base font-medium">Our team is ready to help you</p>
            </div>
            <form className="space-y-5 relative z-10" onSubmit={handleSupportSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-white/55 uppercase tracking-widest mb-2.5">Subject</label>
                  <input type="text" placeholder="Describe the issue briefly"
                    value={supportData.subject}
                    onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-3.5 text-white text-base font-medium focus:border-blue-500/50 transition-all outline-none placeholder-white/25"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/55 uppercase tracking-widest mb-2.5">Category</label>
                  <select value={supportData.category}
                    onChange={(e) => setSupportData({ ...supportData, category: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-3.5 text-white text-base font-medium focus:border-blue-500/50 transition-all outline-none appearance-none">
                    <option className="bg-slate-900" value="Payment Issue">Payment Issue</option>
                    <option className="bg-slate-900" value="Technical Support">Technical Support</option>
                    <option className="bg-slate-900" value="User Report">User Report</option>
                    <option className="bg-slate-900" value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white/55 uppercase tracking-widest mb-2.5">Description</label>
                <textarea rows="4" placeholder="Describe your issue in detail..."
                  value={supportData.description}
                  onChange={(e) => setSupportData({ ...supportData, description: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-5 py-3.5 text-white text-base font-medium focus:border-blue-500/50 transition-all outline-none resize-none placeholder-white/25"
                  required></textarea>
              </div>
              <div className="text-center pt-2">
                <button type="submit"
                  disabled={submitting || submitStatus === 'success' || !user}
                  className={`px-10 py-4 rounded-2xl font-bold text-base uppercase tracking-widest transition-all ${
                    !user ? 'opacity-40 cursor-not-allowed bg-white/[0.05] text-white/30 border border-white/[0.08]' :
                    submitStatus === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' :
                    submitStatus === 'error' ? 'bg-red-600 text-white' :
                    'bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98] shadow-xl shadow-blue-500/25'
                  }`}>
                  {submitting ? 'Sending...' :
                   submitStatus === 'success' ? '✓ Report Sent' :
                   submitStatus === 'error' ? 'Failed — Retry' : 'Submit Report'}
                </button>
                {!user && <p className="mt-4 text-sm font-medium text-white/35">Please log in to submit a support request.</p>}
                {submitStatus === 'error' && errorMessage && <p className="mt-3 text-sm font-medium text-red-400/70">{errorMessage}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 border-t border-white/[0.07]" style={{ background: 'transparent' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-10 mb-14">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                {/* Nexlance SVG icon */}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
                    <path d="M9 22.5L9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17L21 9C21 8.44772 21.4477 8 22 8V8C22.5523 8 23 8.44772 23 9L23 17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5V23C10 23.5523 9.55228 24 9 24V24C8.44772 24 8 23.5523 8 23L8 22.5C8 21.6716 8.67157 21 9.5 21C10.3284 21 11 21.6716 11 22.5V22.5" fill="url(#footerNexGrad)" />
                    <defs>
                      <linearGradient id="footerNexGrad" x1="8" y1="6" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22d3ee" />
                        <stop offset="0.5" stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#9333ea" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-30 blur-md" />
                </div>
                <span className="text-white font-black text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Nexlance</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs font-medium">
                Empowering the next generation of global talent with a premium, focused work environment.
              </p>
            </div>
            <div>
              <h4 className="text-white/60 font-bold mb-5 text-sm uppercase tracking-widest">For Clients</h4>
              <ul className="space-y-3 text-white/40 text-sm">
                <li><Link to="/jobs/new" className="hover:text-blue-300 transition-colors font-medium">Post a Job</Link></li>
                {(!user || user.role === 'client') && <li><Link to="/freelancers" className="hover:text-blue-300 transition-colors font-medium">Find Talent</Link></li>}
                <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-bold mb-5 text-sm uppercase tracking-widest">For Talent</h4>
              <ul className="space-y-3 text-white/40 text-sm">
                <li><Link to="/jobs" className="hover:text-blue-300 transition-colors font-medium">Browse Projects</Link></li>
                <li><Link to="/signup" className="hover:text-blue-300 transition-colors font-medium">Create Profile</Link></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-bold mb-5 text-sm uppercase tracking-widest">Company</h4>
              <ul className="space-y-3 text-white/40 text-sm">
                <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">About Us</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors font-medium">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/35 text-sm font-medium">© 2026 Nexlance. All rights reserved.</p>
            <p className="text-white/25 text-sm font-semibold uppercase tracking-widest">Built for the world's best talent</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;