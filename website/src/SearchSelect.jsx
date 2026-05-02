import { useState, useRef, useEffect } from "react";

export default function SearchSelect({ label, value, options, onChange, placeholder, dark, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const T = dark ? { bg:'#222220',br:'rgba(255,255,255,.08)',brA:'#d4a574',text:'#f5f0e8',sub:'#5c564d',drop:'#1a1a19',dropBr:'rgba(255,255,255,.08)',hover:'#252523',check:'#d4a574',sel:'#d4a574' }
    : { bg:'#ffffff',br:'rgba(0,0,0,.08)',brA:'#0f172a',text:'#111827',sub:'#6b7280',drop:'#ffffff',dropBr:'rgba(0,0,0,.06)',hover:'#f3f4f6',check:'#0f172a',sel:'#0f172a' };

  return (
    <div ref={ref} style={{ position:"relative", marginBottom:14 }}>
      <div style={{ fontSize:10, color:dark?'#8c8578':'#8c7b6b', letterSpacing:".12em", textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>{label}</div>
      <div onClick={() => { if(!loading){ setOpen(!open); setSearch(""); } }} style={{ background:T.bg, border:`1.5px solid ${open?T.brA:T.br}`, borderRadius:12, padding:"11px 14px", cursor:loading?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .2s", boxShadow:open?`0 0 0 3px ${T.brA}18`:"none", opacity:loading?0.6:1 }}>
        <span style={{ fontSize:14, fontWeight:600, color:value?T.text:T.sub }}>{loading ? "Fetching..." : (value||placeholder)}</span>
        {loading ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin-anim 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}><path d="M2 4L6 8L10 4" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100, background:T.drop, border:`1px solid ${T.dropBr}`, borderRadius:14, overflow:"hidden", boxShadow:"0 10px 32px rgba(0,0,0,.1)", maxHeight:260 }}>
          <div style={{ padding:"8px 10px", borderBottom:`1px solid ${T.dropBr}` }}>
            <input ref={inputRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search...`} style={{ width:"100%", background:T.bg, border:`1.5px solid ${T.br}`, borderRadius:8, padding:"8px 12px", color:T.text, fontSize:13, fontFamily:"'DM Sans'", outline:"none" }} onFocus={e=>e.target.style.borderColor=T.brA} onBlur={e=>e.target.style.borderColor=T.br}/>
          </div>
          <div className="custom-scrollbar" style={{ overflowY:"auto", maxHeight:200 }}>
            {filtered.length===0 ? <div style={{padding:14,textAlign:"center",fontSize:12,color:T.sub}}>No results</div>
            : filtered.map(opt=>(
              <div key={opt} onClick={()=>{onChange(opt);setOpen(false);setSearch("")}} onMouseEnter={e=>e.currentTarget.style.background=T.hover} onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                style={{padding:"9px 14px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:7,color:opt===value?T.sel:T.text,fontWeight:opt===value?700:400,transition:"all .1s"}}>
                {opt===value&&<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke={T.check} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
