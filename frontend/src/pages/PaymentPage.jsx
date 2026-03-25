import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle, AlertCircle, DollarSign, Lock,
  ShieldCheck, ArrowLeft, Briefcase, Info, CreditCard
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const PaymentPage = () => {
  const { id } = useParams();
  const [job, setJob]                   = useState(null);
  const [project, setProject]           = useState(null);
  const [verifying, setVerifying]       = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const projRes = await api.get('/projects');
        const found   = projRes.data.find(p => p.project_id === parseInt(id));
        if (!found) { navigate('/dashboard'); return; }
        setProject(found);
        if (found.status === 'completed') { setSuccess(true); return; }
        if (found.status !== 'work_submitted') {
          setError('Work has not been submitted yet. Please wait for the freelancer to submit before releasing payment.');
          setTimeout(() => navigate(`/projects/${id}`), 3000);
          return;
        }
        const jobRes = await api.get(`/jobs/${found.job_id}`);
        setJob(jobRes.data);
      } catch {
        navigate('/dashboard');
      }
    };
    init();
  }, [id, navigate]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!authPassword.trim()) { setError('Please enter your password to confirm payment.'); return; }
    setVerifying(true);
    setError('');
    try {
      await api.post('/auth/verify-password', { password: authPassword });
      await api.put(`/projects/${id}/approve`);
      // Step 1: hold (create transaction as 'held')
      await api.post('/payments', { project_id: parseInt(id), amount: job.budget });
      // Step 2: immediately release it to the freelancer
      await api.post(`/payments/release/${id}`);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  /* ── Loading state ── */
  if (!job && !success) return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1c]">
      <PageBackground variant="dark" />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── Success state ── */
  if (success) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070e1c]/90 backdrop-blur-2xl">
      <div
        className="text-center max-w-md w-full mx-4 p-12 rounded-[32px]"
        style={{
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-3">Payment Released!</h2>
        <p className="text-sm text-white/45 font-medium leading-relaxed mb-8">
          The payment of <span className="text-emerald-400 font-bold">${Number(job?.budget || 0).toLocaleString()}</span> has been released to the freelancer and the project is now marked as completed.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400/60">
          <div className="w-4 h-4 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
          Redirecting to dashboard...
        </div>
      </div>
    </div>
  );

  const budget = Number(job?.budget || 0);

  return (
    <div className="min-h-screen pt-20 pb-16 relative bg-[#070e1c]">
      <PageBackground variant="dark" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Back link */}
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Project
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Project #{id}
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight">Release Payment</h1>
            </div>
          </div>
          {project?.job_title && (
            <p className="text-sm text-white/30 ml-[52px] font-medium">{project.job_title}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Main Form ── */}
          <div className="lg:col-span-3">
            <div
              className="rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <form onSubmit={handleProcessPayment}>

                {/* Header strip */}
                <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <Lock size={15} className="text-indigo-400" />
                    <p className="text-sm font-bold text-white">Confirm & Authorize</p>
                  </div>
                  <p className="text-xs text-white/30 font-medium mt-1">
                    Enter your account password to release the escrow payment to the freelancer.
                  </p>
                </div>

                <div className="p-6 space-y-5">

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/8 border border-red-500/15 text-sm text-red-300 font-medium">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  {/* Password field */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
                      <ShieldCheck size={12} className="text-indigo-400" />
                      Account Password
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={authPassword}
                      onChange={e => { setAuthPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white font-medium focus:outline-none transition-all placeholder-white/[0.12]"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                    <p className="text-xs text-white/20 font-medium mt-2 flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-indigo-400/50" />
                      Your password is verified securely and never stored in transit.
                    </p>
                  </div>

                  {/* Confirmation notice */}
                  <div className="p-4 rounded-2xl border border-amber-500/10 bg-amber-500/[0.04]">
                    <div className="flex items-start gap-2.5">
                      <Info size={13} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/35 font-medium leading-relaxed">
                        By confirming, you approve the freelancer's submitted work and release
                        <span className="text-amber-400/70 font-bold"> ${budget.toFixed(2)}</span> from escrow.
                        This action <span className="text-white/50 font-bold">cannot be undone</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-5 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.35)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background: verifying ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#059669,#047857)',
                      boxShadow: verifying ? 'none' : '0 4px 20px rgba(5,150,105,0.25)',
                    }}
                  >
                    {verifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        Release ${budget.toFixed(2)} to Freelancer
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* ── Billing Summary ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Summary card */}
            <div
              className="rounded-[24px] p-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <h3 className="flex items-center gap-2 text-xs font-black text-white/40 uppercase tracking-widest mb-5">
                <Briefcase size={13} />
                Payment Summary
              </h3>

              <div className="space-y-3 mb-5">
                {[
                  { label: 'Job', value: job?.title || `Job #${project?.job_id}` },
                  { label: 'Contract budget', value: `$${budget.toFixed(2)}` },
                  { label: 'Platform fee', value: 'Free', highlight: 'text-emerald-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-white/35">{row.label}</span>
                    <span className={`text-xs font-bold ${row.highlight || 'text-white'} text-right max-w-[160px] truncate`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-white">${budget.toFixed(2)}</span>
              </div>
            </div>

            {/* Security note */}
            <div
              className="rounded-[20px] p-4"
              style={{
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.12)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={13} className="text-indigo-400/60 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/25 font-medium leading-relaxed">
                  Nexlance uses secure escrow to protect both clients and freelancers. Funds are held until work is approved and released only upon your confirmation.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
