import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock, BookOpen, Clock, AlertTriangle, Terminal, ChevronRight, X } from 'lucide-react';

export default function SideTracks({ addons, organizedData, completedDays }) {
  const [selectedModule, setSelectedModule] = useState(null);

  // Helper: Check if a main phase is complete
  const isPhaseComplete = (phaseId) => {
    const phase = organizedData.find(p => p.id === phaseId);
    if (!phase) return false;
    // Check if every day in this phase is in the completedDays array
    return phase.days.every(d => completedDays.includes(d.uniqueId));
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Shield size={32} className="text-blue-500" /> 
          Special <span className="text-blue-500">Ops</span>
        </h1>
        <p className="text-gray-400 text-xs font-mono mt-2 max-w-2xl">
          CLASSIFIED ADD-ONS: These modules are strictly optional advanced systems training (Holberton-style). 
          They do not affect your main timeline. Engage at your own risk.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {addons.modules.map((mod) => {
          const locked = !isPhaseComplete(mod.recommended_start_after_phase);
          
          return (
            <motion.div 
              key={mod.id}
              whileHover={{ scale: 1.02 }}
              className={`
                relative border rounded-xl p-6 flex flex-col justify-between overflow-hidden group transition-all
                ${locked 
                  ? 'bg-[#050505] border-[#222] opacity-60 grayscale' 
                  : 'bg-[#0a0a0a] border-blue-900/30 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                }
              `}
              onClick={() => !locked && setSelectedModule(mod)}
            >
              {/* Background Tech Grid */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${locked ? 'border-gray-700 text-gray-700' : 'border-blue-500/30 text-blue-400 bg-blue-500/10'}`}>
                    {mod.optional ? 'Optional' : 'Recommended'}
                  </span>
                  {locked ? <Lock size={16} className="text-gray-600" /> : <Unlock size={16} className="text-blue-500" />}
                </div>

                <h3 className={`text-lg font-bold leading-tight mb-2 ${locked ? 'text-gray-600' : 'text-gray-200 group-hover:text-white'}`}>
                  {mod.title}
                </h3>
                
                <p className="text-xs text-gray-500 line-clamp-3 mb-4 font-mono">
                  {mod.summary}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-[#222] flex items-center justify-between text-xs text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {mod.estimated_hours}H
                </span>
                {locked ? (
                  <span className="flex items-center gap-1 text-red-900">
                    REQ: PHASE {mod.recommended_start_after_phase}
                  </span>
                ) : (
                  <button className="text-blue-500 font-bold group-hover:underline flex items-center gap-1">
                    ACCESS FILES <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Module Briefing Modal (Overlay) */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-blue-900 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#333] p-6 flex justify-between items-center z-10">
                 <div>
                    <div className="text-blue-500 text-xs font-mono uppercase tracking-widest mb-1">
                        Special Operation #{selectedModule.id}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedModule.title}</h2>
                 </div>
                 <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-[#222] rounded-full text-gray-400 hover:text-white">
                    <X size={24} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-8">
                  
                  {/* Summary */}
                  <div className="text-gray-300 leading-relaxed text-sm border-l-2 border-blue-500 pl-4">
                      {selectedModule.summary}
                  </div>

                  {/* Objectives */}
                  <div>
                      <h4 className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Terminal size={14} /> Mission Objectives
                      </h4>
                      <ul className="space-y-2">
                          {selectedModule.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                  <span className="text-blue-900 font-mono">0{i+1}</span>
                                  <span>{obj}</span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Resources */}
                  <div>
                      <h4 className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BookOpen size={14} /> Classified Intel (Resources)
                      </h4>
                      <div className="grid gap-2">
                          {selectedModule.resources.map((res, i) => (
                              <a 
                                key={i} 
                                href={res.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-[#111] border border-[#222] rounded hover:border-blue-500/50 hover:bg-blue-900/10 transition-colors group"
                              >
                                  <div className="bg-blue-900/20 p-2 rounded text-blue-500 group-hover:text-white">
                                      <BookOpen size={16} />
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-gray-300 group-hover:text-blue-300">{res.name}</div>
                                      <div className="text-[10px] text-gray-600 font-mono truncate max-w-xs">{res.url}</div>
                                  </div>
                              </a>
                          ))}
                      </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex items-start gap-3">
                      <AlertTriangle size={18} className="text-blue-500 mt-0.5" />
                      <div>
                          <h5 className="text-blue-400 text-xs font-bold uppercase mb-1">Advisory</h5>
                          <p className="text-[11px] text-gray-500 leading-tight">
                              This module is estimated to take <strong>{selectedModule.estimated_hours} hours</strong>. 
                              It is not tracked in your main Hunter License progress. 
                              Complete it at your own pace.
                          </p>
                      </div>
                  </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
    }
