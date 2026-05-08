import React, { useMemo, useState, useEffect } from 'react';

// SCENERY CONSTANTS
const baseScenery = {
  m1:'#2e7d4a', m1b:'#1d5c32', m2:'#256b3d', m2b:'#1a5530',
  m3:'#1c5a32', m3b:'#134825', m4:'#154020', m4b:'#0e3018',
  snow: 'rgba(255,255,255,.55)', tree: '#0f3018',
  river: 'rgba(60,140,210,.45)', rivShine: 'rgba(170,215,255,.35)',
  house: '#6b5a48', roof: '#4a3828', win: '#FDC500',
  mist: 'rgba(255,240,220,.1)', part: '80,130,60',
};

const getColors = (N) => N ? {
  ...baseScenery,
  sky: 'linear-gradient(180deg, #020610 0%, #0a1428 25%, #0f1e3a 50%, #081530 75%, #040a18 100%)',
  orb: '#e8e2cc', orbGlow: 'rgba(200,190,160,.15)',
  cloud: 'rgba(60,80,120,.12)', bird: 'rgba(140,160,200,.25)',
} : {
  ...baseScenery,
  sky: 'linear-gradient(180deg, #1a5276 0%, #2e86ab 20%, #5dade2 40%, #85c1e9 55%, #aed6f1 70%, #fadbd8 85%, #f5b041 95%, #e67e22 100%)',
  orb: '#ffd700', orbGlow: 'rgba(255,180,0,.25)',
  cloud: 'rgba(255,255,255,.75)', bird: 'rgba(20,15,5,.5)',
};

// COMPONENTS

const SunRays = ({ N }) => {
  if (N) return null;
  return <div className="h-rays"/>;
};

const Moonbeams = ({ N }) => {
  if (!N) return null;
  return <div className="h-moonbeams"/>;
};

const SkyOrb = ({ N, C }) => (
  <div className="h-orb" />
);

const NightSky = ({ N }) => {
  if (!N) return null;
  return (
    <>
      {Array.from({length: 150}, (_, i) => (
        <div key={i} className="hst" style={{
          left: `${Math.random()*100}%`, top: `${Math.random()*50}%`,
          width: 0.5 + Math.random()*2.5, height: 0.5 + Math.random()*2.5,
          animationDelay: `${Math.random()*5}s`, animationDuration: `${2 + Math.random()*4}s`
        }}/>
      ))}
      <div className="h-shoot"/>
      <div className="h-shoot" style={{top:'5%', left:'80%', animationDelay:'3s'}}/>
      <div className="h-shoot" style={{top:'25%', left:'30%', animationDelay:'8s', animationDuration:'8s'}}/>
    </>
  );
};

const Clouds = ({ clouds, C }) => (
  <>
    {clouds.map(c => (
      <svg key={c.id} className="hcl" style={{top:`${c.top}%`, width:c.w, opacity:c.op, animationDuration:`${c.dur}s`, animationDelay:`${c.del}s`}} viewBox="0 0 240 90" fill="none">
        <ellipse cx="120" cy="55" rx="105" ry="30" fill={C.cloud}/>
        <ellipse cx="72" cy="42" rx="65" ry="28" fill={C.cloud}/>
        <ellipse cx="165" cy="44" rx="68" ry="26" fill={C.cloud}/>
        <ellipse cx="115" cy="32" rx="58" ry="26" fill={C.cloud}/>
        <ellipse cx="145" cy="28" rx="42" ry="20" fill={C.cloud}/>
        <circle cx="80" cy="30" r="15" fill={C.cloud} />
        <circle cx="180" cy="35" r="20" fill={C.cloud} />
      </svg>
    ))}
  </>
);

const Balloons = ({ N }) => {
  if (N) return null;
  return (
    <>
      <svg style={{position:'absolute', zIndex:6, animation:'bal-1 120s linear infinite'}} viewBox="0 0 30 40" width="40" height="55">
        <path d="M 15 0 C 30 0, 30 20, 15 30 C 0 20, 0 0, 15 0 Z" fill="#e74c3c"/>
        <path d="M 15 0 C 22 0, 22 20, 15 30 C 8 20, 8 0, 15 0 Z" fill="#f1c40f"/>
        <path d="M 15 0 C 18 0, 18 20, 15 30 C 12 20, 12 0, 15 0 Z" fill="#e74c3c"/>
        <rect x="12" y="32" width="6" height="5" fill="#8e44ad" rx="1"/>
        <line x1="13" y1="30" x2="12" y2="32" stroke="#555" strokeWidth="0.5"/>
        <line x1="17" y1="30" x2="18" y2="32" stroke="#555" strokeWidth="0.5"/>
        <polygon points="14,31 16,31 15,28" fill="#e67e22"/>
      </svg>
      <svg style={{position:'absolute', zIndex:5, animation:'bal-2 180s linear infinite', opacity: 0.85}} viewBox="0 0 30 40" width="30" height="40">
        <path d="M 15 0 C 30 0, 30 20, 15 30 C 0 20, 0 0, 15 0 Z" fill="#3498db"/>
        <path d="M 15 0 C 22 0, 22 20, 15 30 C 8 20, 8 0, 15 0 Z" fill="#2ecc71"/>
        <rect x="12" y="32" width="6" height="5" fill="#e67e22" rx="1"/>
        <line x1="13" y1="30" x2="12" y2="32" stroke="#555" strokeWidth="0.5"/>
        <line x1="17" y1="30" x2="18" y2="32" stroke="#555" strokeWidth="0.5"/>
      </svg>
    </>
  );
};

const BirdFlock = ({ birds, C }) => (
  <>
    {birds.map(b => (
      <svg key={b.id} className="hbd" style={{top:`${b.top}%`, width:b.s, animationDuration:`${b.dur}s`, animationDelay:`${b.del}s`}} viewBox="0 0 44 18" fill="none">
        <path d="M2 9Q6 3 10 7Q14 3 18 9" stroke={C.bird} strokeWidth="1.5" fill="none" strokeLinecap="round">
           <animate attributeName="d" values="M2 9Q6 3 10 7Q14 3 18 9; M2 5Q6 10 10 7Q14 10 18 5; M2 9Q6 3 10 7Q14 3 18 9" dur="1s" repeatCount="indefinite"/>
        </path>
        <path d="M13 13Q16 8 19 11Q22 8 25 13" stroke={C.bird} strokeWidth="1.2" fill="none" strokeLinecap="round">
           <animate attributeName="d" values="M13 13Q16 8 19 11Q22 8 25 13; M13 9Q16 14 19 11Q22 14 25 9; M13 13Q16 8 19 11Q22 8 25 13" dur="0.9s" repeatCount="indefinite"/>
        </path>
      </svg>
    ))}
  </>
);

const DetailedTree = ({ x, y, h, C, op }) => (
  <g opacity={op} transform={`translate(${x},${y}) scale(${h/20})`}>
    <rect x="-1" y="-4" width="2" height="4" fill={C.roof} />
    <path d="M 0 -22 L -5 -18 L -2 -18 L -7 -12 L -3 -12 L -9 -6 L -4 -6 L -11 0 L 11 0 L 4 -6 L 9 -6 L 3 -12 L 7 -12 L 2 -18 L 5 -18 Z" fill={C.tree}/>
    <path d="M 0 -22 L -3 -18 L -1 -18 L -5 -12 L -2 -12 L -7 -6 L -3 -6 L -9 0 L 0 0 Z" fill="rgba(255,255,255,0.15)"/>
    <path d="M 0 -22 L 3 -18 L 1 -18 L 5 -12 L 2 -12 L 7 -6 L 3 -6 L 9 0 L 0 0 Z" fill="rgba(0,0,0,0.15)"/>
  </g>
);

const AmbientLeaves = ({ N }) => {
  const leaves = useMemo(() => Array.from({length: 35}, (_, i) => ({
    id: i, x: Math.random() * 100, s: 0.5 + Math.random() * 1.5,
    dur: 10 + Math.random() * 15, del: -(Math.random() * 20)
  })), []);
  return (
    <div style={{position:'absolute', inset:0, zIndex:8, pointerEvents:'none', overflow:'hidden'}}>
      {leaves.map(l => (
        <div key={l.id} style={{
          position: 'absolute', left: `${l.x}%`, top: `-10%`,
          width: `${l.s*4}px`, height: `${l.s*2}px`,
          background: N ? 'rgba(200,200,255,0.4)' : '#e67e22',
          borderRadius: '50% 0 50% 0', opacity: 0.6,
          animation: `leaf-fall ${l.dur}s linear infinite`, animationDelay: `${l.del}s`
        }} />
      ))}
      <style>{`@keyframes leaf-fall { 0% { transform: translate(0, 0) rotate(0deg); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { transform: translate(25vw, 110vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
};

const DetailedHouse = ({ N, C }) => (
  <g transform="translate(320, 245)">
    <rect x="-2" y="30" width="54" height="5" fill={N?'#0a1018':'#4a3a28'} rx="1" opacity=".6"/>
    <rect x="0" y="5" width="50" height="28" fill={C.house} rx="1"/>
    <rect x="42" y="5" width="8" height="28" fill={N?'#0c1520':'#5a4838'} rx="0" opacity=".3"/>
    
    {Array.from({length: 6}).map((_, i) => (
      <line key={`wp${i}`} x1="2" y1={8 + i*4} x2="40" y2={8 + i*4} stroke={N?'#0a1018':'#3a2818'} strokeWidth="0.5" opacity="0.4"/>
    ))}

    <polygon points="-8,5 25,-16 58,5" fill={C.roof}/>
    <polygon points="-8,5 25,-16 25,-13 -6,6" fill={N?'#12181f':'#544030'} opacity=".3"/>
    
    <path d="M -4 3 L 25 -14 L 54 3 M 0 1 L 25 -12 L 50 1 M 4 -1 L 25 -10 L 46 -1 M 8 -3 L 25 -8 L 42 -3 M 12 -5 L 25 -6 L 38 -5" stroke={N?'#12181f':'#544030'} strokeWidth="0.8" fill="none" opacity=".5"/>
    
    <rect x="36" y="-14" width="8" height="18" fill={C.house}/>
    <rect x="34" y="-16" width="12" height="3" fill={C.roof} rx=".5"/>
    <line x1="36" y1="-10" x2="44" y2="-10" stroke={N?'#1a2438':'#7a6850'} strokeWidth=".5" opacity=".4"/>
    <line x1="36" y1="-6" x2="44" y2="-6" stroke={N?'#1a2438':'#7a6850'} strokeWidth=".5" opacity=".4"/>
    
    <circle cx="40" cy="-20" r="3.5" fill={C.cloud} opacity=".2"><animate attributeName="cy" values="-20;-40" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".2;0" dur="4s" repeatCount="indefinite"/><animate attributeName="r" values="3.5;9" dur="4s" repeatCount="indefinite"/></circle>
    <circle cx="41" cy="-26" r="2.5" fill={C.cloud} opacity=".15"><animate attributeName="cy" values="-26;-50" dur="5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".15;0" dur="5s" repeatCount="indefinite"/><animate attributeName="r" values="2.5;7" dur="5s" repeatCount="indefinite"/></circle>

    <rect x="20" y="17" width="10" height="16" fill={N?'#080c14':'#3a2818'} rx="1.5"/>
    <circle cx="28" cy="26" r=".8" fill={C.win} opacity=".7"/>
    <path d="M16 17 L25 13 L34 17" fill="none" stroke={C.roof} strokeWidth="1.5"/>
    <rect x="15" y="33" width="20" height="2" fill={C.roof} rx="0.5"/>

    <rect x="16" y="18" width="3" height="4" fill={N?'#f1c40f':'#d35400'} rx="0.5"/>
    <line x1="17.5" y1="18" x2="17.5" y2="16" stroke={N?'#111':'#5d4037'} strokeWidth="0.8"/>
    {N && <circle cx="17.5" cy="20" r="8" fill="#f1c40f" opacity=".25"/>}

    <rect x="4" y="12" width="10" height="8" fill={C.win} rx="1" opacity={N?1:.65}/>
    <rect x="36" y="12" width="10" height="8" fill={C.win} rx="1" opacity={N?1:.65}/>
    <line x1="9" y1="12" x2="9" y2="20" stroke={C.house} strokeWidth=".8"/>
    <line x1="4" y1="16" x2="14" y2="16" stroke={C.house} strokeWidth=".8"/>
    <line x1="41" y1="12" x2="41" y2="20" stroke={C.house} strokeWidth=".8"/>
    <line x1="36" y1="16" x2="46" y2="16" stroke={C.house} strokeWidth=".8"/>
    
    {N && <>
      <rect x="2" y="10" width="14" height="12" fill={C.win} opacity=".12" rx="2"/>
      <rect x="34" y="10" width="14" height="12" fill={C.win} opacity=".12" rx="2"/>
      <polygon points="4,22 14,22 25,45 -10,45" fill={C.win} opacity=".06"/>
      <polygon points="36,22 46,22 65,45 25,45" fill={C.win} opacity=".06"/>
    </>}

    <circle cx="-2" cy="30" r="6" fill={N?'#0a1510':'#27ae60'} />
    <circle cx="5" cy="32" r="4.5" fill={N?'#0a1510':'#2ecc71'} />
    <circle cx="48" cy="31" r="5" fill={N?'#0a1510':'#27ae60'} />
    <circle cx="54" cy="33" r="4" fill={N?'#0a1510':'#2ecc71'} />
  </g>
);

    {[0,6,12,18,24,30].map(d=><ellipse key={d} cx={25 + Math.sin(d/5)*4} cy={35+d} rx={3-d*.04} ry={1.2} fill={N?'#1a2030':'#8a7a68'} opacity=".5"/>)}

    {[-8,-4,54,58,62].map(x=> (
      <g key={x}>
        <rect x={x} y={22} width={1.5} height={11} fill={C.house} opacity=".4" rx=".3"/>
        <path d={`M ${x} 23 Q ${x+2} 26 ${x} 29 Q ${x-2} 32 ${x} 33`} fill="none" stroke={C.m1} strokeWidth="0.8" opacity="0.6"/>
      </g>
    ))}
    <rect x="-9" y="25" width="14" height="1" fill={C.house} opacity=".3"/>
    <rect x="53" y="25" width="12" height="1" fill={C.house} opacity=".3"/>

    {N && <g transform="translate(-20, 25)">
      <ellipse cx="0" cy="0" rx="8" ry="3" fill="#111" />
      <polygon points="-3,-1 3,-1 0,-10" fill="#e67e22" opacity="0.8">
        <animate attributeName="points" values="-3,-1 3,-1 0,-10; -2,-1 2,-1 0,-14; -3,-1 3,-1 0,-10" dur="0.5s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="-1,-1 1,-1 0,-6" fill="#f1c40f" opacity="0.9">
        <animate attributeName="points" values="-1,-1 1,-1 0,-6; -1.5,-1 1.5,-1 0,-9; -1,-1 1,-1 0,-6" dur="0.3s" repeatCount="indefinite"/>
      </polygon>
      {Array.from({length: 8}).map((_, i) => (
        <circle key={i} cx={-4 + Math.random()*8} cy="-2" r="0.8" fill="#e74c3c">
          <animate attributeName="cy" values="-2; -18" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" begin={`${Math.random()}s`}/>
          <animate attributeName="opacity" values="1; 0" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" begin={`${Math.random()}s`}/>
        </circle>
      ))}
      <ellipse cx="0" cy="0" rx="30" ry="12" fill="#e67e22" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.25;0.15" dur="1s" repeatCount="indefinite"/>
      </ellipse>
    </g>}

    <g transform="translate(60, 20)">
      <circle cx="0" cy="0" r="10" fill="none" stroke={C.roof} strokeWidth="2"/>
      <circle cx="0" cy="0" r="8" fill="none" stroke={C.house} strokeWidth="1"/>
      <circle cx="0" cy="0" r="2" fill={C.roof}/>
      <g style={{animation:'ray-spin 8s linear infinite', transformOrigin:'0px 0px'}}>
        {Array.from({length:8}).map((_, i) => (
           <line key={i} x1="0" y1="0" x2="0" y2="-10" stroke={C.roof} strokeWidth="1.5" transform={`rotate(${i*45})`}/>
        ))}
      </g>
    </g>

    <circle cx="-5" cy="30" r="2" fill={N?'#2a1520':'#d44'} opacity=".7"/>
    <circle cx="57" cy="30" r="2" fill={N?'#1a2a20':'#4a4'} opacity=".7"/>
  </g>
);

const ScenicLake = ({ N, C }) => (
  <>
    {/* Mist and Rocks at River Source to blend smoothly */}
    <ellipse cx="100" cy="235" rx="30" ry="10" fill={C.cloud} opacity=".4" />
    <ellipse cx="105" cy="230" rx="15" ry="5" fill={C.snow} opacity=".6" />
    <path d="M 85 235 L 90 230 L 95 233 L 105 228 L 115 235 Z" fill={N?'#111':'#4a4a4a'} opacity="0.8"/>

    {/* The Grand Continuous River */}
    <path d="M 100 230 C 200 280, 300 340, 550 355 C 900 370, 1300 360, 1650 365 L 1650 395 C 1300 390, 900 400, 550 385 C 250 370, 150 300, 100 230 Z" fill="url(#rvg)" opacity=".85"/>
    <path d="M 100 235 C 200 285, 300 345, 550 360 C 900 375, 1300 365, 1650 370 L 1650 395 C 1300 390, 900 400, 550 385 C 250 370, 150 300, 100 230 Z" fill={C.rivShine} opacity=".15"/>
    
    {/* Shimmer lines flowing along the curve */}
    <path d="M 100 230 C 180 285, 280 345, 530 360 C 880 375, 1280 365, 1650 370" fill="none" stroke={C.rivShine} strokeWidth="4" strokeLinecap="round" strokeDasharray="20 40 10 30" opacity=".4" style={{animation:'rv-flow 3s linear infinite'}}/>
    <path d="M 100 240 C 190 295, 290 355, 540 370 C 890 385, 1290 375, 1650 380" fill="none" stroke={C.rivShine} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="15 35 20 30" opacity=".25" style={{animation:'rv-flow 5s linear infinite', animationDelay:'-1.5s'}}/>
    <path d="M 100 250 C 170 305, 270 365, 520 380 C 870 395, 1270 385, 1650 390" fill="none" stroke={C.rivShine} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="10 50 20 20" opacity=".15" style={{animation:'rv-flow 7s linear infinite', animationDelay:'-3s'}}/>

    {/* Lily Pads */}
    {[[150, 280], [165, 285], [300, 335], [320, 340], [840, 365], [1200, 365], [1220, 360]].map(([x, y], i) => (
      <g key={`lily${i}`} transform={`translate(${x},${y})`}>
        <path d="M 0 0 C 4 -2, 8 2, 4 4 C 0 6, -4 4, -4 2 C -6 -2, -2 -2, 0 0 Z" fill={N?'#153020':'#2ecc71'} opacity="0.8"/>
        {i%2===0 && <circle cx="2" cy="2" r="0.8" fill={N?'#fff':'#f1c40f'} opacity="0.9"/>}
      </g>
    ))}

    {/* Shoreline Rocks */}
    {[[120,245,4],[250,330,5],[550,380,3.5],[950,360,4.5],[1300,390,5]].map(([x,y,r],i)=>(
      <g key={`sh-rk${i}`}>
        <ellipse cx={x} cy={y} rx={r} ry={r*.6} fill={N?'#1a2030':'#6a6050'} opacity=".8"/>
        <ellipse cx={x-.5} cy={y-.5} rx={r*.6} ry={r*.35} fill={N?'#2a3040':'#8a7a68'} opacity=".5"/>
        <path d={`M ${x-r*.5} ${y} Q ${x} ${y-r*.4} ${x+r*.5} ${y}`} fill="none" stroke={N?'#222':'#4a4030'} strokeWidth="0.5"/>
      </g>
    ))}

    {/* Jumping Fish */}
    <g style={{animation: 'fish-jump 8s infinite'}}>
      <path d="M 600 375 Q 605 360 610 375" fill="none" stroke={N?'#bdc3c7':'#7f8c8d'} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="605" cy="375" r="8" fill="none" stroke={C.rivShine} strokeWidth="1" opacity="0.5">
        <animate attributeName="r" values="2; 15" dur="8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8; 0" dur="8s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Wooden Arch Bridge (over the river) */}
    <g transform="translate(450, 345)">
      {/* The Arch */}
      <path d="M 0 20 Q 40 -10 80 20" fill="none" stroke={N?'#2c3e50':'#795548'} strokeWidth="3" opacity="0.8"/>
      <path d="M 0 24 Q 40 -6 80 24" fill="none" stroke={N?'#1a252f':'#4e342e'} strokeWidth="2" opacity="0.5"/>
      {/* The Deck */}
      <rect x="-10" y="5" width="100" height="4" fill={N?'#2c3e50':'#795548'} rx="1"/>
      <rect x="-10" y="9" width="100" height="2" fill={N?'#1a252f':'#4e342e'} rx="1" opacity="0.6"/>
      {/* The Railing */}
      <line x1="-10" y1="-2" x2="90" y2="-2" stroke={N?'#2c3e50':'#795548'} strokeWidth="1.5"/>
      {[0, 16, 32, 48, 64, 80].map(px => (
        <rect key={`bp${px}`} x={px-1} y="-2" width="1.5" height="7" fill={N?'#1a252f':'#5d4037'}/>
      ))}
    </g>

    {/* Wooden Dock */}
    <g transform="translate(900, 355)">
       <rect x="0" y="0" width="15" height="30" fill={N?'#2c3e50':'#795548'} transform="skewX(-20)"/>
       <line x1="0" y1="5" x2="15" y2="5" stroke={N?'#1a252f':'#5d4037'} strokeWidth="1" transform="skewX(-20)"/>
       <line x1="0" y1="15" x2="15" y2="15" stroke={N?'#1a252f':'#5d4037'} strokeWidth="1" transform="skewX(-20)"/>
       <line x1="0" y1="25" x2="15" y2="25" stroke={N?'#1a252f':'#5d4037'} strokeWidth="1" transform="skewX(-20)"/>
       <rect x="-1" y="28" width="2" height="10" fill={N?'#1a252f':'#4e342e'}/>
       <rect x="14" y="28" width="2" height="8" fill={N?'#1a252f':'#4e342e'}/>
    </g>

    {/* Sun/Moon Reflection on River */}
    <g transform="translate(1392, 365)">
      {Array.from({length: 6}).map((_, i) => (
        <ellipse key={`sref${i}`} cx="0" cy={i*4} rx={35 - i*4} ry="1.5" fill={C.orb} opacity={N ? 0.2 : 0.45}>
          <animate attributeName="rx" values={`${35 - i*4};${45 - i*4};${35 - i*4}`} dur={`${2 + i*0.2}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values={`${N ? 0.2 : 0.45};${N ? 0.05 : 0.15};${N ? 0.2 : 0.45}`} dur={`${2 + i*0.2}s`} repeatCount="indefinite"/>
        </ellipse>
      ))}
    </g>

    {/* Small Rowboat */}
    <g style={{animation: 'boat-bob 4s ease-in-out infinite', transformOrigin: '1000px 375px'}}>
      <path d="M -15 0 L 15 0 L 10 6 L -10 6 Z" fill={C.house} opacity=".2" transform="translate(1000, 375) scale(1, -1)"/>
      <path d="M -18 -4 L 18 -4 L 12 4 L -12 4 Z" fill={N?'#2c3e50':'#8e44ad'} transform="translate(1000, 375)"/>
      <path d="M -16 -4 L 16 -4 L 10 2 L -10 2 Z" fill={N?'#34495e':'#9b59b6'} transform="translate(1000, 375)"/>
      <line x1="1000" y1="373" x2="1018" y2="381" stroke={N?'#1a252f':'#e67e22'} strokeWidth="1.5"/>
      <ellipse cx="1018" cy="381" rx="4" ry="2" fill={N?'#1a252f':'#e67e22'} transform="rotate(30 1018 381)"/>
    </g>
  </>
);

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
    Array.from({ length: 40 }, () => ({
      x: Math.random()*100, s: N?(2+Math.random()*2.5):(1+Math.random()*2),
      op: N?(.2+Math.random()*.4):(.05+Math.random()*.12),
      dur: 12+Math.random()*10, del: Math.random()*14,
      dr: -25+Math.random()*50,
    })), [N]);

  const C = getColors(N);

  return (
    <>
      <style>{`
        .hbg{position:absolute;inset:0;overflow:hidden;background:${C.sky}}

        /* SUN RAYS */
        .h-rays{position:absolute;z-index:2;pointer-events:none;
          right:calc(13% - 210px);top:calc(9% - 210px);width:500px;height:500px;
          background:conic-gradient(from 0deg,
            rgba(255,200,50,.08),transparent 6%, rgba(255,200,50,.06),transparent 12%,
            rgba(255,200,50,.08),transparent 18%, rgba(255,200,50,.06),transparent 24%,
            rgba(255,200,50,.08),transparent 30%, rgba(255,200,50,.06),transparent 36%,
            rgba(255,200,50,.08),transparent 42%, rgba(255,200,50,.06),transparent 48%,
            rgba(255,200,50,.08),transparent 54%, rgba(255,200,50,.06),transparent 60%,
            rgba(255,200,50,.08),transparent 66%, rgba(255,200,50,.06),transparent 72%,
            rgba(255,200,50,.08),transparent 78%, rgba(255,200,50,.06),transparent 84%,
            rgba(255,200,50,.08),transparent 90%, rgba(255,200,50,.06),transparent 96%);
          border-radius:50%; animation:ray-spin 80s linear infinite;
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
            width:100%;height:100%;
            background:
              radial-gradient(circle at 28% 42%, rgba(180,170,140,.35) 0%, transparent 22%),
              radial-gradient(circle at 62% 28%, rgba(170,160,130,.3) 0%, transparent 18%),
              radial-gradient(circle at 45% 68%, rgba(160,150,120,.25) 0%, transparent 25%),
              radial-gradient(circle at 72% 55%, rgba(175,165,135,.2) 0%, transparent 15%),
              radial-gradient(circle at 35% 22%, rgba(185,175,145,.18) 0%, transparent 12%),
              radial-gradient(circle at 55% 45%, rgba(165,155,125,.15) 0%, transparent 20%),
              radial-gradient(circle at 18% 58%, rgba(170,160,130,.22) 0%, transparent 14%);
          `:`width:100%;height:100%;background:transparent;`}}
        .h-orb::after{content:'';position:absolute;inset:-60%;border-radius:50%;
          background:radial-gradient(circle,${C.orbGlow},transparent 50%);
          animation:orb-p 5s ease-in-out infinite alternate}
        @keyframes orb-p{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.15);opacity:.85}}

        /* Moonbeams */
        .h-moonbeams{position:absolute;z-index:3;pointer-events:none;
          right:calc(13% - 140px);top:calc(9% - 140px);width:340px;height:340px;
          background:conic-gradient(from 0deg,
            rgba(200,210,230,.04),transparent 8%, rgba(200,210,230,.03),transparent 16%,
            rgba(200,210,230,.04),transparent 24%, rgba(200,210,230,.03),transparent 32%,
            rgba(200,210,230,.04),transparent 40%, rgba(200,210,230,.03),transparent 48%,
            rgba(200,210,230,.04),transparent 56%, rgba(200,210,230,.03),transparent 64%,
            rgba(200,210,230,.04),transparent 72%, rgba(200,210,230,.03),transparent 80%,
            rgba(200,210,230,.04),transparent 88%, rgba(200,210,230,.03),transparent 96%);
          border-radius:50%; animation:ray-spin 120s linear infinite;
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
        .mt-back { animation: mountain-pan-back 90s ease-in-out infinite, mountain-breathe 25s ease-in-out infinite; transform-origin: bottom center; }
        .mt-mid { animation: mountain-pan-mid 70s ease-in-out infinite, mountain-breathe 20s ease-in-out infinite; transform-origin: bottom center; }
        @keyframes mountain-pan-back { 0% { transform: translateX(0px) scale(1.02); } 50% { transform: translateX(-2%) scale(1.02); } 100% { transform: translateX(0px) scale(1.02); } }
        @keyframes mountain-pan-mid { 0% { transform: translateX(0px) scale(1.05); } 50% { transform: translateX(-3.5%) scale(1.05); } 100% { transform: translateX(0px) scale(1.05); } }
        @keyframes mountain-breathe { 0% { transform: scaleY(1); } 50% { transform: scaleY(1.015); } 100% { transform: scaleY(1); } }

        /* RIVER SHIMMER */
        @keyframes rv-flow{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-100}}

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

        /* NEW SCENIC ANIMATIONS */
        @keyframes bal-1 { 0% { transform: translate(-100px, 15vh) scale(1.5); } 100% { transform: translate(110vw, 5vh) scale(1.5); } }
        @keyframes bal-2 { 0% { transform: translate(110vw, 25vh) scale(0.8); } 100% { transform: translate(-100px, 30vh) scale(0.8); } }
        @keyframes boat-bob { 0%, 100% { transform: translate(0px, 0px) rotate(-1deg); } 50% { transform: translate(0px, 3px) rotate(1deg); } }
        @keyframes fish-jump { 0%, 90% { transform: translate(0,0); opacity: 0; } 95% { transform: translate(0,-30px); opacity: 1; } 100% { transform: translate(0,0); opacity: 0; } }

        /* WINDMILL */
        .windmill-wrapper { position:absolute; bottom:24%; right:14%; z-index:10; transform: scale(0.65); transform-origin: bottom center; }
        .n-wm { display: grid; position: relative; }
        .n-wm > .n-blades { justify-self: center; position: absolute; width: 250%; aspect-ratio: 1; display: grid; top: -46.5%; place-items: center; animation: n-rot 20s linear infinite; }
        @keyframes n-rot { to { transform: rotate(360deg); } }
        .n-wm > .n-blades > * { --c1: #412819; --c2: #b3a8a2; grid-area: 1/1; }
        .n-wm > .n-blades > .n-center { width: 6%; aspect-ratio: 1; background-color: var(--c1); background-image: radial-gradient(var(--c2) 20%, var(--c1) 0); border-radius: 50%; z-index: 1; }
        .n-wm > .n-blades > .n-blade { background-color: var(--c1); height: 100%; width: 2%; display: grid; position: relative; border-radius: 2px; }
        .n-wm > .n-blades > .n-blade:last-child { transform: rotate(90deg); }
        .n-wm > .n-blades > .n-blade::before, .n-wm > .n-blades > .n-blade::after { content: ""; position: absolute; width: 500%; height: 35%; background: linear-gradient(to right, var(--c1) 8%, transparent 0 96%, var(--c1) 0), linear-gradient(var(--c1) 2%, transparent 0 98%, var(--c1) 0), linear-gradient(transparent 40%, rgba(0,0,0,0.125) 0 60%, transparent 0) center / 2% 5%, linear-gradient(90deg, transparent 40%, rgba(0,0,0,0.125) 0 60%, transparent 0) center / 20% 80% var(--c2); }
        .n-wm > .n-blades > .n-blade::before { left: 100%; top: 1%; }
        .n-wm > .n-blades > .n-blade::after { right: 100%; bottom: 1%; }
        .n-wm > .n-building { height: 90px; aspect-ratio: 0.5; display: grid; grid-template-rows: 1fr 4fr 1.25fr; }
        .n-wm > .n-building > .n-top { --c1: #513e37; --c2: #77594e; grid-column: 1/-1; background-color: var(--c1); width: 75%; justify-self: center; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background-image: radial-gradient(circle at top left, var(--c2) 50%, transparent 55%); }
        .n-wm > .n-building > .n-middle { --deg1: 8deg; --deg2: 4deg; --stop1: calc(90deg - var(--deg1)); --stop2: calc(90deg - var(--deg2)); --size: /50% 100% no-repeat; --c1: #fcf7fb; --c2: #f3eded; --c3: #e0d6d5; --ct: transparent 0; background: conic-gradient(from 270deg at 50% 100%, var(--c2) var(--stop2), var(--ct)) right var(--size), conic-gradient(from 270deg at 100% 100%, var(--c3) var(--stop1), var(--ct)) right var(--size), conic-gradient(from var(--deg2) at 50% 100%, var(--c2) var(--stop2), var(--ct)) left var(--size), conic-gradient(from var(--deg1) at 0% 100%, var(--c1) var(--stop1), var(--ct)) left var(--size), linear-gradient(var(--c2) 100%, transparent) center / 50% 100% no-repeat; display: grid; padding-top: 40%; justify-items: center; }
        .n-wm > .n-building > .n-middle > .n-window { --c1: #050201; --c2: #77594e; --c3: #fcf7fb; height: 45%; aspect-ratio: 1.5; background: linear-gradient(var(--c1) 8%, transparent 0 92%, var(--c1) 0) center / 52% 100% no-repeat, linear-gradient(90deg, var(--c2) 25%, transparent 0 48%, var(--c1) 0 52%, transparent 0 75%, var(--c2) 0), var(--c3); }
        .n-wm > .n-building > .n-bottom { background: linear-gradient(90deg, #77594e 25%, #513e37 0 75%, #3c2b23 0); display: grid; }
        .n-wm > .n-building > .n-bottom > .n-door { --c1: #050201; --c2: #77594e; place-self: end center; height: 60%; aspect-ratio: 0.75; background: linear-gradient(90deg, var(--c2) 10%, transparent 0 90%, var(--c2) 0), linear-gradient(var(--c2) 7.5%, transparent 0), var(--c1); }
      `}</style>

      <div className="hbg">
        <SunRays N={N} />
        <SkyOrb N={N} C={C} />
        <Moonbeams N={N} />
        <NightSky N={N} />
        <Clouds clouds={clouds} C={C} />
        <Balloons N={N} />
        <BirdFlock birds={birds} C={C} />
        <AmbientLeaves N={N} />

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

          {/* Layer 1: Majestic Back Mountains */}
          <g className="mt-back" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
            <path d="M-50 250 L 50 140 L 100 110 L 150 150 L 220 70 L 280 50 L 340 100 L 420 60 L 500 80 L 580 140 L 660 50 L 750 40 L 820 90 L 880 150 L 950 80 L 1020 60 L 1090 120 L 1150 200 L 1220 100 L 1300 70 L 1380 110 L 1450 160 L 1550 50 L 1650 90 L 1650 600 L -50 600Z" fill="url(#mg1)"/>
            <path d="M-50 250 L 120 180 L 190 120 L 270 170 L 350 90 L 450 120 L 540 70 L 650 150 L 730 110 L 820 170 L 930 100 L 1050 140 L 1180 80 L 1280 150 L 1400 100 L 1520 180 L 1650 130 L 1650 600 L -50 600Z" fill="url(#mg1)" opacity="0.6"/>
            <path d="M100 110 L120 140 L150 150 L110 160 Z M280 50 L310 90 L340 100 L290 110 Z M420 60 L450 80 L500 80 L440 90 Z M660 50 L700 80 L750 40 L690 90 Z M1020 60 L1050 90 L1090 120 L1030 130 Z M1300 70 L1340 100 L1380 110 L1320 120 Z M1550 50 L1580 80 L1650 90 L1570 100 Z" fill={N ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.2)'}/>
            <path d="M100 110 L 85 130 Q 100 135 110 125 Q 115 135 130 130 L 100 110 Z M280 50 L 260 75 Q 280 85 295 70 Q 305 80 320 70 L 280 50 Z M420 60 L 400 85 Q 420 95 435 80 Q 450 90 470 75 L 420 60 Z M660 50 L 630 85 Q 660 95 680 75 Q 700 90 720 70 L 660 50 Z M1020 60 L 990 95 Q 1020 105 1040 85 Q 1060 95 1080 80 L 1020 60 Z M1300 70 L 1270 105 Q 1300 115 1320 95 Q 1340 105 1360 90 L 1300 70 Z M1550 50 L 1520 85 Q 1550 95 1570 75 Q 1590 85 1610 70 L 1550 50 Z" fill={C.snow}/>
          </g>

          <rect x="0" y="190" width="1600" height="50" fill={N?'rgba(10,20,40,.08)':'rgba(180,210,230,.1)'} />

          {/* Layer 2: Rugged Mid Mountains */}
          <g className="mt-mid" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
            <path d="M-50 280 L 20 230 L 80 190 L 140 240 L 220 160 L 300 220 L 380 150 L 460 210 L 540 140 L 620 200 L 700 150 L 780 210 L 860 160 L 940 220 L 1020 150 L 1100 210 L 1180 160 L 1260 220 L 1340 150 L 1420 210 L 1500 160 L 1580 220 L 1650 180 L 1650 600 L -50 600Z" fill="url(#mg2)"/>
            <path d="M80 190 L110 220 L140 240 L100 250 Z M220 160 L250 190 L300 220 L240 230 Z M380 150 L410 180 L460 210 L400 220 Z M540 140 L570 170 L620 200 L560 210 Z M700 150 L730 180 L780 210 L720 220 Z M860 160 L890 190 L940 220 L880 230 Z M1020 150 L1050 180 L1100 210 L1040 220 Z M1180 160 L1210 190 L1260 220 L1200 230 Z M1340 150 L1370 180 L1420 210 L1360 220 Z M1500 160 L1530 190 L1580 220 L1520 230 Z" fill={N ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.15)'}/>
            <path d="M80 190 L 65 210 Q 80 215 90 205 Q 100 215 115 205 L 80 190 Z M220 160 L 205 180 Q 220 185 230 175 Q 240 185 255 175 L 220 160 Z M380 150 L 365 170 Q 380 175 390 165 Q 400 175 415 165 L 380 150 Z M540 140 L 525 160 Q 540 165 550 155 Q 560 165 575 155 L 540 140 Z M700 150 L 685 170 Q 700 175 710 165 Q 720 175 735 165 L 700 150 Z M860 160 L 845 180 Q 860 185 870 175 Q 880 185 895 175 L 860 160 Z M1020 150 L 1005 170 Q 1020 175 1030 165 Q 1040 175 1055 165 L 1020 150 Z M1180 160 L 1165 180 Q 1180 185 1190 175 Q 1200 185 1215 175 L 1180 160 Z M1340 150 L 1325 170 Q 1340 175 1350 165 Q 1360 175 1375 165 L 1340 150 Z M1500 160 L 1485 180 Q 1500 185 1510 175 Q 1520 185 1535 175 L 1500 160 Z" fill={C.snow} opacity="0.8"/>
          </g>

          {/* Pine trees on ridge */}
          {Array.from({length:55},(_,i)=>{const x=i*30+Math.random()*15;const h=8+Math.random()*18;const y=250-Math.random()*8;
            return <DetailedTree key={`p${i}`} x={x} y={y} h={h} C={C} op={.5+Math.random()*.5} />;
          })}

          {/* Layer 3: Near hills */}
          <g style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
            <path d="M0 292 L30 285 L58 290 L85 278 L110 284 L140 272 L165 278 L195 268 L220 274 L248 262 L272 268 L300 275 L325 265 L350 270 L378 258 L405 265 L430 272 L458 262 L485 268 L515 258 L540 264 L568 272 L595 262 L622 268 L650 258 L678 264 L705 270 L732 262 L760 268 L788 260 L815 266 L842 272 L870 264 L898 270 L925 262 L952 268 L980 275 L1008 268 L1035 272 L1062 265 L1090 270 L1118 278 L1145 270 L1172 275 L1200 268 L1228 272 L1255 278 L1282 272 L1310 276 L1338 280 L1365 274 L1392 278 L1420 282 L1448 276 L1478 280 L1508 284 L1538 278 L1568 282 L1600 285 L1600 600 L0 600Z" fill="url(#mg3)" />

          {/* Near trees */}
          {Array.from({length:45},(_,i)=>{const x=i*37+Math.random()*20;const h=6+Math.random()*14;const y=288-Math.random()*6;
            return <DetailedTree key={`n${i}`} x={x} y={y} h={h} C={C} op={.6+Math.random()*.4} />;
          })}

          {/* Majestic Deer Silhouette */}
          <g transform="translate(140, 260)" opacity={N ? 0.6 : 0.8}>
            <path d="M 0 0 C 2 -5, 5 -10, 8 -15 C 6 -18, 5 -20, 7 -22 C 10 -20, 10 -15, 12 -12 C 15 -10, 20 -8, 25 -5 L 20 5 L 18 0 C 15 2, 10 2, 5 5 Z" fill={N?'#111':'#2a1f1a'}/>
            <path d="M 7 -22 Q 5 -28, 2 -30 M 7 -22 Q 10 -25, 12 -28 M 2 -30 Q 5 -32, 8 -30" fill="none" stroke={N?'#111':'#2a1f1a'} strokeWidth="0.8"/>
          </g>

          {/* Rock outcrops */}
          {[[180,270,8],[520,260,10],[880,264,9],[1250,270,7]].map(([x,y,s],i)=>(
            <g key={`rock${i}`} opacity=".25">
              <polygon points={`${x},${y+4} ${x+s*.3},${y-s*.5} ${x+s*.6},${y-s*.3} ${x+s},${y+4}`} fill={N?'#1a2030':'#6a6858'}/>
              <polygon points={`${x+s*.3},${y-s*.5} ${x+s*.45},${y-s*.6} ${x+s*.6},${y-s*.3}`} fill={N?'#222c3a':'#7a7868'} opacity=".6"/>
            </g>
          ))}

          </g>

          {/* Layer 4: Foreground */}
          <g style={{ transform: `translateY(${scrollY * 0.02}px)` }}>
            <path d="M0 322 L35 318 L70 322 L108 316 L145 320 L180 314 L218 318 L255 322 L292 316 L330 320 L368 314 L405 318 L442 322 L480 316 L518 320 L555 314 L592 318 L630 322 L668 316 L705 320 L742 316 L780 312 L818 316 L855 320 L892 314 L930 318 L968 312 L1005 316 L1042 320 L1080 314 L1118 318 L1155 322 L1192 316 L1230 320 L1268 314 L1305 318 L1342 322 L1380 316 L1418 320 L1455 314 L1492 318 L1530 322 L1568 316 L1600 320 L1600 600 L0 600Z" fill="url(#mg4)"/>
          
          {/* Grass tufts */}
          {Array.from({length:30},(_,i)=>{const x=i*55+Math.random()*30;const y=318+Math.random()*4;
            return <g key={`gr${i}`} opacity=".2">
              <line x1={x} y1={y} x2={x-2} y2={y-5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
              <line x1={x+2} y1={y} x2={x+3} y2={y-4.5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
              <line x1={x+4} y1={y} x2={x+2.5} y2={y-5.5} stroke={C.tree} strokeWidth="1" strokeLinecap="round"/>
            </g>;
          })}

          <DetailedHouse N={N} C={C} />

          {/* Trees near house */}
          {[[290,265,18],[300,270,12],[380,260,20],[395,267,13],[400,272,9]].map(([x,y,h],i)=>(
            <g key={`ht${i}`} opacity={.5+i*.08}>
              <polygon points={`${x},${y} ${x+h*.35},${y-h} ${x+h*.7},${y}`} fill={C.tree}/>
              {h>14&&<polygon points={`${x+h*.1},${y-h*.3} ${x+h*.35},${y-h*.85} ${x+h*.6},${y-h*.3}`} fill={C.tree} opacity=".7"/>}
              <rect x={x+h*.3} y={y} width={h*.12} height={h*.25} fill={C.house} opacity=".35"/>
            </g>
          ))}

          {/* (River and Lake Component) */}

          <ScenicLake N={N} C={C} />

          {/* Bank vegetation */}
          {[[600,240],[660,278],[720,310],[780,322],[850,330],[930,338],[1020,342],[1120,348],[1240,354],[1360,362],[1480,368]].map(([x,y],i)=>
            <g key={`bv${i}`}>
              <ellipse cx={x} cy={y} rx={5+i%4} ry={3+i%2} fill={C.tree} opacity=".35"/>
              {i%3===0&&<ellipse cx={x+3} cy={y-1} rx={3} ry={2} fill={C.tree} opacity=".25"/>}
            </g>
          )}

          {/* Wildflowers */}
          {!N&&[[310,278],[340,282],[470,274],[500,276],[560,280],[150,310],[220,315],[850,320],[900,315],[1100,325]].map(([x,y],i)=>
            <circle key={`fl${i}`} cx={x} cy={y} r={1.2} fill={['#e74c3c','#f39c12','#9b59b6','#e74c3c','#3498db'][i%5]} opacity=".8"/>
          )}

          {/* Fireflies (Night only) */}
          {N && Array.from({length: 45}).map((_, i) => (
            <circle key={`ff${i}`} cx={100 + Math.random()*1400} cy={270 + Math.random()*120} r="1.5" fill="#f1c40f" opacity="0">
              <animate attributeName="opacity" values="0;0.9;0" dur={`${2 + Math.random()*4}s`} begin={`${Math.random()*5}s`} repeatCount="indefinite"/>
              <animate attributeName="cy" values={`${270 + Math.random()*120};${260 + Math.random()*120}`} dur={`${2 + Math.random()*4}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          </g>
        </svg>

        <div className="h-mist"/>
        <div className="h-mist h-mist2"/>

        <div className="windmill-wrapper">
          <div className="n-wm">
            <div className="n-blades">
              <div className="n-center"></div>
              <div className="n-blade"></div>
              <div className="n-blade"></div>
            </div>
            <div className="n-building">
              <div className="n-top"></div>
              <div className="n-middle">
                <div className="n-window"></div>
                <div className="n-window"></div>
                <div className="n-window"></div>
              </div>
              <div className="n-bottom">
                <div className="n-door"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
