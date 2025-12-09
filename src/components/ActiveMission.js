import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActiveMission({ day, onBack, onComplete }) {
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // null, 'success', 'fail'

  const runChecker = () => {
    setChecking(true);
    setCheckResult(null);

    // محاكاة عملية الفحص (3 ثواني)
    setTimeout(() => {
        setChecking(false);
        setCheckResult('success');
        // تشغيل الكونفيتي
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8a0000', '#ffffff', '#000000']
        });
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-right duration-500">
      {/* Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Operations
      </button>

      {/* Header */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 mb-6 relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#8a0000] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Mandatory</span>
                <span className="text-gray-500 font-mono text-xs">ID: {day.globalId}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{day.lessonTitle}</h1>
            <a 
                href={day.resourceURL} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#8a0000] hover:text-red-400 font-bold border-b border-[#8a0000] pb-0.5"
            >
                Access Resource Material <ExternalLink size={14} />
            </a>
         </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Tasks */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Mission Directives</h3>
                  <ul className="space-y-4">
                      {day.tasks.map((task, i) => (
                          <li key={i} className="flex gap-3 text-gray-300 text-sm leading-relaxed">
                              <div className="min-w-[20px] h-[20px] rounded-full bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-mono mt-0.5">
                                  {i + 1}
                              </div>
                              {task}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>

          {/* Right: The Checker */}
          <div className="lg:col-span-1">
              <div className="bg-[#0f0f0f] border border-[#333] rounded-xl overflow-hidden sticky top-6">
                  <div className="bg-[#1a1a1a] p-3 border-b border-[#333] flex items-center gap-2">
                      <Terminal size={16} className="text-gray-400" />
                      <span className="text-xs font-mono text-gray-400">Gotham_OS_Checker v2.4</span>
                  </div>
                  
                  <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                      {!checking && !checkResult && (
                          <div className="text-center">
                              <p className="text-gray-500 text-sm mb-4">Ready to validate mission parameters.</p>
                              <button 
                                onClick={runChecker}
                                className="w-full bg-[#8a0000] hover:bg-red-700 text-white font-bold py-3 px-4 rounded shadow-[0_0_15px_rgba(138,0,0,0.3)] transition-all"
                              >
                                RUN CHECKER
                              </button>
                          </div>
                      )}

                      {checking && (
                          <div className="font-mono text-sm space-y-2 w-full">
                              <div className="text-green-500 animate-pulse">> Connecting to mainframe...</div>
                              <div className="text-gray-400 delay-100">> Verifying logic gates...</div>
                              <div className="text-gray-400 delay-200">> Testing memory leaks...</div>
                              <div className="text-gray-400 delay-300">> Compiling...</div>
                          </div>
                      )}

                      {checkResult === 'success' && (
                          <div className="text-center w-full animate-in zoom-in duration-300">
                              <div className="flex justify-center mb-3">
                                  <CheckCircle2 size={48} className="text-green-500" />
                              </div>
                              <h3 className="text-white font-bold text-lg mb-1">Check Passed!</h3>
                              <p className="text-gray-500 text-xs mb-4">You have successfully completed this day.</p>
                              <button 
                                onClick={onComplete}
                                className="w-full border border-green-900 bg-green-900/20 text-green-500 py-2 rounded hover:bg-green-900/40 transition-colors uppercase font-mono text-xs tracking-widest"
                              >
                                Close & Mark Done
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
