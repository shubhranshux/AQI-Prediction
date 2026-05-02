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

  // Base scenery colors (always remain constant, regardless of dark mode)
  const baseScenery = {
    m1:'#2e7d4a', m1b:'#1d5c32', m2:'#256b3d', m2b:'#1a5530',
    m3:'#1c5a32', m3b:'#134825', m4:'#154020', m4b:'#0e3018',
    snow: 'rgba(255,255,255,.55)',
    tree: '#0f3018',
    river: 'rgba(60,140,210,.45)', rivShine: 'rgba(170,215,255,.35)',
    house: '#6b5a48', roof: '#4a3828', win: '#FDC500', winGlow: 'rgba(253,197,0,.08)',
    mist: 'rgba(255,240,220,.1)',
    part: '80,130,60',
  };

  const C = N ? {
    ...baseScenery,
    // Night sky and moon elements
    sky: 'linear-gradient(180deg, #020610 0%, #0a1428 25%, #0f1e3a 50%, #081530 75%, #040a18 100%)',
    orb: '#e8e2cc', orbGlow: 'rgba(200,190,160,.15)',
    cloud: 'rgba(60,80,120,.12)',
    bird: 'rgba(140,160,200,.25)',
  } : {
    ...baseScenery,
    // Day sky and sun elements
    sky: 'linear-gradient(180deg, #1a5276 0%, #2e86ab 20%, #5dade2 40%, #85c1e9 55%, #aed6f1 70%, #fadbd8 85%, #f5b041 95%, #e67e22 100%)',
    orb: '#ffd700', orbGlow: 'rgba(255,180,0,.25)',
    cloud: 'rgba(255,255,255,.75)',
    bird: 'rgba(20,15,5,.5)',
  };

  return (
    <>
      <style>{`
        .hbg{position:absolute;inset:0;overflow:hidden;background:${C.sky}}

        /* SUN RAYS — visible rotating beams */
        .h-rays{position:absolute;z-index:2;pointer-events:none;
          ${N?'display:none':''}
          right:calc(13% - 210px);top:calc(9% - 210px);width:500px;height:500px;
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
        .h-orb{position:absolute;right:13%;top:9%;width:${N?65:80}px;height:${N?65:80}px;
          border-radius:50%;z-index:4;
          background:${N
            ?'radial-gradient(circle at 38% 32%, #fffff5 0%, #f5f0d8 30%, #e8e2cc 55%, #d4ceb8 80%, #c8c0a8 100%)'
            :'radial-gradient(circle at 35% 35%, #fff8dc, '+C.orb+')'};
          box-shadow:0 0 30px ${C.orbGlow},0 0 80px ${C.orbGlow},0 0 150px ${C.orbGlow}${N?'':`,0 0 250px ${C.orbGlow}`}}
        .h-orb::before{content:'';position:absolute;border-radius:50%;z-index:1;
          ${N?`
            /* Moon craters */
            width:100%;height:100%;
            background:
              radial-gradient(circle at 28% 42%, rgba(180,170,140,.35) 0%, transparent 22%),
              radial-gradient(circle at 62% 28%, rgba(170,160,130,.3) 0%, transparent 18%),
              radial-gradient(circle at 45% 68%, rgba(160,150,120,.25) 0%, transparent 25%),
              radial-gradient(circle at 72% 55%, rgba(175,165,135,.2) 0%, transparent 15%),
              radial-gradient(circle at 35% 22%, rgba(185,175,145,.18) 0%, transparent 12%),
              radial-gradient(circle at 55% 45%, rgba(165,155,125,.15) 0%, transparent 20%),
              radial-gradient(circle at 18% 58%, rgba(170,160,130,.22) 0%, transparent 14%);
          `:`
            width:100%;height:100%;background:transparent;
          `}}
        .h-orb::after{content:'';position:absolute;inset:-60%;border-radius:50%;
          background:radial-gradient(circle,${C.orbGlow},transparent 50%);
          animation:orb-p 5s ease-in-out infinite alternate}
        @keyframes orb-p{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.15);opacity:.85}}

        /* Moonbeams — subtle silver rays at night */
        .h-moonbeams{position:absolute;z-index:3;pointer-events:none;
          ${N?'':'display:none;'}
          right:calc(13% - 140px);top:calc(9% - 140px);width:340px;height:340px;
          background:conic-gradient(from 0deg,
            rgba(200,210,230,.04),transparent 8%,
            rgba(200,210,230,.03),transparent 16%,
            rgba(200,210,230,.04),transparent 24%,
            rgba(200,210,230,.03),transparent 32%,
            rgba(200,210,230,.04),transparent 40%,
            rgba(200,210,230,.03),transparent 48%,
            rgba(200,210,230,.04),transparent 56%,
            rgba(200,210,230,.03),transparent 64%,
            rgba(200,210,230,.04),transparent 72%,
            rgba(200,210,230,.03),transparent 80%,
            rgba(200,210,230,.04),transparent 88%,
            rgba(200,210,230,.03),transparent 96%);
          border-radius:50%;
          animation:ray-spin 120s linear infinite;
          mask-image:radial-gradient(circle,black 8%,transparent 50%);
          -webkit-mask-image:radial-gradient(circle,black 8%,transparent 50%)}

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
        <div className="h-moonbeams"/>

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


          {/* Layer 1: Far distant peaks — dramatic jagged silhouette */}
          <path d="M0 230 L20 218 L38 225 L52 198 L68 210 L85 188 L100 196 L118 170 L132 180 L148 158 L165 172 L180 148 L198 162 L220 120 L232 142 L248 100 L260 118 L278 130 L295 108 L310 125 L328 98 L342 115 L358 88 L375 78 L388 92 L405 110 L420 95 L440 118 L458 105 L475 115 L495 98 L510 108 L530 90 L548 102 L568 85 L580 95 L600 72 L618 88 L635 65 L648 78 L665 90 L680 75 L700 88 L718 72 L738 82 L755 68 L770 80 L790 62 L808 75 L825 88 L845 72 L860 85 L880 98 L898 82 L915 65 L928 55 L940 68 L958 80 L978 65 L995 78 L1015 62 L1030 72 L1048 58 L1065 68 L1085 75 L1100 62 L1118 72 L1135 85 L1155 70 L1170 80 L1190 65 L1205 55 L1218 60 L1232 72 L1250 62 L1268 75 L1285 85 L1305 72 L1320 82 L1338 92 L1355 80 L1375 88 L1392 98 L1410 85 L1428 95 L1445 108 L1465 95 L1480 105 L1500 92 L1520 102 L1538 112 L1555 100 L1575 118 L1590 128 L1600 135 L1600 400 L0 400Z" fill="url(#mg1)"/>
          {/* Snow caps on tallest peaks — larger, more realistic */}
          {[[248,100,14],[375,78,16],[635,65,18],[790,62,15],[928,55,20],[1205,55,17]].map(([x,y,s],i)=>(
            <g key={`snow${i}`}>
              <polygon points={`${x-s*.7},${y+s*.4} ${x-s*.15},${y} ${x+s*.15},${y-2} ${x+s*.6},${y+s*.35}`} fill={C.snow}/>
              <polygon points={`${x-s*.4},${y+s*.25} ${x},${y+1} ${x+s*.35},${y+s*.2}`} fill={C.snow} opacity=".5"/>
            </g>
          ))}
          {/* Ridge shadow lines on far peaks */}
          <path d="M248 100 L260 140 L270 165" fill="none" stroke={N?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)'} strokeWidth="1.5"/>
          <path d="M375 78 L385 110 L392 145" fill="none" stroke={N?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)'} strokeWidth="1.5"/>
          <path d="M635 65 L648 100 L655 135" fill="none" stroke={N?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)'} strokeWidth="1.5"/>
          <path d="M928 55 L940 95 L948 130" fill="none" stroke={N?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)'} strokeWidth="1.5"/>
          <path d="M1205 55 L1218 90 L1225 125" fill="none" stroke={N?'rgba(0,0,0,.15)':'rgba(0,0,0,.08)'} strokeWidth="1.5"/>
          {/* Rock face shadows — darker side of major peaks */}
          <path d="M248 100 L260 118 L265 155 L248 170 L235 142 Z" fill={N?'rgba(0,0,0,.12)':'rgba(0,0,0,.06)'}/>
          <path d="M635 65 L650 85 L655 125 L640 140 L625 110 Z" fill={N?'rgba(0,0,0,.12)':'rgba(0,0,0,.06)'}/>
          <path d="M928 55 L945 75 L950 118 L935 132 L918 98 Z" fill={N?'rgba(0,0,0,.12)':'rgba(0,0,0,.06)'}/>

          {/* Atmospheric haze between layers */}
          <rect x="0" y="190" width="1600" height="50" fill={N?'rgba(10,20,40,.08)':'rgba(180,210,230,.1)'} />

          {/* Layer 2: Mid mountains — rugged ridgeline */}
          <path d="M0 258 L25 248 L48 255 L72 235 L90 242 L112 222 L128 232 L150 215 L168 225 L188 208 L205 218 L225 200 L238 210 L255 195 L275 205 L295 192 L312 202 L335 188 L350 198 L372 210 L390 198 L412 208 L430 195 L452 205 L470 192 L490 202 L510 188 L528 198 L550 208 L568 195 L588 205 L608 192 L628 200 L648 188 L665 198 L685 210 L705 198 L722 205 L742 195 L760 202 L782 190 L800 198 L818 210 L838 198 L858 205 L878 195 L898 202 L920 192 L938 200 L958 210 L978 198 L998 205 L1018 195 L1038 202 L1058 192 L1078 200 L1098 210 L1118 198 L1138 205 L1158 195 L1178 202 L1198 210 L1218 200 L1238 208 L1258 198 L1278 205 L1298 212 L1318 202 L1338 210 L1358 218 L1378 208 L1398 215 L1418 222 L1438 212 L1458 218 L1478 225 L1500 215 L1520 222 L1540 228 L1560 220 L1580 228 L1600 232 L1600 400 L0 400Z" fill="url(#mg2)"/>
          {/* Ridge texture lines on mid mountains */}
          {[[112,222,35],[335,188,40],[510,188,38],[782,190,36],[1058,192,34]].map(([x,y,h],i)=>(
            <g key={`ridge${i}`} opacity=".12">
              <line x1={x} y1={y} x2={x+8} y2={y+h} stroke={N?'#fff':'#000'} strokeWidth="1"/>
              <line x1={x+5} y1={y+2} x2={x+15} y2={y+h-5} stroke={N?'#fff':'#000'} strokeWidth=".7"/>
              <line x1={x-4} y1={y+4} x2={x+2} y2={y+h+2} stroke={N?'#fff':'#000'} strokeWidth=".5"/>
            </g>
          ))}

          {/* Pine trees on ridge — varied sizes and density */}
          {Array.from({length:55},(_,i)=>{const x=i*30+Math.random()*15;const h=8+Math.random()*18;const y=250-Math.random()*8;
            return <g key={`p${i}`}>
              <polygon points={`${x},${y} ${x+h*.32},${y-h} ${x+h*.64},${y}`} fill={C.tree} opacity={.25+Math.random()*.35}/>
              {h>14&&<polygon points={`${x+h*.08},${y-h*.3} ${x+h*.32},${y-h*.9} ${x+h*.56},${y-h*.3}`} fill={C.tree} opacity={.2+Math.random()*.2}/>}
              <rect x={x+h*.28} y={y} width={h*.08} height={h*.15} fill={C.house} opacity=".2"/>
            </g>;
          })}

          {/* Layer 3: Near hills — rolling with rocky outcrops */}
          <path d="M0 292 L30 285 L58 290 L85 278 L110 284 L140 272 L165 278 L195 268 L220 274 L248 262 L272 268 L300 275 L325 265 L350 270 L378 258 L405 265 L430 272 L458 262 L485 268 L515 258 L540 264 L568 272 L595 262 L622 268 L650 258 L678 264 L705 270 L732 262 L760 268 L788 260 L815 266 L842 272 L870 264 L898 270 L925 262 L952 268 L980 275 L1008 268 L1035 272 L1062 265 L1090 270 L1118 278 L1145 270 L1172 275 L1200 268 L1228 272 L1255 278 L1282 272 L1310 276 L1338 280 L1365 274 L1392 278 L1420 282 L1448 276 L1478 280 L1508 284 L1538 278 L1568 282 L1600 285 L1600 400 L0 400Z" fill="url(#mg3)"/>

          {/* Near trees — denser with varied species */}
          {Array.from({length:45},(_,i)=>{const x=i*37+Math.random()*20;const h=6+Math.random()*14;const y=288-Math.random()*6;
            return <g key={`n${i}`}>
              <polygon points={`${x},${y} ${x+h*.28},${y-h} ${x+h*.56},${y}`} fill={C.tree} opacity={.3+Math.random()*.35}/>
              {h>10&&<polygon points={`${x+h*.06},${y-h*.35} ${x+h*.28},${y-h*.92} ${x+h*.5},${y-h*.35}`} fill={C.tree} opacity={.2+Math.random()*.2}/>}
            </g>;
          })}

          {/* Rock outcrops on near hills */}
          {[[180,270,8],[520,260,10],[880,264,9],[1250,270,7]].map(([x,y,s],i)=>(
            <g key={`rock${i}`} opacity=".25">
              <polygon points={`${x},${y+4} ${x+s*.3},${y-s*.5} ${x+s*.6},${y-s*.3} ${x+s},${y+4}`} fill={N?'#1a2030':'#6a6858'}/>
              <polygon points={`${x+s*.3},${y-s*.5} ${x+s*.45},${y-s*.6} ${x+s*.6},${y-s*.3}`} fill={N?'#222c3a':'#7a7868'} opacity=".6"/>
            </g>
          ))}

          {/* Layer 4: Foreground — undulating with grass texture */}
          <path d="M0 322 L35 318 L70 322 L108 316 L145 320 L180 314 L218 318 L255 322 L292 316 L330 320 L368 314 L405 318 L442 322 L480 316 L518 320 L555 314 L592 318 L630 322 L668 316 L705 320 L742 316 L780 312 L818 316 L855 320 L892 314 L930 318 L968 312 L1005 316 L1042 320 L1080 314 L1118 318 L1155 322 L1192 316 L1230 320 L1268 314 L1305 318 L1342 322 L1380 316 L1418 320 L1455 314 L1492 318 L1530 322 L1568 316 L1600 320 L1600 400 L0 400Z" fill="url(#mg4)"/>
          {/* Grass tufts on foreground */}
          {Array.from({length:30},(_,i)=>{const x=i*55+Math.random()*30;const y=318+Math.random()*4;
            return <g key={`gr${i}`} opacity=".2">
              <line x1={x} y1={y} x2={x-2} y2={y-5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
              <line x1={x+2} y1={y} x2={x+3} y2={y-4.5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
              <line x1={x+4} y1={y} x2={x+2.5} y2={y-5.5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
            </g>;
          })}

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
