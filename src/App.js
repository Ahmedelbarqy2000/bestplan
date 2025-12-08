import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Map, User, Lock, Star, Zap, Sword, ExternalLink, RefreshCw } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import planData from './plan.json';

// --- 1. منطق اللعبة (مدمج هنا لضمان التشغيل) ---

const DIFFICULTY_WEIGHTS = {
  1: 1.8, 2: 2.2, 3: 1.2, 4: 1.5, 5: 0.8, 
  6: 1.2, 7: 1.0, 8: 3.0, 9: 2.0, 10: 1.5, 11: 1.5
};

const RANKS = [
  { threshold: 0, title: "Zaban City Candidate", desc: "لسه بتقول يا هادي. معرفتك الحالية: تشغيل الكمبيوتر." },
  { threshold: 50, title: "Exam Rookie", desc: "بدأت تفهم يعني ايه Variable. تقدر تشتغل: قهوجي في شركة برمجة." },
  { threshold: 150, title: "Nen Student", desc: "بقيت تعرف تكتب Loop من غير ما تعيط. تقدر تشتغل: Intern تحت السلم." },
  { threshold: 300, title: "Licensed Hunter", desc: "معاك رخصة المبادئ. تقدر تعمل مشاريع صغيرة." },
  { threshold: 500, title: "Single Star Hunter", desc: "مبرمج شاطر. تقدر تشتغل: Junior Developer بمرتب محترم." },
  { threshold: 750, title: "Double Star Hunter", desc: "تنين مجنح. فاهم System Design و Algorithms." },
  { threshold: 900, title: "Triple Star Hunter", desc: "أسطورة حية. الشركات هي اللي بتجري وراك." }
];

const SKILL_MAPPING = {
  1: 'Logic', 2: 'System', 3: 'System', 4: 'System',
  5: 'Scripting', 6: 'Backend', 7: 'Frontend',
  8: 'Fullstack', 9: 'AI', 10: 'Special', 11: 'Career'
};

const calculatePrediction = (completedCount, totalDays, startDateStr) => {
  if (completedCount < 5) return "جاري الحساب..."; 
  const startDate = new Date(startDateStr || Date.now());
  const today = new Date();
  const daysPassed = (today - startDate) / (1000 * 60 * 60 * 24);
  const velocity = completedCount / (daysPassed || 1); 
  const remainingRawDays = totalDays - completedCount;
  const averageDifficulty = 1.4; 
  const estimatedDaysLeft = (remainingRawDays * averageDifficulty) / (velocity || 0.5);
  const finishDate = new Date();
  finishDate.setDate(today.getDate() + estimatedDaysLeft);
  return finishDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- 2. التطبيق الرئيسي ---

const App = () => {
  // الحالة (State)
  const [activeTab, setActiveTab] = useState('map'); 
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollRef = useRef(null);
  
  const [save, setSave] = useState(() => {
    const local = localStorage.getItem('hunter_save_v2'); // V2 لتفادي تضارب البيانات القديمة
    return local ? JSON.parse(local) : {
      completedCount: 0,
      startDate: Date.now(),
      xp: 0,
      streak: 0,
      lastLogin: null
    };
  });

  // البيانات المحسوبة
  const currentDayIndex = save.completedCount;
  const safeIndex = Math.min(currentDayIndex, planData.days.length - 1);
  const currentMission = planData.days[safeIndex];
  const isBoss = currentMission && DIFFICULTY_WEIGHTS[currentMission.phaseId] >= 2.5;
  const currentRank = [...RANKS].reverse().find(r => save.completedCount >= r.threshold) || RANKS[0];
  const predictedDate = calculatePrediction(save.completedCount, planData.days.length, save.startDate);
  const progressPercent = Math.min(100, Math.round((currentDayIndex / planData.days.length) * 100));

  // حساب المهارات
  const calculateSkillScore = (skillKey) => {
    const totalForSkill = planData.days.filter(d => SKILL_MAPPING[d.phaseId] === skillKey).length || 1;
    const completedForSkill = planData.days.slice(0, save.completedCount)
        .filter(d => SKILL_MAPPING[d.phaseId] === skillKey).length;
    return Math.round((completedForSkill / totalForSkill) * 100);
  };

  const skillsData = [
    { subject: 'Logic', A: calculateSkillScore('Logic'), full: 100 },
    { subject: 'System', A: calculateSkillScore('System'), full: 100 },
    { subject: 'Backend', A: calculateSkillScore('Backend'), full: 100 },
    { subject: 'Frontend', A: calculateSkillScore('Frontend'), full: 100 },
    { subject: 'AI', A: calculateSkillScore('AI'), full: 100 },
    { subject: 'Scripting', A: calculateSkillScore('Scripting'), full: 100 },
  ];

  // الحفظ التلقائي
  useEffect(() => {
    localStorage.setItem('hunter_save_v2', JSON.stringify(save));
  }, [save]);

  // سكرول للمهمة الحالية
  useEffect(() => {
    if (activeTab === 'map' && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTab]);

  // دالة إتمام المهمة
  const handleComplete = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: isBoss ? ['#ff003c', '#ffffff'] : ['#66fcf1', '#45a29e']
    });

    const difficultyMultiplier = DIFFICULTY_WEIGHTS[currentMission.phaseId] || 1;
    const gainedXp = Math.round(100 * difficultyMultiplier);
    
    // حساب الستريك
    const today = new Date().toDateString();
    let newStreak = save.streak;
    if (save.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (save.lastLogin === yesterday.toDateString()) newStreak += 1;
        else newStreak = 1;
    }

    setSave(prev => ({
      ...prev,
      completedCount: prev.completedCount + 1,
      xp: prev.xp + gainedXp,
      streak: newStreak,
      lastLogin: today
    }));
  };

  // لو خلصنا
  if (save.completedCount >= planData.days.length) {
    return (
      <div className="min-h-screen bg-hunter-dark flex flex-col items-center justify-center text-center p-6 text-white">
        <h1 className="text-6xl mb-4">👑</h1>
        <h2 className="text-4xl font-bold text-hunter-green mb-4">Ging Freecss فخور بك!</h2>
        <p className="text-gray-400">لقد أتممت الرحلة بالكامل.</p>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-8 px-6 py-2 bg-red-600 rounded text-white">إعادة الرحلة</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 pb-24 overflow-x-hidden">
      
      {/* 1. Header */}
      <header className="fixed top-0 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#1f2833] z-50 p-3 shadow-2xl">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
             <div className="relative">
                <Shield className="w-10 h-10 text-hunter-dimGreen" fill="rgba(69, 162, 158, 0.2)" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-xs">{Math.floor(save.xp/1000)+1}</span>
             </div>
             <div>
               <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rank</div>
               <div className="text-sm font-bold text-white">{currentRank.title.split(' ')[0]}</div>
             </div>
          </div>
          <div className="flex gap-3">
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

      {/* 2. Main Content */}
      <main className="pt-20 px-4 max-w-md mx-auto">
        
        {/* --- MAP TAB --- */}
        {activeTab === 'map' && (
          <div className="space-y-8 animate-fade-in">
            {/* Current Mission */}
            <div className={`relative bg-[#1f2833] rounded-2xl p-6 border-2 ${isBoss ? 'border-[#ff003c] boss-glow' : 'border-[#66fcf1] hunter-glow'}`}>
              <div className="absolute -top-3 left-4 px-2 py-1 bg-[#0b0c10] text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-gray-800 rounded">
                Current Objective
              </div>
              
              <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white leading-tight flex-1 ml-2">
                    {currentMission.lessonTitle}
                  </h2>
                  <div className="text-[#66fcf1]"><RefreshCw size={20} className="animate-spin-slow" /></div>
              </div>
              
              <p className="text-xs text-[#45a29e] mb-6 uppercase tracking-wide bg-black/20 p-2 rounded inline-block">
                {currentMission.phaseName}
              </p>

              <div className="space-y-2 mb-6">
                {currentMission.tasks.slice(0, 3).map((task, i) => (
                   <div key={i} className="flex gap-2 text-sm text-gray-300 dir-rtl items-start" style={{direction: 'rtl'}}>
                     <span className="text-[#66fcf1] mt-1">•</span>
                     <span>{task.substring(0, 60)}...</span>
                   </div>
                ))}
              </div>

              <div className="flex gap-3">
                {currentMission.resourceURL && (
                  <a 
                    href={currentMission.resourceURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-[#0b0c10] hover:bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-700 transition"
                  >
                    <Play size={16} fill="currentColor" /> المصدر
                  </a>
                )}
                <button 
                  onClick={handleComplete}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95 ${isBoss ? 'bg-[#ff003c] text-white shadow-lg shadow-red-900/50' : 'bg-[#66fcf1] text-black shadow-lg shadow-teal-900/50'}`}
                >
                  <CheckCircle size={18} /> إنهاء
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-[#1f2833] ml-4 space-y-0">
              {planData.days.slice(Math.max(0, currentDayIndex - 2), currentDayIndex + 5).map((day, idx) => {
                 const realIndex = planData.days.indexOf(day);
                 const isCompleted = realIndex < currentDayIndex;
                 const isCurrent = realIndex === currentDayIndex;
                 
                 return (
                   <div key={realIndex} ref={isCurrent ? scrollRef : null} className="mb-6 ml-6 relative">
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-[#66fcf1] border-[#66fcf1]' : isCurrent ? 'bg-[#1f2833] border-[#66fcf1] animate-pulse' : 'bg-[#0b0c10] border-gray-700'}`}></div>
                     <div className={`p-4 rounded-xl border transition-all ${isCurrent ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-[#0b0c10] border-[#1f2833] opacity-50'}`}>
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-500">DAY {realIndex + 1}</span>
                          {isCompleted && <CheckCircle size={14} className="text-[#66fcf1]" />}
                          {!isCompleted && !isCurrent && <Lock size={14} className="text-gray-700" />}
                       </div>
                       <h3 className="text-sm font-bold text-gray-200">{day.lessonTitle}</h3>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        )}

        {/* --- CARD TAB --- */}
        {activeTab === 'card' && (
          <div className="perspective-1000 h-[520px] flex items-center justify-center mt-4">
             <div 
               className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
               onClick={() => setIsFlipped(!isFlipped)}
             >
               {/* Front */}
               <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1f2833] to-[#0b0c10] rounded-2xl border-2 border-[#66fcf1] hunter-glow p-5 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 p-20 bg-[#66fcf1]/5 rounded-full blur-3xl"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex gap-3">
                       <div className="w-10 h-7 bg-[#c5c6c7] rounded flex items-center justify-center border border-gray-400">
                          <div className="w-6 h-4 border border-gray-500/50 rounded-sm bg-[#e2e8f0]"></div>
                       </div>
                       <div>
                         <div className="text-[#66fcf1] font-bold text-xl tracking-tighter leading-none">HUNTER</div>
                         <div className="text-[8px] text-gray-400 tracking-widest">LICENSE CARD</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-bold text-white">★★★</div>
                    </div>
                  </div>

                  <div className="h-48 w-full relative z-10 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                        <PolarGrid stroke="#45a29e" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#c5c6c7', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skills" dataKey="A" stroke="#66fcf1" strokeWidth={2} fill="#66fcf1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="relative z-10">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Hunter Rank</div>
                    <div className="text-xl font-bold text-white mb-1">{currentRank.title}</div>
                    <div className="text-[10px] text-gray-400 leading-relaxed bg-black/30 p-2 rounded border-l-2 border-[#66fcf1]">{currentRank.desc}</div>
                  </div>

                  <div className="text-[10px] text-center text-[#45a29e] animate-pulse mt-2">Tap to view stats</div>
               </div>

               {/* Back */}
               <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#0b0c10] rounded-2xl border border-gray-700 p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Mission Statistics</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-[#1f2833] p-4 rounded-xl border-l-4 border-[#66fcf1]">
                        <div className="text-xs text-gray-400 mb-1">Oracle Prediction 🔮</div>
                        <div className="text-base font-bold text-white">{predictedDate}</div>
                        <div className="text-[9px] text-gray-500 mt-1">تاريخ الختم المتوقع بناءً على سرعتك</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                           <div className="text-[#66fcf1] font-bold text-2xl">{progressPercent}%</div>
                           <div className="text-[10px] text-gray-400">Completion</div>
                         </div>
                         <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                           <div className="text-[#ff003c] font-bold text-2xl">{planData.days.length - currentDayIndex}</div>
                           <div className="text-[10px] text-gray-400">Missions Left</div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Sword className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <div className="text-[10px] text-gray-600">PRO HUNTER ASSOCIATION © 2026</div>
                  </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Nav */}
      <nav className="fi
