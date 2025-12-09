import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, CheckCircle, Play, ShieldAlert, FileCode, Terminal, RotateCcw } from 'lucide-react';

// ... (DayTile code remains the same as before) ...
const DayTile = ({ day, status, index, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => status !== 'locked' && onSelect(day)}
      className={`
        relative aspect-video rounded-lg p-3 flex flex-col justify-between border cursor-pointer overflow-hidden group select-none transition-all duration-300
        ${status === 'completed' ? 'bg-[#0a0a0a] border-green-900/30 opacity-60' : ''}
        ${status === 'active' ? 'bg-[#141414] border-[#8a0000] shadow-[0_0_20px_rgba(138,0,0,0.25)] ring-1 ring-[#8a0000]/50' : ''}
        ${status === 'locked' ? 'bg-black border-[#1a1a1a] opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex justify-between items-start z-10">
        <span className={`text-[10px] font-mono font-bold ${status === 'active' ? 'text-[#8a0000]' : 'text-gray-600'}`}>
           DAY {String(day.dayNumber).padStart(3, '0')}
        </span>
        {status === 'locked' && <Lock size={12} className="text-gray-600" />}
        {status === 'completed' && <CheckCircle size={14} className="text-green-600" />}
        {status === 'active' && <Play size={14} className="text-[#8a0000] fill-current animate-pulse" />}
      </div>
      {day.isBoss && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
              <ShieldAlert size={50} className="text-red-500" />
          </div>
      )}
      <div className="z-10 mt-auto">
        <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${status === 'locked' ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>
            {day.lessonTitle}
        </h4>
      </div>
      {status === 'active' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#8a0000]/10 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

// --- تحديث المكون PhaseSection لإضافة زر الحذف ---
const PhaseSection = ({ phase, completedDays, isExpanded, onToggle, onSelectDay, onRevokePhase }) => {
  const totalDays = phase.days.length;
  const completedInPhase = phase.days.filter(d => completedDays.includes(d.uniqueId)).length;
  const progress = Math.round((completedInPhase / totalDays) * 100);
  const isComplete = progress === 100;

  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <div className="w-full py-5 px-2 flex items-center justify-between group hover:bg-[#0a0a0a] transition-colors rounded-lg my-1">
        
        {/* الجزء القابل للضغط لفتح القائمة */}
        <div className="flex-1 flex items-center gap-4 md:gap-6 overflow-hidden cursor-pointer" onClick={onToggle}>
            <div className={`text-2xl md:text-3xl font-black font-mono transition-colors ${isExpanded || !isComplete ? 'text-[#8a0000]' : 'text-green-800'}`}>
                {String(phase.id).padStart(2, '0')}
            </div>
            <div className="text-left truncate flex-1">
                <h3 className={`text-sm md:text-lg font-bold uppercase tracking-wider truncate transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {phase.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                    <div className="h-1 w-20 md:w-32 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-700' : 'bg-[#8a0000]'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-mono ${isComplete ? 'text-green-700' : 'text-gray-600'}`}>{progress}%</span>
                </div>
            </div>
        </div>

        {/* أزرار التحكم (السهم + زر التراجع الجديد) */}
        <div className="flex items-center gap-4">
             {/* زر التراجع عن المرحلة (يظهر فقط إذا كان هناك تقدم) */}
            {progress > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onRevokePhase(phase.id); }}
                    className="p-2 rounded-full hover:bg-red-900/20 text-gray-700 hover:text-red-500 transition-colors"
                    title="Reset Sector (Undo All)"
                >
                    <RotateCcw size={16} />
                </button>
            )}
            
            <button onClick={onToggle}>
                 <ChevronDown className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#8a0000]' : ''}`} />
            </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-6"
            >
                <div className="p-2 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                    {phase.days.map((day) => {
                        let status = 'locked';
                        if (completedDays.includes(day.uniqueId)) status = 'completed';
                        else {
                            const prevDayId = `day_${day.dayNumber - 2}`;
                            if (day.dayNumber === 1 || completedDays.includes(prevDayId)) {
                                status = 'active';
                            }
                        }
                        return (
                            <DayTile key={day.uniqueId} day={day} status={status} index={day.dayNumber - 1} onSelect={onSelectDay} />
                        );
                    })}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Roadmap({ data, completedDays, onSelectDay, onRevokePhase }) {
  // 1. منطق تحديد المرحلة النشطة والمهمة القادمة
  const activePhase = data.find(p => !p.days.every(d => completedDays.includes(d.uniqueId)));
  const [expandedId, setExpandedId] = useState(activePhase?.id || data[0]?.id);

  // البحث عن المهمة القادمة (Next Mission)
  let nextMission = null;
  for (const phase of data) {
    for (const day of phase.days) {
        if (!completedDays.includes(day.uniqueId)) {
            nextMission = { ...day, phaseName: phase.name };
            break;
        }
    }
    if (nextMission) break;
  }

  // أدوات سريعة
  const quickTools = [
    { name: 'Betty', url: 'https://github.com/alx-tools/Betty', icon: <FileCode size={14} /> },
    { name: 'Bash', url: 'https://devdocs.io/bash/', icon: <Terminal size={14} /> },
  ];

  if (!data || data.length === 0) return <div className="p-10 text-center text-gray-500">System Offline...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        
        {/* --- HEADER: Tactical HUD --- */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Next Mission Card */}
            <div className="md:col-span-2 bg-[#111] border border-[#333] rounded-xl p-5 relative overflow-hidden group hover:border-[#8a0000] transition-colors cursor-pointer"
                 onClick={() => nextMission && onSelectDay(nextMission)}
            >
                {nextMission ? (
                    <>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[#8a0000] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <Play size={10} className="fill-current animate-pulse" /> Current Objective
                            </span>
                            <span className="text-gray-600 font-mono text-xs">DAY {String(nextMission.dayNumber).padStart(3,'0')}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1 group-hover:text-[#8a0000] transition-colors">{nextMission.lessonTitle}</h2>
                        <p className="text-gray-500 text-xs font-mono">{nextMission.phaseName}</p>
                    </>
                ) : (
                    <div className="text-green-500 font-bold">ALL MISSIONS CLEARED</div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-1 flex flex-col gap-2">
                <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-mono uppercase">Progress</span>
                    <span className="text-white font-bold">{completedDays.length} <span className="text-[#8a0000]">/</span> {data.reduce((acc, p) => acc + p.days.length, 0)}</span>
                </div>
                <div className="flex gap-2 h-full">
                    {quickTools.map((t, i) => (
                        <a key={i} href={t.url} target="_blank" rel="noreferrer" className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-[#8a0000] transition-all">
                            {t.icon}
                            <span className="text-[10px] font-bold mt-1">{t.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>

        {/* --- BODY: The Roadmap --- */}
        <div>
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Mission <span className="text-[#8a0000]">Map</span>
                </h2>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest border border-[#333] px-2 py-1 rounded">
                    Global View
                </div>
            </div>

            {data.map(phase => (
                <PhaseSection 
                    key={phase.id}
                    phase={phase}
                    completedDays={completedDays}
                    isExpanded={expandedId === phase.id}
                    onToggle={() => setExpandedId(expandedId === phase.id ? null : phase.id)}
                    onSelectDay={onSelectDay}
                    onRevokePhase={onRevokePhase} // <-- تمرير الدالة هنا
                />
            ))}
        </div>

    </div>
  );
}
