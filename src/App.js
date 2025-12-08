import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Map, User, Lock, Zap, Sword, ExternalLink, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import planData from './plan.json';

// --- (1) إعدادات اللعبة والثوابت ---
const DIFFICULTY_WEIGHTS = { 1: 1.8, 2: 2.2, 3: 1.2, 4: 1.5, 5: 0.8, 6: 1.2, 7: 1.0, 8: 3.0, 9: 2.0, 10: 1.5, 11: 1.5 };

const RANKS = [
  { threshold: 0, title: "Zaban Candidate", desc: "المعرفة الحالية: تشغيل الكمبيوتر." },
  { threshold: 50, title: "Rookie", desc: "تقدر تكتب كود بسيط." },
  { threshold: 150, title: "Nen Student", desc: "تقدر تعمل Loops و Functions." },
  { threshold: 300, title: "Licensed Hunter", desc: "تقدر تعمل مشاريع صغيرة." },
  { threshold: 500, title: "1-Star Hunter", desc: "مبرمج شاطر (Junior)." },
  { threshold: 750, title: "2-Star Hunter", desc: "تنين مجنح (Mid-Level)." },
  { threshold: 900, title: "3-Star Hunter", desc: "أسطورة (Senior/Lead)." }
];

const SKILL_MAPPING = { 1: 'Logic', 2: 'System', 3: 'System', 4: 'System', 5: 'Scripting', 6: 'Backend', 7: 'Frontend', 8: 'Fullstack', 9: 'AI', 10: 'Special', 11: 'Career' };

// --- (2) دوال مساعدة آمنة ---
const safeCalculateDate = (completed, total) => {
  if (completed < 1) return "غير محدد";
  const velocity = completed / 1; // افتراض بسيط لليوم الأول
  const remaining = total - completed;
  const daysLeft = remaining / (velocity || 0.5);
  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return date.toLocaleDateString('ar-EG');
};

// --- (3) التطبيق الرئيسي ---
const App = () => {
  // حالة التحميل والأخطاء
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollRef = useRef(null);

  // تحميل البيانات المحفوظة مع حماية من الانهيار
  const [save, setSave] = useState(() => {
    try {
      const saved = localStorage.getItem('codesaga_v4_safe');
      // لو مفيش حفظ أو الحفظ بايظ، ابدأ من الصفر
      if (!saved) return { completedCount: 0, xp: 0, streak: 0, lastLogin: null };
      const parsed = JSON.parse(saved);
      // تأكد إن الأرقام سليمة
      return {
        completedCount: Number(parsed.completedCount) || 0,
        xp: Number(parsed.xp) || 0,
        streak: Number(parsed.streak) || 0,
        lastLogin: parsed.lastLogin
      };
    } catch (e) {
      console.error("Save file corrupted, resetting.", e);
      return { completedCount: 0, xp: 0, streak: 0, lastLogin: null };
    }
  });

  // التأكد من وجود بيانات الخطة قبل أي حاجة
  if (!planData || !planData.days || planData.days.length === 0) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">خطأ: ملف plan.json فارغ أو غير موجود!</div>;
  }

  // الحسابات المشتقة (محمية)
  const safeIndex = Math.min(save.completedCount, planData.days.length - 1);
  const currentTask = planData.days[safeIndex];
  const isFinished = save.completedCount >= planData.days.length;
  
  // حساب الرتبة
  const currentRank = [...RANKS].reverse().find(r => save.xp >= r.threshold * 10) || RANKS[0]; // تعديل بسيط للمعادلة
  
  // حساب المهارات للرسم البياني
  const getSkillData = () => {
    const skills = ['Logic', 'System', 'Backend', 'Frontend', 'AI', 'Scripting'];
    return skills.map(skill => {
      const total = planData.days.filter(d => SKILL_MAPPING[d.phaseId] === skill).length || 1;
      const done = planData.days.slice(0, save.completedCount).filter(d => SKILL_MAPPING[d.phaseId] === skill).length;
      return { subject: skill, A: Math.round((done / total) * 100), full: 100 };
    });
  };

  // حفظ تلقائي
  useEffect(() => {
    localStorage.setItem('codesaga_v4_safe', JSON.stringify(save));
  }, [save]);

  // سكرول للمهمة الحالية
  useEffect(() => {
    if (activeTab === 'map' && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeTab]);

  // دالة إتمام المهمة
  const handleComplete = () => {
    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#66fcf1', '#45a29e'] });
      
      const today = new Date().toDateString();
      let newStreak = save.streak;
      if (save.lastLogin !== today) {
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        newStreak = (save.lastLogin === yest.toDateString()) ? newStreak + 1 : 1;
      }

      setSave(prev => ({
        completedCount: prev.completedCount + 1,
        xp: prev.xp + 150, // نقاط ثابتة للسهولة
        streak: newStreak,
        lastLogin: today
      }));
      
      // إعادة الكارت للوجه الأول لو كان مفتوح
      setIsFlipped(false);
      window.scrollTo(0,0);
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ. حاول مرة أخرى.");
    }
  };

  // دالة تصفير البيانات (لحل المشاكل)
  const hardReset = () => {
    if(window.confirm("هل أنت متأكد؟ ستمسح كل تقدمك لتبدأ من جديد.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // واجهة الختام
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center text-center p-6 text-white">
        <h1 className="text-6xl mb-4">🏆</h1>
        <h2 className="text-3xl font-bold text-[#66fcf1] mb-2">أحسنت يا صياد!</h2>
        <p className="text-gray-400 mb-8">لقد أتممت المسار بالكامل.</p>
        <button onClick={hardReset} className="px-6 py-3 bg-red-900/50 text-red-200 rounded-lg border border-red-800">بدء رحلة جديدة</button>
      </div>
    );
  }

  // الواجهة الرئيسية
  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 pb-24 overflow-x-hidden font-sans select-none">
      
      {/* 1. Header (Stats) */}
      <header className="fixed top-0 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#1f2833] z-50 p-3 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#1f2833] border border-[#66fcf1] flex items-center justify-center text-[#66fcf1] font-bold">
               {Math.floor(save.xp/1000) + 1}
             </div>
             <div>
               <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rank</div>
               <div className="text-xs font-bold text-white truncate max-w-[100px]">{currentRank.title}</div>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase">XP</div>
                <div className="font-mono font-bold text-yellow-400">{save.xp}</div>
             </div>
             <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase">Streak</div>
                <div className="font-mono font-bold text-orange-500">{save.streak}🔥</div>
             </div>
          </div>
        </div>
      </header>

      {/* 2. Main Area */}
      <main className="pt-24 px-4 max-w-md mx-auto">
        
        {/* TAB: MAP (The Journey) */}
        {activeTab === 'map' && (
          <div className="space-y-8 animate-fade-in">
            {/* بطاقة المهمة الحالية */}
            <div className="bg-[#1f2833] rounded-2xl p-6 border-2 border-[#66fcf1] shadow-[0_0_20px_rgba(102,252,241,0.15)] relative">
              <div className="absolute -top-3 left-4 px-2 py-1 bg-[#0b0c10] text-[10px] uppercase font-bold text-gray-400 border border-gray-800 rounded">
                Current Mission
              </div>
              
              <div className="mb-4 mt-2">
                <h2 className="text-xl font-bold text-white leading-tight mb-2">{currentTask.lessonTitle}</h2>
                <span className="text-xs text-[#45a29e] bg-black/30 px-2 py-1 rounded border border-[#45a29e]/30">
                  {currentTask.phaseName}
                </span>
              </div>

              {/* أزرار الإجراءات */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {currentTask.resourceURL && (
                  <a 
                    href={currentTask.resourceURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#0b0c10] text-white py-3 rounded-xl border border-gray-700 font-bold text-sm"
                  >
                    <Play size={16} /> المصدر
                  </a>
                )}
                <button 
                  onClick={handleComplete}
                  className="flex items-center justify-center gap-2 bg-[#66fcf1] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#45a29e] transition-colors"
                >
                  <CheckCircle size={16} /> إنهاء
                </button>
              </div>
            </div>

            {/* الجدول الزمني (Timeline) */}
            <div className="relative border-l-2 border-[#1f2833] ml-4 pb-10">
              {planData.days.slice(Math.max(0, save.completedCount - 2), save.completedCount + 8).map((day, idx) => {
                 const realIndex = planData.days.indexOf(day);
                 const status = realIndex < save.completedCount ? 'done' : realIndex === save.completedCount ? 'current' : 'locked';
                 
                 return (
                   <div key={realIndex} ref={status === 'current' ? scrollRef : null} className="mb-6 ml-6 relative group">
                     {/* النقطة على الخط */}
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 z-10 transition-colors duration-300 
                       ${status === 'done' ? 'bg-[#66fcf1] border-[#66fcf1]' : 
                         status === 'current' ? 'bg-[#1f2833] border-[#66fcf1] animate-pulse' : 
                         'bg-[#0b0c10] border-gray-700'}`}>
                     </div>
                     
                     {/* كارت اليوم في القائمة */}
                     <div className={`p-4 rounded-xl border transition-all duration-300 
                       ${status === 'current' ? 'bg-[#1f2833] border-[#45a29e] scale-105 shadow-lg' : 
                         status === 'done' ? 'bg-[#0b0c10] border-[#1f2833] opacity-60' : 
                         'bg-[#0b0c10] border-[#1f2833] opacity-40'}`}>
                       
                       <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold ${status === 'current' ? 'text-[#66fcf1]' : 'text-gray-500'}`}>DAY {realIndex + 1}</span>
                          {status === 'done' && <CheckCircle size={14} className="text-[#66fcf1]" />}
                          {status === 'locked' && <Lock size={14} className="text-gray-700" />}
                       </div>
                       <h3 className="text-sm font-bold text-gray-200 line-clamp-1">{day.lessonTitle}</h3>
                       <p className="text-[10px] text-gray-500 mt-1 truncate">{day.phaseName}</p>
                     </div>
                   </div>
                 );
              })}
            </div>
            
            {/* زر الإصلاح في حالة الطوارئ */}
            <div className="text-center py-8 border-t border-gray-800">
               <button onClick={hardReset} className="text-[10px] text-red-500/50 flex items-center justify-center gap-1 mx-auto hover:text-red-500">
                 <Trash2 size={10} /> Reset All Progress
               </button>
            </div>
          </div>
        )}

        {/* --- CARD TAB (Hunter License) --- */}
        {activeTab === 'card' && (
          <div className="mt-6 flex flex-col items-center">
             <div className="perspective-1000 w-full h-[480px]" onClick={() => setIsFlipped(!isFlipped)}>
               <div className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                 
                 {/* Wوجه الكارت */}
                 <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1f2833] to-[#0b0c10] rounded-2xl border-2 border-[#66fcf1] shadow-[0_0_30px_rgba(102,252,241,0.2)] p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 items-center">
                         <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center border border-blue-400/50 text-blue-400 font-bold text-xs">H</div>
                         <div>
                           <div className="text-[#66fcf1] font-bold text-lg tracking-tighter leading-none">HUNTER</div>
                           <div className="text-[8px] text-gray-400 tracking-[0.2em]">LICENSE</div>
                         </div>
                      </div>
                      <div className="text-xl">{'★'.repeat(Math.min(3, Math.floor(save.xp/2000)))}</div>
                    </div>

                    <div className="flex-1 -ml-6">
                      <ResponsiveContainer width="110%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getSkillData()}>
                          <PolarGrid stroke="#2d3748" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0aec0', fontSize: 9 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Skills" dataKey="A" stroke="#66fcf1" strokeWidth={2} fill="#66fcf1" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 border-t border-gray-800 pt-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Current Class</div>
                          <div className="text-lg font-bold text-white">{currentRank.title}</div>
                        </div>
                        <div className="text-[10px] text-[#45a29e] animate-pulse">Tap to flip ↻</div>
                      </div>
                    </div>
                 </div>

                 {/* ظهر الكارت */}
                 <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#0b0c10] rounded-2xl border border-gray-700 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-4 mb-6 text-center">Hunter Statistics</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-[#1f2833] p-4 rounded-xl border-l-2 border-[#66fcf1]">
                          <div className="text-[10px] text-gray-400 mb-1">Estimated Completion</div>
                          <div className="text-lg font-bold text-white">{safeCalculateDate(save.completedCount, planData.days.length)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                             <div className="text-[#66fcf1] font-bold text-xl">{Math.round((save.completedCount / planData.days.length) * 100)}%</div>
                             <div className="text-[10px] text-gray-400">Progress</div>
                           </div>
                           <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                             <div className="text-red-500 font-bold text-xl">{planData.days.length - save.completedCount}</div>
                             <div className="text-[10px] text-gray-400">Days Left</div>
                           </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-4 leading-relaxed bg-black/20 p-3 rounded">
                          {currentRank.desc}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center border-t border-gray-800 pt-4">
                      <Sword className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                      <div className="text-[8px] text-gray-600 tracking-widest">PRO HUNTER ASSOCIATION © 2026</div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-[#0b0c10] border-t border-[#1f2833] pb-6 pt-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'map' ? 'text-[#66fcf1]' : 'text-gray-600'}`}
          >
            <Map size={24} />
            <span className="text-[10px] font-bold">The Map</span>
          </button>
          
          <div className="w-px h-8 bg-[#1f2833]"></div>

          <button 
            onClick={() => setActiveTab('card')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'card' ? 'text-[#66fcf1]' : 'text-gray-600'}`}
          >
            <User size={24} />
            <span className="text-[10px] font-bold">My License</span>
          </button>
        </div>
      </nav>

    </div>
  );
}

export default App;
