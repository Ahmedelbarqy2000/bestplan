import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, CheckCircle, Play, ShieldAlert, Eye } from 'lucide-react';

// مكون البطاقة الواحدة
const DayTile = ({ day, status, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(day)}
      className={`
        relative aspect-video rounded-lg p-3 flex flex-col justify-between border cursor-pointer overflow-hidden group select-none
        ${status === 'completed' ? 'bg-[#0f0f0f] border-green-900/30 opacity-70' : ''}
        ${status === 'active' ? 'bg-[#141414] border-[#8a0000] shadow-[0_0_15px_rgba(138,0,0,0.3)]' : ''}
        ${status === 'locked' ? 'bg-[#080808] border-[#1a1a1a] opacity-60 grayscale' : ''}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <span className={`text-[10px] font-mono font-bold ${status === 'active' ? 'text-[#ff0000]' : 'text-gray-600'}`}>
           DAY {String(day.dayNumber).padStart(3, '0')}
        </span>
        {status === 'locked' && <Lock size={12} className="text-gray-600" />}
        {status === 'completed' && <CheckCircle size={14} className="text-green-600" />}
        {status === 'active' && <Play size={14} className="text-[#ff0000] fill-current animate-pulse" />}
      </div>

      {/* Boss Icon */}
      {day.isBoss && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none">
              <ShieldAlert size={50} className="text-red-500" />
          </div>
      )}

      {/* Title */}
      <div className="z-10 mt-auto">
        <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${status === 'locked' ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>
            {day.lessonTitle}
        </h4>
      </div>

      {/* Hover Effect for Locked Items (Peek) */}
      {status === 'locked' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-gray-400 text-xs font-mono">
                <Eye size={12} /> PEEK
            </div>
        </div>
      )}
    </motion.div>
  );
};

// مكون المرحلة (Accordion)
const PhaseSection = ({ phase, completedDays, isExpanded, onToggle, onSelectDay }) => {
  const totalDays = phase.days.length;
  const completedInPhase = phase.days.filter(d => completedDays.includes(d.uniqueId)).length;
  const progress = Math.round((completedInPhase / totalDays) * 100);

  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button 
        onClick={onToggle} 
        className="w-full py-5 px-2 flex items-center justify-between group hover:bg-[#111] transition-colors rounded-lg my-1"
      >
        <div className="flex items-center gap-4 md:gap-6">
            <div className={`text-2xl md:text-3xl font-black font-mono transition-colors ${isExpanded ? 'text-[#8a0000]' : 'text-gray-800'}`}>
                {String(phase.id).padStart(2, '0')}
            </div>
            <div className="text-left">
                <h3 className={`text-sm md:text-lg font-bold uppercase tracking-wider transition-colors ${isExpanded ? 'text-white' : 'text-gray-400'}`}>
                    {phase.name}
                </h3>
                {/* Progress Bar */}
                <div className="flex items-center gap-3 mt-2">
                    <div className="h-1 w-24 md:w-32 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8a0000] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{completedInPhase}/{totalDays}</span>
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
                className="overflow-hidden"
            >
                <div className="p-2 pb-8 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                    {phase.days.map((day) => {
                        let status = 'locked';
                        if (completedDays.includes(day.uniqueId)) status = 'completed';
                        // Logic: If previous day is done OR it's the very first day overall
                        else {
                            const prevDayId = `day_${day.dayNumber - 2}`; // -2 because dayNumber starts at 1
                            if (day.dayNumber === 1 || completedDays.includes(prevDayId)) {
                                status = 'active';
                            }
                        }

                        return (
                            <DayTile 
                                key={day.uniqueId} 
                                day={day} 
                                status={status}
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
  // فتح أول مرحلة تلقائياً أو المرحلة التي فيها آخر تقدم
  const [expandedId, setExpandedId] = useState(data[0]?.id || 1);

  if (!data || data.length === 0) return <div className="p-10 text-center text-gray-500">Loading Mainframe...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-[#8a0000] pl-3">
                Mission Timeline
            </h2>
            <span className="text-xs font-mono text-gray-500">GOTHAM_ARCHIVE_V3</span>
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
