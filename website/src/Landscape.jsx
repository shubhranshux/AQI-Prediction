import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

/* Full-viewport nature landscape with GSAP parallax */
export default function Landscape({ theme, isNight }) {
  const t = theme;
  const ref = useRef(null);
  const sky = isNight ? { s1:'#0c1222', s2:'#162032', s3:'#2a3a52' } : { s1:t.sky1, s2:t.sky2, s3:t.sky3 };
  const stars = isNight ? Array.from({length:45},(_,i)=>({cx:(i*37+13)%1200,cy:(i*23+7)%250,r:.6+(i%3)*.5,op:.2+(i%4)*.12})) : [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const layers = el.querySelectorAll('.parallax-layer');
    layers.forEach((layer, i) => {
      gsap.to(layer, {
        yPercent: -(i + 1) * 8,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    });
    // Sun/moon float
    const celestial = el.querySelector('.celestial');
    if (celestial) {
      gsap.to(celestial, { y: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 1 } });
    }
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 w-full h-full overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.s1}/><stop offset="50%" stopColor={sky.s2}/><stop offset="100%" stopColor={sky.s3}/>
          </linearGradient>
        </defs>
        <rect width="1200" height="700" fill="url(#sky)"/>
        {stars.map((s,i)=><circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.op}><animate attributeName="opacity" values={`${s.op};${s.op*.15};${s.op}`} dur={`${1.5+i%4}s`} repeatCount="indefinite"/></circle>)}
      </svg>

      {/* Sun/Moon — parallax */}
      <div className="celestial absolute z-10" style={{top:'10%',right:'14%'}}>
        {isNight ? (
          <div className="relative">
            <div className="absolute -inset-10 rounded-full" style={{background:'radial-gradient(circle,rgba(253,224,71,.08) 0%,transparent 70%)'}}/>
            <div className="rounded-full" style={{width:64,height:64,background:'linear-gradient(135deg,#fde68a,#fbbf24)',boxShadow:'0 0 50px 15px rgba(253,224,71,.1)'}}>
              <div className="absolute rounded-full" style={{top:12,left:18,width:14,height:14,background:'rgba(245,208,97,.35)',borderRadius:'50%'}}/>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute -inset-14 rounded-full" style={{background:`radial-gradient(circle,${t.sun}20 0%,transparent 60%)`}}/>
            <div className="rounded-full" style={{width:72,height:72,backgroundColor:t.sun,boxShadow:`0 0 60px 20px ${t.sun}20`}}/>
          </div>
        )}
      </div>

      {/* Clouds */}
      {t.haze<.4 && <>
        <svg className="parallax-layer absolute" style={{top:'15%',left:'-6%',animation:'cloud-drift 50s linear infinite'}} width="200" height="70" viewBox="0 0 200 70">
          <ellipse cx="100" cy="40" rx="90" ry="25" fill="white" opacity={isNight?.05:.2}/><ellipse cx="70" cy="32" rx="50" ry="18" fill="white" opacity={isNight?.03:.15}/>
        </svg>
        <svg className="parallax-layer absolute" style={{top:'26%',left:'-10%',animation:'cloud-drift 65s linear infinite',animationDelay:'20s'}} width="140" height="55" viewBox="0 0 140 55">
          <ellipse cx="70" cy="30" rx="62" ry="19" fill="white" opacity={isNight?.04:.13}/>
        </svg>
      </>}

      {/* Birds */}
      {!isNight && t.haze<.3 && <>
        <svg className="absolute" style={{top:'20%',left:'8%',animation:'bird-fly 18s linear infinite'}} width="26" height="10" viewBox="0 0 26 10"><path d="M0,5 Q6.5,0 13,5 Q19.5,0 26,5" fill="none" stroke="rgba(30,41,59,.25)" strokeWidth="1.5"/></svg>
        <svg className="absolute" style={{top:'16%',left:'22%',animation:'bird-fly 22s linear infinite',animationDelay:'6s'}} width="20" height="8" viewBox="0 0 20 8"><path d="M0,4 Q5,0 10,4 Q15,0 20,4" fill="none" stroke="rgba(30,41,59,.18)" strokeWidth="1.2"/></svg>
      </>}

      {/* Haze */}
      {t.haze>0 && <div className="absolute inset-0" style={{backgroundColor:`rgba(120,113,108,${t.haze*.35})`,transition:'background 2s'}}/>}

      {/* Mountains — 4 parallax layers */}
      <svg className="parallax-layer absolute bottom-0 w-full" viewBox="0 0 1200 360" preserveAspectRatio="none" style={{height:'56%'}}>
        <path d="M0,360 L0,175 Q90,70 210,145 Q330,25 470,115 Q590,10 710,85 Q830,0 950,60 Q1060,20 1150,95 L1200,120 L1200,360Z" fill={t.mt1} opacity=".28"/>
      </svg>
      <svg className="parallax-layer absolute bottom-0 w-full" viewBox="0 0 1200 360" preserveAspectRatio="none" style={{height:'50%'}}>
        <path d="M0,360 L0,205 Q150,100 310,180 Q430,75 570,145 Q690,60 810,130 Q930,50 1050,120 Q1150,75 1200,165 L1200,360Z" fill={t.mt2} opacity=".48"/>
      </svg>
      <svg className="parallax-layer absolute bottom-0 w-full" viewBox="0 0 1200 360" preserveAspectRatio="none" style={{height:'44%'}}>
        <path d="M0,360 L0,240 Q190,155 370,220 Q510,140 670,200 Q800,130 930,188 Q1050,145 1150,205 L1200,225 L1200,360Z" fill={t.mt3} opacity=".72"/>
      </svg>
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 360" preserveAspectRatio="none" style={{height:'38%'}}>
        <path d="M0,360 L0,275 Q230,215 450,260 Q610,225 770,255 Q910,218 1070,248 Q1150,228 1200,270 L1200,360Z" fill={t.mt3}/>
      </svg>

      {/* Trees */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 100" preserveAspectRatio="none" style={{height:'16%'}}>
        {[30,80,130,190,260,340,420,500,575,650,720,790,860,940,1010,1080,1140,1175].map((x,i)=>{
          const h=30+(i%4)*10, w=9+(i%3)*3;
          return <g key={i} transform={`translate(${x},100)`} style={{animation:`tree-sway ${4+i%3}s ease-in-out infinite`,transformOrigin:`${x}px 100px`}}>
            <rect x="-1.5" y={-h+10} width="3" height={h-10} fill={t.tree} opacity=".4" rx="1"/>
            <polygon points={`${-w},0 0,${-h} ${w},0`} fill={t.tree} opacity=".85"/>
            <polygon points={`${-w+3},-7 0,${-h-5} ${w-3},-7`} fill={t.tree} opacity=".55"/>
          </g>;
        })}
      </svg>

      {/* River shimmer */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 55" preserveAspectRatio="none" style={{height:'9%'}}>
        <path d="M280,55 Q340,28 430,34 Q540,14 650,26 Q770,8 890,22 Q990,34 1090,18 Q1170,10 1200,24 L1200,55Z" fill={t.river} opacity=".3"/>
        <path d="M540,32 Q570,28 600,32" fill="none" stroke="white" strokeWidth=".7" opacity=".1"><animate attributeName="opacity" values=".06;.18;.06" dur="3s" repeatCount="indefinite"/></path>
      </svg>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-44" style={{background:'linear-gradient(to top,var(--bg),transparent)'}}/>
    </div>
  );
}
