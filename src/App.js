import React, { useState, useEffect } from 'react';
import { Shield, Zap, Award, CheckCircle, ExternalLink, Trophy, Flame, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import planData from './plan.json';

// --- (1) مكونات العرض (UI Components) ---

// الهيدر اللي فيه اللفل والـ XP
const StatsHeader = ({ level, xp, streak, progress }) => (
  <div className="bg-[#18181b] border-b border-[#27272a] sticky top-0 z-50 p-3 shadow-xl">
    <div className="max-w-3xl mx-auto flex justify-between items-center">
      {/* المستوى */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-10 h-10 text-purple-500" fill="rgba(139, 92, 246, 0.2)" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-sm">{level}</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs text-gray-400">Hunter Level</div>
          <div className="h-2 w-24 bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* العدادات */}
      <div className="flex gap-3">
        <div className="bg-[#27272a] px-3 py-1 rounded-lg flex items-center gap-2 border border-yellow-500/20">
          <Zap className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <span className="font-mono font-bold text-yellow-100">{xp}</span>
        </div>
        <div className="bg-[#27272a] px-3 py-1 rounded-lg flex items-center gap-2 border border-orange-500/20">
          <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />
          <span className="font-mono font-bold text-orange-100">{streak}</span>
        </div>
      </div>
    </div>
  </div>
);

// --- (2) التطبيق الرئيسي ---
function App() {
  // تحميل البيانات المحفوظة من الموبايل
  const [save, setSave] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_v1');
    return saved ? JSON.parse(saved) : {
      completedCount: 0, // عدد الأيام المكتملة
      xp: 0,
      streak: 0,
      lastLogin: null
    };
  });

  // حساب المستوى (كل 1000 نقطة مستوى)
  const level = Math.floor(save.xp / 1000) + 1;
  const progressToNextLevel = ((save.xp % 1000) / 1000) * 100;

  // تحديد اليوم الحالي (بناء على عدد الأيام المكتملة في المصفوفة)
  const currentTaskIndex = save.completedCount;
  const currentTask = planData.days && planData.days[currentTaskIndex];
  const isFinished = currentTaskIndex >= planData.days.length;

  // حفظ تلقائي عند أي تغيير
  useEffect(() => {
    localStorage.setItem('codesaga_save_v1', JSON.stringify(save));
  }, [save]);

  // دالة إتمام المهمة
  const handleComplete = () => {
    // 1. احتفال
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#fbbf24']
    });

    // 2. حساب الستريك
    const today = new Date().toDateString();
    let newStreak = save.streak;
    
    if (save.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (save.lastLogin === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1; // لو فوت يوم يبدأ من 1
      }
    }

    // 3. تحديث البيانات
    setSave(prev => ({
      completedCount: prev.completedCount + 1,
      xp: prev.xp + 150, // 150 نقطة لكل يوم
      streak: newStreak,
      lastLogin: today
    }));

    // سكرول لأعلى الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // دالة تخطي اليوم (بدون نقاط)
  const handleSkip = () => {
    if (window.confirm("هتعدي اليوم ده من غير ما تاخد XP؟")) {
      setSave(prev => ({
        ...prev,
        completedCount: prev.completedCount + 1
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // شاشة الختام
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center text-white">
        <Trophy className="w-32 h-32 text-yellow-400 mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold mb-4">أسطورة! 🎉</h1>
        <p className="text-gray-400 mb-8">أنت خلصت منهج OSSU بالكامل.</p>
        <div className="bg-[#18181b] p-6 rounded-2xl border border-[#27272a] min-w-[300px]">
          <div className="text-sm text-gray-500 mb-1">Total XP</div>
          <div className="text-3xl font-bold text-purple-400">{save.xp}</div>
        </div>
      </div>
    );
  }

  // لو مفيش بيانات
  if (!currentTask) {
    return <div className="text-white text-center p-10">جاري تحميل البيانات... تأكد من ملف plan.json</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-10">
      <StatsHeader level={level} xp={save.xp} streak={save.streak} progress={progressToNextLevel} />

      <main className="max-w-2xl mx-auto p-4 md:p-6">
        {/* كارت المرحلة */}
        <div className="mb-6 flex items-center justify-between">
          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/20">
            {currentTask.phaseName}
          </span>
          <span className="text-gray-500 text-xs">
            Day {currentTaskIndex + 1} / {planData.days.length}
          </span>
        </div>

        {/* الكارت الرئيسي للمهمة */}
        <div className="bg-[#18181b] rounded-2xl p-6 border border-[#27272a] shadow-2xl relative overflow-hidden">
          {/* خلفية جمالية */}
          <div className="absolute top-0 right-0 p-24 bg-purple-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <h2 className="text-2xl font-bold text-white mb-6 relative z-10 leading-snug">
            {currentTask.lessonTitle}
          </h2>

          {/* زر المصدر */}
          {currentTask.resourceURL && (
            <a 
              href={currentTask.resourceURL} 
              target="_blank" 
              rel="noreferrer"
              className="w-full mb-8 flex items-center justify-center gap-2 bg-[#27272a] hover:bg-[#3f3f46] text-blue-400 py-3 rounded-xl border border-[#3f3f46] transition-all"
            >
              <ExternalLink size={18} />
              <span>افتح المصدر: {currentTask.resourceName}</span>
            </a>
          )}

          {/* المهام المطلوبة */}
          <div className="space-y-3 mb-8 relative z-10">
            <h3 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">Checklist</h3>
            {currentTask.tasks.map((step, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-black/20 rounded-lg border border-transparent hover:border-gray-700 transition-colors">
                <div className="min-w-[24px] h-6 flex items-center justify-center bg-gray-800 rounded text-xs font-bold text-gray-400 mt-1">
                  {idx + 1}
                </div>
                <p className="text-gray-300 text-base leading-relaxed dir-rtl" style={{direction: 'rtl'}}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* الأكشن */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleComplete}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-purple-900/20"
            >
              <CheckCircle className="w-5 h-5" />
              <span>إتمام المهمة (+150 XP)</span>
            </button>
            
            <button 
              onClick={handleSkip}
              className="text-gray-500 text-xs hover:text-gray-300 py-2 transition-colors"
            >
              تخطي هذا اليوم (بدون نقاط)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
