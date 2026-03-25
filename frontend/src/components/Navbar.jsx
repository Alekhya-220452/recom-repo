import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, Menu, X, Bell, Plus
} from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Don't render navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-slate-950/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-[4.5rem]">
          {/* ── Top left logo ── */}
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            {/* Nexlance SVG icon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
                <path d="M9 22.5L9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17L21 9C21 8.44772 21.4477 8 22 8V8C22.5523 8 23 8.44772 23 9L23 17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5V23C10 23.5523 9.55228 24 9 24V24C8.44772 24 8 23.5523 8 23L8 22.5C8 21.6716 8.67157 21 9.5 21C10.3284 21 11 21.6716 11 22.5V22.5" fill="url(#navNexGrad)" />
                <defs>
                  <linearGradient id="navNexGrad" x1="8" y1="6" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="0.5" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#22d3ee,#3b82f6,#9333ea)', opacity: 0.35, filter: 'blur(8px)' }} />
            </div>
            <span className="text-white font-black text-xl tracking-tight leading-none pt-0.5">Nexlance</span>
          </Link>

          {/* Center Nav — absolutely centred */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {user?.role === 'freelancer' && (
              <Link
                to="/jobs"
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/jobs')
                    ? 'text-blue-400 bg-blue-500/[0.1] border border-blue-500/[0.18]'
                    : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Browse Gigs
              </Link>
            )}
            {user?.role === 'client' && (
              <Link
                to="/freelancers"
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/freelancers')
                    ? 'text-blue-400 bg-blue-500/[0.1] border border-blue-500/[0.18]'
                    : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Freelancers
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    notifOpen ? 'bg-blue-500/[0.12] text-blue-400' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[340px] bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/[0.08] overflow-hidden animate-slide-up z-50"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6)' }}>
                    <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.03] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-3.5 h-3.5 text-blue-400/60" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-[8px] font-black text-red-400/60 uppercase tracking-widest hover:text-red-300 transition-colors">
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-white/[0.04] max-h-[360px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? notifications.map((n) => (
                        <div
                          key={n.notification_id}
                          onClick={() => { markAsRead(n.notification_id); setNotifOpen(false); if (n.link) navigate(n.link); }}
                          className={`px-6 py-4 hover:bg-white/[0.04] transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-blue-500/[0.03]' : ''}`}
                        >
                          {!n.is_read && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>}
                          <p className="text-[11px] text-white/75 font-bold mb-1 group-hover:text-white transition-colors uppercase tracking-tight leading-snug">{n.title}</p>
                          <p className="text-[10px] text-white/35 font-medium truncate leading-relaxed">{n.message}</p>
                          <p className="text-[8px] text-blue-400/30 font-black uppercase tracking-[0.18em] mt-1.5">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true }).toUpperCase()}
                          </p>
                        </div>
                      )) : (
                        <div className="px-6 py-12 text-center">
                          <Bell className="w-7 h-7 text-white/[0.05] mx-auto mb-3" />
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No notifications</p>
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-3 border-t border-white/[0.05] bg-slate-950/50">
                      <Link to="/dashboard" className="text-[9px] text-blue-400/60 font-black uppercase tracking-[0.18em] hover:text-blue-300 transition-colors" onClick={() => setNotifOpen(false)}>
                        View all in dashboard →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile avatar — direct link to profile page */}
              <Link
                to={`/profile/${user?.user_id}`}
                className="flex items-center p-1 rounded-xl hover:bg-white/[0.06] transition-all duration-200"
                title="View Profile"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-lg shadow-blue-500/20 overflow-hidden">
                  {user?.profile_picture
                    ? <img src={user.profile_picture} alt="profile" className="w-full h-full object-cover" />
                    : user?.name?.charAt(0)?.toUpperCase()
                  }
                </div>
              </Link>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="hidden sm:block px-6 py-2.5 text-[10px] font-black text-white/40 uppercase tracking-[0.25em] transition-all rounded-full border border-white/[0.1] hover:bg-white/[0.04] hover:border-white/20 hover:text-white mr-1"
                  >
                    Log In
                  </Link>
                )}
                {location.pathname !== '/signup' && (
                  <Link
                    to="/signup"
                    className="bg-white text-slate-950 text-[10px] font-black px-6 py-2.5 rounded-full hover:bg-blue-50 transition-all duration-300 active:scale-[0.97] uppercase tracking-[0.2em] shadow-lg shadow-black/20"
                  >
                    Sign Up
                  </Link>
                )}
              </>
            )}

            {/* Mobile Toggle */}
            <button
              className={`md:hidden p-2.5 rounded-xl transition-all ${
                menuOpen ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6 animate-slide-up">
            <div className="flex flex-col gap-1 pt-3 border-t border-white/[0.05]">
              {user ? (
                <>
                  {user.role === 'freelancer' && (
                    <Link to="/jobs" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Browse Gigs</Link>
                  )}
                  {user.role === 'client' && (
                    <Link to="/freelancers" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Freelancers</Link>
                  )}
                  <Link to="/dashboard" className="px-5 py-3.5 text-[10px] font-black text-white/35 uppercase tracking-[0.25em] hover:bg-white/[0.04] hover:text-white rounded-2xl transition-all" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  {user.role === 'client' && (
                    <Link to="/jobs/new" className="mx-3 my-1.5 px-5 py-3.5 text-[10px] font-black bg-white text-slate-950 rounded-2xl uppercase tracking-[0.25em] text-center" onClick={() => setMenuOpen(false)}>Post a Gig</Link>
                  )}
                  <button onClick={handleLogout} className="px-5 py-3.5 text-[10px] font-black text-red-400/50 uppercase tracking-[0.18em] hover:text-red-400 rounded-2xl text-left transition-all">Sign Out</button>
                </>
              ) : (
                <>
                  {location.pathname !== '/login' && (
                    <Link to="/login" className="mx-3 my-1 px-5 py-3.5 text-[10px] font-black text-white border border-white/[0.1] rounded-2xl uppercase tracking-[0.25em] text-center hover:bg-white/[0.04] transition-all" onClick={() => setMenuOpen(false)}>Log In</Link>
                  )}
                  {location.pathname !== '/signup' && (
                    <Link to="/signup" className="mx-3 my-1 px-5 py-3.5 text-[10px] font-black bg-white text-slate-950 rounded-2xl uppercase tracking-[0.25em] text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;