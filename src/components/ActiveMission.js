import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ExternalLink, CheckCircle, Clock, Target, 
  List, BookOpen, PlayCircle, FileText, ShieldAlert, RotateCcw, Plus, AlertCircle, Bot, Swords, X 
} from 'lucide-react';

export default function ActiveMission({ day, isCompleted, onBack, onComplete, onToggleComplete }) {
  const [showWarRoom, setShowWarRoom] = useState(false);

  const getResourceIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('video') || t.includes('youtube')) return <PlayCircle size={18} />;
    if (t.includes('book') || t.includes('pdf')) return <BookOpen size={18} />;
    return <FileText size={18} />;
  };

  // --- Feature 2: Oracle Aid ---
  const handleSummonOracle = () => {
    const prompt = `Act as a Senior Software Engineer. I am a student studying "${day.lessonTitle}". Explain the core concept simply using a real-world analogy. Then, provide a code example that demonstrates a common mistake beginners make with this topic, and explain how to fix it.`;
    navigator.clipboard.writeText(prompt);
    alert("🔮 Oracle Prompt Copied to Clipboard!\nPaste it into ChatGPT/Claude.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto pb-40 px-4"
    >
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-sm font-mono uppercase tracking-widest">Return</span>
        </button>
        <div className="flex gap-2">
            <button onClick={handleSummonOracle} className="flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/50 text-purple-400 rounded text-xs uppercase font-bold hover:bg-purple-900/40">
                <Bot size={14} /> Oracle Aid
            </button>
            {day.isBoss && (
                <button onClick={() => setShowWarRoom(!showWarRoom)} className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-500/50 text-red-400 rounded text-xs uppercase font-bold hover:bg-red-900/40">
                    <Swords size={14} /> War Room
                </button>
            )}
        </div>
      </div>

      {/* --- Feature 5: WAR ROOM (Boss Checklist) --- */}
      {showWarRoom && (
          <div className="mb-8 bg-[#1a0505] border border-red-800 rounded-xl p-6 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={18} /> Tactical Breakdown
                  </h3>
                  <button onClick={() => setShowWarRoom(false)}><X size={18} className="text-gray-500" /></button>
              </div>
              <div className="space-y-3">
                  {["Read requirements 3 times", "Handle Edge Cases (Null/Empty)", "Check Memory Leaks (Valgrind)", "Betty/Linter Check", "Create Test Cases"].map((task, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-black/50 rounded border border-red-900/30 cursor-pointer hover:border-red-500 transition-colors">
                          <input type="checkbox" className="accent-red-600 w-4 h-4" />
                          <span className="text-gray-300 text-sm font-mono">{task}</span>
                      </label>
                  ))}
              </div>
          </div>
      )}

      {/* Main Content (Standard Display) */}
      <div className="space-y-6">
        {/* 1. Title */}
        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                {day.isBoss ? <ShieldAlert size={80} className="text-red-600"/> : <Target size={80} className="text-white"/>}
            </div>
            <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-2">Target</h4>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight relative z-10">
                {day.lessonTitle}
            </h1>
        </div>

        {/* 2. Subtasks */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <List size={16} /> Objectives
            </h4>
            <ul className="space-y-3">
                {(day.tasks || day.topics || []).length > 0 ? (
                    (day.tasks || day.topics).map((item, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                            <span className="flex-shrink-0 w-5 h-5 rounded border border-[#333] flex items-center justify-center text-[10px] text-gray-500 font-mono mt-0.5">{i + 1}</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                        </li>
                    ))
                ) : <li className="text-gray-600 text-sm italic">No specific subtasks found.</li>}
            </ul>
        </div>

        {/* 3. Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col">
                <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ExternalLink size={16} /> Supply Drop
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
                    ) : <div className="text-gray-600 text-xs italic">No primary sources.</div>}
                </div>
            </div>

            {/* Optional */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col">
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus size={16} /> Optional Intel
                </h4>
                <div className="space-y-2 flex-1">
                    {day.optionalResources && day.optionalResources.length > 0 ? (
                        day.optionalResources.map((res, i) => (
                            <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-transparent border border-[#333] border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-all group">
                                <div className="text-gray-600 group-hover:text-blue-400">{getResourceIcon(res.type)}</div>
                                <div className="text-sm font-medium text-gray-400 group-hover:text-blue-200 truncate">{res.title}</div>
                            </a>
                        ))
                    ) : <div className="text-gray-700 text-xs italic">No extras needed.</div>}
                </div>
            </div>
        </div>

        {/* 4. Notes & Duration */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
             <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#8a0000] text-xs font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle size={16}/> Briefing</h4>
                <div className="flex items-center gap-1 text-[#8a0000] font-mono text-xs font-bold"><Clock size={14}/> {day.hoursPlanned || 4}H</div>
             </div>
             <p className="text-sm text-gray-300 leading-relaxed font-light">
                 {day.objective || day.notes || "Execute standard protocols."}
             </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-50 flex justify-center">
        <div className="w-full max-w-2xl">
            {!isCompleted ? (
                <button onClick={onComplete} className="w-full bg-[#8a0000] hover:bg-[#a30000] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(138,0,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3">
                    <CheckCircle size={20} /> MISSION COMPLETE
                </button>
            ) : (
                <div className="flex gap-3">
                     <div className="flex-1 bg-green-900/20 border border-green-900/50 text-green-500 font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle size={20} /> COMPLETE
                    </div>
                    <button onClick={onToggleComplete} className="bg-[#111] hover:bg-red-900/10 border border-[#333] hover:border-red-800 text-gray-500 hover:text-red-500 px-8 rounded-xl transition-all flex items-center justify-center gap-2 group">
                        <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
                    </button>
                </div>
            )}
        </div>
      </div>

    </motion.div>
  );
                    } 
