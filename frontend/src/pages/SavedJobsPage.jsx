import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  DollarSign, SlidersHorizontal, LayoutGrid, Search, ChevronDown, Clock, Briefcase, ArrowUpRight, X, MapPin, Bookmark
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const CATEGORIES = [
  'All Categories', 'Web Development', 'UI/UX Design', 'Mobile Apps',
  'AI & Machine Learning', 'Data Science', 'Content Writing',
  'Digital Marketing', 'Cybersecurity', 'Backend Development',
];

const EXPERIENCE_LEVELS = ['Any Level', 'Entry Level', 'Intermediate', 'Expert'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget_high', label: 'Highest Budget' },
  { value: 'budget_low', label: 'Lowest Budget' },
];

const SkeletonCard = () => (
  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-8 overflow-hidden relative mb-4">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-pulse"></div>
    <div className="flex justify-between mb-5">
      <div className="h-6 bg-white/5 rounded-full w-2/3"></div>
      <div className="h-5 bg-white/5 rounded-full w-16"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-white/5 rounded-full w-full"></div>
      <div className="h-4 bg-white/5 rounded-full w-4/5"></div>
      <div className="h-4 bg-white/5 rounded-full w-3/5"></div>
    </div>
    <div className="flex gap-2 mb-6">
      <div className="h-7 bg-white/5 rounded-full w-20"></div>
      <div className="h-7 bg-white/5 rounded-full w-24"></div>
    </div>
    <div className="flex justify-between border-t border-white/5 pt-5 mt-auto">
      <div className="h-5 bg-white/5 rounded-full w-24"></div>
      <div className="h-10 bg-white/5 rounded-xl w-28"></div>
    </div>
  </div>
);

const JobCard = ({ job, isSaved, onToggleSave, user }) => {
  const statusConfig = {
    open: { cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
    in_progress: { cls: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', dot: 'bg-indigo-400' },
  };
  const cfg = statusConfig[job.status] || { cls: 'text-slate-400 bg-white/5 border-white/10', dot: 'bg-slate-400' };

  const daysAgo = Math.floor((Date.now() - new Date(job.created_at)) / (1000 * 60 * 60 * 24));

  const skillHints = ['React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'Django', 'Vue', 'MongoDB', 'Flutter', 'Figma'];
  const jobSkills = skillHints.filter(s =>
    job.title?.toLowerCase().includes(s.toLowerCase()) ||
    job.description?.toLowerCase().includes(s.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="group relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl rounded-[24px] border border-white/[0.08] hover:border-white/[0.15] p-8 transition-all duration-300 flex flex-col h-full shadow-lg">
      
      {/* Subtle Hover Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2 tracking-tight flex-1">
          {job.title}
        </h3>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${job.status === 'open' ? 'animate-pulse' : ''}`}></span>
            {job.status === 'in_progress' ? 'Active' : job.status === 'open' ? 'Open' : job.status}
          </span>
          {user?.role === 'freelancer' && (
            <button 
              onClick={(e) => { e.preventDefault(); onToggleSave(job.job_id); }}
              className={`p-1.5 rounded-full transition-all duration-300 border ${
                isSaved 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark size={15} className={isSaved ? "fill-current" : ""} />
            </button>
          )}
        </div>
      </div>

      <p className="text-slate-300/80 text-[15px] leading-relaxed mb-6 line-clamp-3 font-medium flex-1 relative z-10">
        {job.description || 'No description provided for this job.'}
      </p>

      {/* Skills */}
      {jobSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 relative z-10">
          {jobSkills.map(skill => (
            <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[13px] font-medium transition-colors hover:bg-white/10 cursor-default">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 relative z-10 mt-auto">
        <div className="flex items-center gap-5 text-sm font-medium text-slate-400">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-500">Budget</span>
            <div className="flex items-center gap-1 text-white">
              <span className="text-emerald-400">$</span>
              <span>{Number(job.budget).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-500">Posted</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
            </div>
          </div>
        </div>
        <Link
          to={`/jobs/${job.job_id}`}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group/btn shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
        >
          View Details
          <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const SavedJobsPage = () => {
  const { user } = React.useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    minBudget: '',
    maxBudget: '',
    experience: 'Any Level',
    category: searchParams.get('category') || 'All Categories',
    sort: 'newest',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const savedRes = await api.get('/jobs/saved').catch(()=>({data:[]}));
      
      if (user?.role === 'freelancer') {
        setSavedJobs(new Set(savedRes.data.map(j => j.job_id)));
      }
      
      let data = savedRes.data;

      if (filters.q) {
        const q = filters.q.toLowerCase();
        data = data.filter(j =>
          j.title?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
        );
      }
      if (filters.minBudget) data = data.filter(j => Number(j.budget) >= Number(filters.minBudget));
      if (filters.maxBudget) data = data.filter(j => Number(j.budget) <= Number(filters.maxBudget));
      if (filters.category && filters.category !== 'All Categories') {
        data = data.filter(j => j.category === filters.category);
      }
      if (filters.experience && filters.experience !== 'Any Level') {
        data = data.filter(j => j.experience_level?.toLowerCase() === filters.experience.toLowerCase());
      }

      if (filters.sort === 'budget_high') data.sort((a, b) => b.budget - a.budget);
      else if (filters.sort === 'budget_low') data.sort((a, b) => a.budget - b.budget);
      else data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleSave = async (jobId) => {
    try {
      // Optimistic upate
      setSavedJobs(prev => {
        const next = new Set(prev);
        if (next.has(jobId)) next.delete(jobId);
        else next.add(jobId);
        return next;
      });
      await api.post(`/jobs/${jobId}/save`);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
      // Revert if failed
      fetchJobs();
    }
  };

  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const clearFilters = () => setFilters({
    q: '', minBudget: '', maxBudget: '', experience: 'Any Level', category: 'All Categories', sort: 'newest',
  });

  const hasActiveFilters = filters.minBudget || filters.maxBudget ||
    filters.experience !== 'Any Level' || filters.category !== 'All Categories';

  return (
    <div className="min-h-screen pt-24 pb-20 relative bg-[#070e1c] text-white">
      <style>{`
        @keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
/* Hide number input spinners */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
`}</style>
      <PageBackground variant="dark" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            Saved Jobs
          </h1>
          <p className="text-slate-400 text-lg">
            Review your {jobs.length} bookmarked opportunities.
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
              hasActiveFilters
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                : 'bg-white/[0.04] backdrop-blur-xl border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {hasActiveFilters && <span className="bg-white text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold inline-block ml-1">!</span>}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, skill, or keyword..."
              value={filters.q}
              onChange={e => updateFilter('q', e.target.value)}
              className="w-full pl-14 pr-12 py-3.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl text-[15px] text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all font-medium placeholder-slate-400 shadow-inner"
            />
            {filters.q && (
              <button onClick={() => updateFilter('q', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="appearance-none bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-sm font-semibold text-slate-300 px-6 py-3.5 pr-12 rounded-2xl focus:outline-none focus:border-indigo-500/50 cursor-pointer hover:bg-white/[0.08] transition-all w-full sm:w-auto"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {filterOpen && (
            <aside className="w-full lg:w-72 flex-shrink-0 animate-slide-in">
              <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] p-8 lg:sticky lg:top-28 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold text-white tracking-wide">Filters</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="mb-8">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 block font-heading">Popular Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateFilter('category', cat)}
                        className={`text-[10px] px-3.5 py-2 rounded-xl border transition-all font-bold tracking-tight ${
                          filters.category === cat
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="mb-8 border-t border-white/[0.08] pt-8">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Budget Range</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number" placeholder="Min"
                        value={filters.minBudget}
                        onChange={e => updateFilter('minBudget', e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500/50 outline-none font-medium placeholder-slate-500"
                      />
                    </div>
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number" placeholder="Max"
                        value={filters.maxBudget}
                        onChange={e => updateFilter('maxBudget', e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-indigo-500/50 outline-none font-medium placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="border-t border-white/[0.08] pt-8">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 block font-heading">Expertise Need</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => updateFilter('experience', lvl)}
                        className={`text-center text-[10px] px-3 py-2 rounded-xl border transition-all font-black uppercase tracking-wider ${
                          filters.experience === lvl
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {lvl.replace(' Level', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Job Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 hidden lg:flex">
              <p className="text-sm font-medium text-slate-400">
                Found <span className="text-white font-bold">{jobs.length}</span> matching jobs
              </p>
              <div className="flex items-center gap-2 text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-xs font-semibold">Grid View</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-[32px] border border-white/10 border-dashed bg-white/[0.02] p-16 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">No jobs found</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any jobs matching your current search criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <JobCard 
                    key={job.job_id} 
                    job={job} 
                    user={user}
                    isSaved={savedJobs.has(job.job_id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsPage;