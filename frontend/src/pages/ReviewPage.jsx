import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Star, ArrowLeft, CheckCircle, Send, Briefcase, DollarSign } from 'lucide-react';

/* ─── Star Picker ─────────────────────────────────────────────────────────── */
const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const StarPicker = ({ rating, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform duration-150 hover:scale-115 active:scale-95 focus:outline-none"
          >
            <Star
              size={36}
              strokeWidth={1.5}
              className={`transition-all duration-200 ${
                s <= active
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-white/15 fill-white/5'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="h-6 flex items-center">
        {active > 0 && (
          <span className={`text-sm font-bold tracking-wide transition-all ${
            active >= 4 ? 'text-amber-400' : active === 3 ? 'text-white/60' : 'text-white/40'
          }`}>
            {labels[active]} {active === 5 ? '✨' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Quick Phrases ───────────────────────────────────────────────────────── */
const quickPhrases = [
  'Great communication',
  'Delivered on time',
  'Exceeded expectations',
  'High quality work',
  'Would hire again',
  'Professional attitude',
];

/* ═══════════════════════════════════════════════════════════════════════════ */
const ReviewPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject]   = useState(null);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(res => {
      const found = res.data.find(p => p.project_id === parseInt(id));
      if (found) setProject(found);
    }).catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a brief review comment.'); return; }

    setLoading(true);
    setError('');

    const revieweeId = user.user_id === project.client_id
      ? project.freelancer_id
      : project.client_id;

    try {
      await api.post('/reviews', {
        project_id: parseInt(id),
        reviewee_id: revieweeId,
        rating: parseInt(rating),
        comment: comment.trim(),
      });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2800);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── loading ── */
  if (!project) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── success screen ── */
  if (submitted) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-3">Review Submitted</h2>
        <p className="text-sm text-white/40 font-medium leading-relaxed mb-8">
          Thank you for your feedback. Your review helps build trust across the platform.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/25">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          Redirecting to dashboard…
        </div>
      </div>
    </div>
  );

  const reviewingLabel = user.user_id === project.client_id ? 'Reviewing Freelancer' : 'Reviewing Client';
  const charCount = comment.length;
  const isReady = rating > 0 && comment.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#070e1c] pt-20 pb-16">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* back */}
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/35 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Project
        </Link>

        {/* ── project pill ── */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star size={15} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400/70 uppercase tracking-widest">{reviewingLabel}</p>
            <p className="text-sm font-bold text-white">
              {project.job_title || `Project #${project.project_id}`}
            </p>
          </div>
          {project.job_budget && (
            <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-white/25">
              <DollarSign size={11} />
              {Number(project.job_budget).toLocaleString()}
            </div>
          )}
        </div>

        {/* ── main card ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* star section */}
          <div
            className="px-7 py-8 text-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-6">Overall Rating</p>
            <StarPicker rating={rating} onChange={setRating} />
          </div>

          {/* comment section */}
          <div className="px-7 py-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Your Review</p>
              <span className={`text-xs font-bold tabular-nums transition-colors ${
                charCount > 20 ? 'text-white/40' : 'text-white/15'
              }`}>
                {charCount} chars
              </span>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience working on this project…"
              rows={4}
              className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-indigo-500/40 resize-none transition-colors leading-relaxed"
            />

            {/* quick phrases */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickPhrases.map(phrase => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => setComment(prev => prev ? `${prev}. ${phrase}` : phrase)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-white/20 hover:bg-white/[0.04] transition-all"
                >
                  + {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="mx-7 mb-4 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* submit row */}
          <div
            className="px-7 pb-7 pt-2 flex gap-3"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-none px-5 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isReady}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={isReady && !loading ? {
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
              } : {
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>

        {/* bottom note */}
        <p className="text-center text-xs text-white/20 font-medium mt-5 leading-relaxed">
          Reviews are public and help build trust on the platform. Be honest and constructive.
        </p>

      </div>
    </div>
  );
};

export default ReviewPage;
