import { useState, useEffect } from 'react';

const THEMES = {
  dawn:      { greeting: 'Good Dawn',      bg: 'from-indigo-900 via-purple-800 to-orange-400', accent: '#F59E0B', text: 'text-amber-100' },
  morning:   { greeting: 'Good Morning',   bg: 'from-sky-400 via-cyan-300 to-emerald-200',     accent: '#F59E0B', text: 'text-sky-900' },
  afternoon: { greeting: 'Good Afternoon', bg: 'from-blue-500 via-sky-400 to-cyan-300',        accent: '#3B82F6', text: 'text-blue-900' },
  evening:   { greeting: 'Good Evening',   bg: 'from-orange-500 via-rose-400 to-purple-600',   accent: '#F97316', text: 'text-orange-100' },
  dusk:      { greeting: 'Good Evening',   bg: 'from-purple-700 via-indigo-600 to-slate-800',  accent: '#8B5CF6', text: 'text-purple-100' },
  night:     { greeting: 'Good Night',     bg: 'from-slate-950 via-indigo-950 to-slate-900',   accent: '#818CF8', text: 'text-indigo-100' },
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 7)   return 'dawn';
  if (h >= 7 && h < 12)  return 'morning';
  if (h >= 12 && h < 16) return 'afternoon';
  if (h >= 16 && h < 18) return 'evening';
  if (h >= 18 && h < 20) return 'dusk';
  return 'night';
}

export function useTimeTheme() {
  const [tod, setTod] = useState(getTimeOfDay);
  useEffect(() => { const i = setInterval(() => setTod(getTimeOfDay()), 60000); return () => clearInterval(i); }, []);
  return { ...THEMES[tod], tod, isDark: ['dawn','dusk','night'].includes(tod) };
}
