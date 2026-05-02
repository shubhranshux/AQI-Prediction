import { useMemo } from 'react';

/*
  CINEMATIC GOLDEN HOUR HERO
  Dramatic warm sky, bold mountains, visible sun rays,
  large puffy clouds, prominent house, wide river
*/
export default function HeroBackground({ isNight = false }) {
  const N = isNight;

  const clouds = useMemo(() => [
    { id:0, top:8, w:220, op:N?.1:.7, dur:70, del:-10 },
    { id:1, top:18, w:180, op:N?.08:.55, dur:85, del:-40 },
    { id:2, top:12, w:260, op:N?.12:.65, dur:60, del:-65 },
    { id:3, top:25, w:140, op:N?.07:.5, dur:90, del:-25 },
    { id:4, top:6, w:200, op:N?.09:.6, dur:75, del:-55 },
  ], [N]);

  const birds = useMemo(() => [
    { id:0, top:14, s:22, dur:22, del:-5 },
    { id:1, top:20, s:18, dur:28, del:-15 },
    { id:2, top:10, s:26, dur:20, del:-25 },
    { id:3, top:24, s:16, dur:32, del:-8 },
  ], []);

  const particles = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random()*100, s: N?(2+Math.random()*2.5):(1+Math.random()*2),
      op: N?(.2+Math.random()*.4):(.05+Math.random()*.12),
      dur: 12+Math.random()*10, del: Math.random()*14,
      dr: -25+Math.random()*50,
    })), [N]);

  // DRAMATIC color palettes
  const C = N ? {
    sky: 'linear-gradient(180deg, #020610 0%, #0a1428 25%, #0f1e3a 50%, #081530 75%, #040a18 100%)',
    orb: '#e8e2cc', orbGlow: 'rgba(200,190,160,.15)',
    cloud: 'rgba(60,80,120,.12)',
    bird: 'rgba(140,160,200,.25)',
    // Mountain colors: dark blue-green layers
    m1:'#101828', m1b:'#0a1018', m2:'#0c1420', m2b:'#080e16',
    m3:'#081018', m3b:'#050a10', m4:'#040810', m4b:'#020408',
    snow: 'rgba(160,180,210,.15)',
    tree: '#060a10',
    river: 'rgba(40,80,140,.3)', rivShine: 'rgba(80,130,200,.15)',
    house: '#151e2c', roof: '#0c1420', win: '#FDC500', winGlow: 'rgba(253,197,0,.2)',
    mist: 'rgba(20,40,80,.08)',
    part: '150,180,255',
  } : {
    // GOLDEN HOUR — warm dramatic sunset palette
    sky: 'linear-gradient(180deg, #1a5276 0%, #2e86ab 20%, #5dade2 40%, #85c1e9 55%, #aed6f1 70%, #fadbd8 85%, #f5b041 95%, #e67e22 100%)',
    orb: '#ffd700', orbGlow: 'rgba(255,180,0,.25)',
    cloud: 'rgba(255,255,255,.75)',
    bird: 'rgba(20,15,5,.5)',
    // Mountain colors: rich greens with warm tones
    m1:'#2e7d4a', m1b:'#1d5c32', m2:'#256b3d', m2b:'#1a5530',
    m3:'#1c5a32', m3b:'#134825', m4:'#154020', m4b:'#0e3018',
    snow: 'rgba(255,255,255,.55)',
    tree: '#0f3018',
    river: 'rgba(60,140,210,.45)', rivShine: 'rgba(170,215,255,.35)',
    house: '#6b5a48', roof: '#4a3828', win: '#FDC500', winGlow: 'rgba(253,197,0,.08)',
    mist: 'rgba(255,240,220,.1)',
    part: '80,130,60',
  };

  return (
    <>
      <style>{`
        .hbg{position:absolute;inset:0;overflow:hidden;background:${C.sky}}

        /* SUN RAYS — visible rotating beams */
        .h-rays{position:absolute;z-index:2;pointer-events:none;
          ${N?'display:none':''}
          right:8%;top:2%;width:500px;height:500px;
          background:conic-gradient(from 0deg,
            rgba(255,200,50,.08),transparent 6%,
            rgba(255,200,50,.06),transparent 12%,
            rgba(255,200,50,.08),transparent 18%,
            rgba(255,200,50,.06),transparent 24%,
            rgba(255,200,50,.08),transparent 30%,
            rgba(255,200,50,.06),transparent 36%,
            rgba(255,200,50,.08),transparent 42%,
            rgba(255,200,50,.06),transparent 48%,
            rgba(255,200,50,.08),transparent 54%,
            rgba(255,200,50,.06),transparent 60%,
            rgba(255,200,50,.08),transparent 66%,
            rgba(255,200,50,.06),transparent 72%,
            rgba(255,200,50,.08),transparent 78%,
            rgba(255,200,50,.06),transparent 84%,
            rgba(255,200,50,.08),transparent 90%,
            rgba(255,200,50,.06),transparent 96%);
          border-radius:50%;
          animation:ray-spin 80s linear infinite;
          mask-image:radial-gradient(circle,black 10%,transparent 55%);
          -webkit-mask-image:radial-gradient(circle,black 10%,transparent 55%)}
        @keyframes ray-spin{to{transform:rotate(360deg)}}

        /* SUN/MOON ORB */
        .h-orb{position:absolute;right:13%;top:9%;width:${N?55:80}px;height:${N?55:80}px;
          border-radius:50%;z-index:4;
          background:radial-gradient(circle at 35% 35%,${N?'#fffff0':'#fff8dc'},${C.orb});
          box-shadow:0 0 30px ${C.orbGlow},0 0 80px ${C.orbGlow},0 0 150px ${C.orbGlow}${N?'':`,0 0 250px ${C.orbGlow}`}}
        .h-orb::after{content:'';position:absolute;inset:-50%;border-radius:50%;
          background:radial-gradient(circle,${C.orbGlow},transparent 55%);
          animation:orb-p 5s ease-in-out infinite alternate}
        @keyframes orb-p{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.12);opacity:.8}}

        /* CLOUDS */
        .hcl{position:absolute;z-index:6;pointer-events:none;animation:hcl-d linear infinite}
        @keyframes hcl-d{0%{transform:translateX(-320px)}100%{transform:translateX(calc(100vw + 320px))}}

        /* BIRDS */
        .hbd{position:absolute;z-index:7;pointer-events:none;animation:hbd-f linear infinite}
        @keyframes hbd-f{
          0%{transform:translateX(-80px) translateY(0)}
          25%{transform:translateX(25vw) translateY(-10px)}
          50%{transform:translateX(50vw) translateY(5px)}
          75%{transform:translateX(75vw) translateY(-7px)}
          100%{transform:translateX(calc(100vw + 80px)) translateY(3px)}}

        /* MOUNTAINS */
        .h-mts{position:absolute;bottom:0;left:0;right:0;z-index:8;pointer-events:none}

        /* RIVER SHIMMER */
        @keyframes rv-flow{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-80}}

        /* MIST */
        .h-mist{position:absolute;bottom:0;left:-3%;right:-3%;height:30%;z-index:12;pointer-events:none;
          background:linear-gradient(to top,${C.mist},${C.mist},transparent);
          animation:mist-mv 12s ease-in-out infinite alternate}
        .h-mist2{animation-direction:alternate-reverse;animation-duration:16s;height:18%;bottom:8%;opacity:.5}
        @keyframes mist-mv{0%{opacity:.3;transform:translateX(-0.8%)}100%{opacity:.55;transform:translateX(0.8%)}}

        /* PARTICLES */
        .hpt{position:absolute;border-radius:50%;z-index:5;pointer-events:none;animation:hpt-f linear infinite;
          ${N?'box-shadow:0 0 4px 1px rgba(150,180,255,.3)':''}}
        @keyframes hpt-f{
          0%{transform:translateY(0) translateX(0);opacity:0}
          8%{opacity:var(--po)}92%{opacity:var(--po)}
          100%{transform:translateY(-100vh) translateX(var(--pd));opacity:0}}

        /* STARS */
        .hst{position:absolute;background:#fff;border-radius:50%;z-index:3;animation:hst-t 3s ease-in-out infinite alternate}
        @keyframes hst-t{0%{opacity:.06;transform:scale(.3)}100%{opacity:.6;transform:scale(1)}}
        .h-shoot{position:absolute;top:14%;left:52%;width:3px;height:3px;background:#fff;border-radius:50%;z-index:4;animation:h-sh 11s ease-in infinite}
        .h-shoot::after{content:'';position:absolute;width:55px;height:1.5px;background:linear-gradient(to left,transparent,rgba(255,255,255,.4));right:3px;transform:rotate(-35deg);transform-origin:right}
        @keyframes h-sh{0%{transform:translate(0,0);opacity:0}2%{opacity:1}7%{transform:translate(-200px,100px);opacity:0}100%{opacity:0}}

        /* WINDMILL */
        @keyframes wm-s{to{transform:rotate(360deg)}}
        .wm-w{position:absolute;bottom:26%;right:16%;z-index:10;width:28px}
        .wm-bd{width:14px;height:52px;background:${C.house};position:absolute;bottom:0;left:7px;border-radius:2px 2px 0 0}
        .wm-bd::before{content:'';position:absolute;width:5px;height:5px;left:4.5px;top:14px;background:#FDC500;box-shadow:0 0 6px rgba(253,197,0,.4),0 12px 0 #FDC500,0 12px 6px rgba(253,197,0,.3)}
        .wm-rf{width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-bottom:14px solid ${C.roof};position:absolute;bottom:52px;left:3px}
        .wm-sp{position:absolute;bottom:42px;left:11px;width:6px;height:6px;animation:wm-s 5s linear infinite;z-index:2}
        .wm-hb{width:6px;height:6px;border-radius:50%;background:${C.house}}
        .wm-bl{position:absolute;width:2px;height:28px;background:${C.house};left:2px;top:3px;transform-origin:1px 0}
        .wm-b0{transform:rotate(0deg)}.wm-b1{transform:rotate(90deg)}.wm-b2{transform:rotate(180deg)}.wm-b3{transform:rotate(270deg)}
      `}</style>

      <div className="hbg">
        {/* Sun rays */}
        <div className="h-rays"/>

        {/* Orb */}
        <div className="h-orb"/>

        {/* Night */}
        {N && <>
          {Array.from({length:60},(_,i)=>(
            <div key={i} className="hst" style={{left:`${Math.random()*100}%`,top:`${Math.random()*42}%`,width:1+Math.random()*2.5,height:1+Math.random()*2.5,animationDelay:`${Math.random()*4}s`,animationDuration:`${2+Math.random()*3}s`}}/>
          ))}
          <div className="h-shoot"/>
        </>}

        {/* Clouds */}
        {clouds.map(c=>(
          <svg key={c.id} className="hcl" style={{top:`${c.top}%`,width:c.w,opacity:c.op,animationDuration:`${c.dur}s`,animationDelay:`${c.del}s`}} viewBox="0 0 240 90" fill="none">
            <ellipse cx="120" cy="55" rx="105" ry="30" fill={C.cloud}/>
            <ellipse cx="72" cy="42" rx="65" ry="28" fill={C.cloud}/>
            <ellipse cx="165" cy="44" rx="68" ry="26" fill={C.cloud}/>
            <ellipse cx="115" cy="32" rx="58" ry="26" fill={C.cloud}/>
            <ellipse cx="145" cy="28" rx="42" ry="20" fill={C.cloud}/>
          </svg>
        ))}

        {/* Birds */}
        {birds.map(b=>(
          <svg key={b.id} className="hbd" style={{top:`${b.top}%`,width:b.s,animationDuration:`${b.dur}s`,animationDelay:`${b.del}s`}} viewBox="0 0 44 18" fill="none">
            <path d="M2 9Q6 3 10 7Q14 3 18 9" stroke={C.bird} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M13 13Q16 8 19 11Q22 8 25 13" stroke={C.bird} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M24 7Q27 2 30 5Q33 2 36 7" stroke={C.bird} strokeWidth="1" fill="none" strokeLinecap="round"/>
          </svg>
        ))}

        {/* Particles */}
        {particles.map((p,i)=>(
          <div key={i} className="hpt" style={{left:`${p.x}%`,bottom:'-2%',width:p.s,height:p.s,background:`rgba(${C.part},${p.op})`,animationDuration:`${p.dur}s`,animationDelay:`${p.del}s`,'--po':p.op,'--pd':`${p.dr}px`}}/>
        ))}

        {/* ═══ LANDSCAPE ═══ */}
        <svg className="h-mts" viewBox="0 0 1600 400" preserveAspectRatio="none" style={{width:'100%',height:'55%'}}>
          <defs>
            <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.m1} stopOpacity=".5"/><stop offset="100%" stopColor={C.m1b} stopOpacity=".8"/></linearGradient>
            <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.m2} stopOpacity=".65"/><stop offset="100%" stopColor={C.m2b} stopOpacity=".9"/></linearGradient>
            <linearGradient id="mg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.m3} stopOpacity=".8"/><stop offset="100%" stopColor={C.m3b} stopOpacity=".96"/></linearGradient>
            <linearGradient id="mg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.m4} stopOpacity=".92"/><stop offset="100%" stopColor={C.m4b} stopOpacity="1"/></linearGradient>
            <linearGradient id="rvg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.river}/><stop offset="50%" stopColor={C.rivShine}/><stop offset="100%" stopColor={C.river}/></linearGradient>
          </defs>

          {/* Layer 1: Far peaks */}
          <path d="M0 235 L55 195 L115 165 L175 185 L250 100 L310 138 L375 85 L435 158 L500 115 L560 148 L640 70 L710 125 L780 95 L850 152 L930 60 L1000 108 L1070 80 L1140 135 L1220 62 L1300 112 L1365 88 L1425 142 L1500 105 L1560 128 L1600 155 L1600 400 L0 400Z" fill="url(#mg1)"/>
          {[[248,103],[373,88],[638,73],[928,63],[1218,65]].map(([x,y],i)=><polygon key={i} points={`${x-7},${y+6} ${x},${y} ${x+7},${y+6}`} fill={C.snow}/>)}

          {/* Layer 2: Mid mountains */}
          <path d="M0 262 Q95 218 190 238 Q275 195 375 225 Q455 190 555 218 Q635 198 735 222 Q815 192 915 218 Q995 195 1095 218 Q1175 192 1275 215 Q1355 200 1455 222 Q1535 208 1600 222 L1600 400 L0 400Z" fill="url(#mg2)"/>

          {/* Pine trees on ridge */}
          {Array.from({length:45},(_,i)=>{const x=i*38+Math.random()*18;const h=10+Math.random()*16;const y=256-Math.random()*10;
            return <polygon key={`p${i}`} points={`${x},${y} ${x+h*.35},${y-h} ${x+h*.7},${y}`} fill={C.tree} opacity={.3+Math.random()*.3}/>;
          })}

          {/* Layer 3: Near hills */}
          <path d="M0 298 Q140 262 290 280 Q420 252 560 275 Q680 260 800 278 Q920 262 1040 278 Q1160 260 1290 275 Q1420 265 1520 280 Q1570 270 1600 278 L1600 400 L0 400Z" fill="url(#mg3)"/>

          {/* Near trees */}
          {Array.from({length:35},(_,i)=>{const x=i*48+Math.random()*25;const h=7+Math.random()*12;const y=294-Math.random()*6;
            return <polygon key={`n${i}`} points={`${x},${y} ${x+h*.3},${y-h} ${x+h*.6},${y}`} fill={C.tree} opacity={.35+Math.random()*.3}/>;
          })}

          {/* Layer 4: Foreground */}
          <path d="M0 328 Q240 310 480 320 Q720 305 960 318 Q1200 308 1380 320 Q1500 312 1600 320 L1600 400 L0 400Z" fill="url(#mg4)"/>

          {/* ══════ DETAILED HOUSE ══════ */}
          <g transform="translate(320, 245)">
            {/* Foundation/base */}
            <rect x="-2" y="30" width="54" height="5" fill={N?'#0a1018':'#4a3a28'} rx="1" opacity=".6"/>
            {/* Main house body */}
            <rect x="0" y="5" width="50" height="28" fill={C.house} rx="1"/>
            {/* Side shadow for depth */}
            <rect x="42" y="5" width="8" height="28" fill={N?'#0c1520':'#5a4838'} rx="0" opacity=".3"/>
            {/* Roof */}
            <polygon points="-6,5 25,-14 56,5" fill={C.roof}/>
            <polygon points="-6,5 25,-14 25,-11 -4,6" fill={N?'#12181f':'#544030'} opacity=".3"/>
            {/* Chimney */}
            <rect x="36" y="-12" width="8" height="16" fill={C.house}/>
            <rect x="34" y="-14" width="12" height="3" fill={C.roof} rx=".5"/>
            {/* Chimney brick lines */}
            <line x1="36" y1="-8" x2="44" y2="-8" stroke={N?'#1a2438':'#7a6850'} strokeWidth=".5" opacity=".4"/>
            <line x1="36" y1="-4" x2="44" y2="-4" stroke={N?'#1a2438':'#7a6850'} strokeWidth=".5" opacity=".4"/>
            <line x1="36" y1="0" x2="44" y2="0" stroke={N?'#1a2438':'#7a6850'} strokeWidth=".5" opacity=".4"/>
            
            {/* Smoke puffs — staggered */}
            <circle cx="40" cy="-18" r="3.5" fill={C.cloud} opacity=".18">
              <animate attributeName="cy" values="-18;-38" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".18;0" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="r" values="3.5;9" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="41" cy="-24" r="2.5" fill={C.cloud} opacity=".12">
              <animate attributeName="cy" values="-24;-48" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".12;0" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="r" values="2.5;7" dur="5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="39" cy="-14" r="2" fill={C.cloud} opacity=".1">
              <animate attributeName="cy" values="-14;-32" dur="3.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".1;0" dur="3.5s" repeatCount="indefinite"/>
              <animate attributeName="r" values="2;6" dur="3.5s" repeatCount="indefinite"/>
            </circle>

            {/* Door */}
            <rect x="20" y="17" width="10" height="16" fill={N?'#080c14':'#3a2818'} rx="1.5"/>
            <circle cx="28" cy="26" r=".8" fill={C.win} opacity=".7"/>
            {/* Porch awning */}
            <path d="M16 17 L25 13 L34 17" fill="none" stroke={C.roof} strokeWidth="1.5"/>

            {/* Windows — larger with frames */}
            <rect x="4" y="12" width="10" height="8" fill={C.win} rx="1" opacity={N?1:.65}/>
            <rect x="36" y="12" width="10" height="8" fill={C.win} rx="1" opacity={N?1:.65}/>
            {/* Window frames (cross) */}
            <line x1="9" y1="12" x2="9" y2="20" stroke={C.house} strokeWidth=".8"/>
            <line x1="4" y1="16" x2="14" y2="16" stroke={C.house} strokeWidth=".8"/>
            <line x1="41" y1="12" x2="41" y2="20" stroke={C.house} strokeWidth=".8"/>
            <line x1="36" y1="16" x2="46" y2="16" stroke={C.house} strokeWidth=".8"/>
            {/* Window glow at night */}
            {N&&<>
              <rect x="2" y="10" width="14" height="12" fill={C.win} opacity=".12" rx="2"/>
              <rect x="34" y="10" width="14" height="12" fill={C.win} opacity=".12" rx="2"/>
            </>}

            {/* Stone path from door */}
            {[0,6,12,18].map(d=><ellipse key={d} cx={25} cy={35+d} rx={3-d*.08} ry={1.2} fill={N?'#1a2030':'#8a7a68'} opacity=".35"/>)}

            {/* Fence */}
            {[-8,-4,54,58,62].map(x=><rect key={x} x={x} y={22} width={1.5} height={11} fill={C.house} opacity=".4" rx=".3"/>)}
            <rect x="-9" y="25" width="14" height="1" fill={C.house} opacity=".3"/>
            <rect x="53" y="25" width="12" height="1" fill={C.house} opacity=".3"/>

            {/* Flower pots */}
            <circle cx="-5" cy="30" r="2" fill={N?'#2a1520':'#d44'} opacity=".5"/>
            <circle cx="57" cy="30" r="2" fill={N?'#1a2a20':'#4a4'} opacity=".5"/>
          </g>

          {/* Trees near house — varied sizes */}
          {[[290,265,18],[300,270,12],[380,260,20],[395,267,13],[400,272,9]].map(([x,y,h],i)=>(
            <g key={`ht${i}`} opacity={.5+i*.08}>
              <polygon points={`${x},${y} ${x+h*.35},${y-h} ${x+h*.7},${y}`} fill={C.tree}/>
              {h>14&&<polygon points={`${x+h*.1},${y-h*.3} ${x+h*.35},${y-h*.85} ${x+h*.6},${y-h*.3}`} fill={C.tree} opacity=".7"/>}
              <rect x={x+h*.3} y={y} width={h*.12} height={h*.25} fill={C.house} opacity=".35"/>
            </g>
          ))}

          {/* ══════ WIDE REALISTIC RIVER ══════ */}
          {/* River body — very wide, perspective widening */}
          <path d="M580 215 Q620 235 645 260 Q668 285 700 302 Q750 318 830 328 Q940 338 1080 344 Q1250 352 1400 358 Q1530 365 1600 372 L1600 395 Q1530 388 1400 382 Q1250 376 1080 370 Q940 365 830 358 Q750 350 708 338 Q678 325 658 302 Q640 278 612 250 Q592 232 570 218 Z" fill="url(#rvg)" opacity=".65"/>
          {/* Deeper center channel */}
          <path d="M588 220 Q625 240 650 264 Q672 288 705 305 Q755 320 835 330 Q945 340 1085 346 Q1255 354 1405 360 Q1535 367 1600 374 L1600 388 Q1535 381 1405 375 Q1255 369 1085 363 Q945 358 835 350 Q755 342 712 332 Q682 320 664 298 Q648 275 622 248 Q600 230 582 216 Z" fill={C.rivShine} opacity=".12"/>

          {/* Multiple shimmer layers */}
          <path d="M590 222 Q628 242 652 266 Q674 290 708 306 Q758 322 838 332 Q948 342 1088 348 Q1258 356 1408 362 Q1538 369 1600 376" fill="none" stroke={C.rivShine} strokeWidth="4" strokeLinecap="round" strokeDasharray="18 24 10 28" opacity=".4" style={{animation:'rv-flow 2.2s linear infinite'}}/>
          <path d="M595 228 Q630 246 655 270 Q678 294 712 310 Q762 326 842 336 Q952 346 1092 352 Q1262 360 1412 366 Q1542 373 1600 380" fill="none" stroke={C.rivShine} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 26 14 20" opacity=".28" style={{animation:'rv-flow 4s linear infinite',animationDelay:'-1.5s'}}/>
          <path d="M585 218 Q624 238 648 262 Q670 286 704 302 Q754 318 834 328 Q944 338 1084 344 Q1254 352 1404 358 Q1534 365 1600 372" fill="none" stroke={C.rivShine} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 30 8 22" opacity=".18" style={{animation:'rv-flow 6s linear infinite',animationDelay:'-3s'}}/>

          {/* Rocks in river */}
          {[[620,248,4],[680,290,3.5],[740,315,4.5],[850,332,3],[960,340,4],[1120,348,3.5]].map(([x,y,r],i)=>(
            <g key={`rk${i}`}>
              <ellipse cx={x} cy={y} rx={r} ry={r*.6} fill={N?'#1a2030':'#6a6050'} opacity=".45"/>
              <ellipse cx={x-.5} cy={y-.5} rx={r*.6} ry={r*.35} fill={N?'#2a3040':'#8a7a68'} opacity=".3"/>
            </g>
          ))}

          {/* Animated ripples — more of them */}
          {[[650,262],[730,308],[820,326],[920,336],[1050,344],[1200,352],[1380,362]].map(([cx,cy],i)=>(
            <ellipse key={`rp${i}`} cx={cx} cy={cy} rx={10+i*2} ry={2.2} fill="none" stroke={C.rivShine} strokeWidth=".8" opacity=".22">
              <animate attributeName="rx" values={`${8+i*2};${15+i*2};${8+i*2}`} dur={`${2.5+i*.4}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".22;.05;.22" dur={`${2.5+i*.4}s`} repeatCount="indefinite"/>
            </ellipse>
          ))}

          {/* Wooden bridge with railings */}
          <g transform="translate(810, 324)" opacity=".6">
            <path d="M-18 6Q-12 -8 0 -10Q12 -8 18 6" fill="none" stroke={N?'#2a3040':'#6b5a48'} strokeWidth="3" strokeLinecap="round"/>
            <rect x="-20" y="-12" width="40" height="3.5" rx="1" fill={N?'#1e2838':'#7a6850'}/>
            {/* Planks */}
            {[-16,-10,-4,2,8,14].map(px=><rect key={px} x={px} y={-12} width="2" height="3.5" fill={N?'#2a3848':'#8a7860'} opacity=".4"/>)}
            {/* Railing posts */}
            <rect x="-19" y="-20" width="2" height="10" fill={N?'#2a3040':'#6b5a48'} rx=".5"/>
            <rect x="17" y="-20" width="2" height="10" fill={N?'#2a3040':'#6b5a48'} rx=".5"/>
            <rect x="-19" y="-20" width="38" height="1.5" rx=".5" fill={N?'#2a3040':'#6b5a48'}/>
          </g>

          {/* Bank vegetation — lush */}
          {[[600,240],[660,278],[720,310],[780,322],[850,330],[930,338],[1020,342],[1120,348],[1240,354],[1360,362],[1480,368]].map(([x,y],i)=>
            <g key={`bv${i}`}>
              <ellipse cx={x} cy={y} rx={5+i%4} ry={3+i%2} fill={C.tree} opacity=".35"/>
              {i%3===0&&<ellipse cx={x+3} cy={y-1} rx={3} ry={2} fill={C.tree} opacity=".25"/>}
            </g>
          )}

          {/* Wildflowers scattered */}
          {!N&&[[310,278],[340,282],[470,274],[500,276],[560,280]].map(([x,y],i)=>
            <circle key={`fl${i}`} cx={x} cy={y} r={1.2} fill={['#e74c3c','#f39c12','#9b59b6','#e74c3c','#3498db'][i]} opacity=".5"/>
          )}
        </svg>

        <div className="h-mist"/>
        <div className="h-mist h-mist2"/>

        <div className="wm-w">
          <div className="wm-rf"/><div className="wm-sp"><div className="wm-hb"/><div className="wm-bl wm-b0"/><div className="wm-bl wm-b1"/><div className="wm-bl wm-b2"/><div className="wm-bl wm-b3"/></div><div className="wm-bd"/>
        </div>
      </div>
    </>
  );
}
