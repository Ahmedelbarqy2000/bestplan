import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Info, Calendar, Award, Database } from 'lucide-react';
import planData from './data'; // استيراد البيانات

const App = () => {
  // --- STATE MANAGEMENT (نظام الحفظ) ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_v1');
    return saved ? JSON.parse(saved) : { completed: [], xp: 0, streak: 0, lastLogin: null };
  });

  const [view, setView] = useState('dashboard'); // dashboard | player
  const [activeEpisode, setActiveEpisode] = useState(null);

  // حساب التاريخ الحالي للعرض
  const todayStr = new Date().toISOString().split('T')[0];
  
  // البحث عن حلقة اليوم أو أول حلقة غير مكتملة
  const heroEpisode = planData.find(ep => ep.date === todayStr) || 
                      planData.find(ep => !progress.completed.includes(ep.date)) || 
                      planData[0];

  // تجميع المواسم (Phases)
  const seasons = [...new Set(planData.map(item => item.phaseId))];

  // --- ACTIONS ---

  const handleComplete = (date, hours) => {
    if (progress.completed.includes(date)) return;

    const newProgress = {
      ...progress,
      completed: [...progress.completed, date],
      xp: progress.xp + (hours * 100), // كل ساعة تساوي 100 نقطة خبرة
    };
    
    // Streak Logic
    if (newProgress.lastLogin !== todayStr) {
        newProgress.streak += 1;
        newProgress.lastLogin = todayStr;
    }

    setProgress(newProgress);
    localStorage.setItem('codesaga_save_v1', JSON.stringify(newProgress));
    
    // مؤثر صوتي بسيط عند الإنجاز (اختياري)
    // new Audio('/success.mp3').play().catch(e => {}); 
  };

  const exportSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "codesaga_save.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- RENDER HELPERS ---

  const getProgressPercent = () => {
    return Math.round((progress.completed.length / planData.length) * 100);
  };

  // --- VIEWS ---

  if (view === 'player' && activeEpisode) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col">
        <button onClick={() => setView('dashboard')} className="text-gray-400 mb-4 text-right">✕ إغلاق</button>
        
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm text-red-500 font-bold tracking-widest uppercase mb-2">
            الموسم {activeEpisode.phaseId}: {activeEpisode.phaseName}
          </h2>
          <h1 className="text-3xl font-extrabold mb-4">{activeEpisode.lessonTitle}</h1>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-6">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Info size={18} /> الهدف اليومي
            </h3>
            <p className="text-gray-300 leading-relaxed">{activeEpisode.dayGoal}</p>
          </div>

          <div className="space-y-4">
             {activeEpisode.tasks.map((task, idx) => (
               <div key={idx} className="flex gap-3 bg-gray-800 p-3 rounded hover:bg-gray-700 transition">
                 <input type="checkbox" className="w-6 h-6 accent-red-600 rounded cursor-pointer" />
                 <span className="text-sm text-gray-200">{task}</span>
               </div>
             ))}
          </div>

          <a 
            href={activeEpisode.resourceURL} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full text-center bg-white text-black font-bold py-4 rounded-lg mt-8 hover:bg-gray-200 transition"
          >
            🚀 الذهاب للمصدر التعليمي
          </a>
          
          {activeEpisode.hoursPlanned > 0 && (
              <button 
              onClick={() => {
                  handleComplete(activeEpisode.date, activeEpisode.hoursPlanned);
                  setView('dashboard');
              }}
              className={`block w-full text-center font-bold py-4 rounded-lg mt-4 transition border-2 
                  ${progress.completed.includes(activeEpisode.date) 
                      ? 'border-green-500 text-green-500' 
                      : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'}`}
              >
              {progress.completed.includes(activeEpisode.date) ? '✔ تم إكمال الحلقة' : 'إنهاء الحلقة والحصول على XP'}
              </button>
          )}

           <div className="mt-8 text-xs text-gray-500 text-center border-t border-gray-800 pt-4">
             {activeEpisode.stopPoint && <p className="text-yellow-500 mb-2">🛑 {activeEpisode.stopPoint}</p>}
           </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#141414] text-white pb-10">
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-gradient-to-b from-black to-transparent p-4 flex justify-between items-center">
        <h1 className="text-red-600 text-2xl font-black tracking-tighter">CODESAGA</h1>
        <div className="flex gap-4 text-xs font-bold">
           <span className="flex items-center gap-1">🔥 {progress.streak} يوم</span>
           <span className="flex items-center gap-1">💎 {progress.xp} XP</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative h-[65vh] flex flex-col justify-end p-6 bg-gradient-to-t from-[#141414] via-transparent to-gray-900/20">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 -z-10"></div>
         
         <div className="z-10 mb-8">
            <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider mb-2 inline-block">
                متابعة التعليم
            </span>
            <h1 className="text-4xl font-extrabold mb-2 leading-tight">{heroEpisode.lessonTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-green-400 font-bold mb-4">
                <span>{Math.round(progress.completed.length / planData.length * 100)}% Match</span>
                <span className="text-gray-400">{heroEpisode.date}</span>
                <span className="border border-gray-600 px-1 text-[10px] text-gray-400">HD</span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3 mb-6">{heroEpisode.dayGoal}</p>
            
            <div className="flex gap-3">
                <button 
                  onClick={() => { setActiveEpisode(heroEpisode); setView('player'); }}
                  className="bg-white text-black flex-1 py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-opacity-90"
                >
                    <Play fill="black" size={20} /> تشغيل
                </button>
                <button 
                   onClick={exportSave}
                   className="bg-gray-600/70 text-white flex-1 py-2 rounded font-bold flex items-center justify-center gap-2 hover:bg-gray-600"
                >
                    <Database size={20} /> نسخ احتياطي
                </button>
            </div>
         </div>
      </div>

      {/* SEASONS LIST */}
      <div className="pl-4 -mt-6 relative z-20 space-y-8">
        
        {/* Progress Bar */}
        <div className="pr-4 mb-6">
            <h3 className="text-white text-sm font-bold mb-2">المسار الكلي</h3>
            <div className="h-1 w-full bg-gray-700 rounded overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${getProgressPercent()}%` }}></div>
            </div>
        </div>

        {seasons.map(phaseId => {
            const phaseEpisodes = planData.filter(e => e.phaseId === phaseId);
            if (phaseEpisodes.length === 0) return null;
            
            return (
                <div key={phaseId}>
                    <h3 className="text-white text-md font-bold mb-3 flex items-center gap-2">
                        الموسم {phaseId} <span className="text-gray-500 text-xs font-normal">{phaseEpisodes[0].phaseName}</span>
                    </h3>
                    <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                        {phaseEpisodes.map((ep, idx) => {
                             const isCompleted = progress.completed.includes(ep.date);
                             const isRest = ep.hoursPlanned === 0;

                             return (
                                <div 
                                    key={idx}
                                    onClick={() => { setActiveEpisode(ep); setView('player'); }}
                                    className={`min-w-[140px] h-[80px] rounded-md relative cursor-pointer overflow-hidden group transition-transform hover:scale-105
                                        ${isRest ? 'bg-gray-800 border-l-4 border-yellow-500' : 'bg-gray-800'}
                                    `}
                                >
                                    {/* Thumbnail Placeholder */}
                                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent p-2 text-center
                                        ${isCompleted ? 'opacity-40' : 'opacity-100'}
                                    `}>
                                        <span className="text-xs font-bold">{ep.lessonTitle.substring(0, 30)}...</span>
                                    </div>
                                    
                                    {/* Progress Indicator for Episode */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        {isCompleted && <div className="h-full bg-red-600 w-full"></div>}
                                    </div>
                                    
                                    {/* Play Icon on Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                                        <div className="bg-white/20 rounded-full p-2 border border-white">
                                            <Play fill="white" size={12} />
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            )
        })}
      </div>
      
      <div className="text-center text-gray-600 text-xs py-8 mt-4">
        CodeSaga v1.0 • Personal Use Only
      </div>
    </div>
  );
};

export default App;
