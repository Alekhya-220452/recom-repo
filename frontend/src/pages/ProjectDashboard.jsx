import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Activity, FileText, AlertTriangle, Briefcase, Upload, CheckCircle,
  Star, ArrowLeft, User, Users, Calendar, ShieldCheck, RotateCcw,
  Flag, Lock, DollarSign, Zap, MessageSquare
} from 'lucide-react';

/* ─── Status pill ─────────────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cfg = {
    active:         { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/25',     dot: 'bg-blue-400',    label: 'Active'          },
    work_submitted: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',  dot: 'bg-amber-400',   label: 'Under Review'    },
    completed:      { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400', label: 'Completed'   },
    pending_escrow: { bg: 'bg-purple-500/15 text-purple-400 border-purple-500/25', dot: 'bg-purple-400', label: 'Awaiting Escrow'},
    in_dispute:     { bg: 'bg-red-500/15 text-red-400 border-red-500/25',        dot: 'bg-red-400',     label: 'In Dispute'      },
  };
  const c = cfg[status] || { bg: 'bg-white/10 text-white/50 border-white/10',   dot: 'bg-white/30',    label: status };
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wide ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
};

/* ─── Timeline step ───────────────────────────────────────────────────────── */
const TimelineStep = ({ icon: Icon, label, sublabel, done, active, isLast }) => (
  <div className="flex gap-4 relative">
    {!isLast && (
      <div className={`absolute left-4 top-9 bottom-0 w-px ${done ? 'bg-indigo-500/40' : 'bg-white/[0.06]'}`} />
    )}
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all z-10 ${
      done    ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400' :
      active  ? 'bg-white/10 border border-white/20 text-white/60' :
                'bg-white/[0.04] border border-white/[0.06] text-white/20'
    }`}>
      {done ? <CheckCircle size={14} /> : <Icon size={14} />}
    </div>
    <div className="pb-7">
      <p className={`text-sm font-semibold ${done ? 'text-white' : active ? 'text-white/50' : 'text-white/20'}`}>{label}</p>
      {sublabel && <p className="text-xs text-white/25 font-medium mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

/* ─── Info card ───────────────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-2xl p-4 border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={13} />
      </div>
      <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-bold text-white leading-snug">{value}</p>
  </div>
);

/* ─── Modal shell ─────────────────────────────────────────────────────────── */
const Modal = ({ onClose, children, accentClass = 'border-white/10' }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
    <div className={`relative bg-[#0c1120] border ${accentClass} rounded-[28px] p-8 max-w-md w-full shadow-2xl`}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const ProjectDashboard = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal]   = useState(false);
  const [showDisputeModal, setShowDisputeModal]   = useState(false);
  const [disputeReason, setDisputeReason]         = useState('');
  const [disputeDesc,   setDisputeDesc]           = useState('');
  const [actionLoading, setActionLoading]         = useState(false);
  const [actionError,   setActionError]           = useState('');
  const navigate = useNavigate();

  const fetchProject = async () => {
    try {
      // Admin can fetch any project by ID directly; others fetch their own list
      if (user?.role === 'admin') {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } else {
        const res = await api.get('/projects');
        const found = res.data.find(p => p.project_id === parseInt(id));
        if (found) setProject(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  /* actions */
  const confirmApproval = async () => {
    setActionLoading(true); setActionError('');
    try {
      await api.put(`/projects/${id}/approve`);
      setShowApproveModal(false);
      await fetchProject();
      navigate(`/projects/${id}/review`);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Approval failed.');
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    setActionLoading(true);
    try {
      await api.put(`/projects/${id}/request-changes`);
      await fetchProject();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to request changes.');
    } finally { setActionLoading(false); }
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim() || !disputeDesc.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/projects/${id}/dispute`, { reason: disputeReason, description: disputeDesc });
      setShowDisputeModal(false);
      await fetchProject();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to raise dispute.');
    } finally { setActionLoading(false); }
  };

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ── 404 ── */
  if (!project) return (
    <div className="min-h-screen bg-[#070e1c] flex items-center justify-center flex-col gap-4 text-center px-4">
      <AlertTriangle size={40} className="text-white/20" />
      <h2 className="text-lg font-bold text-white">Project not found</h2>
      <p className="text-sm text-white/35">No project with ID #{id} was found in your account.</p>
      <Link to="/dashboard" className="mt-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
        ← Back to Dashboard
      </Link>
    </div>
  );

  const isClient     = user?.role === 'client'     && user?.user_id === project.client_id;
  const isFreelancer = user?.role === 'freelancer' && user?.user_id === project.freelancer_id;
  const isCompleted  = project.status === 'completed';
  const isPendingEscrow = project.status === 'pending_escrow';
  const isInDispute  = project.status === 'in_dispute';
  const isSubmitted  = project.status === 'work_submitted';

  const steps = [
    { icon: Briefcase, label: 'Project Created',    sublabel: project.start_date ? new Date(project.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : null, done: true },
    { icon: Lock,      label: 'Escrow Funded',       sublabel: 'Client deposited funds',   done: !isPendingEscrow },
    { icon: Zap,       label: 'Work In Progress',    sublabel: 'Freelancer working',       done: ['active','work_submitted','completed','in_dispute'].includes(project.status) },
    { icon: Upload,    label: 'Work Delivered',      sublabel: 'Awaiting client review',   done: ['work_submitted','completed'].includes(project.status) },
    { icon: CheckCircle,label:'Approved & Paid',     sublabel: 'Funds released',           done: isCompleted },
  ];

  return (
    <div className="min-h-screen bg-[#070e1c] pt-20 pb-16">

      {/* ── page wrapper ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/35 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>

        {/* ── HEADER CARD ── */}
        <div
          className="rounded-[28px] p-7 mb-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg,rgba(99,102,241,0.08),rgba(99,102,241,0.02))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          {/* bg glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* top row */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <Briefcase size={15} />
                </div>
                <p className="text-xs font-bold text-indigo-400/70 uppercase tracking-widest">Project #{project.project_id}</p>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {project.job_title || `Job #${project.job_id}`}
              </h1>
              {project.job_budget && (
                <p className="text-sm text-white/35 font-semibold mt-1 flex items-center gap-1.5">
                  <DollarSign size={13} />
                  {Number(project.job_budget).toLocaleString()} contract value
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={project.status} />
              {!isPendingEscrow && (
                <Link
                  to={`/messages/${user.role === 'client' ? project.freelancer_id : project.client_id}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                >
                  <MessageSquare size={13} />
                  Message
                </Link>
              )}
            </div>
          </div>

          {/* info grid */}
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <InfoCard
              icon={User}
              label="Client"
              value={isClient ? 'You' : (project.client_name || `User #${project.client_id}`)}
              accent="bg-blue-500/15 border border-blue-500/20 text-blue-400"
            />
            <InfoCard
              icon={Users}
              label="Freelancer"
              value={isFreelancer ? 'You' : (project.freelancer_name || `User #${project.freelancer_id}`)}
              accent="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
            />
            <InfoCard
              icon={Calendar}
              label="Started"
              value={project.start_date
                ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Not started yet'}
              accent="bg-white/10 border border-white/10 text-white/50"
            />
          </div>

          {/* work notes */}
          {project.work_notes && (
            <div className="mb-6 rounded-2xl p-4 border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-indigo-400" />
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Delivery Notes</p>
              </div>
              <p className="text-sm text-white/60 font-medium leading-relaxed">"{project.work_notes}"</p>
            </div>
          )}

          {/* ── ACTION BAR ── */}
          <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/[0.06]">

            {/* Freelancer → submit */}
            {isFreelancer && project.status === 'active' && (
              <Link
                to={`/projects/${project.project_id}/submit`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
              >
                <Upload size={14} />
                Submit Delivery
              </Link>
            )}

            {/* Client → fund escrow */}
            {isClient && isPendingEscrow && (
              <Link
                to={`/projects/${project.project_id}/escrow`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
              >
                <Lock size={14} />
                Fund Escrow
              </Link>
            )}

            {/* Client → 3 actions on submission */}
            {isClient && isSubmitted && (
              <>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Flag size={13} />
                  Raise Dispute
                </button>
                <button
                  onClick={handleRequestChanges}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-500/25 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  Request Changes
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 ml-auto"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.25)' }}
                >
                  <CheckCircle size={14} />
                  Approve & Release
                </button>
              </>
            )}

            {/* Completed → review */}
            {isCompleted && (
              <Link
                to={`/projects/${project.project_id}/review`}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
              >
                <Star size={14} />
                Leave a Review
              </Link>
            )}

            {/* In dispute */}
            {isInDispute && (
              <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 w-full mt-2">
                <div className="flex items-center gap-2 text-sm font-black text-red-400">
                  <Flag size={14} />
                  Under Dispute
                </div>
                <p className="text-xs font-bold text-red-300">
                  This job is currently under dispute. Admin is reviewing the case.
                </p>
              </div>
            )}          </div>
        </div>

        {/* ── TIMELINE CARD ── */}
        <div
          className="rounded-[28px] p-7"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-7">
            <Activity size={15} className="text-white/30" />
            <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">Progress Timeline</h2>
          </div>

          <div>
            {steps.map((step, i) => (
              <TimelineStep
                key={i}
                icon={step.icon}
                label={step.label}
                sublabel={step.sublabel}
                done={step.done}
                active={!step.done && (i === 0 || steps[i - 1]?.done)}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ APPROVE MODAL ═══ */}
      {showApproveModal && (
        <Modal onClose={() => { setShowApproveModal(false); setActionError(''); }} accentClass="border-emerald-500/20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Approve & Release Funds</h3>
          <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">
            Confirming approval will mark this project as <span className="text-emerald-400 font-bold">complete</span> and
            release the escrowed funds to the freelancer. You'll then be prompted to leave a review.
          </p>
          {actionError && (
            <p className="text-red-400 text-xs font-bold mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{actionError}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowApproveModal(false); setActionError(''); }}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmApproval}
              disabled={actionLoading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Confirm Approval
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ DISPUTE MODAL ═══ */}
      {showDisputeModal && (
        <Modal onClose={() => { setShowDisputeModal(false); setActionError(''); }} accentClass="border-red-500/20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5">
            <Flag size={22} />
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Raise a Dispute</h3>
          <p className="text-sm text-white/35 font-medium leading-relaxed mb-6">
            Funds will remain <span className="text-red-400 font-bold">locked</span> until the dispute is reviewed and resolved by the platform team.
          </p>
          {actionError && (
            <p className="text-red-400 text-xs font-bold mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{actionError}</p>
          )}
          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="Reason (e.g. Work not delivered as agreed)"
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-colors"
            />
            <textarea
              rows={4}
              placeholder="Describe the issue in detail..."
              value={disputeDesc}
              onChange={e => setDisputeDesc(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowDisputeModal(false); setActionError(''); }}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitDispute}
              disabled={actionLoading || !disputeReason.trim() || !disputeDesc.trim()}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Submit Dispute
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDashboard;
