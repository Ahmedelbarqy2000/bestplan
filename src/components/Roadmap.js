import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, CheckCircle, Play, ShieldAlert, Eye } from 'lucide-react';

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

      {/* Active Day Glow Effect */}
      {status === 'active' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#8a0000]/10 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

const PhaseSection = ({ phase, completedDays, isExpanded, onToggle, onSelectDay }) => {
  const totalDays = phase.days.length;
  const completedInPhase = phase.days.filter(d => completedDays.includes(d.uniqueId)).length;
  const progress = Math.round((completedInPhase / totalDays) * 100);
  const isComplete = progress === 100;

  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button 
        onClick={onToggle} 
        className="w-full py-5 px-2 flex items-center justify-between group hover:bg-[#0a0a0a] transition-colors rounded-lg my-1"
      >
        <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
            <div className={`text-2xl md:text-3xl font-black font-mono transition-colors ${isExpanded || !isComplete ? 'text-[#8a0000]' : 'text-green-800'}`}>
                {String(phase.id).padStart(2, '0')}
            </div>
            <div className="text-left truncate">
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
        <ChevronDown className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#8a0000]' : ''}`} />
      </button>

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
                        // Logic: Day 1 is active, or if prev day is complete
                        else {
                            const prevDayId = `day_${day.dayNumber - 2}`;
                            if (day.dayNumber === 1 || completedDays.includes(prevDayId)) {
                                status = 'active';
                            }
                        }

                        return (
                            <DayTile 
                                key={day.uniqueId} 
                                day={day} 
                                status={status}
                                index={day.dayNumber - 1} // Global Index for display
                                onSelect={onSelectDay} 
                            />
                        );
                    })}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Roadmap({ data, completedDays, onSelectDay }) {
  // Find current active phase logic
  const activePhase = data.find(p => {
      const isFinished = p.days.every(d => completedDays.includes(d.uniqueId));
      return !isFinished;
  });
  
  const [expandedId, setExpandedId] = useState(activePhase?.id || data[0]?.id);

  if (!data || data.length === 0) return <div className="p-10 text-center text-gray-500 animate-pulse">Initializing Batcomputer...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex items-center justify-between mb-8 px-2 pt-4">
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Mission <span className="text-[#8a0000]">Map</span>
                </h2>
                <p className="text-gray-500 text-xs font-mono mt-1">SELECT ACTIVE SECTOR TO ENGAGE</p>
            </div>
            <div className="hidden md:block text-right">
                <div className="text-[#8a0000] font-bold text-xl">{completedDays.length}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">Missions Clear</div>
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
           />
       ))}
    </div>
  );
}
