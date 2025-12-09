import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, CheckCircle, Play, ShieldAlert } from 'lucide-react';

const DayTile = ({ day, status, index, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: status !== 'locked' ? 1.03 : 1 }}
      onClick={() => status !== 'locked' && onSelect(day)}
      className={`
        relative aspect-[16/9] rounded-md p-3 flex flex-col justify-between border cursor-pointer transition-colors overflow-hidden group
        ${status === 'locked' ? 'bg-[#0f0f0f] border-[#1f1f1f] opacity-50 cursor-not-allowed' : ''}
        ${status === 'completed' ? 'bg-[#0f0f0f] border-green-900/40 hover:bg-[#1a1a1a]' : ''}
        ${status === 'active' ? 'bg-[#1a1a1a] border-[#8a0000] shadow-[0_0_10px_rgba(138,0,0,0.2)]' : ''}
        ${day.isBoss && status !== 'locked' ? 'border-red-600/60 border-dashed' : ''}
      `}
    >
      <div className="flex justify-between items-start z-10">
        <span className={`text-[10px] font-mono font-bold ${status === 'active' ? 'text-[#8a0000]' : 'text-gray-600'}`}>
           DAY {index + 1}
        </span>
        {status === 'locked' && <Lock size={14} className="text-gray-600" />}
        {status === 'completed' && <CheckCircle size={14} className="text-green-600" />}
        {status === 'active' && <Play size={14} className="text-[#8a0000] fill-[#8a0000]" />}
      </div>

      {day.isBoss && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <ShieldAlert size={40} className="text-red-500" />
          </div>
      )}

      <div className="z-10">
        <h4 className={`text-xs md:text-sm font-bold leading-snug ${status === 'locked' ? 'text-gray-600' : 'text-gray-300 group-hover:text-white'}`}>
            {day.lessonTitle}
        </h4>
      </div>
    </motion.div>
  );
};

const PhaseSection = ({ phase, days, completedDays, isExpanded, onToggle }) => {
  // حساب عدد المكتمل في هذه المرحلة
  const completedCount = days.filter(d => completedDays.includes(d.globalId)).length;
  const progress = Math.round((completedCount / days.length) * 100);

  return (
    <div className="border-b border-[#1f1f1f]">
      <button onClick={onToggle} className="w-full py-6 flex items-center justify-between group">
        <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold transition-colors ${isExpanded ? 'text-[#8a0000]' : 'text-gray-800 group-hover:text-gray-600'}`}>
                {String(phase.id).padStart(2, '0')}
            </div>
            <div className="text-left">
                <h3 className={`text-lg md:text-xl font-bold uppercase transition-colors ${isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {phase.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-20 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-[#8a0000]" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{progress}% DONE</span>
                </div>
            </div>
        </div>
        <ChevronDown className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#8a0000]' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-6"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {days.map((day, i) => {
                        let status = 'locked';
                        if (completedDays.includes(day.globalId)) status = 'completed';
                        // إذا كان اليوم السابق مكتمل، أو هذا هو اليوم الأول مطلقاً، فهذا اليوم نشط
                        else if (day.globalId === 0 || completedDays.includes(day.globalId - 1)) status = 'active';

                        return (
                            <DayTile 
                                key={day.globalId} 
                                day={day} 
                                index={i}
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
  const [expandedId, setExpandedId] = useState(data[0]?.id);

  return (
    <div className="max-w-6xl mx-auto pb-20">
       {data.map(group => (
           <PhaseSection 
             key={group.id}
             phase={group}
             days={group.days}
             completedDays={completedDays}
             isExpanded={expandedId === group.id}
             onToggle={() => setExpandedId(expandedId === group.id ? null : group.id)}
             onSelectDay={onSelectDay}
           />
       ))}
    </div>
  );
}
