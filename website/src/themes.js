/* Pollution-reactive nature scene themes */
export const getAqiTheme = (aqi) => {
  if (aqi === null) return { sky1:'#0c4a6e', sky2:'#0ea5e9', sky3:'#bae6fd', mt1:'#166534', mt2:'#15803d', mt3:'#14532d', river:'#38bdf8', sun:'#fbbf24', tree:'#115e26', haze:0 };
  if (aqi <= 50)    return { sky1:'#0c4a6e', sky2:'#0ea5e9', sky3:'#bae6fd', mt1:'#166534', mt2:'#15803d', mt3:'#14532d', river:'#38bdf8', sun:'#fbbf24', tree:'#115e26', haze:0 };
  if (aqi <= 100)   return { sky1:'#1e3a5f', sky2:'#60a5fa', sky3:'#fde68a', mt1:'#365314', mt2:'#3f6212', mt3:'#1a2e05', river:'#60a5fa', sun:'#fbbf24', tree:'#3f6212', haze:0.08 };
  if (aqi <= 200)   return { sky1:'#57534e', sky2:'#a8a29e', sky3:'#d6d3d1', mt1:'#57534e', mt2:'#78716c', mt3:'#44403c', river:'#a1a1aa', sun:'#d4d4d8', tree:'#57534e', haze:0.25 };
  if (aqi <= 300)   return { sky1:'#44403c', sky2:'#78716c', sky3:'#a8a29e', mt1:'#44403c', mt2:'#57534e', mt3:'#292524', river:'#78716c', sun:'#a8a29e', tree:'#44403c', haze:0.45 };
  if (aqi <= 400)   return { sky1:'#292524', sky2:'#57534e', sky3:'#78716c', mt1:'#1c1917', mt2:'#292524', mt3:'#0c0a09', river:'#57534e', sun:'#78716c', tree:'#292524', haze:0.65 };
  return                    { sky1:'#1c1917', sky2:'#44403c', sky3:'#7f1d1d', mt1:'#0c0a09', mt2:'#1c1917', mt3:'#000000', river:'#44403c', sun:'#ef4444', tree:'#1c1917', haze:0.8 };
};

export const aqiMeta = (aqi) => {
  if (aqi <= 50)  return { color:'#22c55e', label:'Good' };
  if (aqi <= 100) return { color:'#eab308', label:'Satisfactory' };
  if (aqi <= 200) return { color:'#f97316', label:'Moderate' };
  if (aqi <= 300) return { color:'#ef4444', label:'Poor' };
  if (aqi <= 400) return { color:'#a855f7', label:'Very Poor' };
  return                  { color:'#dc2626', label:'Severe' };
};

export const getTimeInfo = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)  return { greeting:'Good Morning',   isNight:false, sunColor:'#fbbf24' };
  if (h >= 12 && h < 17) return { greeting:'Good Afternoon', isNight:false, sunColor:'#f59e0b' };
  if (h >= 17 && h < 21) return { greeting:'Good Evening',   isNight:false, sunColor:'#f97316' };
  return                         { greeting:'Good Night',     isNight:true,  sunColor:'#818cf8' };
};
