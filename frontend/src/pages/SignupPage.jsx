import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

/* ─── tiny keyframes injected once ─── */
const STYLES = `
@keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer  { from { transform:translateX(-100%) skewX(-12deg); } to { transform:translateX(220%) skewX(-12deg); } }
@keyframes barSlide { from { transform:scaleX(0); } to { transform:scaleX(1); } }
@keyframes pulse    { 0%,100%{ opacity:.6; } 50%{ opacity:1; } }
`;

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'freelancer' ? 'freelancer' : 'client';

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: initialRole, bio: '', skills: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);   // animation step 0=hidden,1=visible
  const [roleAnim, setRoleAnim] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await googleLogin('mock-token-123', formData.role);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Google signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setStep(1), 80);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const switchRole = (role) => {
    if (role === formData.role) return;
    setRoleAnim(true);
    setTimeout(() => { setFormData(f => ({ ...f, role })); setRoleAnim(false); }, 240);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      e.name = 'At least 2 characters required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Enter a valid email address.';
    if (!formData.password || formData.password.length < 6)
      e.password = 'Minimum 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    try {
      await register(formData);
      setSubmitSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const d = err.response?.data?.detail;
      setErrors({ general: typeof d === 'string' ? d : Array.isArray(d) ? d[0].msg : 'Error creating account. Try again.' });
    } finally { setLoading(false); }
  };

  const isFL = formData.role === 'freelancer';

  /* ── Accent tokens per role ── */
  const A = isFL ? {
    topBar: 'linear-gradient(90deg,#059669,#10b981,#34d399,#10b981,#059669)',
    btnGrad: 'linear-gradient(135deg,#059669 0%,#10b981 60%,#34d399 100%)',
    btnShd: '0 0 0 1px rgba(16,185,129,0.30), 0 10px 28px rgba(16,185,129,0.38)',
    pillOn: 'linear-gradient(135deg,#059669,#10b981)',
    pillShd: '0 4px 14px rgba(16,185,129,0.40)',
    fBdr: '1px solid rgba(52,211,153,0.60)',
    fBg: 'rgba(16,185,129,0.07)',
    fShdw: '0 0 0 3px rgba(16,185,129,0.11)',
    iconFoc: '#34d399',
    linkCls: 'text-emerald-400 hover:text-emerald-300',
    orbClr: 'rgba(16,185,129,0.09)',
    btnColor: '#030f09',
    spinCls: 'border-[#030f09]/20 border-t-[#030f09]',
    labelClr: 'rgba(52,211,153,0.60)',
    checkClr: 'text-emerald-400',
    roleBg: 'rgba(16,185,129,0.08)',
    roleBdr: '1px solid rgba(16,185,129,0.18)',
  } : {
    topBar: 'linear-gradient(90deg,#4f46e5,#6366f1,#818cf8,#6366f1,#4f46e5)',
    btnGrad: 'linear-gradient(135deg,#4f46e5 0%,#6366f1 60%,#818cf8 100%)',
    btnShd: '0 0 0 1px rgba(99,102,241,0.30), 0 10px 28px rgba(99,102,241,0.38)',
    pillOn: 'linear-gradient(135deg,#4f46e5,#6366f1)',
    pillShd: '0 4px 14px rgba(99,102,241,0.40)',
    fBdr: '1px solid rgba(129,140,248,0.60)',
    fBg: 'rgba(99,102,241,0.07)',
    fShdw: '0 0 0 3px rgba(99,102,241,0.11)',
    iconFoc: '#818cf8',
    linkCls: 'text-indigo-400 hover:text-indigo-300',
    orbClr: 'rgba(99,102,241,0.11)',
    btnColor: '#ffffff',
    spinCls: 'border-white/20 border-t-white',
    labelClr: 'rgba(129,140,248,0.70)',
    checkClr: 'text-indigo-400',
    roleBg: 'rgba(99,102,241,0.08)',
    roleBdr: '1px solid rgba(99,102,241,0.18)',
  };

  /* ── Input style helpers ── */
  const iBase = { background: 'rgba(255,255,255,0.052)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', color: '#fff', width: '100%', outline: 'none', transition: 'all .2s ease', padding: '13px 16px 13px 44px', fontSize: '14px', fontWeight: 500 };
  const iPlain = { ...iBase, paddingLeft: '16px' };  // no icon
  const onFocusIn = e => { e.target.style.background = A.fBg; e.target.style.border = A.fBdr; e.target.style.boxShadow = A.fShdw; };
  const onFocusOut = e => { e.target.style.background = 'rgba(255,255,255,0.052)'; e.target.style.border = '1px solid rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; };

  /* ── Stagger helper ── */
  const stagger = (i) => ({
    opacity: step ? 1 : 0,
    transform: step ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity .55s ease ${0.06 * i}s, transform .55s cubic-bezier(.16,1,.3,1) ${0.06 * i}s`,
  });

  const LABEL_STYLE = { display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: A.labelClr, marginBottom: '7px' };
  const ERR = ({ msg }) => msg ? <p style={{ marginTop: '5px', fontSize: '11px', color: '#f87171', fontWeight: 500 }}>{msg}</p> : null;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative', overflow: 'hidden', background: '#06091a' }}>

        {/* ── HD background photo ── */}
        <img
          key={isFL ? 'fl' : 'cl'}
          src={isFL
            ? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=95&auto=format&fit=crop&crop=center'
            : 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=95&auto=format&fit=crop&crop=center'
          }
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%',
            filter: 'brightness(0.30) saturate(1.1) contrast(1.1)',
            opacity: roleAnim ? 0 : 1, transition: 'opacity .55s ease',
          }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=95&auto=format&fit=crop'; }}
        />

        {/* Dark + accent gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, transition: 'background .6s ease', background: isFL
            ? 'linear-gradient(135deg,rgba(3,10,18,.78) 0%,rgba(4,16,24,.60) 50%,rgba(3,10,18,.76) 100%)'
            : 'linear-gradient(135deg,rgba(6,9,26,.78) 0%,rgba(13,17,48,.60) 50%,rgba(6,9,26,.76) 100%)'
        }} />
        {/* Radial color orb — role-aware */}
        <div style={{ position: 'absolute', inset: 0, transition: 'background .7s ease', background: `radial-gradient(ellipse at 50% 50%,${A.orbClr} 0%,transparent 62%)` }} />

        {/* ── Card wrapper ── */}
        <div ref={cardRef} style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: '640px',
          opacity: step ? 1 : 0,
          transform: step ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
          transition: 'opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1)',
        }}>

          {/* ── Logo above card ── */}
          <div style={{ ...stagger(1), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
                <path d="M9 22.5L9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17L21 9C21 8.44772 21.4477 8 22 8V8C22.5523 8 23 8.44772 23 9L23 17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5V23C10 23.5523 9.55228 24 9 24V24C8.44772 24 8 23.5523 8 23L8 22.5C8 21.6716 8.67157 21 9.5 21C10.3284 21 11 21.6716 11 22.5V22.5" fill="url(#signupNexGrad)" />
                <defs>
                  <linearGradient id="signupNexGrad" x1="8" y1="6" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="0.5" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#22d3ee,#3b82f6,#9333ea)', opacity: 0.35, filter: 'blur(8px)' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '18px', color: '#fff', letterSpacing: '-.02em' }}>Nexlance</span>
          </div>

          {/* ── Glass card ── */}
          <div style={{
            borderRadius: '24px', overflow: 'hidden',
            background: 'rgba(7,11,30,0.88)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

            <div style={{ padding: '36px 40px 40px' }}>

              {/* Heading */}
              <div style={{ ...stagger(2), textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{  fontWeight: 900, fontSize: '26px', color: '#fff', letterSpacing: '-.03em', marginBottom: '6px', transition: 'all .3s ease' }}>
                  {isFL ? 'Start freelancing 🚀' : 'Hire top talent 🎯'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px', fontWeight: 500 }}>
                  Create your free account — no credit card needed
                </p>
              </div>

              {/* Role toggle */}
              <div style={{ ...stagger(3), display: 'flex', gap: '6px', padding: '5px', borderRadius: '14px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {['client', 'freelancer'].map(role => {
                  const active = formData.role === role;
                  return (
                    <button key={role} type="button" onClick={() => switchRole(role)}
                      style={{
                        flex: 1, padding: '11px 0', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer',
                        letterSpacing: '.06em', textTransform: 'uppercase', position: 'relative', overflow: 'hidden',
                        transition: 'all .35s cubic-bezier(.16,1,.3,1)',
                        background: active ? A.pillOn : 'transparent',
                        color: active ? (isFL ? '#030f09' : '#fff') : 'rgba(255,255,255,0.28)',
                        boxShadow: active ? A.pillShd : 'none',
                      }}>
                      {active && <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', animation: 'shimmer .6s ease', pointerEvents: 'none' }} />}
                      {role === 'client' ? "I'm a Client" : "I'm a Freelancer"}
                    </button>
                  );
                })}
              </div>

              {/* Google SSO button */}
              <div style={stagger(4)}>
                <button
                  type="button"
                  id="google-signup-button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', padding: '12px 0', borderRadius: '50px', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: '#fff', color: '#1f2937',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.30)',
                    marginBottom: '20px', transition: 'background 0.2s ease',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div style={{ ...stagger(5), display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', fontWeight: 500, whiteSpace: 'nowrap' }}>or sign up with email</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* General error */}
              {errors.general && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.24)', animation: 'fadeIn .3s ease' }}>
                  <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: '#f87171', fontWeight: 500 }}>{errors.general}</p>
                </div>
              )}

              {/* Form — fades on role switch */}
              <form onSubmit={handleSubmit} noValidate
                style={{ opacity: roleAnim ? 0 : 1, transform: roleAnim ? 'translateY(6px)' : 'none', transition: 'opacity .24s ease,transform .24s ease' }}>

                {/* Row 1: Name + Email */}
                <div style={{ ...stagger(6), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={LABEL_STYLE}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none', transition: 'color .2s' }} />
                      <input name="name" type="text" value={formData.name} onChange={handleChange}
                        placeholder="Your full name" style={iBase} onFocus={onFocusIn} onBlur={onFocusOut}
                        onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                        onMouseOut={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                      />
                    </div>
                    <ERR msg={errors.name} />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                      <input name="email" type="email" value={formData.email} onChange={handleChange}
                        placeholder="you@example.com" style={iBase} onFocus={onFocusIn} onBlur={onFocusOut}
                        onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                        onMouseOut={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                      />
                    </div>
                    <ERR msg={errors.email} />
                  </div>
                </div>

                {/* Row 2: Password + Skills(FL) */}
                <div style={{ ...stagger(7), display: 'grid', gridTemplateColumns: isFL ? '1fr 1fr' : '1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={LABEL_STYLE}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                      <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                        placeholder="Min 6 characters" style={{ ...iBase, paddingRight: '44px' }} onFocus={onFocusIn} onBlur={onFocusOut}
                        onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                        onMouseOut={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: 0, display: 'flex' }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <ERR msg={errors.password} />
                  </div>

                  {/* Skills — only for freelancer, slides in */}
                  <div style={{ overflow: 'hidden', maxHeight: isFL ? '90px' : '0', opacity: isFL ? 1 : 0, transition: 'max-height .4s cubic-bezier(.16,1,.3,1), opacity .3s ease' }}>
                    <label style={LABEL_STYLE}>Skills (comma-separated)</label>
                    <input name="skills" type="text" value={formData.skills} onChange={handleChange}
                      placeholder="React, Node.js, Python..." style={iPlain} onFocus={onFocusIn} onBlur={onFocusOut}
                      onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                      onMouseOut={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                    />
                  </div>
                </div>

                {/* Bio — full width */}
                <div style={{ ...stagger(8), marginBottom: '22px' }}>
                  <label style={LABEL_STYLE}>Bio <span style={{ color: 'rgba(255,255,255,0.22)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                    placeholder={isFL ? 'Tell clients about your expertise, background, and what makes you stand out...' : 'Tell freelancers about your company, projects, and what you\'re looking to build...'}
                    style={{ ...iPlain, resize: 'none', paddingTop: '13px', paddingBottom: '13px', lineHeight: '1.55' }}
                    onFocus={onFocusIn} onBlur={onFocusOut}
                    onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                    onMouseOut={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  />
                </div>

                {/* Submit */}
                <div style={stagger(9)}>
                  <button type="submit" disabled={loading || submitSuccess}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      padding: '15px 0', borderRadius: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      border: 'none', position: 'relative', overflow: 'hidden', transition: 'all .3s ease',
                      background: submitSuccess ? 'linear-gradient(135deg,#059669,#10b981)' : A.btnGrad,
                      color: A.btnColor, boxShadow: A.btnShd,
                      transform: loading ? 'scale(0.99)' : 'scale(1)',
                    }}
                    onMouseOver={e => { if (!loading && !submitSuccess) e.currentTarget.style.filter = 'brightness(1.10)'; }}
                    onMouseOut={e => { e.currentTarget.style.filter = 'none'; }}>
                    {/* Shine overlay */}
                    {!loading && !submitSuccess && (
                      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)', transform: 'translateX(-100%) skewX(-12deg)', transition: 'transform .7s ease', pointerEvents: 'none' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateX(220%) skewX(-12deg)'; }} />
                    )}
                    {submitSuccess
                      ? <><CheckCircle size={17} /><span>Account Created!</span></>
                      : loading
                        ? <div style={{ width: '17px', height: '17px', borderRadius: '50%', border: `2.5px solid transparent`, borderTopColor: A.btnColor, animation: 'spin 0.75s linear infinite', opacity: .7 }} />
                        : <><span>Create Account</span><ArrowRight size={17} /></>
                    }
                  </button>
                </div>
              </form>

              {/* Footer links */}
              <div style={{ ...stagger(10), marginTop: '22px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)' }}>
                  Already have an account?{' '}
                  <Link to="/login" className={`font-semibold transition-colors ${A.linkCls}`}>Sign in here</Link>
                </p>
              </div>

            </div>
          </div>

          {/* Bottom trust row */}
          <div style={{ ...stagger(11), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '18px' }}>
            {['🔒 SSL Encrypted', '✓ No credit card', '🌍 50K+ Members'].map(t => (
              <span key={t} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;