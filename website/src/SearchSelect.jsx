import { useState, useRef, useEffect } from "react";

export default function SearchSelect({ label, value, options, onChange, placeholder, dark, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const T = dark ? { bg:'#222220',br:'rgba(255,255,255,.08)',brA:'#d4a574',text:'#f5f0e8',sub:'#5c564d',drop:'#1a1a19',dropBr:'rgba(255,255,255,.08)',hover:'#252523',check:'#d4a574',sel:'#d4a574',sh:'0 10px 40px rgba(0,0,0,0.8)' }
    : { bg:'#ffffff',br:'rgba(0,0,0,.08)',brA:'#0f172a',text:'#111827',sub:'#6b7280',drop:'#ffffff',dropBr:'rgba(0,0,0,.06)',hover:'#f8f9fa',check:'#0f172a',sel:'#0f172a',sh:'0 12px 36px rgba(15,23,42,0.1)' };

  return (
    <div ref={ref} style={{ position:"relative", marginBottom:14, '--hover-bg': T.hover }}>
      <div style={{ fontSize:10, color:dark?'#8c8578':'#8c7b6b', letterSpacing:".12em", textTransform:"uppercase", fontWeight:800, marginBottom:6 }}>{label}</div>
      <div onClick={() => { if(!loading){ setOpen(!open); setSearch(""); } }} style={{ background:T.bg, border:`1px solid ${open?T.brA:T.br}`, borderRadius:12, padding:"12px 14px", cursor:loading?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .2s ease", boxShadow:open?`0 0 0 4px ${T.brA}15`:"0 2px 4px rgba(0,0,0,0.02)", opacity:loading?0.6:1 }}>
        <span style={{ fontSize:14, fontWeight:600, color:value?T.text:T.sub }}>{loading ? "Fetching..." : (value||placeholder)}</span>
        {loading ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin-anim 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .3s cubic-bezier(0.4, 0, 0.2, 1)"}}><path d="M2 4L6 8L10 4" stroke={T.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:100, background:T.drop, border:`1px solid ${T.dropBr}`, borderRadius:16, overflow:"hidden", boxShadow:T.sh, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px", borderBottom:`1px solid ${T.dropBr}`, background:dark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)' }}>
            <input ref={inputRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${label}...`} style={{ width:"100%", background:dark?'#111110':'#ffffff', border:`1px solid ${T.br}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, fontFamily:"'Inter'", outline:"none", transition:"border-color 0.2s" }} onFocus={e=>e.target.style.borderColor=T.brA} onBlur={e=>e.target.style.borderColor=T.br}/>
          </div>
          <div className="custom-scrollbar" style={{ overflowY:"auto", maxHeight:240, padding:"6px" }}>
            {filtered.length===0 ? <div style={{padding:"20px",textAlign:"center",fontSize:13,color:T.sub,fontWeight:500}}>No results found</div>
            : filtered.map(opt=>(
              <div key={opt} className="search-select-option" onClick={()=>{onChange(opt);setOpen(false);setSearch("")}}
                style={{padding:"10px 14px",borderRadius:10,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:opt===value?T.sel:T.text,fontWeight:opt===value?700:500,transition:"background-color 0.15s ease"}}>
                {opt===value ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke={T.check} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <div style={{width:14,height:14}}/>}
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
