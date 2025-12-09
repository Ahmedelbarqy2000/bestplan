import React from 'react';
import { Star, Shield, Fingerprint, Award, Trash2 } from 'lucide-react';

export default function HunterLicense({ completedDays, organizedData, startDate, onReset }) {
  const totalDays = organizedData.reduce((acc, p) => acc + p.days.length, 0);
  const completedCount = completedDays.length;
  
  // --- منطق النجوم (Hunter Stars) ---
  // 1 Star: Phase 3 Done (Intro + C)
  // 2 Stars: Phase 7 Done (Frontend)
  // 3 Stars: Phase 11 Done (Capstone)
  let stars = 0;
  // *ملاحظة: نحسب تقريباً بعدد الأيام لأن الـ IDs قد تتغير*
  if (completedCount > 100) stars = 1;
  if (completedCount > 400) stars = 2;
  if (completedCount > 800) stars = 3;

  // --- اللقب (Title) ---
  let title = "Novice Hunter";
  if (completedCount > 10) title = "Code Vigilante";
  if (completedCount > 50) title = "System Detective";
  if (completedCount > 150) title = "Algorithm Knight";
  if (completedCount > 300) title = "Backend Wraith";
  if (completedCount > 500) title = "Fullstack Warlord";
  if (completedCount > 800) title = "Tech Titan";

  // --- الجوائز (Dynamic Trophies) ---
  const achievements = [
    { id: 1, name: "The Awakening", desc: "Completed Day 1", active: completedCount >= 1 },
    { id: 2, name: "First Blood", desc: "First 10 Days", active: completedCount >= 10 },
    { id: 3, name: "Monthly Grind", desc: "30 Days Done", active: completedCount >= 30 },
    { id: 4, name: "Centurion", desc: "100 Days Survived", active: completedCount >= 100 },
    { id: 5, name: "Half-Blood Prince", desc: "50% Complete", active: completedCount >= totalDays / 2 },
    { id: 6, name: "The Finisher", desc: "100% Complete", active: completedCount >= totalDays },
  ];

  // نضيف جوائز إنهاء المراحل
  organizedData.forEach(phase => {
    const phaseDone = phase.days.every(d => completedDays.includes(d.uniqueId));
    achievements.push({
        id: `phase_${phase.id}`,
        name: `${phase.name.split(' ')[0]} Master`,
        desc: `Finish ${phase.name}`,
        active: phaseDone,
        isPhase: true
    });
  });

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in zoom-in duration-500">
      
      {/* 1. The License Card */}
      <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-[#8a0000] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(138,0,0,0.3)] relative mb-12">
          {/* Card Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
          
          {/* Top Strip */}
          <div className="bg-[#8a0000] h-3 w-full" />
          
          <div className="p-6 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                      <div className="bg-[#8a0000] text-black font-black px-2 rounded text-xl">H</div>
                      <div className="bg-[#8a0000] text-black font-black px-2 rounded text-xl">X</div>
                      <div className="bg-[#8a0000] text-black font-black px-2 rounded text-xl">H</div>
                  </div>
                  <div className="flex gap-1">
                      {[1, 2, 3].map(s => (
                          <Star key={s} size={24} fill={s <= stars ? "#fbbf24" : "none"} stroke={s <= stars ? "#fbbf24" : "#444"} />
                      ))}
                  </div>
              </div>

              {/* Identity Info */}
              <div className="flex flex-col gap-1 mb-8">
                  <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Hunter Name</label>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase font-mono">Ahmed Emad Elbarqy</h1>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Current Class</label>
                        <p className="text-[#8a0000] font-bold text-lg">{title}</p>
                     </div>
                     <div>
                        <label className="text-[10px] uppercase text-gray-500 font-mono tracking-widest">Serial No.</label>
                        <p className="text-gray-400 font-mono text-sm">EG-2026-X-{completedCount}</p>
                     </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                      <Fingerprint size={32} />
                      <span className="text-[10px] w-20 leading-tight">Bio-Metric Data Encrypted</span>
                  </div>
                  <div className="text-right">
                      <span className="text-4xl font-black text-white/10">HUNTER</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. Achievement Grid (Trophies) */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="text-[#8a0000]" />
            Achievements Collection
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {achievements.map((ach, i) => (
                <div key={i} className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all ${ach.active ? 'bg-[#1a1a1a] border-[#8a0000] text-white shadow-lg shadow-[#8a0000]/20' : 'bg-black border-[#222] text-gray-700 opacity-50 grayscale'}`}>
                    <div className={`mb-2 ${ach.isPhase ? 'text-yellow-500' : 'text-[#8a0000]'}`}>
                        {ach.isPhase ? <Shield size={24} /> : <Award size={24} />}
                    </div>
                    <div className="text-[10px] font-bold leading-tight">{ach.name}</div>
                </div>
            ))}
        </div>
      </div>

      {/* 3. Danger Zone */}
      <div className="border border-red-900/30 bg-red-900/5 rounded-xl p-6 text-center">
          <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
          <p className="text-gray-500 text-xs mb-4">Resetting your license will revoke all stars and progress.</p>
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 mx-auto bg-transparent border border-red-800 text-red-800 px-6 py-2 rounded hover:bg-red-900 hover:text-white transition-colors text-sm font-mono"
          >
            <Trash2 size={16} /> BURN LICENSE
          </button>
      </div>

    </div>
  );
}
