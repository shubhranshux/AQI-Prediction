import { useEffect, useRef, useMemo } from 'react';

/*
  Premium nature-inspired hero background
  - Animated gradient aurora (shifts with time of day)
  - Floating organic particles
  - Subtle grid overlay
  - Glowing orb (sun/moon)
*/
export default function HeroBackground({ isNight = false }) {
  const canvasRef = useRef(null);

  // Floating particles
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      speed: 0.15 + Math.random() * 0.3,
      opacity: 0.1 + Math.random() * 0.3,
      delay: Math.random() * 8,
      drift: -20 + Math.random() * 40,
    })), []);

  const colors = isNight
    ? { g1: '#0a0f1e', g2: '#0d1a2d', g3: '#122040', g4: '#0a1628',
        orb: '#e8e4d0', orbGlow: 'rgba(200,200,180,.15)', orbShadow: 'rgba(180,180,160,.08)',
        particle: '180,200,220', aurora: 'rgba(40,80,140,.15)',
        aurora2: 'rgba(60,40,120,.1)', gridLine: 'rgba(255,255,255,.03)' }
    : { g1: '#e8f4f8', g2: '#d4eef6', g3: '#b8e2f0', g4: '#f0f8fc',
        orb: '#ffd700', orbGlow: 'rgba(255,200,0,.2)', orbShadow: 'rgba(255,165,0,.08)',
        particle: '60,120,80', aurora: 'rgba(34,197,94,.08)',
        aurora2: 'rgba(59,130,246,.06)', gridLine: 'rgba(0,0,0,.03)' };

  return (
    <>
      <style>{`
        .hero-bg {
          position: absolute; inset: 0; overflow: hidden;
          background: linear-gradient(135deg, ${colors.g1} 0%, ${colors.g2} 30%, ${colors.g3} 60%, ${colors.g4} 100%);
          transition: background 1.5s ease;
        }

        /* Animated aurora bands */
        .hero-aurora {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background:
            radial-gradient(ellipse 80% 50% at 20% 50%, ${colors.aurora} 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 70% 30%, ${colors.aurora2} 0%, transparent 50%),
            radial-gradient(ellipse 70% 60% at 50% 70%, ${colors.aurora} 0%, transparent 55%);
          animation: aurora-drift 20s ease-in-out infinite alternate;
          z-index: 1;
        }
        @keyframes aurora-drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(3%, -2%) rotate(2deg); }
          66% { transform: translate(-2%, 3%) rotate(-1deg); }
          100% { transform: translate(1%, -1%) rotate(1deg); }
        }

        /* Grid overlay */
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(${colors.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: 2;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%);
        }

        /* Glowing orb (sun/moon) */
        .hero-orb {
          position: absolute;
          right: 15%; top: 12%;
          width: ${isNight ? 70 : 90}px;
          height: ${isNight ? 70 : 90}px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, ${isNight ? '#fffff4' : '#fff8dc'}, ${colors.orb});
          box-shadow:
            0 0 40px ${colors.orbGlow},
            0 0 120px ${colors.orbShadow},
            0 0 250px ${colors.orbShadow};
          z-index: 4;
          transition: all 1s ease;
        }
        .hero-orb::after {
          content: '';
          position: absolute; inset: -60%;
          border-radius: 50%;
          background: radial-gradient(circle, ${colors.orbGlow}, transparent 65%);
          animation: orb-pulse 6s ease-in-out infinite alternate;
        }
        @keyframes orb-pulse {
          0% { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.15); opacity: .9; }
        }

        /* Floating particles */
        .hero-particle {
          position: absolute;
          border-radius: 50%;
          z-index: 3;
          animation: particle-float linear infinite;
          pointer-events: none;
        }
        @keyframes particle-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--p-opacity); }
          90% { opacity: var(--p-opacity); }
          100% { transform: translateY(-120vh) translateX(var(--p-drift)); opacity: 0; }
        }

        /* Mountain silhouettes at bottom */
        .hero-mountains {
          position: absolute; bottom: 0; left: 0; right: 0;
          z-index: 5; pointer-events: none;
        }

        /* Subtle stars (night only) */
        .hero-star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          animation: star-twinkle 3s ease-in-out infinite alternate;
          z-index: 3;
        }
        @keyframes star-twinkle {
          0% { opacity: .15; transform: scale(.6); }
          100% { opacity: .8; transform: scale(1.1); }
        }

        /* Shooting star */
        .hero-shoot {
          position: absolute; top: 15%; left: 55%;
          width: 3px; height: 3px;
          background: #fff; border-radius: 50%;
          z-index: 4;
          animation: hero-shoot 7s ease-in infinite;
        }
        .hero-shoot::after {
          content: '';
          position: absolute; width: 60px; height: 1.5px;
          background: linear-gradient(to left, transparent, rgba(255,255,255,.6));
          right: 3px;
          transform: rotate(-35deg); transform-origin: right;
        }
        @keyframes hero-shoot {
          0% { transform: translate(0,0); opacity: 0; }
          3% { opacity: 1; }
          10% { transform: translate(-200px,100px); opacity: 0; }
          100% { opacity: 0; }
        }

        /* ── Windmill ── */
        @keyframes wm-spin { to { transform: rotate(360deg); } }

        .wm-wrap {
          position: absolute; bottom: 18%; right: 22%; z-index: 8;
          width: 36px;
        }
        .wm-body {
          width: 24px; height: 80px;
          background: ${isNight ? '#1a2030' : '#5a4535'};
          position: absolute; bottom: 0; left: 6px;
          border-radius: 2px 2px 0 0;
        }
        .wm-body::before {
          content: ''; position: absolute;
          width: 10px; height: 10px; left: 7px; top: 20px;
          background: #FDC500;
          box-shadow: 0 0 12px rgba(253,197,0,.6), 0 18px 0 #FDC500, 0 18px 12px rgba(253,197,0,.4);
        }
        .wm-roof {
          width: 0; height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-bottom: 22px solid ${isNight ? '#1a2030' : '#4a3a2a'};
          position: absolute; bottom: 80px; left: 0;
        }
        .wm-spinner {
          position: absolute; bottom: 62px; left: 13px;
          width: 10px; height: 10px;
          animation: wm-spin 5s linear infinite;
          z-index: 2;
        }
        .wm-hub {
          width: 10px; height: 10px; border-radius: 50%;
          background: ${isNight ? '#3a4558' : '#6b5a48'};
        }
        .wm-blade {
          position: absolute;
          width: 4px; height: 45px;
          background: ${isNight ? '#3a4558' : '#6b5a48'};
          border-left: 1px solid rgba(0,0,0,.15);
          left: 3px; top: 5px;
          transform-origin: 2px 0px;
        }
        .wm-blade::after {
          content: ''; position: absolute; left: 4px; top: 0;
          width: 14px; height: 35px;
          background-size: 7px 8px;
          background-image:
            linear-gradient(to left, rgba(140,150,160,.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(140,150,160,.35) 1px, transparent 1px);
        }
        .wm-b0 { transform: rotate(0deg); }
        .wm-b1 { transform: rotate(90deg); }
        .wm-b2 { transform: rotate(180deg); }
        .wm-b3 { transform: rotate(270deg); }
      `}</style>

      <div className="hero-bg">
        {/* Aurora gradient */}
        <div className="hero-aurora" />

        {/* Grid overlay */}
        <div className="hero-grid" />

        {/* Sun/Moon orb */}
        <div className="hero-orb" />

        {/* Night elements */}
        {isNight && <>
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} className="hero-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              width: 1 + Math.random() * 2.5,
              height: 1 + Math.random() * 2.5,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }} />
          ))}
          <div className="hero-shoot" />
        </>}

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div key={i} className="hero-particle" style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            background: `rgba(${colors.particle}, ${p.opacity})`,
            animationDuration: `${12 + p.speed * 20}s`,
            animationDelay: `${p.delay}s`,
            '--p-opacity': p.opacity,
            '--p-drift': `${p.drift}px`,
          }} />
        ))}

        {/* Mountain silhouettes */}
        <svg className="hero-mountains" viewBox="0 0 1600 200" preserveAspectRatio="none" style={{width:'100%',height:'35%'}}>
          <defs>
            <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNight ? '#0d1520' : '#1a5a2a'} stopOpacity=".6"/>
              <stop offset="100%" stopColor={isNight ? '#080d18' : '#145020'} stopOpacity=".9"/>
            </linearGradient>
            <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNight ? '#0a1018' : '#0f4020'} stopOpacity=".7"/>
              <stop offset="100%" stopColor={isNight ? '#060a12' : '#0a3518'} stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="mt3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isNight ? '#080c14' : '#0a3018'} stopOpacity=".85"/>
              <stop offset="100%" stopColor={isNight ? '#040810' : '#082810'} stopOpacity="1"/>
            </linearGradient>
          </defs>
          {/* Far mountains */}
          <path d="M0 120 Q80 60 160 90 Q240 40 360 80 Q450 30 540 70 Q620 50 720 85 Q800 35 900 75 Q1000 45 1100 80 Q1200 30 1300 70 Q1380 50 1450 85 Q1520 55 1600 90 L1600 200 L0 200Z"
            fill="url(#mt1)"/>
          {/* Mid mountains */}
          <path d="M0 140 Q100 100 200 120 Q320 80 440 110 Q540 75 660 105 Q760 85 860 115 Q960 80 1080 108 Q1180 75 1280 105 Q1380 90 1480 115 Q1540 95 1600 110 L1600 200 L0 200Z"
            fill="url(#mt2)"/>
          {/* Near mountains/hills */}
          <path d="M0 160 Q120 130 250 145 Q380 120 500 140 Q620 125 740 142 Q860 128 980 140 Q1100 125 1220 138 Q1340 130 1440 142 Q1520 132 1600 145 L1600 200 L0 200Z"
            fill="url(#mt3)"/>
        </svg>
        {/* Windmill on mountain ridge */}
        <div className="wm-wrap">
          <div className="wm-roof" />
          <div className="wm-spinner">
            <div className="wm-hub" />
            <div className="wm-blade wm-b0" />
            <div className="wm-blade wm-b1" />
            <div className="wm-blade wm-b2" />
            <div className="wm-blade wm-b3" />
          </div>
          <div className="wm-body" />
        </div>
      </div>
    </>
  );
}
