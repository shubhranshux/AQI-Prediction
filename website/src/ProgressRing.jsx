import { motion } from 'framer-motion';

export default function ProgressRing({ value, max, size=130, color='#22c55e', children }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.8, ease: [0.16,1,0.3,1] }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
