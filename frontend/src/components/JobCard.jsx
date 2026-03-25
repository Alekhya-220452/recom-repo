import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

const JobCard = ({ job, showDetailsBtn = true }) => {
  const statusConfig = {
    open: { cls: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/[0.18]', dot: 'bg-emerald-500', label: 'Open' },
    in_progress: { cls: 'text-blue-400 bg-blue-500/[0.08] border-blue-500/[0.18]', dot: 'bg-blue-500', label: 'In Progress' },
    completed: { cls: 'text-white/30 bg-white/[0.04] border-white/[0.08]', dot: 'bg-white/30', label: 'Completed' },
  };
  const cfg = statusConfig[job.status] || statusConfig.completed;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-slate-950/50 backdrop-blur-xl p-8 transition-all duration-500 hover:bg-slate-900/50 hover:border-white/[0.1]"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.4)' }}>

      <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/[0.04] blur-[50px] rounded-full -mr-14 -mt-14 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors leading-snug tracking-tight uppercase"
          style={{  }}>
          {job.title}
        </h3>
        <span className={`flex items-center gap-1.5 px-3 py-1 text-[9px] rounded-full border font-black uppercase tracking-[0.2em] flex-shrink-0 ${cfg.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
          {cfg.label}
        </span>
      </div>

      <p className="text-slate-400/70 text-sm leading-relaxed mb-6 line-clamp-3 font-medium relative z-10">
        {job.description}
      </p>

      <div className="flex items-center gap-6 text-[10px] text-white/30 font-black uppercase tracking-widest mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400/60" />
          <span className="text-white/60">${Number(job.budget).toLocaleString()}</span>
        </div>
        <div className="w-px h-3 bg-white/[0.08]"></div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-400/60" />
          <span>{new Date(job.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {showDetailsBtn && (
        <div className="pt-5 border-t border-white/[0.05] flex justify-end relative z-10">
          <Link
            to={`/jobs/${job.job_id}`}
            className="flex items-center gap-2 text-[10px] font-black text-white/35 uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] hover:text-white hover:border-white/20 transition-all duration-300 group/btn"
          >
            View Details
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobCard;