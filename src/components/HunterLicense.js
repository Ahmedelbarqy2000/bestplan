import React from 'react';
import { Star, Shield, Fingerprint, Award, Trash2, Zap, Trophy } from 'lucide-react';

// Custom SVG Radar Chart Component (No Libraries needed)
const RadarChart = ({ stats }) => {
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleSlice = (Math.PI * 2) / 6;

  // Helper to calculate points
  const getPoint = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2; // Start from top
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  };

  const labels = Object.keys(stats);
  const values = Object.values(stats);
  
  const polygonPoints = values.map((val, i) => getPoint(val, i)).join(' ');
  const backgroundPoints = values.map((_, i) => getPoint(100, i)).join(' ');

  return (
    <div className="relative w-full flex justify-center py-4">
       <svg width={size} height={size} className="overflow-visible">
          {/* Background Hexagon */}
          <polygon points={backgroundPoints} fill="none" stroke="#333" strokeWidth="1" />
          {/* Internal Web */}
          {[0.25, 0.5, 0.75].map((scale, j) => (
             <polygon key={j} points={values.map((_, i) => getPoint(100 * scale, i)).join(' ')} fill="none" stroke="#222" strokeWidth="1" />
          ))}
          {/* Data Shape */}
          <polygon points={polygonPoints} fill="rgba(138, 0, 0, 0.5)" stroke="#8a0000" strokeWidth="2" />
          
          {/* Labels */}
          {labels.map((label, i) => {
             const angle = i * angleSlice - Math.PI / 2;
             const x = center + (radius + 25) * Math.cos(angle);
             const y = center + (radius + 15) * Math.sin(angle);
             return (
               <text key={i} x={x} y={y} fill="#888" fontSize="10" textAnchor="middle" alignmentBaseline="middle">
                 {label}
               </text>
             );
          })}
       </svg>
    </div>
  );
};

export default function HunterLicense({ completedDays, organizedData, startDate, onReset, streak, skillStats }) {
  const totalDays = organizedData.reduce((acc, p) => acc + p.days.length, 0);
  const completedCount = completedDays.length;
  
  // Stars Logic
  let stars = 0;
  if (completedCount > 50) stars = 1;
  if (completedCount > 150) stars = 2;
  if (completedCount > 300) stars = 3;

  // Title Logic
  let title = "Novice Hunter";
  if (completedCount > 10) title = "Code Vigilante";
  if (completedCount > 50) title = "System Detective";
  if (completedCount > 100) title = "Algorithm Knight";
  if (completedCount > 200) title = "Tech Titan";

  // Achievements
  const achievements = [
    { id: 1, name: "Awakening", desc: "Day 1 Complete", active: completedCount >= 1 },
    { id: 2, name: "First Blood", desc: "10 Days Done", active: completedCount >= 10 },
    { id: 3, name: "Streak Master", desc: "7 Day Streak", active: streak >= 7 },
    { id: 4, name: "Centurion", desc: "100 Days", active: completedCount >= 100 },
  ];

  organizedData.forEach(phase => {
    const phaseDone = phase.days.every(d => completedDays.includes(d.uniqueId));
    if (phaseDone) {
        achievements.push({
            id: `p_${phase.id}`,
            name: `${phase.name.split(' ')[0]} Master`,
            desc: "Sector Cleared",
            active: true,
            isPhase: true
        });
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in zoom-in duration-500">
      
      {/* 1. LICENSE CARD */}
      <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-[#8a0000] rounded-2xl overflow-hidden shadow-2xl relative mb-12">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
          <div className="bg-[#8a0000] h-3 w-full" />
          
          <div className="p-6 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2 font-black text-xl">
                      <span className="bg-[#8a0000] text-black px-2 rounded">H</span>
                      <span className="bg-[#8a0000] text-black px-2 rounded">X</span>
                      <span className="bg-[#8a0000] text-black px-2 rounded">H</span>
                  </div>
                  <div className="flex gap-1">
                      {[1, 2, 3].map(s => (
                          <Star key={s} size={24} fill={s <= stars ? "#fbbf24" : "none"} stroke={s <= stars ? "#fbbf24" : "#444"} />
                      ))}
                  </div>
              </div>

              {/* Name & Class */}
              <div className="flex flex-col gap-1 mb-6">
                  <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Hunter Name</label>
                  <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-mono">Ahmed Emad Elbarqy</h1>
                  <p className="text-[#8a0000] font-bold text-lg">{title}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                         <Zap size={14} className="text-yellow-500" />
                         <span className="text-gray-400 text-xs uppercase">Current Streak</span>
                     </div>
                     <span className="text-2xl font-black text-white">{streak} DAYS</span>
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                         <Trophy size={14} className="text-blue-500" />
                         <span className="text-gray-400 text-xs uppercase">Progress</span>
                     </div>
                     <span className="text-2xl font-black text-white">{Math.round((completedCount/totalDays)*100)}%</span>
                  </div>
              </div>

              {/* RADAR CHART (The Skill Hexagon) */}
              <div className="mt-6 border-t border-gray-800 pt-4">
                 <div className="text-center text-[10px] uppercase text-gray-500 mb-2">Skill Analysis</div>
                 <RadarChart stats={skillStats} />
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end border-t border-gray-800 pt-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                      <Fingerprint size={32} />
                      <span className="text-[10px] w-20 leading-tight">Biometric Verified</span>
                  </div>
                  <span className="text-4xl font-black text-white/10">HUNTER</span>
              </div>
          </div>
      </div>

      {/* 2. ACHIEVEMENTS */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="text-[#8a0000]" /> Achievements
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {achievements.map((ach, i) => (
                <div key={i} className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all ${ach.active ? 'bg-[#1a1a1a] border-[#8a0000] text-white' : 'bg-black border-[#222] text-gray-700 opacity-50'}`}>
                    <div className={`mb-2 ${ach.isPhase ? 'text-yellow-500' : 'text-[#8a0000]'}`}>
                        {ach.isPhase ? <Shield size={24} /> : <Award size={24} />}
                    </div>
                    <div className="text-[10px] font-bold leading-tight">{ach.name}</div>
                </div>
            ))}
        </div>
      </div>

      {/* 3. DANGER ZONE */}
      <div className="border border-red-900/30 bg-red-900/5 rounded-xl p-6 text-center">
          <button onClick={onReset} className="flex items-center justify-center gap-2 mx-auto bg-transparent border border-red-800 text-red-800 px-6 py-2 rounded hover:bg-red-900 hover:text-white transition-colors text-sm font-mono">
            <Trash2 size={16} /> BURN LICENSE
          </button>
      </div>
    </div>
  );
}
