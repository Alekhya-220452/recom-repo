import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, DollarSign, Send, Lightbulb, CheckCircle,
  Clock, Briefcase, Calendar, AlertCircle, FileText
} from 'lucide-react';

/* ── keyframes ── */
const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.bid-fade { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
`;

const TIPS = [
  'Personalise your proposal — mention the client\'s specific needs.',
  'Include relevant work samples or portfolio links.',
  'Be realistic with your bid amount and delivery time.',
  'Start with a compelling hook in the first two sentences.',
];

/* ── Shared input style helper ── */
const INPUT_BASE =
  'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3.5 text-white text-base font-medium ' +
  'outline-none transition-all duration-200 placeholder-white/20 ' +
  'focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10';

const BidFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({ proposal_text: '', bid_amount: '', delivery_days: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get(`/jobs/${id}`).then(res => setJob(res.data)).catch(console.error);
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.proposal_text || formData.proposal_text.length < 50)
      errs.proposal_text = 'Proposal must be at least 50 characters.';
    if (!formData.bid_amount || parseFloat(formData.bid_amount) <= 0)
      errs.bid_amount = 'Please enter a valid bid amount.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await api.post('/bids', {
        job_id: parseInt(id),
        proposal_text: formData.proposal_text,
        bid_amount: parseFloat(formData.bid_amount),
      });
      navigate(`/jobs/${id}`);
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Error submitting proposal. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!job) return (
    <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: '#070e1c' }}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const charCount = formData.proposal_text.length;
  const charProgress = Math.min(100, (charCount / 500) * 100);

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Page wrapper ── */}
      <div className="min-h-screen pt-20 pb-16" style={{ background: '#070e1c', position: 'relative' }}>

        {/* Ambient glow orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-5vh', left: '-5vw', width: '55vw', height: '55vw', maxWidth: 900, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,.22) 0%,rgba(59,130,246,.09) 40%,transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '10vh', right: '-8vw', width: '40vw', height: '40vw', maxWidth: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.16) 0%,rgba(99,102,241,.07) 40%,transparent 70%)', filter: 'blur(100px)' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative" style={{ zIndex: 1 }}>

          {/* ── Back link ── */}
          <Link
            to={`/jobs/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Job Details
          </Link>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">

            {/* ════ MAIN FORM CARD ════ */}
            <div
              className="bid-fade rounded-3xl p-8"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
              }}
            >
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-blue-300 text-sm font-bold uppercase tracking-widest mb-4"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <FileText size={13} />
                  Submit a Proposal
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-1.5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Place Your Bid
                </h1>
                <p className="text-white/50 text-base font-medium">
                  For: <span className="text-blue-400 font-semibold">{job.title}</span>
                </p>
              </div>

              {/* General error */}
              {errors.general && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={16} className="shrink-0" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* ── Proposal textarea ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-white/40 uppercase tracking-widest">
                      Cover Letter <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${charCount < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {charCount} / 500
                      </span>
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${charProgress}%`,
                            background: charCount < 50 ? '#f87171' : 'linear-gradient(90deg,#10b981,#34d399)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <textarea
                    name="proposal_text"
                    rows={9}
                    value={formData.proposal_text}
                    onChange={handleChange}
                    placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                    className={`${INPUT_BASE} resize-none leading-relaxed`}
                    style={errors.proposal_text ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
                  />
                  {errors.proposal_text && (
                    <p className="mt-1.5 text-xs font-semibold text-red-400 flex items-center gap-1.5">
                      <AlertCircle size={12} /> {errors.proposal_text}
                    </p>
                  )}
                </div>

                {/* ── Bid amount + Delivery days ── */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Bid amount */}
                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                      Bid Amount ($) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                      <input
                        name="bid_amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.bid_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${INPUT_BASE} pl-10`}
                        style={errors.bid_amount ? { borderColor: 'rgba(239,68,68,0.4)' } : {}}
                      />
                    </div>
                    {errors.bid_amount && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400 flex items-center gap-1.5">
                        <AlertCircle size={12} /> {errors.bid_amount}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-white/30 font-medium">
                      Client budget:{' '}
                      <span className="text-blue-400 font-semibold">${Number(job.budget).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Delivery days */}
                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2">
                      Delivery Time (Days)
                    </label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                      <input
                        name="delivery_days"
                        type="number"
                        min="1"
                        value={formData.delivery_days}
                        onChange={handleChange}
                        placeholder="e.g. 14"
                        className={`${INPUT_BASE} pl-10`}
                      />
                    </div>
                    <p className="mt-2 text-sm text-white/30 font-medium">Leave blank if flexible</p>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3.5 rounded-xl text-base font-semibold text-white/60 hover:text-white transition-all border border-white/[0.08] hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg,#2563eb 0%,#4f46e5 60%,#7c3aed 100%)',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                    }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {loading ? 'Submitting…' : 'Submit Proposal'}
                  </button>
                </div>

              </form>
            </div>

            {/* ════ SIDEBAR ════ */}
            <div className="space-y-5">

              {/* Job Summary */}
              <div
                className="bid-fade rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  animationDelay: '.08s',
                }}
              >
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Job Summary</h3>
                <div className="space-y-3">
                  {[
                    { icon: <DollarSign size={15} className="text-emerald-400" />, label: 'Budget', value: `$${Number(job.budget).toLocaleString()}` },
                    { icon: <Calendar size={14} className="text-blue-400" />, label: 'Deadline', value: new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { icon: <Briefcase size={14} className="text-violet-400" />, label: 'Status', value: job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : '—' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                      <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                        {item.icon}
                        {item.label}
                      </div>
                      <span className="text-white text-base font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div
                className="bid-fade rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  animationDelay: '.14s',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={17} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Tips for Winning</h3>
                </div>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-white/55 text-sm font-medium leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BidFormPage;
