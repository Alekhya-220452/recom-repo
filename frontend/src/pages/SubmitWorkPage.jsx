import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, Upload, CheckCircle, AlertCircle,
  Briefcase, FileText, Info
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const SubmitWorkPage = () => {
  const { id } = useParams();
  const [project, setProject]     = useState(null);
  const [workNotes, setWorkNotes] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        const found = res.data.find(p => p.project_id === parseInt(id));
        if (found) setProject(found);
      })
      .catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workNotes.trim()) { setError('Please describe your completed work before submitting.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post(`/projects/${id}/submit-work`, { work_notes: workNotes });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to submit work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1c]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const charCount = workNotes.length;

  return (
    <div className="min-h-screen pt-20 pb-16 relative bg-[#070e1c]">
      <PageBackground variant="dark" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Back link */}
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Project
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Project #{project.project_id}
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                Submit Your Work
              </h1>
            </div>
          </div>
          {project.job_title && (
            <p className="text-sm text-white/35 ml-[52px] font-medium">
              {project.job_title}
            </p>
          )}
        </div>

        {/* Main card */}
        <div
          className="rounded-[28px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <form onSubmit={handleSubmit}>

            {/* Work Notes */}
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileText size={14} className="text-indigo-400" />
                  Work Description
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <span className={`text-xs font-semibold ${charCount > 30 ? 'text-emerald-400' : 'text-white/25'}`}>
                  {charCount} characters
                </span>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 mb-4 rounded-2xl bg-red-500/8 border border-red-500/15 text-sm text-red-300 font-medium">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <textarea
                rows={10}
                value={workNotes}
                onChange={e => { setWorkNotes(e.target.value); setError(''); }}
                placeholder="Describe what you've completed, include any relevant links, files, or notes for the client to review..."
                className="w-full px-5 py-4 rounded-2xl text-sm text-white font-medium leading-relaxed resize-none focus:outline-none transition-all placeholder-white/[0.12]"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />

              {/* Progress bar */}
              <div className="mt-2 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (charCount / 200) * 100)}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="mx-6 md:mx-8 mb-6 p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/[0.1]">
              <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-3">
                <CheckCircle size={13} />
                Before you submit, confirm:
              </h4>
              <ul className="space-y-2">
                {[
                  'All project requirements have been fulfilled',
                  'Links and files are accessible to the client',
                  'Work is complete and ready for review',
                  'Documentation or usage notes are included',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-emerald-400/50">
                    <CheckCircle size={12} className="flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Info note */}
            <div className="mx-6 md:mx-8 mb-6 p-4 rounded-2xl bg-blue-500/[0.04] border border-blue-500/[0.1] flex items-start gap-2.5">
              <Info size={13} className="text-blue-400/60 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/30 font-medium leading-relaxed">
                Once submitted, the client will be notified to review your work. The project status will be updated to <span className="text-blue-400/60 font-bold">Awaiting Review</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 md:p-8 pt-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-black text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? 'rgba(99,102,241,0.4)'
                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Submit Work for Review
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default SubmitWorkPage;
