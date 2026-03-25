import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle, AlertCircle, DollarSign, Lock,
  ShieldCheck, ArrowLeft, Briefcase, Info
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const EscrowPaymentPage = () => {
  const { id } = useParams();
  const [project, setProject]           = useState(null);
  const [job, setJob]                   = useState(null);
  const [verifying, setVerifying]       = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const projRes = await api.get(`/projects`);
        const p = projRes.data.find(proj => proj.project_id === parseInt(id));
        if (!p) { navigate('/dashboard'); return; }
        setProject(p);
        
        if (p.status !== 'pending_escrow') {
          navigate(`/projects/${id}`);
          return; // already funded
        }
        
        const jobRes = await api.get(`/jobs/${p.job_id}`);
        setJob(jobRes.data);
      } catch (err) {
        navigate('/dashboard');
      }
    };
    init();
  }, [id, navigate]);

  const handleFundEscrow = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    
    try {
      // 1. Create intent
      const intentRes = await api.post('/payments/create-payment-intent', { project_id: project.project_id });
      
      // 2. Simulate webhook call (Since we don't have a real stripe setup listening)
      await api.post('/payments/webhook', {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            metadata: {
              project_id: project.project_id.toString(),
              amount: job.budget.toString()
            }
          }
        }
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (!job && !success) return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e1c]">
      <PageBackground variant="dark" />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
        <h2 className="text-2xl font-black text-white tracking-tight mb-3">Escrow Funded!</h2>
        <p className="text-sm text-white/45 font-medium leading-relaxed mb-8">
          You have successfully deposited <span className="text-emerald-400 font-bold">${Number(job?.budget || 0).toLocaleString()}</span> into Escrow. The freelancer has been notified to start work.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400/60">
          <div className="w-4 h-4 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
          Redirecting to your dashboard...
        </div>
      </div>
    </div>
  );

  const budget = Number(job?.budget || 0);

  return (
    <div className="min-h-screen pt-20 pb-16 relative bg-[#070e1c]">
      <PageBackground variant="dark" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <Link
          to={`/dashboard`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Job #{job.job_id}
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight">Fund Escrow</h1>
            </div>
          </div>
          <p className="text-sm text-white/30 ml-[52px] font-medium">{job.title}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3">
            <div
              className="rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <form onSubmit={handleFundEscrow}>
                <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={15} className="text-indigo-400" />
                    <p className="text-sm font-bold text-white">Secure Escrow Deposit</p>
                  </div>
                  <p className="text-xs text-white/30 font-medium mt-1">
                    Your money is held securely in Escrow until you approve the final work.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/8 border border-red-500/15 text-sm text-red-300 font-medium">
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.04]">
                    <div className="flex items-start gap-2.5">
                      <Info size={13} className="text-indigo-400/60 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/35 font-medium leading-relaxed">
                        By funding, you agree to place <span className="text-indigo-400/70 font-bold">${budget.toFixed(2)}</span> into the secure Escrow system. The freelancer will be notified to begin the job immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background: verifying ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                      boxShadow: verifying ? 'none' : '0 4px 20px rgba(99,102,241,0.25)',
                    }}
                  >
                    {verifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign size={15} />
                        Deposit ${budget.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
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
                  { label: 'Accepted Bid', value: `$${budget.toFixed(2)}` },
                  { label: 'Platform fee', value: 'Free', highlight: 'text-indigo-400' },
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
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Amount to Pay</span>
                <span className="text-2xl font-black text-white">${budget.toFixed(2)}</span>
              </div>
            </div>
            
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
                  Your funds are protected by our Escrow payment system. Payment is only released to the freelancer once you are fully satisfied with the delivered work. 100% money back guarantee if task is not delivered.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EscrowPaymentPage;
