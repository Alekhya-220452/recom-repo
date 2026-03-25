import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Star, Clock } from 'lucide-react';

const BidCard = ({ bid, onAccept, isJobOpen, jobOwnerId }) => {
  const { user } = useContext(AuthContext);

  const isClientOwner = user?.role === 'client' && user?.user_id === jobOwnerId;
  const canAccept = isClientOwner && isJobOpen && bid.status === 'pending';

  const statusConfig = {
    accepted: { bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/[0.2]', text: 'text-emerald-400', dot: 'bg-emerald-500', label: 'Accepted' },
    rejected: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/[0.2]', text: 'text-red-400', dot: 'bg-red-500', label: 'Rejected' },
    pending: { bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/[0.2]', text: 'text-amber-400', dot: 'bg-amber-500', label: 'Pending' },
  };

  const cfg = statusConfig[bid.status] || statusConfig.pending;

  return (
    <div className={`group relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500 ${
      bid.status === 'accepted'
        ? 'bg-emerald-500/[0.04] border-emerald-500/[0.15]'
        : 'bg-slate-950/40 backdrop-blur-xl border-white/[0.06] hover:bg-slate-900/50 hover:border-white/[0.1]'
    }`}
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 16px 48px rgba(0,0,0,0.4)' }}>

      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/[0.04] blur-[60px] rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 relative z-10">
        {/* Freelancer Info */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 border border-white/[0.08] shadow-lg shadow-blue-500/15">
            {bid.freelancer_id?.toString().charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-white text-base tracking-tight uppercase leading-none mb-1.5"
              style={{  }}>
              Freelancer #{bid.freelancer_id}
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="sm:text-right flex-shrink-0">
          <div className="text-3xl font-black text-white tracking-tight leading-none"
            style={{  }}>
            ${Number(bid.bid_amount).toLocaleString()}
          </div>
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Proposal Amount</div>
        </div>
      </div>

      {/* Proposal Text */}
      <div className="bg-white/[0.02] rounded-2xl px-6 py-5 mb-6 border border-white/[0.04] relative z-10">
        <p className="text-sm text-slate-300/80 leading-relaxed font-medium italic">
          "{bid.proposal_text || 'No proposal text provided.'}"
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          {/* Status */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.25em] ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${bid.status === 'pending' ? 'animate-pulse' : ''}`}></div>
            {cfg.label}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-[9px] text-white/20 font-black uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {new Date(bid.created_at).toLocaleDateString()}
          </div>
        </div>

        {canAccept && (
          <button
            onClick={() => onAccept(bid.bid_id)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-7 py-3.5 rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 active:scale-[0.97] uppercase tracking-[0.18em] shadow-lg shadow-blue-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            Accept Bid
          </button>
        )}
      </div>
    </div>
  );
};

export default BidCard;