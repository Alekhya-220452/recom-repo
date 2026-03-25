import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Plus, Briefcase, Users,
  CreditCard, LogOut, Menu, X,
  Search, ClipboardList, Star, MessageSquare,
  CheckCircle, Activity, Bookmark, User, ShieldCheck
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

/* ─── per-item accent colours ─────────────────────────────────── */
const ACCENT = {
  Dashboard:    { color: '#60a5fa', glow: 'rgba(96,165,250,0.18)',  bg: 'rgba(96,165,250,0.10)'  },
  Messages:     { color: '#34d399', glow: 'rgba(52,211,153,0.18)',  bg: 'rgba(52,211,153,0.10)'  },
  'Post Gig':   { color: '#f472b6', glow: 'rgba(244,114,182,0.18)', bg: 'rgba(244,114,182,0.10)' },
  'Posted Gigs':{ color: '#a78bfa', glow: 'rgba(167,139,250,0.18)', bg: 'rgba(167,139,250,0.10)' },
  Proposals:    { color: '#fb923c', glow: 'rgba(251,146,60,0.18)',  bg: 'rgba(251,146,60,0.10)'  },
  Projects:     { color: '#38bdf8', glow: 'rgba(56,189,248,0.18)',  bg: 'rgba(56,189,248,0.10)'  },
  Completed:    { color: '#4ade80', glow: 'rgba(74,222,128,0.18)',  bg: 'rgba(74,222,128,0.10)'  },
  Freelancers:  { color: '#fbbf24', glow: 'rgba(251,191,36,0.18)',  bg: 'rgba(251,191,36,0.10)'  },
  Payments:     { color: '#34d399', glow: 'rgba(52,211,153,0.18)',  bg: 'rgba(52,211,153,0.10)'  },
  Earnings:     { color: '#34d399', glow: 'rgba(52,211,153,0.18)',  bg: 'rgba(52,211,153,0.10)'  },
  Profile:      { color: '#c084fc', glow: 'rgba(192,132,252,0.18)', bg: 'rgba(192,132,252,0.10)' },
  'Browse Gigs':{ color: '#f472b6', glow: 'rgba(244,114,182,0.18)', bg: 'rgba(244,114,182,0.10)' },
  'Saved Gigs': { color: '#fbbf24', glow: 'rgba(251,191,36,0.18)',  bg: 'rgba(251,191,36,0.10)'  },
  'My Bids':    { color: '#fb923c', glow: 'rgba(251,146,60,0.18)',  bg: 'rgba(251,146,60,0.10)'  },
  Disputes:     { color: '#f87171', glow: 'rgba(248,113,113,0.18)', bg: 'rgba(248,113,113,0.10)' },
};

const DEFAULT_ACCENT = { color: '#94a3b8', glow: 'rgba(148,163,184,0.12)', bg: 'rgba(148,163,184,0.08)' };

const STYLES = `
  .snav::-webkit-scrollbar { width: 3px; }
  .snav::-webkit-scrollbar-track { background: transparent; }
  .snav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 3px; }
  .snav { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.07) transparent; }
  @keyframes sidebarFadeIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
  .sidebar-label { animation: sidebarFadeIn 0.18s ease; }
`;

const ICON = 18;

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen: open, toggleSidebar } = useSidebar();

  const hiddenPaths = ['/', '/login', '/signup'];
  if (!user || hiddenPaths.includes(location.pathname)) return null;

  const isActive = (to) => {
    if (to.includes('?')) return location.pathname + location.search === to;
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const clientItems = [
    { section: 'Main' },
    { icon: <LayoutDashboard size={ICON} />, label: 'Dashboard',  to: '/dashboard' },
    { icon: <MessageSquare  size={ICON} />, label: 'Messages',    to: '/messages' },
    { section: 'Work' },
    { icon: <Plus           size={ICON} />, label: 'Post Gig',    to: '/jobs/new' },
    { icon: <Briefcase      size={ICON} />, label: 'Posted Gigs', to: '/dashboard?tab=jobs' },
    { icon: <ClipboardList  size={ICON} />, label: 'Proposals',   to: '/dashboard?tab=proposals' },
    { icon: <Activity       size={ICON} />, label: 'Projects',    to: '/dashboard?tab=projects' },
    { icon: <CheckCircle    size={ICON} />, label: 'Completed',   to: '/dashboard?tab=completed' },
    { section: 'Network' },
    { icon: <Users          size={ICON} />, label: 'Freelancers', to: '/freelancers' },
    { section: 'Account' },
    { icon: <CreditCard     size={ICON} />, label: 'Payments',    to: '/dashboard?tab=payments' },
    { icon: <User           size={ICON} />, label: 'Profile',     to: `/profile/${user?.user_id}` },
  ];

  const freelancerItems = [
    { section: 'Main' },
    { icon: <LayoutDashboard size={ICON} />, label: 'Dashboard',   to: '/dashboard' },
    { icon: <MessageSquare   size={ICON} />, label: 'Messages',    to: '/messages' },
    { section: 'Work' },
    { icon: <Search          size={ICON} />, label: 'Browse Gigs', to: '/jobs' },
    { icon: <Bookmark        size={ICON} />, label: 'Saved Gigs',  to: '/saved-jobs' },
    { icon: <ClipboardList   size={ICON} />, label: 'My Bids',     to: '/dashboard?tab=bids' },
    { icon: <Briefcase       size={ICON} />, label: 'Projects',    to: '/dashboard?tab=projects' },
    { icon: <Star            size={ICON} />, label: 'Completed',   to: '/dashboard?tab=completed' },
    { section: 'Account' },
    { icon: <CreditCard      size={ICON} />, label: 'Earnings',    to: '/dashboard?tab=payments' },
    { icon: <User            size={ICON} />, label: 'Profile',     to: `/profile/${user?.user_id}` },
  ];

  const adminItems = [
    { section: 'Administration' },
    { icon: <ShieldCheck size={ICON} />, label: 'Disputes', to: '/admin/disputes' },
  ];

  const navItems = user?.role === 'admin' ? adminItems
    : user?.role === 'client' ? clientItems
    : freelancerItems;

  const W_OPEN   = 256;
  const W_CLOSED = 58;
  const w = open ? W_OPEN : W_CLOSED;

  return (
    <>
      <style>{STYLES}</style>
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', width: w, zIndex: 51,
        background: 'linear-gradient(180deg, #080f1e 0%, #0a1020 60%, #080e1c 100%)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.24s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        boxShadow: open ? '4px 0 32px rgba(0,0,0,0.45)' : 'none',
      }}>

        {/* ── Header: logo + name (open) or hamburger (closed) ── */}
        <div style={{
          minHeight: '4.5rem', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: open ? '0 14px 0 16px' : '0',
          gap: 10,
        }}>
          {open ? (
            <>
              {/* Logo + brand name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ position:'relative', width:30, height:30, borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{ width:'100%', height:'100%', position:'relative', zIndex:1 }}>
                    <path d="M9 22.5L9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17L21 9C21 8.44772 21.4477 8 22 8V8C22.5523 8 23 8.44772 23 9L23 17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5V23C10 23.5523 9.55228 24 9 24V24C8.44772 24 8 23.5523 8 23L8 22.5C8 21.6716 8.67157 21 9.5 21C10.3284 21 11 21.6716 11 22.5V22.5"
                      fill="url(#sbLogoGrad)"/>
                    <defs>
                      <linearGradient id="sbLogoGrad" x1="8" y1="6" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22d3ee"/>
                        <stop offset="0.5" stopColor="#3b82f6"/>
                        <stop offset="1" stopColor="#9333ea"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#22d3ee,#3b82f6,#9333ea)', opacity:0.28, filter:'blur(6px)' }}/>
                </div>
                <div>
                  <div style={{ color:'#fff', fontWeight:800, fontSize:15.5, letterSpacing:'-0.03em', lineHeight:1, fontFamily:"'Space Grotesk',sans-serif" }}>
                    Nexlance
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.28)', fontSize:10, fontWeight:600, letterSpacing:'0.08em', marginTop:2, textTransform:'uppercase' }}>
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'client' ? 'Client' : 'Freelancer'}
                  </div>
                </div>
              </div>

              {/* Close (✕) button — top-right when open */}
              <button onClick={toggleSidebar} title="Close menu" style={{
                width:32, height:32, borderRadius:8, border:'none', flexShrink:0,
                background:'rgba(239,68,68,0.07)', color:'rgba(248,113,113,0.65)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', transition:'all 0.15s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.16)'; e.currentTarget.style.color='#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.07)'; e.currentTarget.style.color='rgba(248,113,113,0.65)'; }}
              >
                <X size={15}/>
              </button>
            </>
          ) : (
            /* Hamburger (☰) — centred when closed */
            <button onClick={toggleSidebar} title="Open menu" style={{
              width:36, height:36, borderRadius:10, border:'none',
              background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'all 0.15s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.18)'; e.currentTarget.style.color='#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}
            >
              <Menu size={17}/>
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="snav" style={{
          flex:1, padding:'10px 8px',
          overflowY:'auto', display:'flex', flexDirection:'column', gap:1,
        }}>
          {navItems.map((item, idx) => {
            if (item.section) {
              return open ? (
                <div key={`s-${idx}`} style={{
                  fontSize:'10px', fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'0.14em', color:'rgba(255,255,255,0.22)',
                  padding: idx === 0 ? '10px 14px 6px' : '22px 14px 6px',
                }}>
                  {item.section}
                </div>
              ) : (
                <div key={`s-${idx}`} style={{ height: idx === 0 ? 8 : 18 }}/>
              );
            }
            return <NavItem key={item.label} item={item} active={isActive(item.to)} open={open}/>;
          })}
        </nav>

        {/* ── Log Out ── */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'8px' }}>
          <button onClick={handleLogout} title={!open ? 'Log out' : undefined} style={{
            display:'flex', alignItems:'center', gap:12,
            width:'100%', padding: open ? '11px 14px' : '11px',
            borderRadius:10, border:'none', background:'transparent',
            color:'rgba(255,255,255,0.38)', cursor:'pointer',
            fontWeight:600, fontSize:13.5, whiteSpace:'nowrap',
            justifyContent: open ? 'flex-start' : 'center',
            transition:'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.10)'; e.currentTarget.style.color='#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.38)'; }}
          >
            <LogOut size={16} style={{ flexShrink:0, opacity:0.7 }}/>
            {open && <span className="sidebar-label">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Spacer that pushes page content right */}
      <div style={{ width:w, flexShrink:0, transition:'width 0.24s cubic-bezier(0.16,1,0.3,1)' }}/>
    </>
  );
};

/* ── Single nav link ── */
const NavItem = ({ item, active, open }) => {
  const [hovered, setHovered] = useState(false);
  const acc = ACCENT[item.label] || DEFAULT_ACCENT;

  const bg    = active ? acc.bg    : hovered ? 'rgba(255,255,255,0.04)' : 'transparent';
  const color = active ? acc.color : hovered ? '#e2e8f0'                : 'rgba(255,255,255,0.48)';

  return (
    <Link
      to={item.to}
      title={!open ? item.label : undefined}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding: open ? '10px 14px' : '10px',
        borderRadius:10, textDecoration:'none',
        color, background: bg,
        fontWeight: active ? 700 : 500,
        fontSize: 13.5,
        whiteSpace:'nowrap',
        justifyContent: open ? 'flex-start' : 'center',
        position:'relative',
        transition:'background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease',
        transform: hovered && !active ? 'translateX(3px)' : 'none',
        boxShadow: active && open ? `inset 0 0 0 1px ${acc.color}28` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* active accent bar */}
      {active && open && (
        <span style={{
          position:'absolute', left:0, top:'16%', bottom:'16%',
          width:3, borderRadius:'0 3px 3px 0',
          background: `linear-gradient(to bottom, ${acc.color}, ${acc.color}88)`,
          boxShadow: `0 0 8px ${acc.glow}`,
        }}/>
      )}

      {/* icon */}
      <span style={{
        flexShrink:0, display:'flex',
        color: active ? acc.color : hovered ? '#e2e8f0' : 'rgba(255,255,255,0.38)',
        filter: active ? `drop-shadow(0 0 5px ${acc.glow})` : hovered ? 'brightness(1.3)' : 'none',
        transition:'color 0.16s ease, filter 0.16s ease',
      }}>
        {item.icon}
      </span>

      {/* label */}
      {open && (
        <span className="sidebar-label" style={{
          background: active
            ? `linear-gradient(90deg, ${acc.color}, ${acc.color}cc)`
            : 'none',
          WebkitBackgroundClip: active ? 'text' : 'unset',
          WebkitTextFillColor: active ? 'transparent' : 'inherit',
          letterSpacing:'0.01em',
        }}>
          {item.label}
        </span>
      )}

      {/* hover glow pip on closed mode */}
      {!open && hovered && (
        <span style={{
          position:'absolute', right:-1, top:'25%', bottom:'25%',
          width:2, borderRadius:'2px 0 0 2px',
          background: acc.color,
          boxShadow: `0 0 6px ${acc.glow}`,
        }}/>
      )}
    </Link>
  );
};

export default Sidebar;
