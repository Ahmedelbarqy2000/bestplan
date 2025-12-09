import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Target, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  ShieldAlert, 
  RotateCcw 
} from 'lucide-react';

export default function ActiveMission({ day, isCompleted, onBack, onComplete, onToggleComplete }) {
  
  // دالة مساعدة لتحديد نوع المصدر (فيديو، مقال، الخ)
  const getResourceIcon = (type) => {
    if (type?.toLowerCase().includes('video') || type?.toLowerCase().includes('youtube')) return <PlayCircle size={18} />;
    if (type?.toLowerCase().includes('article') || type?.toLowerCase().includes('doc')) return <FileText size={18} />;
    return <ExternalLink size={18} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto pb-24"
    >
      {/* --- Top Navigation --- */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 rounded-full hover:bg-[#1a1a1a] border border-transparent hover:border-[#333] transition-all group"
        >
          <ArrowLeft className="text-gray-400 group-hover:text-white" />
        </button>
        <div>
          <div className="text-[10px] text-[#8a0000] font-mono tracking-widest uppercase">
            Sector {String(day.phaseId).padStart(2, '0')} • {day.phaseName}
          </div>
          <h2 className="text-gray-400 text-sm font-mono">
            MISSION ID: {day.uniqueId.toUpperCase()}
          </h2>
        </div>
      </div>

      {/* --- Header Section (Title & Status) --- */}
      <div className="relative mb-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-10 overflow-hidden">
        {/* Background Decors */}
        <div className="absolute top-0 right-0 p-4 opacity-20">
            {isCompleted ? <CheckCircle size={100} className="text-green-800" /> : <Target size={100} className="text-red-900" />}
        </div>
        
        {day.isBoss && (
          <div className="inline-flex items-center gap-2 bg-red-900/20 text-red-500 border border-red-900/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert size={14} /> Boss Level / Capstone
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4 relative z-10">
          {day.lessonTitle}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-mono relative z-10">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#8a0000]" />
            <span>EST. TIME: {day.hoursPlanned} HOURS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span>STATUS: {isCompleted ? 'MISSION ACCOMPLISHED' : 'ACTIVE ENGAGEMENT'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Intel & Protocol --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Objective */}
          <section>
            <h3 className="text-[#8a0000] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <Target size={14} /> Mission Objective
            </h3>
            <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-gray-300 leading-relaxed font-light">
              {day.objective || "Complete the assigned tasks to advance your hunter rank. Focus on understanding the core concepts."}
            </div>
          </section>

          {/* Topics */}
          {day.topics && day.topics.length > 0 && (
            <section>
              <h3 className="text-[#8a0000] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <BookOpen size={14} /> Protocol Details
              </h3>
              <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                {day.topics.map((topic, idx) => (
                  <div key={idx} className="p-4 border-b border-[#222] last:border-0 flex items-start gap-3 hover:bg-[#161616] transition-colors">
                    <span className="text-[#8a0000] font-mono text-xs pt-1">0{idx + 1}</span>
                    <span className="text-gray-300 text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* --- Right Column: Supply Drop (Resources) --- */}
        <div className="lg:col-span-1">
          <section className="sticky top-6">
            <h3 className="text-[#8a0000] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <ExternalLink size={14} /> Supply Drop
            </h3>
            
            <div className="space-y-3">
              {day.resources && day.resources.length > 0 ? (
                day.resources.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-[#111] border border-[#222] rounded-lg hover:border-[#8a0000] hover:bg-[#1a1a1a] transition-all group"
                  >
                    <div className="text-gray-500 group-hover:text-[#8a0000] transition-colors">
                      {getResourceIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase font-mono mb-0.5">{res.type || 'Resource'}</div>
                      <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{res.title}</div>
                    </div>
                    <ExternalLink size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))
              ) : (
                <div className="p-6 border border-dashed border-[#333] rounded-lg text-center">
                  <span className="text-gray-600 text-xs font-mono">NO INTEL PROVIDED</span>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>

      {/* --- Bottom Action Bar (Sticky) --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md">
            {!isCompleted ? (
                <button 
                    onClick={onComplete}
                    className="w-full bg-[#8a0000] hover:bg-[#a30000] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(138,0,0,0.4)] hover:shadow-[0_0_40px_rgba(138,0,0,0.6)] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Target size={20} /> Complete Mission
                </button>
            ) : (
                <div className="flex gap-2">
                    <div className="flex-1 bg-green-900/20 border border-green-900/50 text-green-500 font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle size={20} /> Mission Complete
                    </div>
                    {/* زر التراجع الجديد */}
                    <button 
                        onClick={onToggleComplete}
                        className="bg-[#111] hover:bg-[#222] border border-[#333] text-gray-400 hover:text-white px-6 rounded-xl transition-colors flex items-center justify-center"
                        title="Revoke Completion (Undo)"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            )}
        </div>
      </div>

    </motion.div>
  );
}
