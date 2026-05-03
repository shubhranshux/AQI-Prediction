import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import React from 'react';
import { getLocations, predictAuto, predictManual } from "./api";
import { getAqiTheme, getTimeInfo } from "./themes";
import SearchSelect from "./SearchSelect";
import { Shield, Wind, CloudRain, Thermometer, Droplets, ArrowRight, Sun, Moon, MapPin, Search, Activity, Leaf, Clock, Sparkles, Skull, AlertCircle, Pencil, Radio, Users, Heart, Eye, Cloud, CloudSun, Sunset, Sunrise, Cpu, Database, BarChart3 } from 'lucide-react';
import WindmillScene from './WindmillScene';

import { districts as staticDistricts, locMap as staticLocMap } from "./locations";




const T_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const LEVELS=[{max:50,label:"Good",color:"#22c55e",I:Leaf},{max:100,label:"Satisfactory",color:"#eab308",I:Sun},{max:200,label:"Moderate",color:"#f97316",I:Cloud},{max:300,label:"Poor",color:"#ef4444",I:CloudRain},{max:400,label:"Very Poor",color:"#a855f7",I:Skull},{max:500,label:"Severe",color:"#dc2626",I:AlertCircle}];
const getLevel=a=>LEVELS.find(l=>a<=l.max)||LEVELS[5];
const TIME={'Good Morning':{I:Sunrise,s:"Fresh air awaits you"},'Good Afternoon':{I:CloudSun,s:"Stay mindful of the air"},'Good Evening':{I:Sunset,s:"Wind down, breathe easy"},'Good Night':{I:Moon,s:"Rest well tonight"}};
const FIELDS=[{k:'pm25',l:'PM2.5',u:'µg/m³'},{k:'pm10',l:'PM10',u:'µg/m³'},{k:'no2',l:'NO₂',u:'ppb'},{k:'so2',l:'SO₂',u:'ppb'},{k:'co',l:'CO',u:'mg/m³'},{k:'o3',l:'O₃',u:'ppb'},{k:'temp',l:'Temp',u:'°C'},{k:'humidity',l:'Humidity',u:'%'}];

const Gauge = React.memo(function Gauge({aqi,color,dark}){
  const cx=120,cy=120,r=96,strk=28,p=Math.min(aqi/500,1);
  const T = dark ? { cut:'#111110', ndl:'#f8fafc', ndlHole:'#111110', txt:'rgba(255,255,255,.5)' } : { cut:'#ffffff', ndl:'#334155', ndlHole:'#ffffff', txt:'rgba(0,0,0,.5)' };
  return(
    <svg width="240" height="140" viewBox="0 0 240 140" style={{overflow:'visible',marginTop:10}}>
      <defs>
        <linearGradient id="gg" x1="0%" y1="0%" x2="100%">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="20%" stopColor="#84cc16"/>
          <stop offset="40%" stopColor="#eab308"/>
          <stop offset="60%" stopColor="#f97316"/>
          <stop offset="80%" stopColor="#ef4444"/>
          <stop offset="100%" stopColor="#991b1b"/>
        </linearGradient>
      </defs>
      
      {/* Full colored arc */}
      <path d={`M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="url(#gg)" strokeWidth={strk} strokeLinecap="butt"/>
      
      {/* Cutting lines for 10 segments */}
      {[...Array(9)].map((_,i)=>{
        const a = Math.PI - (i+1)*(Math.PI/10);
        return <line key={i} x1={cx+(r-strk/2-2)*Math.cos(a)} y1={cy-(r-strk/2-2)*Math.sin(a)} x2={cx+(r+strk/2+2)*Math.cos(a)} y2={cy-(r+strk/2+2)*Math.sin(a)} stroke={T.cut} strokeWidth="4"/>
      })}

      {/* Value Labels along inner arc */}
      {[0,100,200,300,400,500].map((v,i)=>{
        const a = Math.PI - i*(Math.PI/5);
        const lx = cx+(r-strk/2-18)*Math.cos(a);
        const ly = cy-(r-strk/2-18)*Math.sin(a) + (i===0||i===5?4:4);
        return <text key={v} x={lx} y={ly} textAnchor="middle" fill={T.txt} fontSize="11" fontWeight="700">{v}</text>
      })}

      {/* Low / High Labels */}
      <text x={cx-r} y={cy+26} textAnchor="middle" fill={T.txt} fontSize="13" fontWeight="800">Low</text>
      <text x={cx+r} y={cy+26} textAnchor="middle" fill={T.txt} fontSize="13" fontWeight="800">High</text>

      {/* Needle */}
      <g transform={`translate(${cx}, ${cy}) rotate(${p*180 - 90})`} style={{transition:'transform 1.5s cubic-bezier(.34,1.56,.64,1)'}}>
        <polygon points="-8,-6 0,-94 8,-6" fill={T.ndl} />
        <circle cx="0" cy="0" r="14" fill={T.ndl} />
        <circle cx="0" cy="0" r="6" fill={T.ndlHole} />
      </g>
    </svg>
  );
});

// Isolated Clock to prevent full-app re-renders every second
function ClockDisplay() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span style={{fontSize:12,color:'rgba(255,255,255,.9)',display:'flex',alignItems:'center',gap:4,textShadow:'0 2px 8px rgba(0,0,0,.4)',fontWeight:600}}>
      <Clock size={12}/>{time.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
    </span>
  );
}

export default function App(){
  const time=useMemo(getTimeInfo,[]);const TI=TIME[time.greeting];
  const[dark,setDark]=useState(false);const D=dark;

  const [districts,setDistricts]=useState(staticDistricts);
  const [locMap,setLocMap]=useState(staticLocMap);
  const [district,setDistrict]=useState(staticDistricts[0]||'');
  const [location,setLocation]=useState(staticLocMap[staticDistricts[0]]?.[0]||'');
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [mode,setMode]=useState('auto'); // auto|manual
  const [manual,setManual]=useState({pm25:'',pm10:'',no2:'',so2:'',co:'',o3:'',temp:'',humidity:''});
  const [bars,setBars]=useState(false);

  useEffect(()=>{if(district&&locMap[district])setLocation(locMap[district][0])},[district]);
  useEffect(()=>{setResult(null);setBars(false)},[district,location]);
  const scan=useCallback(async()=>{setLoading(true);setError(null);setBars(false);try{let r;if(mode==='auto')r=await predictAuto(district,location);else{const n={};for(const k in manual)n[k]=parseFloat(manual[k])||0;r=await predictManual({...n,district,location})}setResult(r);setTimeout(()=>setBars(true),400)}catch{setError('Prediction failed')}setLoading(false)}, [mode, district, location, manual]);

  const aqi=result?.predicted_aqi??null;const lv=aqi!==null?getLevel(aqi):null;const LI=lv?.I||Shield;
  const theme=getAqiTheme(aqi);const p=result?.parameters;
  const T=useMemo(()=>D?{bg:'#000000',card:'#111110',cb:'rgba(255,255,255,.08)',text:'#f0ece4',sub:'#a09888',mut:'#6c665d',acc:'#d4a574',inp:'#1a1a18',inpB:'rgba(255,255,255,.10)',div:'rgba(255,255,255,.06)'}
    :{bg:'#f9f9fc',card:'#ffffff',cb:'rgba(0,0,0,.04)',text:'#111827',sub:'#6b7280',mut:'#9ca3af',acc:'#0f172a',inp:'#f3f4f6',inpB:'rgba(0,0,0,.05)',div:'rgba(0,0,0,.06)'},[D]);
  const CS=useMemo(()=>({background:T.card,border:`1px solid ${T.cb}`,borderRadius:24,boxShadow:D?'0 2px 16px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.03)':'0 10px 30px rgba(0,0,0,.03), 0 1px 3px rgba(0,0,0,.02)'}),[T,D]);
  const LB=useMemo(()=>({fontSize:11,color:T.sub,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,marginBottom:12}),[T]);
  // Removed GSAP to fix opacity bugs. Using native CSS animations instead.

  const heroMemo = useMemo(() => (
      <div style={{padding:16,position:'relative',marginBottom:48}}>
        {/* Landscape container — full width, rounded */}
        <div className="hero-landscape" style={{position:'relative',height:'90vh',minHeight:600,borderRadius:24,overflow:'hidden',transform:'translateZ(0)',isolation:'isolate',WebkitMaskImage:'-webkit-radial-gradient(white, black)'}}>
          <WindmillScene isNight={D}/>
          {/* Dark overlay for text readability */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.45) 40%, rgba(0,0,0,.35) 70%, rgba(0,0,0,.5) 100%)',pointerEvents:'none'}}/>

          {/* Hero Content — Elegant & Minimal (Reference Image Style) */}
          <div className="hero-text-block" style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:10,textAlign:'center',width:'100%',maxWidth:640,padding:'0 20px'}}>
            <div style={{animation:'fade-up 1s ease-out forwards'}}>
              <h1 className="hero-title" style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:56,fontWeight:500,color:'#ffffff',lineHeight:1.1,marginBottom:16,textShadow:'0 2px 24px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.4)'}}>
                <span className="hero-word" style={{display:'block'}}>Air Quality,</span>
                <span className="hero-word" style={{display:'block'}}>One Step at a Time</span>
              </h1>
              <p className="hero-sub" style={{fontFamily:"'Inter', sans-serif",fontSize:15,fontWeight:500,color:'rgba(255,255,255,.88)',marginBottom:32,lineHeight:1.5,textShadow:'0 1px 8px rgba(0,0,0,.4)'}}>
                Hyper-local ML predictions designed to ensure<br/>a healthier environment and inner peace.
              </p>

              <div className="hero-sub hero-buttons" style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
                <button className="hover-scale" onClick={()=>document.getElementById('scan-section').scrollIntoView({behavior:'smooth'})} style={{padding:'11px 26px',borderRadius:99,border:'none',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7,fontFamily:"'Inter'",boxShadow:'0 2px 12px rgba(37,99,235,.45)',letterSpacing:'.01em',transition:'all .3s ease'}}>
                  <Sparkles size={14}/> Start Now
                </button>
                <button className="hover-scale" onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{padding:'11px 26px',borderRadius:99,border:'1.5px solid rgba(255,255,255,.35)',background:'transparent',color:'rgba(255,255,255,.92)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Inter'",letterSpacing:'.01em',display:'flex',alignItems:'center',gap:7,transition:'all .3s ease'}}>
                  <ArrowRight size={14}/> Our Features
                </button>
              </div>
            </div>
          </div>
          
          {/* Nav on top of landscape */}
          <div className="hero-nav" style={{position:'absolute',top:0,left:0,right:0,zIndex:15,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.15)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}><Leaf size={15} color="#fff"/></div>
              <span style={{fontSize:15,fontWeight:800,color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,.4)'}}>EnviroPredict</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <span className="clock-wrapper"><ClockDisplay /></span>
              <button onClick={()=>setDark(!D)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:99,border:'1px solid rgba(255,255,255,.25)',background:'rgba(255,255,255,.12)',backdropFilter:'blur(10px)',cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,.25)',transition:'all .3s ease'}}>
                {D ? <Sun size={14} color="#fbbf24"/> : <Moon size={14} color="#e2e8f0"/>}
                <span style={{fontSize:11,fontWeight:700,color:'#fff',letterSpacing:'.03em'}}>{D?'Light':'Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Stats Bar — positioned to overlap hero bottom */}
        <div className="stats-bar hero-sub" style={{display:'flex',alignItems:'center',gap:0,padding:'14px 36px',background:D?'rgba(17,17,16,.95)':'#fff',borderRadius:16,border:`1px solid ${D?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)'}`,boxShadow:D?'0 8px 32px rgba(0,0,0,.4)':'0 8px 32px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.04)',margin:'-28px auto 0',position:'relative',zIndex:20,width:'fit-content',animation:'fade-up 1s ease-out 0.3s both'}}>
          {[{v:'98.83%',l:'Accuracy',c:D?'#f0ece4':'#111827'},{v:'400+',l:'Locations',c:'#3b82f6'},{v:'9',l:'Districts',c:'#22c55e'}].map((s,i)=>(
            <div key={s.l} style={{display:'flex',alignItems:'center',gap:0}}>
              <div style={{textAlign:'center',padding:'0 20px'}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c,lineHeight:1,letterSpacing:'-0.02em'}}>{s.v}</div>
                <div style={{fontSize:9,color:D?'#a09888':'#9ca3af',fontWeight:700,marginTop:4,letterSpacing:'.06em',textTransform:'uppercase'}}>{s.l}</div>
              </div>
              {i<2&&<div className="stat-divider" style={{width:1,height:28,background:D?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}}/>}
            </div>
          ))}
        </div>
      </div>
  ), [D, T]);

  return(
    <div style={{background:T.bg,minHeight:'100vh',fontFamily:"'Inter',sans-serif",color:T.text,'--bg':T.bg}}>

      {/* ═══ HERO — Xurya style ═══ */}
      {heroMemo}

      {/* ═══ SCROLL DOWN INDICATOR ═══ */}
      <div className="scroll-indicator" onClick={()=>document.getElementById('scan-section').scrollIntoView({behavior:'smooth'})} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'12px 0 0',cursor:'pointer',opacity:.6,transition:'opacity .3s'}}>
        <div style={{width:24,height:38,borderRadius:12,border:`2px solid ${T.sub}`,position:'relative',display:'flex',justifyContent:'center'}}>
          <div className="scroll-dot" style={{width:4,height:4,borderRadius:'50%',background:T.sub,position:'absolute',top:8,animation:'scroll-bounce 2s ease-in-out infinite'}}/>
        </div>
        <span style={{fontSize:10,fontWeight:700,color:T.sub,letterSpacing:'.12em',textTransform:'uppercase'}}>Scroll to explore</span>
      </div>

      {/* ═══ DASHBOARD BELOW ═══ */}
      <div id="scan-section" className="scan-section" style={{padding:'60px 32px 0',maxWidth:'100%'}}>

        {/* ── 3-COLUMN LAYOUT: Scan | Pollutants | Gauge ── */}
        <div className="dashboard-grid" style={{display:'grid',gap:16,marginBottom:20,position:'relative',zIndex:50,animation:'fade-up 1s ease-out 0.4s both'}}>

          {/* COL 1: Scan Controls */}
          <div className="hover-lift" style={{...CS,padding:22,position:'relative',zIndex:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}><Search size={15} color={T.acc}/><span style={{fontSize:15,fontWeight:800}}>Scan</span></div>
            <div style={{display:'flex',background:D?'#252523':'#f0ebe4',borderRadius:10,padding:3,gap:2,marginBottom:12}}>
              <button onClick={()=>setMode('auto')} style={{flex:1,padding:'8px 0',borderRadius:8,border:'none',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'Inter'",display:'flex',alignItems:'center',justifyContent:'center',gap:4,background:mode==='auto'?T.card:'transparent',color:mode==='auto'?T.text:T.sub,boxShadow:mode==='auto'&&!D?'0 1px 3px rgba(0,0,0,.05)':'none'}}><Radio size={11}/>Auto</button>
              <button onClick={()=>setMode('manual')} style={{flex:1,padding:'8px 0',borderRadius:8,border:'none',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'Inter'",display:'flex',alignItems:'center',justifyContent:'center',gap:4,background:mode==='manual'?T.card:'transparent',color:mode==='manual'?T.text:T.sub,boxShadow:mode==='manual'&&!D?'0 1px 3px rgba(0,0,0,.05)':'none'}}><Pencil size={11}/>Manual</button>
            </div>
            <SearchSelect label="District" value={district} options={districts} onChange={setDistrict} placeholder="Search..." dark={D} />
            <SearchSelect label="Location" value={location} options={locMap[district]||[]} onChange={setLocation} placeholder="Search..." dark={D} />
            {mode==='manual'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:10}}>{FIELDS.map(f=><div key={f.k}><div style={{fontSize:8,color:T.sub,letterSpacing:'.06em',textTransform:'uppercase',fontWeight:700,marginBottom:2}}>{f.l}</div><input type="number" step="any" placeholder="0" value={manual[f.k]} onChange={e=>setManual(p=>({...p,[f.k]:e.target.value}))} style={{width:'100%',background:T.inp,border:`1.5px solid ${T.inpB}`,borderRadius:8,padding:'6px 8px',fontSize:11,fontFamily:"'Inter'",color:T.text,outline:'none'}}/></div>)}</div>}
            {error&&<div style={{background:'rgba(239,68,68,.06)',borderRadius:8,padding:'6px 8px',marginBottom:8,fontSize:10,color:'#ef4444',display:'flex',alignItems:'center',gap:4}}><AlertCircle size={11}/>{error}</div>}
            <button onClick={scan} disabled={loading||(!districts.length)} className="hover-scale" style={{width:'100%',padding:14,borderRadius:14,border:'none',background:T.acc,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:"'Inter'",opacity:(loading)?0.6:1,boxShadow:'0 4px 12px rgba(15,23,42,.15)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin-anim 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Scanning...</>
              ) : 'Scan Air Quality'}
            </button>
          </div>

          {/* COL 2: Pollutant Breakdown */}
          <div className="hover-lift" style={{...CS,padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{...LB,fontSize:12}}>Pollutant Breakdown</div>
            </div>
            {p?(
              <div className="pollutant-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[
                  {k:'PM2.5',v:p.pm25,u:'µg/m³',m:250,c:'#22c55e'},
                  {k:'PM10',v:p.pm10,u:'µg/m³',m:430,c:'#3b82f6'},
                  {k:'O₃',v:p.o3,u:'µg/m³',m:200,c:'#eab308'},
                  {k:'NO₂',v:p.no2,u:'µg/m³',m:200,c:'#f472b6'},
                  {k:'CO',v:p.co,u:'mg/m³',m:10,c:'#a78bfa'},
                  {k:'SO₂',v:p.so2,u:'µg/m³',m:350,c:'#f97316'},
                ].map(pl=>(
                  <div key={pl.k} className="theme-animate hover-scale" style={{background:D?'#1a1a18':'#f8fafc',border:`1px solid ${D?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'}`,borderRadius:16,padding:'16px 18px',display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:pl.c,boxShadow:`0 0 8px ${pl.c}88`}}/>
                      <span style={{fontSize:13,fontWeight:700,color:T.sub}}>{pl.k}</span>
                    </div>
                    <div style={{fontSize:24,fontWeight:900,color:T.text,marginBottom:14,lineHeight:1,letterSpacing:'-0.02em'}}>
                      {typeof pl.v==='number'?pl.v.toFixed(1):pl.v} <span style={{fontSize:11,fontWeight:600,color:T.sub,marginLeft:2}}>{pl.u}</span>
                    </div>
                    <div style={{height:6,borderRadius:8,background:D?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)',overflow:'hidden',marginTop:'auto'}}>
                      <div style={{height:'100%',borderRadius:8,width:bars?`${Math.min((pl.v/pl.m)*100,100)}%`:'0%',background:pl.c,transition:'width 1.4s cubic-bezier(.22,1,.36,1)'}}/>
                    </div>
                  </div>
                ))}
              </div>
            ):(
              <div style={{textAlign:'center',padding:'60px 0',color:T.sub}}>
                <Eye size={28} color={T.mut} style={{margin:'0 auto 8px'}}/>
                <div style={{fontSize:13}}>Scan a location to view data</div>
              </div>
            )}
          </div>

          {/* COL 3: AQI Gauge Meter */}
          <div className="hover-lift" style={{...CS,padding:24,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <Gauge aqi={aqi??0} color={lv?.color||T.mut} dark={D}/>
            <div style={{display:'flex',alignItems:'baseline',gap:12,marginTop:4}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:48,fontWeight:900,color:lv?.color||T.mut,lineHeight:1}}>{aqi??'--'}</div>
              </div>
            </div>
            {lv&&<span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:700,color:lv.color,background:`${lv.color}10`,marginTop:10}}><LI size={13}/>{lv.label}</span>}
            {result&&<div style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:T.sub,marginTop:6}}><MapPin size={12}/>{result.location}, {result.district}</div>}
            <div style={{width:'100%',marginTop:14,paddingTop:10,borderTop:`1px solid ${T.div}`}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                {LEVELS.map(l=>{const on=aqi!==null&&aqi<=l.max&&(LEVELS.indexOf(l)===0||aqi>LEVELS[LEVELS.indexOf(l)-1].max);return(
                  <div key={l.label} style={{textAlign:'center',flex:1}}>
                    <div style={{width:'100%',height:4,borderRadius:99,background:on?l.color:(D?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'),transition:'background .5s',marginBottom:3}}/>
                    <div style={{fontSize:7,color:on?l.color:T.mut,fontWeight:on?800:500}}>{l.label}</div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        {aqi!==null&&<div className="health-grid gsap-stagger-section" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20,position:'relative',zIndex:40}}>
          {[{I:Activity,t:'Outdoor Activity',tip:aqi<100?'Great for sports & jogging.':'Limit prolonged outdoor exertion.',c:'#22c55e'},{I:Shield,t:'Protection',tip:aqi<100?'No mask needed today.':'N95 mask recommended outdoors.',c:'#3b82f6'},{I:Wind,t:'Ventilation',tip:aqi<100?'Open windows for fresh air.':'Keep windows closed. Use purifiers.',c:'#eab308'}].map(h=>(
            <div key={h.t} className="hover-lift health-card" style={{...CS,padding:20,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${h.c}0A`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><h.I size={18} color={h.c}/></div>
              <div><div style={{fontSize:14,fontWeight:800}}>{h.t}</div><div style={{fontSize:13,color:T.sub,lineHeight:1.5}}>{h.tip}</div></div>
            </div>
          ))}
        </div>}

        {/* Features */}
        {useMemo(() => (
        <>
        <div id="features" className="gsap-stagger-section" style={{marginTop:32,marginBottom:20,position:'relative',zIndex:30}}>
          <div style={{textAlign:'center',marginBottom:24}}><div style={LB}>Why EnviroPredict</div><h2 style={{fontSize:30,fontWeight:900,margin:'4px 0'}}>Built for Precision</h2><p style={{fontSize:14,color:T.sub,maxWidth:480,margin:'8px auto 0'}}>Combining cutting-edge ML models with live environmental data for the most accurate AQI predictions in Odisha.</p></div>
          <div className="features-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
            {[{I:Cpu,t:'ML Powered',d:'XGBoost with 98.83% accuracy trained on 25,000+ data points.',c:'#d4a574'},{I:Database,t:'Location Data',d:'Comprehensive pollutant data from calibrated Open-Meteo API.',c:'#3b82f6'},{I:BarChart3,t:'6 Pollutants',d:'PM2.5, PM10, NO₂, SO₂, CO, O₃ analyzed simultaneously.',c:'#22c55e'},{I:Sparkles,t:'Smart UI',d:'Animated landscape reacts to AQI conditions dynamically.',c:'#a855f7'}].map(f=>(
              <div key={f.t} className="hover-lift" style={{...CS,padding:22,textAlign:'center'}}>
                <div style={{width:48,height:48,borderRadius:14,background:`${f.c}12`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',border:`1px solid ${f.c}20`}}><f.I size={22} color={f.c}/></div>
                <div style={{fontSize:15,fontWeight:800,marginBottom:6}}>{f.t}</div><div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech + Team */}
        <div className="gsap-stagger-section tech-team-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
          <div className="hover-lift" style={{...CS,padding:24}}>
            <div style={LB}>Tech Stack</div>
            <div className="tech-stack-inner-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {n:'XGBoost',d:'ML Engine',c:'#d4a574'},{n:'FastAPI',d:'REST Backend',c:'#059669'},
                {n:'React',d:'Frontend UI',c:'#61dafb'},{n:'Vite',d:'Build Tool',c:'#a855f7'},
                {n:'scikit-learn',d:'Data Pipeline',c:'#f97316'},{n:'Open-Meteo',d:'Live AQ Data',c:'#3b82f6'},
                {n:'Tailwind',d:'CSS Framework',c:'#38bdf8'},{n:'Lucide',d:'Icon System',c:'#6b7280'}
              ].map(t=>(
                <div key={t.n} className="hover-scale" style={{background:D?'#1a1a18':T.inp,borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,border:`1px solid ${T.cb}`}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:t.c,flexShrink:0,boxShadow:`0 0 8px ${t.c}66`}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>{t.n}</div>
                    <div style={{fontSize:10,color:T.sub,fontWeight:500}}>{t.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hover-lift" style={{...CS,padding:24}}>
            <div style={LB}>Team</div>
            <div className="team-inner-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[{n:'Shubhranshu Behera',r:'ML & Backend',c:'#d4a574'},{n:'Rupak Ranjan Parida',r:'Data Analysis',c:'#3b82f6'},{n:'Ranjan Kumar Nayak',r:'Research',c:'#22c55e'},{n:'Pramod Kumar Mohananta',r:'Frontend',c:'#a855f7'}].map(m=>(
                <div key={m.n} className="hover-scale" style={{background:D?'#1a1a18':T.inp,borderRadius:14,padding:16,textAlign:'center',border:`1px solid ${T.cb}`}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg, ${m.c}, ${m.c}88)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',boxShadow:`0 4px 12px ${m.c}33`}}><Users size={18} color="#fff"/></div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,lineHeight:1.3}}>{m.n}</div>
                  <span style={{display:'inline-block',fontSize:9,fontWeight:700,color:m.c,background:`${m.c}12`,padding:'3px 10px',borderRadius:99,marginTop:6,letterSpacing:'.04em',textTransform:'uppercase'}}>{m.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="site-footer" style={{borderTop:`1px solid ${T.div}`,padding:'20px 0 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:D?'#252523':'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center'}}><Leaf size={14} color={T.acc}/></div>
            <span style={{fontSize:14,fontWeight:800}}>EnviroPredict</span>
          </div>
          <p style={{fontSize:12,color:T.mut}}>AQI Prediction System · XGBoost + FastAPI + React</p>
          <p style={{fontSize:11,color:T.mut,display:'flex',alignItems:'center',gap:4}}><Heart size={10} color="#ef4444"/>Built with care in Odisha</p>
        </footer>
        </>
        ), [T, D, CS, LB])}
      </div>
    </div>
  );
}
