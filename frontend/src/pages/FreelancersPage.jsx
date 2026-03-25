import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  X, Users, ChevronDown, MapPin, Search, Star, CheckCircle, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import PageBackground from '../components/PageBackground';

const SKILLS = [
  'React', 'Python', 'Node.js', 'TypeScript',
  'UI Design', 'AWS', 'PostgreSQL',
];

const EXPERIENCE = ['Any Level', 'Entry Level', 'Intermediate', 'Expert'];

const SkeletonCard = () => (
  <div className="rounded-[2.5rem] border border-white/[0.05] bg-slate-950/40 p-9 animate-pulse">
    <div className="flex gap-6 mb-6">
      <div className="w-20 h-20 bg-white/[0.05] rounded-[1.5rem] flex-shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-white/[0.05] rounded-full w-2/3"></div>
        <div className="h-3 bg-white/[0.04] rounded-full w-1/3"></div>
        <div className="h-4 bg-white/[0.04] rounded-full w-24 ml-auto"></div>
      </div>
    </div>
    <div className="space-y-2.5 mb-7">
      <div className="h-3 bg-white/[0.04] rounded-full w-full"></div>
      <div className="h-3 bg-white/[0.04] rounded-full w-4/5"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-white/[0.04] rounded-full w-16"></div>
      <div className="h-6 bg-white/[0.04] rounded-full w-20"></div>
    </div>
  </div>
);

const FreelancerCard = ({ freelancer }) => {
  const skills = typeof freelancer.skills === 'string'
    ? freelancer.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="group relative overflow-hidden bg-slate-950/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.06] p-9 hover:bg-slate-900/50 transition-all duration-500 flex flex-col h-full"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 16px 48px rgba(0,0,0,0.4)' }}>

      {/* Hover glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/[0.05] blur-[70px] rounded-full -mr-22 -mt-22 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      <div className="flex items-start gap-6 mb-7 relative z-10">
        {/* Avatar */}
        <div className={`w-[72px] h-[72px] bg-gradient-to-br ${freelancer.color || 'from-blue-500 to-indigo-600'} rounded-[1.4rem] flex items-center justify-center text-white text-3xl font-black flex-shrink-0 border border-white/[0.1] shadow-xl overflow-hidden`}>
          {freelancer.profile_picture ? (
            <img src={freelancer.profile_picture} alt={freelancer.name} className="w-full h-full object-cover" />
          ) : (
            freelancer.name.charAt(0)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition-colors uppercase tracking-tight leading-none mb-2 truncate"
                style={{}}>
                {freelancer.name}
              </h3>
              {freelancer.location && (
                <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                  <MapPin className="w-3 h-3 text-blue-500/30 flex-shrink-0" />
                  <span className="truncate">{freelancer.location}</span>
                </div>
              )}
            </div>
            {freelancer.hourly_rate && (
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black text-white tracking-tight leading-none">${freelancer.hourly_rate}</p>
                <p className="text-[9px] font-black text-white/15 uppercase tracking-[0.2em] mt-1">/hr</p>
              </div>
            )}
          </div>

          {/* Rating */}
          {freelancer.rating && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(freelancer.rating) ? 'fill-amber-400 text-amber-400' : 'text-white/[0.06]'}`} />
                ))}
              </div>
              <span className="text-sm font-black text-white/80">{freelancer.rating?.toFixed(1)}</span>
              {freelancer.jobs && (
                <span className="text-[9px] font-black text-white/15 uppercase tracking-widest bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.04]">{freelancer.jobs} jobs</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {freelancer.bio && (
        <p className="text-slate-400/65 text-sm leading-relaxed mb-7 line-clamp-2 font-medium flex-1 group-hover:text-slate-300/75 transition-colors relative z-10">
          {freelancer.bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-7 relative z-10">
          {skills.slice(0, 4).map(skill => (
            <span key={skill} className="px-3.5 py-1.5 bg-blue-500/[0.08] border border-blue-500/[0.14] text-blue-400/80 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/[0.15] transition-colors cursor-default">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-[9px] font-black text-white/15 uppercase tracking-widest self-center">+{skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.05] relative z-10">
        <div className="flex items-center gap-2 text-[9px] text-emerald-400/70 font-black uppercase tracking-[0.25em]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Available
        </div>
        <Link
          to={`/profile/${freelancer.user_id}`}
          className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.07] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 group/btn"
        >
          View Profile
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const FreelancersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    skill: 'All Skills',
    minRate: '',
    maxRate: '',
    experience: 'Any Level',
    sort: 'rating',
  });

  useEffect(() => {
    // Redirect freelancers away from this page
    if (user?.role === 'freelancer') {
      navigate('/dashboard');
      return;
    }
    const fetchFreelancers = async () => {
      try {
        const res = await api.get('/auth/users?role=freelancer');
        const apiFreelancers = res.data || [];
        setAllFreelancers(apiFreelancers);
      } catch (err) {
        console.error("Failed to fetch freelancers:", err);
        setAllFreelancers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [user, navigate]);

  useEffect(() => {
    let data = [...allFreelancers];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      data = data.filter(f =>
        f.name?.toLowerCase().includes(q) ||
        f.bio?.toLowerCase().includes(q) ||
        f.skills?.toLowerCase().includes(q)
      );
    }

    if (filters.skill !== 'All Skills') {
      data = data.filter(f => f.skills?.toLowerCase().includes(filters.skill.toLowerCase()));
    }

    if (filters.experience !== 'Any Level') {
      data = data.filter(f => {
        const count = f.projects_done || 0;
        if (filters.experience === 'Entry Level') return count <= 2;
        if (filters.experience === 'Intermediate') return count >= 3 && count <= 5;
        if (filters.experience === 'Expert') return count >= 6;
        return true;
      });
    }

    if (filters.minRate) data = data.filter(f => (f.hourly_rate || 0) >= Number(filters.minRate));
    if (filters.maxRate) data = data.filter(f => (f.hourly_rate || 999) <= Number(filters.maxRate));

    if (filters.sort === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (filters.sort === 'jobs') data.sort((a, b) => (b.projects_done || 0) - (a.projects_done || 0));
    else if (filters.sort === 'rate_low') data.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    else if (filters.sort === 'rate_high') data.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));

    setDisplayed(data);
  }, [filters, allFreelancers]);

  const updateFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));
  const hasFilters = filters.q || filters.skill !== 'All Skills' || filters.minRate || filters.maxRate;

  return (
    <div className="min-h-screen pt-20 relative">
      <PageBackground variant="dark" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-blue-500/40"></span>
            <span className="text-blue-400/50 font-black uppercase tracking-[0.4em] text-[9px]">Talent Network</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight uppercase leading-none"
            style={{ letterSpacing: '-0.04em' }}>
            Find Talent
          </h1>
          <p className="text-white/25 font-bold text-sm uppercase tracking-[0.3em]">
            {displayed.length} professionals available worldwide
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-3 px-7 py-4 rounded-2xl border text-[10px] uppercase font-black tracking-[0.18em] transition-all duration-400 flex-shrink-0 ${hasFilters
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/[0.04] backdrop-blur-2xl border-white/[0.07] text-white/40 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="bg-white text-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-black">!</span>}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-500/40" />
            <input
              type="text"
              placeholder="Search by name, skill, or expertise..."
              value={filters.q}
              onChange={e => updateFilter('q', e.target.value)}
              className="w-full pl-16 pr-5 py-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all font-medium placeholder-white/[0.15]"
            />
            {filters.q && (
              <button onClick={() => updateFilter('q', '')} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
              className="appearance-none bg-white/[0.04] backdrop-blur-2xl border border-white/[0.07] text-[10px] font-black uppercase tracking-[0.18em] text-white/50 px-7 py-4 pr-12 rounded-2xl focus:outline-none focus:border-blue-500/40 cursor-pointer hover:bg-white/[0.06] transition-all"
            >
              <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
              <option value="jobs" className="bg-slate-900 text-white">Most Jobs</option>
              <option value="rate_low" className="bg-slate-900 text-white">Rate: Low</option>
              <option value="rate_high" className="bg-slate-900 text-white">Rate: High</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          {filterOpen && (
            <aside className="w-72 flex-shrink-0 animate-slide-in">
              <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-7 sticky top-24"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.4)' }}>
                <div className="flex justify-between items-center mb-7">
                  <h3 className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.3em]">Filter Talent</h3>
                  {hasFilters && (
                    <button
                      onClick={() => setFilters({ q: '', skill: 'All Skills', minRate: '', maxRate: '', experience: 'Any Level', sort: filters.sort })}
                      className="text-[9px] text-white/30 font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Skills Pick */}
                <div className="mb-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Popular Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {['All Skills', ...SKILLS].map(skill => (
                      <button
                        key={skill}
                        onClick={() => updateFilter('skill', skill)}
                        className={`text-[9px] px-3 py-1.5 rounded-lg transition-all font-black uppercase tracking-widest border ${filters.skill === skill
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="border-t border-white/[0.05] pt-7 mb-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Hourly Rate ($)</label>
                  <div className="flex gap-2.5">
                    <input
                      type="number" placeholder="Min"
                      value={filters.minRate}
                      onChange={e => updateFilter('minRate', e.target.value)}
                      className="w-1/2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:border-blue-500/40 outline-none font-medium"
                    />
                    <input
                      type="number" placeholder="Max"
                      value={filters.maxRate}
                      onChange={e => updateFilter('maxRate', e.target.value)}
                      className="w-1/2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:border-blue-500/40 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="border-t border-white/[0.05] pt-7">
                  <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-4 block">Experience Level</label>
                  <div className="space-y-1.5">
                    {EXPERIENCE.map(level => (
                      <button
                        key={level}
                        onClick={() => updateFilter('experience', level)}
                        className={`w-full text-left text-[10px] px-4 py-2.5 rounded-xl transition-all font-bold uppercase tracking-widest ${filters.experience === level
                            ? 'bg-blue-600/[0.12] text-blue-300 border border-blue-500/[0.2]'
                            : 'text-white/30 border border-transparent hover:bg-white/[0.04] hover:text-white'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-7">
              <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.2em]">
                Showing <span className="text-blue-400">{displayed.length}</span> freelancers
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="rounded-[3rem] border border-white/[0.05] border-dashed bg-slate-900/30 p-20 text-center group">
                <div className="w-16 h-16 bg-white/[0.04] rounded-3xl flex items-center justify-center mx-auto mb-7 border border-white/[0.07] group-hover:scale-105 transition-transform shadow-xl">
                  <Users className="w-7 h-7 text-white/[0.1]" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3"
                  style={{}}>No freelancers found</h3>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8 max-w-xs mx-auto leading-relaxed">
                  Try adjusting your search filters.
                </p>
                <button
                  onClick={() => setFilters({ q: '', skill: 'All Skills', minRate: '', maxRate: '', experience: 'Any Level', sort: 'rating' })}
                  className="inline-flex items-center gap-3 text-[10px] font-black text-blue-400/70 hover:text-blue-300 transition-all uppercase tracking-[0.3em] bg-blue-500/[0.06] px-7 py-3.5 rounded-full border border-blue-500/[0.15]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayed.map(f => <FreelancerCard key={f.user_id} freelancer={f} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancersPage;