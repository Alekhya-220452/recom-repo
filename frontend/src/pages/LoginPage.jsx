import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Home, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin('mock-token-123');
      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d[0].msg : 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">

      {/* ── Full-bleed background photo ── */}
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=95&auto=format&fit=crop&crop=center"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: '60% center', filter: 'brightness(0.38) saturate(1.1) contrast(1.08)' }}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=95&auto=format&fit=crop'; }}
      />

      {/* ── Back to Homepage button — fixed top-left ── */}
      <Link
        to="/"
        style={{
          position: 'fixed', top: 20, left: 24, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 13, fontWeight: 700,
          textDecoration: 'none',
          letterSpacing: '0.01em',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
          transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s, background 0.2s, color 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
      >
        <ArrowLeft size={14} style={{ flexShrink: 0 }} />
        <span>Back to Home</span>
      </Link>

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(6,9,26,0.70) 0%,rgba(13,17,48,0.55) 50%,rgba(6,9,26,0.68) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(99,102,241,0.12) 0%,transparent 65%)' }} />

      {/* ── Centered glass card ── */}
      <div className="relative z-10 w-full max-w-[580px]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: 'all 0.6s cubic-bezier(.16,1,.3,1)' }}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
          {/* Nexlance SVG icon */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
              <path d="M9 22.5L9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17L21 9C21 8.44772 21.4477 8 22 8V8C22.5523 8 23 8.44772 23 9L23 17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5V23C10 23.5523 9.55228 24 9 24V24C8.44772 24 8 23.5523 8 23L8 22.5C8 21.6716 8.67157 21 9.5 21C10.3284 21 11 21.6716 11 22.5V22.5" fill="url(#loginNexGrad)" />
              <defs>
                <linearGradient id="loginNexGrad" x1="8" y1="6" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="0.5" stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#9333ea" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#22d3ee,#3b82f6,#9333ea)', opacity: 0.35, filter: 'blur(8px)' }} />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Nexlance</span>
        </div>

        {/* Glass form card */}
        <div className="rounded-[22px] overflow-hidden"
          style={{
            background: 'rgba(8,12,32,0.82)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          <div className="p-8">
            {/* Heading */}
            <div className="text-center mb-7"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.15s' }}>
              <h1 className="text-2xl font-black text-white mb-1.5"
                style={{  letterSpacing: '-0.02em' }}>
                Welcome back 👋
              </h1>
              <p className="text-white/40 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Google SSO button */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.18s' }}>
              <button
                type="button"
                id="google-login-button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mb-5 w-full flex items-center justify-center gap-3 py-3 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#fff', color: '#1f2937', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5"
              style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease 0.22s' }}>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-white/25 text-sm font-medium px-2">or sign in with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.25s' }}>
                <label className="block text-[12px] font-bold text-white/35 uppercase tracking-[0.25em] mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/22 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-4 rounded-xl text-white text-base font-medium outline-none transition-all duration-200 placeholder-white/20"
                    style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
                    onFocus={e => { e.target.style.background = 'rgba(99,102,241,0.07)'; e.target.style.border = '1px solid rgba(129,140,248,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.055)'; e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.30s' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[12px] font-bold text-white/35 uppercase tracking-[0.25em]">Password</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/22 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-4 rounded-xl text-white text-base font-medium outline-none transition-all duration-200 placeholder-white/20"
                    style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
                    onFocus={e => { e.target.style.background = 'rgba(99,102,241,0.07)'; e.target.style.border = '1px solid rgba(129,140,248,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; }}
                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.055)'; e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(8px)', transition: 'all 0.5s ease 0.34s' }}>
                <button type="submit" disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-bold text-white overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 60%,#7c3aed 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 20px rgba(99,102,241,0.38)' }}>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12 pointer-events-none" />
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                    : <><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /></>
                  }
                </button>
              </div>
            </form>

            <p className="text-center text-base text-white/35 mt-6"
              style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.40s' }}>
              New here?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create a free account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom caption */}
        <p className="text-center mt-5 text-white/30 text-[13px] font-medium"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 0.45s' }}>
          🔒 Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage;