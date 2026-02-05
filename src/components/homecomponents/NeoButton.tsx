const NeonButton = () => {
  return (
    <div className="inline-block">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
        
        @keyframes border-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes plasma-move {
          0% { transform: translateX(-55%); }
          100% { transform: translateX(55%); }
        }

        @keyframes plasma-opacity {
          0%, 100% { opacity: 0; }
          15% { opacity: 1; }
          65% { opacity: 0; }
        }

        @keyframes letter-glow {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          5% { 
            opacity: 1; 
            text-shadow: 0 0 8px #4438ad, 0 0 16px #566fdb;
            transform: scale(1.02) translateY(-1px);
          }
          20% { opacity: 1; transform: scale(1) translateY(0); text-shadow: none; }
          100% { opacity: 1; }
        }
      `}</style>

      <button
        className="inline-flex transition overflow-hidden group text-sm font-medium rounded-full relative items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--color-background) 0%, var(--card-background-glass) 100%)',
          border: 'none',
          boxShadow: 'rgba(68, 56, 173, 0.2) 0px 8px 32px, rgba(68, 56, 173, 0.1) 0px 1px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px inset',
          transition: 'all 0.3s ease-out',
          transform: 'translateY(0px)',
          height: '60px',
          minWidth: '300px',
          fontFamily: "'JetBrains Mono', monospace",
          padding: '0'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(68, 56, 173, 0.3), inset 0 1px 0 rgba(68, 56, 173, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1), 0 0 30px rgba(68, 56, 173, 0.4), 0 0 60px rgba(68, 56, 173, 0.2)';
          const borderGlow = e.currentTarget.querySelector('.border-glow') as HTMLElement;
          if (borderGlow) {
            borderGlow.style.opacity = '1';
            borderGlow.style.filter = 'blur(6px)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'rgba(68, 56, 173, 0.2) 0px 8px 32px, rgba(68, 56, 173, 0.1) 0px 1px 0px inset, rgba(0, 0, 0, 0.1) 0px -1px 0px inset';
          const borderGlow = e.currentTarget.querySelector('.border-glow') as HTMLElement;
          if (borderGlow) {
            borderGlow.style.opacity = '0.7';
            borderGlow.style.filter = 'blur(3px)';
          }
        }}
      >
        {/* Animated Border Glow */}
        <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '9999px',
          zIndex: 0,
          overflow: 'hidden'
        }}>
          <div 
            className="border-glow"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 60deg, #4438ad 120deg, #566fdb 180deg, #2563EB 240deg, transparent 300deg, transparent 360deg)',
              animation: 'border-rotate 6s linear infinite',
              filter: 'blur(3px)',
              opacity: 0.7,
              transition: 'all 0.3s ease-out'
            }}
          />
        </div>

        {/* Inner Background */}
        <div style={{
          position: 'absolute',
          inset: '2px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, var(--color-background) 0%, var(--card-background-glass) 100%)',
          zIndex: 1
        }} />

        {/* Plasma Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 2,
          backgroundColor: 'transparent',
          mask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)',
          WebkitMask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)',
          borderRadius: '9999px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              radial-gradient(circle at 50% 50%, #4438ad 0%, transparent 50%),
              radial-gradient(circle at 45% 45%, #2563EB 0%, transparent 45%),
              radial-gradient(circle at 55% 55%, #566fdb 0%, transparent 45%),
              radial-gradient(circle at 45% 55%, #4438ad 0%, transparent 45%),
              radial-gradient(circle at 55% 45%, #566fdb 0%, transparent 45%)
            `,
            mask: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%)',
            WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%)',
            animation: 'plasma-move 2s infinite alternate, plasma-opacity 4s infinite',
            animationTimingFunction: 'cubic-bezier(0.6, 0.8, 0.5, 1)',
            filter: 'drop-shadow(0 0 8px rgba(68, 56, 173, 0.6))'
          }} />
        </div>

        {/* Text */}
        <span style={{
          position: 'relative',
          zIndex: 3,
          fontSize: '1.1em',
          fontWeight: 700,
          userSelect: 'none',
          color: 'var(--color-text)',
          display: 'flex',
          gap: '0.08em',
          letterSpacing: '0.02em',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.1s' }}>V</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.14s' }}>i</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.18s' }}>r</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.22s' }}>a</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.26s' }}>r</span>
          <span style={{ display: 'inline-block', width: '0.35em' }} />
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.34s' }}>P</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.38s' }}>r</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.42s' }}>e</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.46s' }}>m</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.50s' }}>i</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.54s' }}>u</span>
          <span style={{ display: 'inline-block', animation: 'letter-glow 4s infinite linear', animationDelay: '0.58s' }}>m</span>
        </span>
      </button>
    </div>
  );
};

export default NeonButton;