import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Edit2, Save, X, Star, User, CheckCircle, Mail, Clock,
  Briefcase, Award, Lock, AlertCircle, Camera, MapPin,
  Globe, Shield, ChevronRight
} from 'lucide-react';

/* ── keyframes & base styles ── */
const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }

/* Clean scrollbar for timeline */
.clean-scrollbar::-webkit-scrollbar { width: 4px; }
.clean-scrollbar::-webkit-scrollbar-track { background: transparent; }
.clean-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

/* ── Components ── */
const StatCard = ({ icon, value, label }) => (
  <div className="flex flex-col p-5 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-white/40 group-hover:text-white/60 transition-colors">{icon}</div>
      <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{label}</p>
    </div>
    <div className="mt-auto">
      <p className="font-semibold text-white text-3xl tracking-tight">{value}</p>
    </div>
  </div>
);

const ReviewCard = ({ review, userMap }) => (
  <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white/70 font-semibold text-sm flex-shrink-0">
          {review.reviewer_id?.toString().charAt(0) || 'C'}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {userMap && userMap[review.reviewer_id]?.name 
              ? userMap[review.reviewer_id].name 
              : `Client #${review.reviewer_id}`}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date(review.created_at || Date.now()).toLocaleDateString('en-US',{ month:'short', year:'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/10">
        <Star size={12} className="fill-white text-white"/>
        <span className="text-white font-semibold text-xs">{review.rating}.0</span>
      </div>
    </div>
    <p className="text-white/70 text-sm leading-relaxed">
      "{review.comment || 'Excellent work delivered on time. Highly recommended.'}"
    </p>
  </div>
);

const SkillBadge = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-white/[0.08] bg-white/[0.03] text-white/80 transition-colors hover:bg-white/[0.06]">
    {skill}
    {onRemove && (
      <button onClick={() => onRemove(skill)} className="text-white/40 hover:text-white transition-colors ml-1">
        <X size={12}/>
      </button>
    )}
  </span>
);

/* ─── Main Component ─── */
const ProfilePage = () => {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const { user: currentUser, fetchUserProfile } = useContext(AuthContext);
  
  const [profileUser, setProfileUser]   = useState(null);
  const [userMap, setUserMap]           = useState({});
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isEditing, setIsEditing]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [status, setStatus]             = useState({ message:'', type:'' });
  const [editForm, setEditForm]         = useState({ name:'', email:'', bio:'', skills:'', profile_picture:'', hourly_rate:0, current_password:'' });
  const [avatarSrc, setAvatarSrc]       = useState(null);
  const [activeTab, setActiveTab]       = useState('overview');
  const [mounted, setMounted]           = useState(false);
  const [stats, setStats]               = useState({ projects_done: 0, proposals_given: 0, jobs_posted: 0, jobs_done: 0 });
  const fileRef                         = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const loadProfile = async () => {
    try {
      const reviewsRes = await api.get(`/reviews/user/${id}`);
      setReviews(reviewsRes.data);
      if (currentUser && parseInt(id) === currentUser.user_id) {
        const r = await api.get('/auth/profile');
        setProfileUser(r.data);
      } else {
        const r = await api.get(`/auth/users/${id}`);
        setProfileUser(r.data);
      }
      
      const profileInfo = currentUser && parseInt(id) === currentUser.user_id ? currentUser : (profileUser || (await api.get(`/auth/users/${id}`)).data);
      if (profileInfo) {
        const statsRes = await api.get(`/auth/users/${id}/stats?role=${profileInfo.role}`);
        setStats(statsRes.data);
      }
      
      const usersRes = await api.get('/auth/users').catch(() => null);
      if (usersRes?.data) {
        const map = {};
        usersRes.data.forEach(u => map[u.user_id] = u);
        setUserMap(map);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, [id, currentUser]);

  const handleEditToggle = () => {
    const p = profileUser || currentUser;
    setEditForm({ 
      name:p.name||'', email:p.email||'', bio:p.bio||'', skills:p.skills||'', 
      profile_picture:p.profile_picture||'', hourly_rate:p.hourly_rate||0, current_password:'' 
    });
    setIsEditing(true); setStatus({ message:'', type:'' });
  };

  const handleSaveProfile = async () => {
    setSaving(true); setStatus({ message:'', type:'' });
    const emailChanged = editForm.email !== profileUser.email;
    if (emailChanged && !editForm.current_password) {
      setStatus({ message:'Current password required to change email.', type:'error' });
      setSaving(false); return;
    }
    try {
      const res = await api.put('/auth/profile', editForm);
      if (res.data.access_token) localStorage.setItem('token', res.data.access_token);
      setStatus({ message:'Profile updated successfully.', type:'success' });
      setTimeout(async () => {
        await loadProfile();
        if (fetchUserProfile) await fetchUserProfile();
        setIsEditing(false); setStatus({ message:'', type:'' });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail === 'Authorization failed: Incorrect password'
        ? 'Incorrect current password.' : (err.response?.data?.detail || 'Failed to save.');
      setStatus({ message: msg, type:'error' });
    } finally { setSaving(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      if (!isEditing) {
        const p = profileUser || currentUser;
        setEditForm({ name:p.name||'', email:p.email||'', bio:p.bio||'', skills:p.skills||'', profile_picture:ev.target.result||'', current_password:'' });
      } else {
        setEditForm(prev => ({...prev, profile_picture: ev.target.result}));
      }
      setIsEditing(true); setStatus({ message:'', type:'' });
    };
    reader.readAsDataURL(file);
  };

  const profile      = profileUser || (currentUser?.user_id === parseInt(id) ? currentUser : null);
  const isOwnProfile = currentUser && parseInt(id) === currentUser.user_id;
  const isFreelancer = profile?.role === 'freelancer';
  const avgRating    = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;
  const skills       = profile?.skills ? profile.skills.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const editSkills   = editForm.skills ? editForm.skills.split(',').map(s=>s.trim()).filter(Boolean) : [];

  const removeSkill = (sk) => setEditForm(prev => ({ ...prev, skills: editSkills.filter(s=>s!==sk).join(', ') }));

  const INPUT = "w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none transition-all placeholder-white/20 bg-white/[0.03] border border-white/10 focus:border-white/30 focus:bg-white/[0.05]";

  const TABS = [
    { id:'overview', label:'Overview', icon:<User size={14}/> },
    { id:'reviews', label:`Reviews (${reviews.length})`, icon:<Star size={14}/> }
  ];

  /* ── Loading Skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-6"/>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.04]"/>
          <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.04]"/>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#030712] pt-32 flex flex-col items-center">
      <User size={48} className="text-white/10 mb-4"/>
      <p className="text-white/40 font-semibold">User not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-20 text-slate-300 font-sans">
      <style>{STYLES}</style>
      
      <div className="max-w-6xl mx-auto px-6" style={{ opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(10px)', transition:'all 0.3s ease-out' }}>
        
        {/* ════ CLEAN PROFILE HEADER ════ */}
        <div className="rounded-2xl border border-white/[0.04] mb-6 overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.2)]" 
             style={{ background: isFreelancer ? 'linear-gradient(180deg, #022c22 0%, #111827 100%)' : 'linear-gradient(180deg, #0B1220 0%, #111827 100%)' }}>
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"/>

          <div className="px-8 pb-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 mb-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className={`w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold border shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden ${isFreelancer ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                    {avatarSrc || profile.profile_picture ? (
                      <img src={avatarSrc || profile.profile_picture} alt="avatar" className="w-full h-full object-cover"/>
                    ) : (
                      (profile.name?.charAt(0) || 'U').toUpperCase()
                    )}
                  </div>
                  {isOwnProfile && (
                    <button onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 right-2 w-7 h-7 bg-white/10 backdrop-blur-md border border-white/20 rounded-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
                      <Camera size={13}/>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                  
                  {/* Status Indicator */}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#111827]"/>
                </div>

                <div className="pb-1 max-w-xl">
                  {isEditing ? (
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Name</label>
                        <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} className={INPUT} placeholder="Display name"/>
                      </div>
                      {isFreelancer && (
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Rate ($)</label>
                          <input type="number" value={editForm.hourly_rate} onChange={e=>setEditForm({...editForm,hourly_rate:e.target.value})} className={`${INPUT} text-center`} placeholder="0"/>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-white tracking-tight mb-3 leading-tight">{profile.name || 'Anonymous User'}</h1>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-white/55">
                        <span className="flex items-center gap-2"><User size={15}/> {isFreelancer ? 'Freelancer' : 'Client'}</span>
                        <span className="flex items-center gap-2"><MapPin size={15}/> Remote</span>
                        <span className="flex items-center gap-2"><Clock size={15}/> Joined {new Date(profile.created_at || Date.now()).getFullYear()}</span>
                        {isFreelancer && (
                          <span className="flex items-center gap-1.5 text-white/80 font-semibold">
                            ${profile.hourly_rate || 0}/hr
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                {isOwnProfile && !isEditing && (
                  <button onClick={handleEditToggle} className="px-6 py-2.5 text-sm font-semibold border border-white/[0.08] rounded-xl hover:bg-white/[0.04] hover:-translate-y-px hover:shadow-lg transition-all duration-200 text-white active:scale-[0.98]">
                    Edit Profile
                  </button>
                )}
                {isEditing && (
                  <>
                    <button onClick={() => { setIsEditing(false); setStatus({message:'',type:''}); }} className="px-5 py-2.5 text-sm font-semibold border border-transparent hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 text-sm font-semibold bg-[#4F46E5] text-white rounded-xl hover:bg-[#6366f1] hover:-translate-y-px active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-[0_4px_14px_rgba(79,70,229,0.3)]">
                      {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> : <Save size={15}/>}
                      Save Changes
                    </button>
                  </>
                )}
                {!isOwnProfile && (
                  <button onClick={() => navigate(`/messages/${profile.user_id}`)} className="px-6 py-2.5 text-sm font-semibold border border-white/[0.08] rounded-xl hover:bg-white/[0.04] hover:-translate-y-px transition-all duration-200 text-white flex items-center gap-2 active:scale-[0.98]">
                    <Mail size={15} className="opacity-70 group-hover:opacity-100 transition-opacity" /> Message
                  </button>
                )}
                {!isOwnProfile && currentUser?.role === 'client' && isFreelancer && (
                  <Link to="/jobs/new" className="px-6 py-2.5 text-sm font-semibold bg-[#4F46E5] text-white rounded-xl hover:bg-[#6366f1] hover:-translate-y-px active:scale-[0.98] transition-all duration-200 shadow-[0_4px_14px_rgba(79,70,229,0.3)]">
                    Hire Now
                  </Link>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {status.message && (
              <div className={`mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm border ${status.type==='success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {status.type==='success' ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                {status.message}
              </div>
            )}

            {/* Stats Grid */}
            {!isEditing && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.04]">
                <StatCard icon={<Star size={18}/>} value={avgRating||'--'} label="Avg Rating"/>
                <StatCard icon={<Briefcase size={18}/>} value={isFreelancer ? stats.projects_done : stats.jobs_posted} label={isFreelancer ? "Projects" : "Posted"}/>
                <StatCard icon={<CheckCircle size={18}/>} value={isFreelancer ? (stats.proposals_given > 0 ? Math.floor((stats.projects_done / stats.proposals_given)*100)+'%' : '100%') : (stats.jobs_posted > 0 ? Math.floor((stats.jobs_done / stats.jobs_posted)*100)+'%' : '100%')} label="Success Rate"/>
                <StatCard icon={<Award size={18}/>} value={isFreelancer ? (stats.projects_done > 10 ? 'Pro' : 'Regular') : (stats.jobs_posted > 5 ? 'Elite' : 'New')} label="Level"/>
              </div>
            )}

          </div>
        </div>

        {/* ════ BODY GRID ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          
          {/* Main Column */}
          <div className="space-y-6">
            
            {/* Clean Tabs */}
            {!isEditing && (
              <div className="flex items-center gap-1 border-b border-white/[0.04]">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} 
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 hover:-translate-y-px ${activeTab === t.id ? 'border-[#4F46E5] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
                    <span className={activeTab === t.id ? 'text-[#818CF8]' : 'text-inherit'}>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Overview Content ── */}
            {(activeTab === 'overview' || isEditing) && (
              <div className="p-8 md:p-10 rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.03]">
                <h2 className="text-xl font-semibold text-white mb-7 tracking-tight">About</h2>
                
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-white/50 mb-2">Email Address</label>
                      <input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} className={INPUT}/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/50 mb-2">Description / Bio</label>
                      <textarea value={editForm.bio} onChange={e=>setEditForm({...editForm,bio:e.target.value})} rows={5} className={`${INPUT} resize-none`}/>
                    </div>
                    {isFreelancer && (
                      <div>
                        <label className="block text-xs font-semibold text-white/50 mb-2">Skills (comma separated)</label>
                        <input value={editForm.skills} onChange={e=>setEditForm({...editForm,skills:e.target.value})} className={INPUT}/>
                        {editSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {editSkills.map(sk => <SkillBadge key={sk} skill={sk} onRemove={removeSkill}/>)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/[0.05]">
                      <label className="block text-xs font-semibold text-white/50 mb-2">Current Password (to save email changes)</label>
                      <input type="password" value={editForm.current_password} onChange={e=>setEditForm({...editForm,current_password:e.target.value})} className={INPUT} placeholder="Leave blank if not changing email"/>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm leading-relaxed text-white/70 mb-8 whitespace-pre-wrap">
                      {profile.bio ? profile.bio : <span className="italic opacity-50">No description provided.</span>}
                    </div>

                    {isFreelancer && (
                      <div className="pt-8 border-t border-white/[0.04]">
                        <h3 className="text-base font-semibold text-white mb-5">Skills & Capabilities</h3>
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.map(sk => <SkillBadge key={sk} skill={sk}/>)}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic">No skills listed.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {/* ── Reviews Tab ── */}
            {activeTab === 'reviews' && !isEditing && (
              <div className="space-y-4 animate-fadeUp">
                {reviews.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                    <Star size={32} className="text-white/10 mx-auto mb-4"/>
                    <p className="text-white/50 text-sm font-medium">No reviews yet.</p>
                  </div>
                ) : (
                  reviews.map((r,i) => <ReviewCard key={i} review={r} userMap={userMap}/>)
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Contact Box */}
            <div className="p-7 rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.03]">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Contact Info</h3>
              <div className="space-y-4 divide-y divide-white/[0.04]">
                <a href={`mailto:${profile.email}`} className="flex items-center justify-between text-sm py-2">
                  <span className="flex items-center gap-3 text-white/50"><Mail size={16}/> Email</span>
                  <span className="text-white truncate max-w-[140px] hover:underline">{profile.email}</span>
                </a>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="flex items-center gap-3 text-white/50"><Globe size={16}/> Website</span>
                  <span className="text-white truncate max-w-[140px] opacity-40">Not provided</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="flex items-center gap-3 text-white/50"><Shield size={16}/> Verification</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle size={12}/> Verified</span>
                </div>
              </div>
            </div>

            {/* Similar Profiles Placeholder */}
            {isFreelancer && !isOwnProfile && (
              <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.02]">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Similar Freelancers</h3>
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-white/40 border border-white/10 group-hover:border-[#4F46E5]/40 group-hover:text-[#818CF8] transition-all">F{i}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Expert Developer {i}</p>
                        <p className="text-xs text-white/40 transition-colors">UX Design</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;