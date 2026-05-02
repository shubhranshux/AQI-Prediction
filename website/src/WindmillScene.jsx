import { useMemo } from 'react';

/*
  Zen Mountain Hero — Realistic landscape
  - Layered realistic mountain silhouettes
  - Drifting clouds (varied sizes/speeds)
  - V-shaped bird flocks
  - Small house on the hillside
  - Flowing river with shimmer animation
  - Windmill on the ridge
  - Mist + floating particles
  - Day/Night modes
*/
export default function HeroBackground({ isNight = false }) {
  const N = isNight;

  const clouds = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      top: 6 + Math.random() * 30,
      size: 100 + Math.random() * 140,
      opacity: N ? (0.08 + Math.random() * 0.12) : (0.35 + Math.random() * 0.45),
      duration: 50 + Math.random() * 50,
      delay: -(Math.random() * 70),
    })), [N]);

  const birds = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: 10 + Math.random() * 22,
      size: 16 + Math.random() * 16,
      duration: 16 + Math.random() * 18,
      delay: -(Math.random() * 35),
    })), []);

  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      opacity: 0.06 + Math.random() * 0.18,
      delay: Math.random() * 12,
      drift: -20 + Math.random() * 40,
      dur: 16 + Math.random() * 10,
    })), []);

  const C = N
    ? { sky1:'#070b16', sky2:'#0c1525', sky3:'#111d35', sky4:'#0a1322',
        orb:'#e8e4d0', orbG:'rgba(200,200,180,.12)', orbS:'rgba(180,180,160,.06)',
        cloud:'rgba(80,100,140,.18)', bird:'rgba(160,180,210,.35)',
        mt1a:'#0d1520', mt1b:'#080d18', mt2a:'#0b1219', mt2b:'#070b12',
        mt3a:'#091012', mt3b:'#050910', mt4a:'#060a0e', mt4b:'#030608',
        river:'rgba(60,100,160,.3)', riverShine:'rgba(120,160,220,.15)',
        house:'#1a2030', houseRoof:'#12181f', houseWin:'#FDC500',
        mist:'rgba(40,60,100,.08)', particle:'100,140,190',
        snow:'rgba(200,210,230,.15)', treeLine:'#0a1018' }
    : { sky1:'#6ab4d6', sky2:'#82c4de', sky3:'#a8d8ea', sky4:'#c8e8f4',
        orb:'#ffd700', orbG:'rgba(255,200,0,.22)', orbS:'rgba(255,165,0,.08)',
        cloud:'rgba(255,255,255,.8)', bird:'rgba(30,25,15,.5)',
        mt1a:'#3a7d52', mt1b:'#2a6840', mt2a:'#2d6b42', mt2b:'#1f5832',
        mt3a:'#245a35', mt3b:'#1a4c28', mt4a:'#1e4e2c', mt4b:'#154020',
        river:'rgba(80,160,220,.45)', riverShine:'rgba(180,220,255,.35)',
        house:'#6b5a48', houseRoof:'#4a3828', houseWin:'#FDC500',
        mist:'rgba(255,255,255,.1)', particle:'70,130,80',
        snow:'rgba(255,255,255,.6)', treeLine:'#1a4020' };

  return (
    <>
      <style>{`
        .zen-bg {
          position: absolute; inset: 0; overflow: hidden;
          background: linear-gradient(180deg, ${C.sky1} 0%, ${C.sky2} 30%, ${C.sky3} 60%, ${C.sky4} 100%);
        }

        .zen-aurora {
          position: absolute; inset: -40%; width: 180%; height: 180%;
          background:
            radial-gradient(ellipse 70% 50% at 25% 40%, rgba(100,160,220,.06) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 72% 30%, rgba(80,60,140,.04) 0%, transparent 50%);
          animation: za-drift 28s ease-in-out infinite alternate;
          z-index: 1;
        }
        @keyframes za-drift {
          0% { transform: translate(0,0); }
          100% { transform: translate(1.5%,-0.8%); }
        }

        .zen-orb {
          position: absolute; right: 16%; top: 12%;
          width: ${N ? 60 : 80}px; height: ${N ? 60 : 80}px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, ${N?'#fffff4':'#fff8dc'}, ${C.orb});
          box-shadow: 0 0 35px ${C.orbG}, 0 0 90px ${C.orbS}, 0 0 180px ${C.orbS};
          z-index: 4;
        }
        .zen-orb::after {
          content:''; position:absolute; inset:-55%; border-radius:50%;
          background: radial-gradient(circle, ${C.orbG}, transparent 65%);
          animation: zo-pulse 5s ease-in-out infinite alternate;
        }
        @keyframes zo-pulse { 0%{transform:scale(1);opacity:.45} 100%{transform:scale(1.12);opacity:.8} }

        /* Clouds */
        .zen-cloud { position:absolute; z-index:6; pointer-events:none; animation: zc-drift linear infinite; }
        @keyframes zc-drift { 0%{transform:translateX(-280px)} 100%{transform:translateX(calc(100vw + 280px))} }

        /* Birds */
        .zen-bird { position:absolute; z-index:7; pointer-events:none; animation: zb-fly linear infinite; }
        @keyframes zb-fly {
          0%{transform:translateX(-60px) translateY(0)}
          20%{transform:translateX(20vw) translateY(-10px)}
          40%{transform:translateX(40vw) translateY(3px)}
          60%{transform:translateX(60vw) translateY(-7px)}
          80%{transform:translateX(80vw) translateY(2px)}
          100%{transform:translateX(calc(100vw + 60px)) translateY(-4px)}
        }

        /* Mountains */
        .zen-mts { position:absolute; bottom:0; left:0; right:0; z-index:8; pointer-events:none; }

        /* River shimmer */
        @keyframes zr-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -60; }
        }
        @keyframes zr-shine {
          0%,100% { opacity:.3; }
          50% { opacity:.7; }
        }

        /* Mist */
        .zen-mist {
          position:absolute; bottom:0; left:0; right:0; height:35%;
          background: linear-gradient(to top, ${C.mist}, transparent);
          z-index:12; pointer-events:none;
          animation: zm-drift 10s ease-in-out infinite alternate;
        }
        @keyframes zm-drift { 0%{opacity:.35;transform:translateX(-0.5%)} 100%{opacity:.6;transform:translateX(0.5%)} }

        /* Particles */
        .zen-p { position:absolute; border-radius:50%; z-index:5; pointer-events:none; animation:zp-float linear infinite; }
        @keyframes zp-float {
          0%{transform:translateY(0) translateX(0);opacity:0}
          10%{opacity:var(--po)}
          90%{opacity:var(--po)}
          100%{transform:translateY(-100vh) translateX(var(--pd));opacity:0}
        }

        /* Night stars */
        .zen-star { position:absolute; background:#fff; border-radius:50%; z-index:3;
          animation: zs-twinkle 3s ease-in-out infinite alternate; }
        @keyframes zs-twinkle { 0%{opacity:.1;transform:scale(.4)} 100%{opacity:.7;transform:scale(1)} }

        .zen-shoot { position:absolute; top:16%; left:58%; width:3px; height:3px;
          background:#fff; border-radius:50%; z-index:4; animation: zsh 9s ease-in infinite; }
        .zen-shoot::after { content:''; position:absolute; width:45px; height:1.5px;
          background:linear-gradient(to left,transparent,rgba(255,255,255,.45)); right:3px;
          transform:rotate(-35deg); transform-origin:right; }
        @keyframes zsh { 0%{transform:translate(0,0);opacity:0} 3%{opacity:1} 9%{transform:translate(-160px,80px);opacity:0} 100%{opacity:0} }

        /* Windmill */
        @keyframes wm-spin { to{transform:rotate(360deg)} }
        .wm-wrap { position:absolute; bottom:24%; right:18%; z-index:11; width:32px; }
        .wm-body { width:16px; height:58px; background:${C.house}; position:absolute; bottom:0; left:8px; border-radius:2px 2px 0 0; }
        .wm-body::before { content:''; position:absolute; width:6px; height:6px; left:5px; top:15px;
          background:#FDC500; box-shadow:0 0 8px rgba(253,197,0,.4),0 13px 0 #FDC500,0 13px 8px rgba(253,197,0,.3); }
        .wm-roof { width:0; height:0; border-left:12px solid transparent; border-right:12px solid transparent;
          border-bottom:15px solid ${C.houseRoof}; position:absolute; bottom:58px; left:4px; }
        .wm-spinner { position:absolute; bottom:47px; left:13px; width:6px; height:6px; animation:wm-spin 5s linear infinite; z-index:2; }
        .wm-hub { width:6px; height:6px; border-radius:50%; background:${C.house}; }
        .wm-blade { position:absolute; width:2.5px; height:32px; background:${C.house}; left:1.75px; top:3px; transform-origin:1.25px 0; }
        .wm-b0{transform:rotate(0deg)} .wm-b1{transform:rotate(90deg)} .wm-b2{transform:rotate(180deg)} .wm-b3{transform:rotate(270deg)}
      `}</style>

      <div className="zen-bg">
        <div className="zen-aurora"/>
        <div className="zen-orb"/>

        {/* Night extras */}
        {N && <>
          {Array.from({length:50},(_,i)=>(
            <div key={i} className="zen-star" style={{
              left:`${Math.random()*100}%`, top:`${Math.random()*42}%`,
              width:1+Math.random()*2.5, height:1+Math.random()*2.5,
              animationDelay:`${Math.random()*4}s`, animationDuration:`${2+Math.random()*3}s`,
            }}/>
          ))}
          <div className="zen-shoot"/>
        </>}

        {/* Clouds */}
        {clouds.map(c=>(
          <svg key={c.id} className="zen-cloud" style={{
            top:`${c.top}%`, width:c.size, opacity:c.opacity,
            animationDuration:`${c.duration}s`, animationDelay:`${c.delay}s`,
          }} viewBox="0 0 220 80" fill="none">
            <ellipse cx="110" cy="48" rx="90" ry="26" fill={C.cloud}/>
            <ellipse cx="70" cy="38" rx="55" ry="24" fill={C.cloud}/>
            <ellipse cx="150" cy="40" rx="60" ry="22" fill={C.cloud}/>
            <ellipse cx="100" cy="32" rx="48" ry="22" fill={C.cloud}/>
          </svg>
        ))}

        {/* Birds */}
        {birds.map(b=>(
          <svg key={b.id} className="zen-bird" style={{
            top:`${b.top}%`, width:b.size,
            animationDuration:`${b.duration}s`, animationDelay:`${b.delay}s`,
          }} viewBox="0 0 44 18" fill="none">
            <path d="M2 9 Q6 3 10 7 Q14 3 18 9" stroke={C.bird} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            <path d="M13 13 Q16 8 19 11 Q22 8 25 13" stroke={C.bird} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
            <path d="M24 7 Q27 2 30 5 Q33 2 36 7" stroke={C.bird} strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          </svg>
        ))}

        {/* Particles */}
        {particles.map((p,i)=>(
          <div key={i} className="zen-p" style={{
            left:`${p.x}%`, bottom:'-2%', width:p.size, height:p.size,
            background:`rgba(${C.particle},${p.opacity})`,
            animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
            '--po':p.opacity, '--pd':`${p.drift}px`,
          }}/>
        ))}

        {/* ═══ REALISTIC MOUNTAIN LANDSCAPE ═══ */}
        <svg className="zen-mts" viewBox="0 0 1600 360" preserveAspectRatio="none" style={{width:'100%',height:'50%'}}>
          <defs>
            <linearGradient id="zm1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.mt1a} stopOpacity=".5"/>
              <stop offset="100%" stopColor={C.mt1b} stopOpacity=".8"/>
            </linearGradient>
            <linearGradient id="zm2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.mt2a} stopOpacity=".65"/>
              <stop offset="100%" stopColor={C.mt2b} stopOpacity=".92"/>
            </linearGradient>
            <linearGradient id="zm3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.mt3a} stopOpacity=".8"/>
              <stop offset="100%" stopColor={C.mt3b} stopOpacity=".97"/>
            </linearGradient>
            <linearGradient id="zm4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.mt4a} stopOpacity=".9"/>
              <stop offset="100%" stopColor={C.mt4b} stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="zriv" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.river}/>
              <stop offset="50%" stopColor={C.riverShine}/>
              <stop offset="100%" stopColor={C.river}/>
            </linearGradient>
          </defs>

          {/* Layer 1: Far snowy peaks */}
          <path d="M0 210 L60 170 L120 145 L180 165 L260 90 L310 120 L380 75 L440 140 L500 100 L560 130 L640 60 L720 110 L790 85 L860 135 L940 50 L1010 95 L1080 70 L1140 120 L1220 55 L1300 100 L1360 80 L1420 130 L1500 95 L1560 115 L1600 140 L1600 360 L0 360Z"
            fill="url(#zm1)"/>
          {/* Snow caps on tallest peaks */}
          <path d="M255 95 L260 90 L265 93Z" fill={C.snow} opacity=".7"/>
          <path d="M375 80 L380 75 L385 79Z" fill={C.snow} opacity=".7"/>
          <path d="M635 65 L640 60 L645 64Z" fill={C.snow} opacity=".7"/>
          <path d="M935 55 L940 50 L945 54Z" fill={C.snow} opacity=".7"/>
          <path d="M1215 60 L1220 55 L1225 59Z" fill={C.snow} opacity=".7"/>

          {/* Layer 2: Mid mountains with ridgeline texture */}
          <path d="M0 240 Q80 195 160 215 Q240 175 340 200 Q420 168 520 195 Q600 178 700 200 Q780 172 880 198 Q960 175 1060 195 Q1140 170 1240 195 Q1320 180 1420 200 Q1500 185 1600 200 L1600 360 L0 360Z"
            fill="url(#zm2)"/>

          {/* Tree line silhouettes on mid mountains */}
          <path d="M0 238 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -9 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -9 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0"
            fill="none" stroke={C.treeLine} strokeWidth="3" opacity=".4"
            transform="translate(100, -2)"/>
          <path d="M0 238 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -9 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -9 8 0 q4 -5 8 0 q4 -7 8 0 q4 -6 8 0 q4 -8 8 0 q4 -5 8 0 q4 -7 8 0"
            fill="none" stroke={C.treeLine} strokeWidth="3" opacity=".4"
            transform="translate(700, 5)"/>

          {/* Layer 3: Near hills */}
          <path d="M0 275 Q120 240 250 258 Q380 230 520 252 Q640 238 760 255 Q880 240 1000 255 Q1120 238 1250 252 Q1380 242 1480 258 Q1550 248 1600 255 L1600 360 L0 360Z"
            fill="url(#zm3)"/>

          {/* Layer 4: Foreground base */}
          <path d="M0 305 Q200 285 400 295 Q600 280 800 292 Q1000 282 1200 293 Q1400 286 1600 295 L1600 360 L0 360Z"
            fill="url(#zm4)"/>

          {/* ═══ HOUSE on the hillside ═══ */}
          <g transform="translate(420, 235)">
            {/* House body */}
            <rect x="0" y="8" width="22" height="18" fill={C.house} rx="1"/>
            {/* Roof */}
            <polygon points="-3,8 11,-4 25,8" fill={C.houseRoof}/>
            {/* Chimney */}
            <rect x="16" y="-2" width="4" height="8" fill={C.house}/>
            {/* Door */}
            <rect x="8" y="16" width="6" height="10" fill={N?'#0a0e16':'#3a2a1a'} rx="1"/>
            {/* Windows (glowing at night) */}
            <rect x="2" y="12" width="4" height="4" fill={C.houseWin} rx=".5"
              opacity={N?1:.7}/>
            <rect x="16" y="12" width="4" height="4" fill={C.houseWin} rx=".5"
              opacity={N?1:.7}/>
            {/* Window glow */}
            {N && <>
              <rect x="1" y="11" width="6" height="6" fill={C.houseWin} opacity=".15" rx="1" filter="url(#blur)"/>
              <rect x="15" y="11" width="6" height="6" fill={C.houseWin} opacity=".15" rx="1" filter="url(#blur)"/>
            </>}
          </g>

          {/* Small trees near house */}
          <g transform="translate(400, 245)" opacity=".7">
            <polygon points="0,0 4,-12 8,0" fill={C.treeLine}/>
            <rect x="3" y="0" width="2" height="4" fill={C.house}/>
          </g>
          <g transform="translate(450, 242)" opacity=".7">
            <polygon points="0,0 5,-14 10,0" fill={C.treeLine}/>
            <rect x="4" y="0" width="2" height="5" fill={C.house}/>
          </g>
          <g transform="translate(460, 246)" opacity=".6">
            <polygon points="0,0 3,-10 6,0" fill={C.treeLine}/>
            <rect x="2" y="0" width="2" height="3" fill={C.house}/>
          </g>

          {/* ═══ FLOWING RIVER ═══ */}
          {/* Main river path winding through the valley */}
          <path d="M680 200 Q720 220 740 245 Q760 265 800 278 Q860 290 940 295 Q1040 298 1150 302 Q1280 308 1400 315 Q1500 320 1600 325"
            fill="none" stroke="url(#zriv)" strokeWidth="8" strokeLinecap="round"
            opacity=".6"/>
          {/* Shimmer line on river */}
          <path d="M680 200 Q720 220 740 245 Q760 265 800 278 Q860 290 940 295 Q1040 298 1150 302 Q1280 308 1400 315 Q1500 320 1600 325"
            fill="none" stroke={C.riverShine} strokeWidth="2" strokeLinecap="round"
            strokeDasharray="8 12"
            opacity=".5"
            style={{animation:'zr-flow 3s linear infinite'}}/>
          {/* Second shimmer offset */}
          <path d="M680 200 Q720 220 740 245 Q760 265 800 278 Q860 290 940 295 Q1040 298 1150 302 Q1280 308 1400 315 Q1500 320 1600 325"
            fill="none" stroke={C.riverShine} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="5 15"
            opacity=".3"
            style={{animation:'zr-flow 4s linear infinite', animationDelay:'-1.5s'}}/>

          {/* River banks (subtle darker lines) */}
          <path d="M678 198 Q718 218 738 243 Q758 263 798 276 Q858 288 938 293 Q1038 296 1148 300 Q1278 306 1398 313 Q1498 318 1600 323"
            fill="none" stroke={C.mt4b} strokeWidth="1" opacity=".3"/>
          <path d="M682 202 Q722 222 742 247 Q762 267 802 280 Q862 292 942 297 Q1042 300 1152 304 Q1282 310 1402 317 Q1502 322 1600 327"
            fill="none" stroke={C.mt4b} strokeWidth="1" opacity=".3"/>
        </svg>

        {/* Mist layer */}
        <div className="zen-mist"/>

        {/* Windmill */}
        <div className="wm-wrap">
          <div className="wm-roof"/>
          <div className="wm-spinner">
            <div className="wm-hub"/>
            <div className="wm-blade wm-b0"/>
            <div className="wm-blade wm-b1"/>
            <div className="wm-blade wm-b2"/>
            <div className="wm-blade wm-b3"/>
          </div>
          <div className="wm-body"/>
        </div>
      </div>
    </>
  );
}
