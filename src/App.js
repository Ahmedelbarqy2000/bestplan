import React, { useState, useEffect } from 'react';
import { Shield, Zap, Award, ExternalLink, CheckCircle, RotateCw, Sword } from 'lucide-react';
import confetti from 'canvas-confetti';
import planData from './plan.json';

const App = () => {
  // --- تحميل البيانات ---
  const [save, setSave] = useState(() => {
    const saved = localStorage.getItem('codesaga_rpg_v3');
    return saved ? JSON.parse(saved) : { count: 0, xp: 0, streak: 0, lastLogin: null };
  });

  const [isFlipped, setIsFlipped] = useState(false); // عشان القلبة

  // --- حسابات اللعبة ---
  const level = Math.floor(save.xp / 1000) + 1;
  const currentIdx = save.count;
  const task = planData.days[currentIdx];
  const isFinished = currentIdx >= planData.days.length;

  useEffect(() => {
    localStorage.setItem('codesaga_rpg_v3', JSON.stringify(save));
  }, [save]);

  // --- الأكشن ---
  const handleComplete = (e) => {
    e.stopPropagation(); // عشان الكارت ميتلبش لما تدوس
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    
    const today = new Date().toDateString();
    let newStreak = (save.lastLogin === new Date(Date.now() - 864e5).toDateString()) ? save.streak + 1 : 1;
    if (save.lastLogin === today) newStreak = save.streak;

    setSave(prev => ({
      count: prev.count + 1,
      xp: prev.xp + 200,
      streak: newStreak,
      lastLogin: today
    }));
    setIsFlipped(false); // نرجع الكارت لوشه للمهمة الجديدة
    window.scrollTo(0,0);
  };

  if (isFinished) return <div className="h-screen flex items-center justify-center text-white text-3xl font-bold">ختمت اللعبة يا بطل! 🏆</div>;
  if (!task) return <div className="text-white text-center mt-20">جاري تحميل البيانات...</div>;

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* 1. الهيدر (HUD) */}
      <div className="flex justify-between items-center mb-8 bg-black/40 p-4 rounded-2xl border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-purple-900/50 p-2 rounded-lg border border-purple-500/50">
            <Shield className="text-purple-400 w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Hunter Level</div>
            <div className="text-xl font-bold text-white">{level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest">Experience</div>
          <div className="text-xl font-bold text-yellow-400 flex items-center justify-end gap-1">
            {save.xp} <Zap size={16} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* 2. منطقة الكارت القلاب (The Arena) */}
      <div className="flex-1 flex items-center justify-center perspective-1000 my-4">
        <div 
          className={`relative w-full max-w-md h-[600px] transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          
          {/* --- وش الكارت (Front) --- */}
          <div className="absolute w-full h-full backface-hidden bg-[#121212] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden flex flex-col neon-border">
            {/* صورة/لون المرحلة */}
            <div className="h-1/2 bg-gradient-to-br from-purple-900 to-black flex items-center justify-center relative p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="text-center z-10 animate-float">
                <Sword className="w-20 h-20 text-purple-400 mx-auto mb-4 opacity-80" />
                <span className="px-3 py-1 bg-black/50 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
                  {task.phaseName}
                </span>
              </div>
            </div>
            
            {/* تفاصيل سريعة */}
            <div className="h-1/2 p-8 flex flex-col justify-between relative bg-[#0a0a0a]">
               <div>
                 <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">مهمة اليوم #{currentIdx + 1}</h2>
                 <h1 className="text-3xl font-bold text-white leading-tight">{task.lessonTitle}</h1>
               </div>
               
               <div className="w-full bg-gray-800 h-12 rounded-xl flex items-center justify-center gap-2 text-gray-300 group hover:bg-gray-700 transition-colors">
                 <RotateCw size={18} className="animate-spin-slow" />
                 <span className="font-bold">اضغط لقلب الكارت وبدء المهمة</span>
               </div>
            </div>
          </div>

          {/* --- ظهر الكارت (Back) --- */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#0f0f0f] rounded-[2rem] border border-purple-500/30 shadow-2xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">تفاصيل المهمة</h3>
              {task.resourceURL && (
                <a 
                  href={task.resourceURL} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors"
                >
                  <ExternalLink size={20} />
                </a>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {task.tasks.map((step, i) => (
                <div key={i} className="flex gap-3 p-3 bg-[#18181b] rounded-xl border border-gray-800">
                  <div className="min-w-[24px] h-6 flex items-center justify-center bg-purple-600 rounded-full text-xs font-bold text-white mt-1">
                    {i + 1}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed" style={{direction: 'rtl'}}>{step}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={handleComplete}
              className="mt-6 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transform transition active:scale-95"
            >
              <CheckCircle size={20} />
              <span>إتمام والحصول على المكافأة</span>
            </button>
          </div>

        </div>
      </div>
      
      {/* 3. الفوتر (Streak) */}
      <div className="text-center text-gray-500 text-sm mt-4">
        Streak الحالي: <span className="text-orange-500 font-bold">{save.streak} أيام</span> 🔥
      </div>
    </div>
  );
}

export default App;
