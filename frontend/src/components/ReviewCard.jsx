import React from 'react';
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-slate-950/40 backdrop-blur-xl p-7 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.1]"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.4)' }}>

      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.04] blur-[40px] rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-sm border border-white/[0.08]">
            {review.reviewer_id?.toString().charAt(0) || 'C'}
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]"
              style={{  }}>
              Client #{review.reviewer_id}
            </p>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
              {new Date(review.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/[0.05] gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/[0.08]'}`} />
          ))}
        </div>
      </div>

      <div className="relative pl-5 z-10">
        <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-blue-500/30 to-transparent rounded-full"></div>
        <p className="text-sm text-slate-300/75 font-medium leading-relaxed italic group-hover:text-slate-200/90 transition-colors">
          "{review.comment || 'Excellent work delivered on time. Would highly recommend.'}"
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;