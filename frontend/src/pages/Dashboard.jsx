import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase, DollarSign, Star, TrendingUp, Clock,
  Plus, ArrowRight, ExternalLink, CheckCircle,
  Activity, Users, X, ChevronRight, Bell,
  Search, Filter, MoreHorizontal, Zap, Award,
  Eye, Edit3, Trash2, MessageCircle, CreditCard,
  MessageSquare, ClipboardList
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

/* ─── Animations ─── */
const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 0.5s ease both; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

/* ─── Skeleton ─── */
const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <div className="bg-white/5 animate-pulse" style={{ width: w, height: h, borderRadius: r }} />
);

/* ─── Pill ─── */
const Pill = ({ status }) => {
  const STATUS_LABELS = {
    pending: 'Pending Review',
    active: 'In Progress',
    work_submitted: 'Action Needed',
    completed: 'Completed',
    open: 'Open',
    rejected: 'Declined',
    accepted: 'Awarded',
    in_progress: 'In Progress'
  }
  const COLORS = {
    pending: 'bg-white/5 text-slate-400 border-white/10',
    active: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    work_submitted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const colorClass = COLORS[status] || COLORS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${colorClass} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

/* ─── Stat Card ─── */
const CARD_COLORS = [
  { glow: 'rgba(99,102,241,0.18)',  bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  icon: '#818cf8', gradient: 'from-indigo-500/[0.07] to-purple-500/[0.03]' },
  { glow: 'rgba(236,72,153,0.16)',  bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.2)',  icon: '#f472b6', gradient: 'from-pink-500/[0.07] to-rose-500/[0.03]' },
  { glow: 'rgba(59,130,246,0.16)',  bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  icon: '#60a5fa', gradient: 'from-blue-500/[0.07] to-cyan-500/[0.03]' },
  { glow: 'rgba(16,185,129,0.16)',  bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  icon: '#34d399', gradient: 'from-emerald-500/[0.07] to-teal-500/[0.03]' },
];

const StatCard = ({ icon, label, value, sub, delay = 0, colorIdx = 0, onClick }) => {
  const c = CARD_COLORS[colorIdx % CARD_COLORS.length];
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${c.gradient} backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`}
      style={{
        animation: `fadeUp .5s ease ${delay}s both`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 0 1px ${c.border}44, 0 16px 40px rgba(0,0,0,0.35)`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 0 1px ${c.border}, 0 20px 50px rgba(0,0,0,0.45), 0 0 40px ${c.glow}`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 0 1px ${c.border}44, 0 16px 40px rgba(0,0,0,0.35)`; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* ambient blob */}
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:c.glow, filter:'blur(30px)', pointerEvents:'none', transition:'opacity .3s' }}/>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div style={{
          width:44, height:44, borderRadius:13, background:c.bg,
          border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center',
          color:c.icon, boxShadow:`0 0 14px ${c.glow}`,
          transition:'transform .25s ease',
        }}
          className="group-hover:scale-110"
        >
          {React.cloneElement(icon, { size: 19 })}
        </div>
        <TrendingUp size={14} style={{ color: c.icon, opacity:0.5 }} />
      </div>

      <p className="text-3xl font-bold text-white tracking-tight mb-1 relative z-10">{value}</p>
      <p className="text-sm font-semibold text-slate-400 relative z-10">{label}</p>
      {sub && <p className="text-[12px] font-semibold mt-2 relative z-10" style={{ color: c.icon }}>{sub}</p>}
    </div>
  );
};

/* ─── ProjectRow ─── */
const ProjectRow = ({ project, userRole }) => {
  const navigate = useNavigate();
  const otherUserId = userRole === 'client' ? project.freelancer_id : project.client_id;
  return (
    <div 
      onClick={() => navigate(`/projects/${project.project_id}`)}
      className="group flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl transition-all duration-300 relative text-left bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12] cursor-pointer"
    >
      <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner flex-shrink-0 relative z-10">
        <Briefcase size={20} />
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-base font-bold text-white mb-0.5 truncate group-hover:text-indigo-400 transition-colors">
          {project.job_title || `Project #${project.project_id}`}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-slate-400 truncate">
            Gig #{project.job_id}
          </p>
          {project.status === 'work_submitted' && (
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
              <Bell size={12} /> Action Needed
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-5 relative z-10">
        <Pill status={project.status} />
        
        {project.status !== 'pending_escrow' && (
          <Link 
            to={`/messages/${otherUserId}`}
            onClick={(e) => e.stopPropagation()} 
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors text-sm font-semibold"
          >
            <MessageSquare size={14} />
            Message
          </Link>
        )}

        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all hidden sm:flex">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
};

/* ─── JobRow ─── */
const JobRow = ({ job, hasNewBids, onDelete }) => (
  <div className={`group flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl transition-all duration-300 relative text-left border ${
    hasNewBids ? 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.08] hover:border-white/[0.12]'
  }`}>
    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-inner relative z-10 ${
      hasNewBids ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400' : 'bg-white/5 border border-white/10 text-slate-300'
    }`}>
      <Briefcase size={20} />
    </div>
    
    <div className="flex-1 min-w-0 relative z-10">
      <p className="text-base font-bold text-white mb-0.5 truncate group-hover:text-indigo-400 transition-colors">
        {job.title}
      </p>
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-slate-400">
          ${Number(job.budget).toLocaleString()} budget
        </p>
        {hasNewBids && <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">New Proposals</span>}
      </div>
    </div>
    
    <div className="flex items-center gap-4 relative z-10">
      <Pill status={job.status} />
      <div className="flex items-center gap-2">
        <Link to={`/jobs/${job.job_id}`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all">
          <Eye size={18} />
        </Link>
        {job.status === 'completed' && (
          <button onClick={() => onDelete(job.job_id)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ─── BidRow ─── */
const BidRow = ({ bid }) => (
  <Link to={`/jobs/${bid.job_id}`} 
    className="group flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl transition-all duration-300 relative text-left bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12]"
  >
    <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner flex-shrink-0 relative z-10">
      <DollarSign size={20} />
    </div>
    
    <div className="flex-1 min-w-0 relative z-10">
      <p className="text-base font-bold text-white mb-0.5 truncate group-hover:text-indigo-400 transition-colors">
        Gig #{bid.job_id}
      </p>
      <p className="text-sm font-medium text-slate-400 truncate">
        ${Number(bid.bid_amount).toLocaleString()} &middot; {bid.proposal_text.substring(0, 40) + '...'}
      </p>
    </div>
    
    <div className="flex items-center gap-5 relative z-10">
      <Pill status={bid.status} />
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all hidden sm:flex">
        <ChevronRight size={18} />
      </div>
    </div>
  </Link>
);

/* ─── Main Dashboard ─── */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobBids, setJobBids] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects').catch(() => ({ data: [] }));
      const reviewsRes = await api.get(`/reviews/user/${user.user_id}`).catch(() => ({ data: [] }));
      setProjects(projRes.data || []);
      setReviews(reviewsRes.data || []);

      if (user.role === 'client') {
        const jobRes = await api.get('/jobs').catch(() => ({ data: [] }));
        const clientJobs = (jobRes.data || []).filter(j => Number(j.client_id) === Number(user.user_id));
        setItems(clientJobs);
      } else {
        const bidRes = await api.get('/bids/my').catch(() => ({ data: [] }));
        setItems(bidRes.data || []);
      }
      
      const txRes = await api.get('/payments/history').catch(() => ({ data: [] }));
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Remove this job from your dashboard?')) return;
    try {
      await api.patch(`/jobs/${id}`, { is_hidden_by_client: true });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const isFL = user.role === 'freelancer';
  const activeProjects = projects.filter(p => p.status !== 'completed');
  const completedProj = projects.filter(p => p.status === 'completed');
  const visibleJobs = items.filter(j => !j.is_hidden_by_client && j.status !== 'deleted');
  const pendingBids = items.filter(b => b.status === 'pending');
  const jobsWithBids = !isFL ? visibleJobs.filter(j => j.unread_bid_count > 0) : [];
  const urgentProjects = activeProjects.filter(p => p.status === 'work_submitted' && !isFL);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const navigate = useNavigate();

  /* Stats */
  const STATS = isFL ? [
    { icon: <Activity />, label: 'Active Projects', value: activeProjects.length, sub: activeProjects.length ? 'In progress' : null, onClick: () => navigate('/dashboard?tab=projects') },
    { icon: <Briefcase />, label: 'Proposals Sent', value: items.length, sub: pendingBids.length ? `${pendingBids.length} pending` : null, onClick: () => navigate('/dashboard?tab=bids') },
    { icon: <CheckCircle />, label: 'Completed', value: completedProj.length, sub: completedProj.length ? 'All time stats' : null, onClick: () => navigate('/dashboard?tab=completed') },
    { icon: <Star />, label: 'Avg Rating', value: avgRating ?? '—', sub: reviews.length ? `${reviews.length} reviews` : 'No reviews', onClick: () => navigate(`/profile/${user.user_id}`) },
  ] : [
    { icon: <Briefcase />, label: 'Posted Gigs', value: items.length, sub: visibleJobs.filter(j => j.status === 'open').length + ' open', onClick: () => navigate('/dashboard?tab=jobs') },
    { icon: <Activity />, label: 'Active Projects', value: activeProjects.length, sub: urgentProjects.length ? `${urgentProjects.length} awaiting review` : null, onClick: () => navigate('/dashboard?tab=projects') },
    { icon: <Users />, label: 'New Proposals', value: jobsWithBids.length, sub: jobsWithBids.length ? 'Action required' : null, onClick: () => navigate('/dashboard?tab=proposals') },
    { icon: <Star />, label: 'Avg Rating', value: avgRating ?? '—', sub: reviews.length ? `${reviews.length} reviews` : 'No reviews', onClick: () => navigate(`/profile/${user.user_id}`) },
  ];


  const EmptyState = ({ icon, title, sub, action }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[24px]"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px border-dashed border-white/10' }}>
      <div className="w-16 h-16 rounded-2xl border border-white/5 flex items-center justify-center mb-6 shadow-inner text-slate-500 bg-white/5">
        {React.cloneElement(icon, { size: 30 })}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">{sub}</p>
      {action && (
        <Link to={action.to} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.3)]">
          {action.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="min-h-screen pt-24 pb-20 relative bg-[#070e1c]">
        <PageBackground variant="dark" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-up">
            <div>
              <p className="text-sm font-semibold text-indigo-400 mb-2">
                {isFL ? 'Freelancer Dashboard' : 'Client Dashboard'}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Welcome back, {user.name?.split(' ')[0]} 👋
              </h1>
            </div>
            
            <div className="flex shrink-0">
              {isFL ? (
                <Link to="/jobs" className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow:'0 4px 18px rgba(59,130,246,0.35)' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 28px rgba(59,130,246,0.5)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='0 4px 18px rgba(59,130,246,0.35)'}
                >
                  <Search size={17} /> Find Work
                </Link>
              ) : (
                <Link to="/jobs/new" className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', boxShadow:'0 4px 18px rgba(99,102,241,0.38)' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 28px rgba(99,102,241,0.55)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='0 4px 18px rgba(99,102,241,0.38)'}
                >
                  <Plus size={17} /> Post a Gig
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-[140px] flex flex-col justify-between">
                  <Skeleton w={48} h={48} r={13} />
                  <Skeleton w="60%" h={24} r={6} />
                </div>
              ))
            ) : (
              STATS.map((s, i) => <StatCard key={i} {...s} delay={0.05 * i} colorIdx={i} />)
            )}
          </div>

          {/* Context Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Main Column */}
            <div className="lg:col-span-8 flex flex-col">
              

              {/* Tab bar removed — sidebar nav drives the content */}


              {/* OVERVIEW TAB — stat cards already shown above; quick-nav tiles below */}
              {activeTab === 'overview' && (
                <div className="animate-fade-up">
                  <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-4">Quick Navigation</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(isFL ? [
                      { label: 'Browse Gigs',    sub: 'Find new work', to: '/jobs',                   icon: <Search size={20} />,        color: 'from-blue-500/15 to-cyan-500/5',   border: 'border-blue-500/15',   text: 'text-blue-400' },
                      { label: 'My Bids',        sub: `${items.length} proposal${items.length !== 1 ? 's' : ''} sent`, to: '/dashboard?tab=bids',  icon: <ClipboardList size={20} />, color: 'from-indigo-500/15 to-blue-500/5', border: 'border-indigo-500/15', text: 'text-indigo-400' },
                      { label: 'Projects',       sub: `${activeProjects.length} active`,              to: '/dashboard?tab=projects',     icon: <Briefcase size={20} />,     color: 'from-violet-500/15 to-purple-500/5', border: 'border-violet-500/15', text: 'text-violet-400' },
                      { label: 'Completed',      sub: `${completedProj.length} finished`,             to: '/dashboard?tab=completed',    icon: <CheckCircle size={20} />,   color: 'from-emerald-500/15 to-green-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400' },
                      { label: 'Earnings',       sub: 'View payments',                                to: '/dashboard?tab=payments',     icon: <DollarSign size={20} />,    color: 'from-amber-500/15 to-yellow-500/5',  border: 'border-amber-500/15',  text: 'text-amber-400' },
                      { label: 'Profile',        sub: 'Edit your profile',                            to: `/profile/${user?.user_id}`,   icon: <Star size={20} />,          color: 'from-pink-500/15 to-rose-500/5',     border: 'border-pink-500/15',   text: 'text-pink-400' },
                    ] : [
                      { label: 'Post a Gig',     sub: 'Create a new listing',                         to: '/jobs/new',                   icon: <Plus size={20} />,          color: 'from-blue-500/15 to-cyan-500/5',     border: 'border-blue-500/15',   text: 'text-blue-400' },
                      { label: 'Posted Gigs',    sub: `${visibleJobs.length} gig${visibleJobs.length !== 1 ? 's' : ''}`, to: '/dashboard?tab=jobs', icon: <Briefcase size={20} />, color: 'from-indigo-500/15 to-blue-500/5', border: 'border-indigo-500/15', text: 'text-indigo-400' },
                      { label: 'Proposals',      sub: `${jobsWithBids.length} with new bids`,        to: '/dashboard?tab=proposals',    icon: <MessageSquare size={20} />, color: 'from-violet-500/15 to-purple-500/5', border: 'border-violet-500/15', text: 'text-violet-400' },
                      { label: 'Projects',       sub: `${activeProjects.length} active`,              to: '/dashboard?tab=projects',     icon: <Activity size={20} />,      color: 'from-emerald-500/15 to-green-500/5', border: 'border-emerald-500/15', text: 'text-emerald-400' },
                      { label: 'Completed',      sub: `${completedProj.length} done`,                 to: '/dashboard?tab=completed',    icon: <CheckCircle size={20} />,   color: 'from-amber-500/15 to-yellow-500/5',  border: 'border-amber-500/15',  text: 'text-amber-400' },
                      { label: 'Payments',       sub: 'Transaction history',                          to: '/dashboard?tab=payments',     icon: <DollarSign size={20} />,    color: 'from-pink-500/15 to-rose-500/5',     border: 'border-pink-500/15',   text: 'text-pink-400' },
                    ]).map(card => (
                      <Link key={card.label} to={card.to}
                        className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} hover:scale-[1.02] hover:brightness-110 transition-all duration-200 group`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${card.text} flex-shrink-0`}>
                          {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{card.label}</p>
                          <p className="text-xs text-white/35 mt-0.5">{card.sub}</p>
                        </div>
                        <ArrowRight size={15} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}


              {/* PROJECTS TAB — accessible via sidebar 'Projects' link (?tab=projects) */}
              {activeTab === 'projects' && (
                <div className="animate-fade-up bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Active Projects</h3>
                  {loading ? (
                    <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={80} r={16} />)}</div>
                  ) : activeProjects.length === 0 ? (
                    <EmptyState icon={<Briefcase />} title="No active projects" sub={isFL ? "Win a bid to start a project." : "Post a gig and hire a freelancer."} action={isFL ? { to: '/jobs', label: 'Browse Gigs' } : { to: '/jobs/new', label: 'Post a Gig' }} />
                  ) : (
                    <div className="space-y-4">{activeProjects.map(p => <ProjectRow key={p.project_id} project={p} userRole={user.role} />)}</div>
                  )}
                </div>
              )}

              {/* BIDS/PROPOSALS TAB — freelancer: My Bids | client: Jobs with proposals */}
              {(activeTab === 'proposals' || activeTab === 'bids') && isFL && (
                <div className="animate-fade-up bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">My Proposals</h3>
                  {loading ? (
                    <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={80} r={16} />)}</div>
                  ) : items.length === 0 ? (
                    <EmptyState icon={<DollarSign />} title="No proposals yet" sub="Find jobs and submit proposals to get started." action={{ to: '/jobs', label: 'Browse Jobs' }} />
                  ) : (
                    <div className="space-y-4">{items.map(b => <BidRow key={b.bid_id} bid={b} />)}</div>
                  )}
                </div>
              )}

              {/* CLIENT PROPOSALS TAB — jobs that received bids */}
              {activeTab === 'proposals' && !isFL && (
                <div className="animate-fade-up bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tight">Gigs with Proposals</h3>
                    <Link to="/jobs/new"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                      <Plus size={16} /> Post New
                    </Link>
                  </div>
                  {loading ? (
                    <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={80} r={16} />)}</div>
                  ) : (() => {
                    const jobsWithAnyBids = visibleJobs.filter(j => (j.bid_count || 0) > 0);
                    return jobsWithAnyBids.length === 0 ? (
                      <EmptyState icon={<Bell />} title="No proposals received yet"
                        sub="Post gigs and wait for freelancers to submit proposals."
                        action={{ to: '/jobs/new', label: 'Post a Gig' }} />
                    ) : (
                      <div className="space-y-4">
                        {jobsWithAnyBids.map(j => {
                          const bidsCount = j.bid_count || 0;
                          const unread = j.unread_bid_count || 0;
                          return (
                            <Link key={j.job_id} to={`/jobs/${j.job_id}`}
                              className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group">
                              <div className="w-11 h-11 rounded-[14px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                <Briefcase size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{j.title || `Gig #${j.job_id}`}</p>
                                <p className="text-xs text-slate-500 mt-0.5">${j.budget || 0} · {j.status}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm font-bold text-white">{bidsCount} proposal{bidsCount !== 1 ? 's' : ''}</span>
                                {unread > 0 && (
                                  <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unread} new</span>
                                )}
                                <ChevronRight size={16} className="text-slate-500" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* JOBS TAB — accessible via sidebar 'My Jobs' link (?tab=jobs) */}
              {activeTab === 'jobs' && !isFL && (
                <div className="animate-fade-up bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tight">My Gig Listings</h3>
                    <Link to="/jobs/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                      <Plus size={16} /> Post New
                    </Link>
                  </div>
                  {loading ? (
                    <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={80} r={16} />)}</div>
                  ) : visibleJobs.length === 0 ? (
                    <EmptyState icon={<Briefcase />} title="No gigs posted yet" sub="Post your first gig to start receiving proposals." action={{ to: '/jobs/new', label: 'Post a Gig' }} />
                  ) : (
                    <div className="space-y-4">{visibleJobs.map(j => <JobRow key={j.job_id} job={j} hasNewBids={j.unread_bid_count > 0} onDelete={handleDeleteJob} />)}</div>
                  )}
                </div>
              )}

              {/* COMPLETED TAB — accessible via sidebar 'Completed' link (?tab=completed) */}
              {(activeTab === 'history' || activeTab === 'completed') && (
                <div className="animate-fade-up bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Completed Projects</h3>
                  {loading ? (
                    <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} h={80} r={16} />)}</div>
                  ) : completedProj.length === 0 ? (
                    <EmptyState icon={<Award />} title="No completed projects yet" sub="Your completed projects will appear here." action={{ to: '/jobs', label: 'Find Work' }} />
                  ) : (
                    <div className="space-y-4">
                      {completedProj.map(p => (
                        <div key={p.project_id} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                            <CheckCircle size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-white mb-1 truncate">{p.job_title || `Project #${p.project_id}`}</p>
                            <p className="text-sm font-medium text-slate-400">Completed &middot; ${p.job_budget || 0}</p>
                          </div>
                          <Pill status="completed" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EARNINGS / PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="animate-fade-up flex flex-col gap-6">

                  {/* Total Earnings Hero Card */}
                  {(() => {
                    const released = transactions.filter(t => t.status.toLowerCase() === 'released');
                    const pending  = transactions.filter(t => ['pending', 'held', 'locked'].includes(t.status.toLowerCase()));
                    const totalReleased = released.reduce((s, t) => s + Number(t.amount), 0);
                    const totalPending  = pending.reduce((s, t) => s + Number(t.amount), 0);
                    return (
                      <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-[32px] p-8">
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">
                          {isFL ? 'Total Earned (Released)' : 'Total Spent (Released)'}
                        </p>
                        <p className="text-5xl font-black text-white tracking-tight mb-6">
                          ${totalReleased.toFixed(2)}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
                            <Clock size={16} className="text-amber-400" />
                            <div>
                              <p className="text-xs text-slate-400 font-semibold">In Escrow (Pending)</p>
                              <p className="text-base font-bold text-white">${totalPending.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
                            <CreditCard size={16} className="text-blue-400" />
                            <div>
                              <p className="text-xs text-slate-400 font-semibold">Total Transactions</p>
                              <p className="text-base font-bold text-white">{transactions.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Per-Transaction List */}
                  <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-6">Transaction History</h3>

                    {loading ? (
                      <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} h={72} r={16} />)}</div>
                    ) : transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                          <DollarSign size={28} className="text-slate-500" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">No transactions yet</h4>
                        <p className="text-sm text-slate-400 max-w-xs">
                          {isFL ? 'Complete projects to start earning.' : 'Post gigs and release payments to see history.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx) => {
                          const txProject = projects.find(p => p.project_id === tx.project_id);
                          const isReleased = tx.status.toLowerCase() === 'released';
                          const isPending  = ['pending', 'held', 'locked'].includes(tx.status.toLowerCase());
                          return (
                            <div key={tx.transaction_id}
                              className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] transition-all"
                            >
                              {/* Icon */}
                              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                                isReleased ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : isPending ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                : 'bg-white/5 border border-white/10 text-slate-400'
                              }`}>
                                <DollarSign size={18} />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                  {txProject?.job_title || `Project #${tx.project_id}`}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {new Date(tx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  {' · '}Transaction #{tx.transaction_id}
                                </p>
                              </div>

                              {/* Amount + Status */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-lg font-black ${
                                  isReleased ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-slate-400'
                                }`}>
                                  {isFL ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                </span>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  isReleased ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isPending ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-white/5 text-slate-400 border border-white/10'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              




            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;