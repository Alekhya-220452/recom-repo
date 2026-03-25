import React from 'react';

const PageBackground = ({ variant = 'light' }) => {
  const isDark = variant === 'dark';
  const isAuth = variant === 'auth';

  const bgImage = isAuth
    ? 'url("/assets/images/auth_bg.png")'
    : 'url("/assets/images/water_bg.png")';

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: bgImage,
          filter: isDark
            ? 'brightness(0.25) saturate(0.8)'
            : isAuth
              ? 'brightness(0.75) contrast(1.05) saturate(0.9)'
              : 'brightness(1.05) saturate(1.05)',
        }}
      ></div>

      {/* Dark overlay */}
      <div
        className={`absolute inset-0 ${isDark
            ? 'bg-slate-950/55'
            : isAuth
              ? 'bg-slate-900/50'
              : 'bg-white/25'
          } backdrop-blur-[3px]`}
      ></div>

      {/* Gradient depth */}
      <div
        className={`absolute inset-0 ${isDark || isAuth
            ? 'bg-gradient-to-tr from-slate-950 via-slate-950/40 to-slate-900/30'
            : 'bg-gradient-to-tr from-white/10 via-transparent to-blue-50/10'
          }`}
      ></div>

      {/* Subtle vignette for dark variant */}
      {isDark && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)]"></div>
      )}
    </div>
  );
};

export default PageBackground;