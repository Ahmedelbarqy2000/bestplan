import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ExternalLink, CheckCircle, Clock, Target, 
  List, BookOpen, PlayCircle, FileText, ShieldAlert, RotateCcw, Plus, AlertCircle 
} from 'lucide-react';

export default function ActiveMission({ day, isCompleted, onBack, onComplete, onToggleComplete }) {
  
  // Helper: Icon selector based on resource type
  const getResourceIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('video') || t.includes('youtube')) return <PlayCircle size={18} />;
    if (t.includes('book') || t.includes('pdf')) return <BookOpen size={18} />;
    return <FileText size={18} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto pb-40 px-4"
    >
      
      {/* --- HEADER: Navigation & Status --- */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> <span className="text-sm font-mono uppercase tracking-widest">Return to Map</span>
        </button>
        <div className="text-[#8a0000] font-mono text-xs uppercase tracking-widest border border-[#8a0000]/30 px-3 py-1 rounded">
            Phase {String(day.phaseId).padStart(2, '0')}
        </div>
      </div>

      {/* --- THE 6-POINT SYSTEM DISPLAY --- */}
      <div className="space-y-6">

        {/* 1. MAIN TOPIC (From Plan) */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                {day.isBoss ? <ShieldAlert size={80} className="text-red-600"/> : <Target size={80} className="text-white"/>}
            </div>
            <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-2">1. Main Topic</h4>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight relative z-10">
                {day.lessonTitle}
            </h1>
        </div>

        {/* 2. SUBTASKS / TOPICS (From Plan) */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <List size={16} /> 2. Subtasks & Requirements
            </h4>
            <ul className="space-y-3">
                {/* Accepts 'tasks' OR 'topics' key from your JSON */}
                {(day.tasks || day.topics || []).length > 0 ? (
                    (day.tasks || day.topics).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                            <span className="flex-shrink-0 w-5 h-5 rounded border border-[#333] flex items-center justify-center text-[10px] text-gray-500 font-mono mt-0.5 group-hover:border-[#8a0000] group-hover:text-[#8a0000] transition-colors">
                                {i + 1}
                            </span>
                            <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                        </li>
                    ))
                ) : (
                    <li className="text-gray-600 text-sm italic">No detailed tasks listed in plan file.</li>
                )}
            </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3. PRIMARY RESOURCES (From Plan) */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col">
                <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ExternalLink size={16} /> 3. Primary Resources
                </h4>
                <div className="space-y-2 flex-1">
                    {day.resources && day.resources.length > 0 ? (
                        day.resources.map((res, i) => (
                            <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-[#161616] border border-[#333] rounded-lg hover:border-white hover:bg-[#222] transition-all group">
                                <div className="text-gray-500 group-hover:text-white">{getResourceIcon(res.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-500 uppercase font-mono">{res.type || 'Source'}</div>
                                    <div className="text-sm font-medium text-gray-200 truncate">{res.title}</div>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="p-4 border border-dashed border-[#333] rounded text-center text-gray-600 text-xs">
                            No primary sources found in plan.
                        </div>
                    )}
                </div>
            </div>

            {/* 4. OPTIONAL RESOURCES (The Extras) */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col relative overflow-hidden">
                {/* Subtle Green/Blue tint for optional */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-900/10 blur-2xl rounded-full pointer-events-none"></div>
                
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus size={16} /> 4. Optional Extra Resources
                </h4>
                <div className="space-y-2 flex-1">
                    {day.optionalResources && day.optionalResources.length > 0 ? (
                        day.optionalResources.map((res, i) => (
                            <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-transparent border border-[#333] border-dashed rounded-lg hover:border-blue-500/50 hover:bg-blue-900/5 transition-all group opacity-75 hover:opacity-100">
                                <div className="text-gray-600 group-hover:text-blue-400">{getResourceIcon(res.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-400 group-hover:text-blue-200 truncate">{res.title}</div>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-700 text-xs italic">
                            No optional materials needed.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 5. DURATION & 6. NOTES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 5. Estimated Duration */}
            <div className="col-span-1 bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock size={16} /> 5. Duration
                </h4>
                <span className="text-4xl font-black text-white font-mono">{day.hoursPlanned || 4}H</span>
                <span className="text-xs text-gray-500 mt-1">Estimated Study Time</span>
            </div>

            {/* 6. Notes / Prerequisites */}
            <div className="col-span-1 md:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
                <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle size={16} /> 6. Important Notes / Prerequisites
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                    {day.objective || day.notes || "Follow the plan exactly as written. Ensure previous day's tasks are complete before proceeding."}
                </p>
            </div>
        </div>

      </div>

      {/* --- FOOTER: ACTION BAR (Completed & Undo) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-50 flex justify-center">
        <div className="w-full max-w-2xl">
            {!isCompleted ? (
                <button 
                    onClick={onComplete}
                    className="w-full bg-[#8a0000] hover:bg-[#a30000] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(138,0,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 border border-transparent hover:border-red-500"
                >
                    <CheckCircle size={20} /> MARK DAY AS COMPLETE
                </button>
            ) : (
                <div className="flex gap-3 animate-in slide-in-from-bottom-2">
                     <div className="flex-1 bg-green-900/20 border border-green-900/50 text-green-500 font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-default shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                        <CheckCircle size={20} /> COMPLETED
                    </div>
                    {/* Explicit Day Undo Button */}
                    <button 
                        onClick={onToggleComplete}
                        className="bg-[#111] hover:bg-red-900/10 border border-[#333] hover:border-red-800 text-gray-500 hover:text-red-500 px-8 rounded-xl transition-all flex items-center justify-center gap-2 group"
                        title="Undo completion for this day"
                    >
                        <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
                    </button>
                </div>
            )}
        </div>
      </div>

    </motion.div>
  );
}
