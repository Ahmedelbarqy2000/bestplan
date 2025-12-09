import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Terminal, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActiveMission({ day, isCompleted, onBack, onComplete }) {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // هل هذا الدرس مسموح بإتمامه؟ (يجب أن يكون اليوم السابق منتهي أو هو اليوم الأول)
  // لكن للتبسيط، سنسمح بالتشيكر في كل الأحوال، لكن زر "Complete" يظهر فقط لو لم ينتهِ بعد.
  
  const runChecker = () => {
    setChecking(true);
    setCheckResult(null);
    setTimeout(() => {
        setChecking(false);
        setCheckResult('success');
        if (!isCompleted) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8a0000', '#ffffff']
            });
        }
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-right duration-500">
      
      {/* Top Bar */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        RETURN TO MAP
      </button>

      {/* Main Mission Card */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl relative">
         {isCompleted && (
             <div className="absolute top-0 right-0 bg-green-900/80 text-green-100 text-xs font-bold px-3 py-1 rounded-bl-xl z-20">
                 MISSION COMPLETED
             </div>
         )}
         
         <div className="p-6 md:p-10 relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-[#8a0000] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                    {day.phaseName}
                </span>
                <span className="text-gray-600 font-mono text-xs">DAY_{String(day.dayNumber).padStart(3, '0')}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {day.lessonTitle}
            </h1>

            {/* Resources Link */}
            <a 
                href={day.resourceURL} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#e5e5e5] text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors mb-8"
            >
                <ExternalLink size={16} />
                Open Learning Source
            </a>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Tasks Column */}
                <div className="lg:col-span-2">
                    <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-4 border-b border-[#333] pb-2">
                        Objective Protocol
                    </h3>
                    <ul className="space-y-4">
                        {day.tasks.map((task, i) => (
                            <li key={i} className="flex gap-4 group">
                                <div className={`min-w-[24px] h-[24px] rounded-full flex items-center justify-center text-xs font-mono border ${isCompleted ? 'bg-green-900/20 border-green-800 text-green-500' : 'bg-[#1a1a1a] border-[#333] text-gray-500'}`}>
                                    {i + 1}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                                    {task}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Checker Console Column */}
                <div className="lg:col-span-1">
                    <div className="bg-black border border-[#333] rounded-lg overflow-hidden font-mono shadow-lg">
                        <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#333] flex items-center gap-2">
                            <Terminal size={12} className="text-gray-500" />
                            <span className="text-[10px] text-gray-500">ALX_CHECKER_V2</span>
                        </div>
                        
                        <div className="p-4 min-h-[200px] flex flex-col justify-between">
                            <div className="text-xs text-gray-400 space-y-1">
                                <div>$ init_check...</div>
                                {checking && (
                                    <>
                                        <div className="text-yellow-600">Loading resources...</div>
                                        <div className="text-blue-600">Verifying logic...</div>
                                    </>
                                )}
                                {checkResult === 'success' && (
                                    <div className="text-green-500 font-bold mt-2">
                                        [SUCCESS] All requirements met.
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                {!isCompleted ? (
                                    <button 
                                        onClick={checkResult === 'success' ? onComplete : runChecker}
                                        disabled={checking}
                                        className={`w-full py-3 text-xs font-bold uppercase tracking-widest rounded transition-all
                                            ${checkResult === 'success' 
                                                ? 'bg-green-600 hover:bg-green-500 text-white' 
                                                : 'bg-[#8a0000] hover:bg-red-700 text-white'
                                            }
                                            ${checking ? 'opacity-50 cursor-wait' : ''}
                                        `}
                                    >
                                        {checking ? 'Running...' : checkResult === 'success' ? 'Confirm Completion' : 'Run Check'}
                                    </button>
                                ) : (
                                    <div className="w-full py-3 bg-[#111] border border-green-900 text-green-600 text-center text-xs font-bold uppercase rounded">
                                        Mission Already Clear
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
         </div>
      </div>
    </div>
  );
}
