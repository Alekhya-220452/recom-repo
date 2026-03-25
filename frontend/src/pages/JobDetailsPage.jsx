import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  CheckCircle, XCircle, Send, Star, Briefcase, AlertTriangle, 
  ArrowLeft, User, Calendar, DollarSign, MessageSquare, Bookmark
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const STYLES = `
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const BidCard = ({ bid, onAccept, isJobOpen, jobOwnerId, currentUserId, userMap }) => {
  const isOwner = currentUserId === jobOwnerId;

  return (
    <div className={`bg-white/[0.02] backdrop-blur-xl rounded-[20px] border p-6 sm:p-8 transition-all duration-300 relative group mb-4 ${
      bid.status === 'accepted' ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/[0.08] hover:bg-white/[0.04]'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0">
            {bid.freelancer_id?.toString().charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg tracking-tight">
              {userMap?.[bid.freelancer_id]?.name || `Freelancer #${bid.freelancer_id}`}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-white/70 font-medium">Top Rated</span>
              </div>
            </div>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-2xl font-bold text-white tracking-tight">${Number(bid.bid_amount).toLocaleString()}</div>
          <div className="text-sm font-medium text-white/40 mt-1 block">Proposed Budget</div>
        </div>
      </div>

      <div className="bg-black/20 rounded-xl p-5 mb-6 border border-white/[0.03]">
        <h5 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Cover Letter</h5>
        <p className="text-sm text-slate-300 leading-relaxed">
          {bid.proposal_text || 'No cover letter provided.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          bid.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          bid.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-white/5 text-slate-400 border-white/10'
        }`}>
          {bid.status === 'accepted' && <CheckCircle className="w-3.5 h-3.5" />}
          {bid.status === 'accepted' ? 'Awarded' : bid.status === 'rejected' ? 'Declined' : 'Pending Review'}
        </div>

        {isOwner && isJobOpen && bid.status === 'pending' && (
          <button
            onClick={() => onAccept(bid.bid_id)}
            className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 border border-transparent text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-white/10"
          >
            <CheckCircle className="w-4 h-4" />
            Accept Proposal
          </button>
        )}

        {bid.status === 'accepted' && bid.project_id && (
          <Link
            to={`/messages/${bid.freelancer_id}`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Link>
        )}
      </div>
    </div>
  );
};

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJob(jobRes.data);
        const bidsRes = await api.get(`/bids/job/${id}`);
        setBids(bidsRes.data);
        
        const usersRes = await api.get('/auth/users').catch(() => null);
        if (usersRes?.data) {
          const map = {};
          usersRes.data.forEach(u => map[u.user_id] = u);
          setUserMap(map);
        }

        if (user?.role === 'client' && user?.user_id === jobRes.data.client_id) {
          api.post(`/bids/job/${id}/read-all`).catch(() => {});
          
          const recRes = await api.get(`/jobs/${id}/recommendations`).catch(() => ({ data: [] }));
          if (recRes?.data) setRecommendedFreelancers(recRes.data);
        } else if (user?.role === 'freelancer') {
          const savedRes = await api.get('/jobs/saved').catch(() => ({ data: [] }));
          if (savedRes.data?.some(j => j.job_id === parseInt(id))) {
            setIsSaved(true);
          }
        }

        // Fetch projects to find the one associated with this job
        const projectsRes = await api.get('/projects').catch(() => ({ data: [] }));
        const jobProject = projectsRes.data.find(p => p.job_id === parseInt(id));
        if (jobProject) {
          setBids(prev => prev.map(b => b.status === 'accepted' ? { ...b, project_id: jobProject.project_id } : b));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
    const interval = setInterval(fetchJobData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id, user]);

  const handleAcceptBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/accept`);
      const res = await api.post(`/projects`, { job_id: job.job_id });
      navigate(`/projects/${res.data.project_id}/escrow`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error accepting bid');
    }
  };

  const handleToggleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await api.post(`/jobs/${id}/save`);
    } catch (err) {
      console.error(err);
      setIsSaved(isSaved);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 relative bg-[#070e1c]">
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-24"></div>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="h-8 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-8"></div>
            <div className="h-24 bg-white/10 rounded w-full mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen pt-24 relative flex items-center justify-center bg-[#070e1c]">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-white/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-300">Gig not found</h2>
        <Link to="/jobs" className="text-indigo-400 hover:text-indigo-300 font-medium mt-2 inline-block">← Back to gigs</Link>
      </div>
    </div>
  );

  const isClientOwner = user?.role === 'client' && user?.user_id === job.client_id;
  const isFreelancer = user?.role === 'freelancer';
  const hasBid = bids.some(b => b.freelancer_id === user?.user_id);
  const daysLeft = Math.floor((new Date(job.deadline) - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen pt-24 pb-20 relative bg-[#070e1c] text-white">
      <style>{STYLES}</style>
      <PageBackground variant="dark" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{ animation: 'fadeUp 0.5s ease' }}>
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Gig Search
          </Link>
        </div>

        {/* Job Header Card */}
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] shadow-2xl p-8 sm:p-12 mb-8 relative overflow-hidden">
          {/* Subtle glow behind card content */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
                    job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    job.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    job.status === 'in_dispute' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-white/5 text-slate-300 border-white/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`}></div>
                    {job.status === 'in_progress' ? 'Active' : job.status === 'open' ? 'Open' : job.status === 'in_dispute' ? 'Under Dispute' : job.status}
                  </div>
                  <div className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Gig ID: {job.job_id}
                  </div>
                </div>
                {isFreelancer && (
                  <button onClick={handleToggleSave} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all duration-300 ${isSaved ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}>
                    <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
                    {isSaved ? 'Gig Saved' : 'Save Gig'}
                  </button>
                )}
              </div>
              
              {job.status === 'in_dispute' && (
                <div className="w-full sm:max-w-md p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm font-black text-red-400">
                    <AlertTriangle size={14} /> Under Dispute
                  </div>
                  <p className="text-xs font-bold text-red-300">
                    This gig is currently under dispute. Admin is reviewing the case.
                  </p>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>{userMap[job.client_id]?.name || `Client #${job.client_id}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/[0.08] p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Budget</p>
            <p className="text-3xl font-bold text-white flex items-center gap-1 tracking-tight">
              <span className="text-emerald-400">$</span>{Number(job.budget).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/[0.08] p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deadline</p>
            <p className="text-xl font-semibold text-white tracking-tight mb-1">
              {new Date(job.deadline).toLocaleDateString()}
            </p>
            <p className={`text-xs font-medium ${daysLeft < 7 ? 'text-red-400' : 'text-indigo-400'}`}>
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
            </p>
          </div>
          
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/[0.08] p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Proposals</p>
            <p className="text-3xl font-bold text-white tracking-tight">{bids.length}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[32px] border border-white/[0.08] p-8 sm:p-12 mb-8 relative z-10">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Gig Description</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </p>
          </div>

          {/* Freelancer Actions */}
          {isFreelancer && job.status === 'open' && !hasBid && (
            <div className="mt-10 pt-8 border-t border-white/10 flex sm:justify-end">
              <Link 
                to={`/jobs/${job.job_id}/bid`} 
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
              >
                <Send className="w-4 h-4" />
                Submit Proposal
              </Link>
            </div>
          )}

          {isFreelancer && hasBid && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-sm font-medium">You have already submitted a proposal for this gig.</p>
              </div>
            </div>
          )}

          {!user && job.status === 'open' && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-indigo-200 text-sm font-medium">Sign in to submit a proposal for this gig.</p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link to="/login" className="flex-1 sm:flex-none text-center text-sm font-semibold text-white bg-white/10 border border-white/20 px-6 py-2.5 rounded-xl hover:bg-white/20 transition-all">Sign In</Link>
                  <Link to="/signup" className="flex-1 sm:flex-none text-center text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25">Join Free</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proposals List */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {(isClientOwner || (isFreelancer && hasBid)) && (
            <>
              <h2 className="text-xl font-bold text-white tracking-tight mb-6">
                Proposals <span className="text-slate-400 text-base font-medium ml-2">{bids.length}</span>
              </h2>

              {bids.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 border-dashed p-12 text-center">
                  <Briefcase className="w-10 h-10 text-white/20 mx-auto mb-4" />
                  <p className="text-slate-300 font-semibold mb-1">No proposals yet</p>
                  <p className="text-slate-400 text-sm">Proposals from freelancers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map(bid => (
                    <BidCard 
                      key={bid.bid_id} 
                      bid={bid} 
                      onAccept={handleAcceptBid}
                      isJobOpen={job.status === 'open'}
                      jobOwnerId={job.client_id}
                      currentUserId={user?.user_id}
                      userMap={userMap}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Recommended Freelancers Section */}
        {isClientOwner && (
          <div className="mt-12" style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">
              Recommended Freelancers 
              <span className="text-emerald-400 text-[10px] font-bold ml-3 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full tracking-widest uppercase align-middle shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                Selected for you
              </span>
            </h2>
            
            {recommendedFreelancers.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-8 text-center">
                <p className="text-slate-400 text-sm">No specific recommendations found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedFreelancers.map(freelancer => (
                  <div key={freelancer.user_id} className="bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/[0.08] p-6 hover:bg-white/[0.06] transition-all duration-300 group shadow-lg shadow-black/20">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                        {freelancer.name?.charAt(0) || 'F'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg tracking-tight truncate">{freelancer.name}</h4>
                        <p className="text-xs text-emerald-400 font-medium truncate mt-0.5">{freelancer.skills || 'Freelancer'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-xl p-4 mb-5 border border-white/[0.03]">
                      <p className="text-[13px] text-slate-300 line-clamp-2 leading-relaxed h-[40px]">
                        {freelancer.bio || 'This freelancer has not provided a bio.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</span>
                        <span className="text-lg font-bold text-white tracking-tight">${freelancer.hourly_rate || 0}<span className="text-sm font-medium text-slate-400">/hr</span></span>
                      </div>
                      
                      <Link 
                        to={`/freelancers?search=${encodeURIComponent(freelancer.name)}`} 
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <User size={14} /> Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default JobDetailsPage;
