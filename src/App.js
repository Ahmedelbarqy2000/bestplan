import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Map, User, Lock, Star, Zap, Sword, ExternalLink, RefreshCw } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import planData from './plan.json';

// --- الثوابت والمنطق (مدمجة هنا لضمان العمل) ---
const DIFFICULTY_WEIGHTS = { 1: 1.8, 2: 2.2, 3: 1.2, 4: 1.5, 5: 0.8, 6: 1.2, 7: 1.0, 8: 3.0, 9: 2.0, 10: 1.5, 11: 1.5 };

const RANKS = [
  { threshold: 0, title: "Zaban Candidate", desc: "لسه بتقول يا هادي. معرفتك: تشغيل الكمبيوتر." },
  { threshold: 50, title: "Exam Rookie", desc: "فاهم يعني ايه Variable. تقدر تشتغل: قهوجي كود." },
  { threshold: 150, title: "Nen Student", desc: "بتكتب Loop من غير ما تعيط. تقدر تشتغل: Intern." },
  { threshold: 300, title: "Licensed Hunter", desc: "معاك الرخصة. تقدر تعمل مشاريع صغيرة." },
  { threshold: 500, title: "Single Star", desc: "مبرمج شاطر. تقدر تشتغل: Junior Dev." },
  { threshold: 750, title: "Double Star", desc: "تنين مجنح. فاهم System Design." },
  { threshold: 900, title: "Triple Star", desc: "أسطورة حية. الشركات بتجري وراك." }
];

const SKILL_MAPPING = { 1: 'Logic', 2: 'System', 3: 'System', 4: 'System', 5: 'Scripting', 6: 'Backend', 7: 'Frontend', 8: 'Fullstack', 9: 'AI', 10: 'Special', 11: 'Career' };

// دالة التوقع الزمني
const calculatePrediction = (completedCount, totalDays, startDateStr) => {
  if (completedCount < 5) return "جاري الحساب...";
  const startDate = new Date(startDateStr || Date.now());
  const daysPassed = (new Date() - startDate) / (1000 * 60 * 60 * 24);
  const velocity = completedCount / (daysPassed || 1);
  const remaining = totalDays - completedCount;
  const daysLeft = (remaining * 1.4) / (velocity || 0.5);
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysLeft);
  return finishDate.toLocaleDateString('ar-EG');
};

// --- المكون الرئيسي ---
const App = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollRef = useRef(null);
  
  const [save, setSave] = useState(() => {
    try {
      const local = localStorage.getItem('hunter_save_v3');
      return local ? JSON.parse(local) : { completedCount: 0, startDate: Date.now(), xp: 0, streak: 0, lastLogin: null };
    } catch { return { completedCount: 0, startDate: Date.now(), xp: 0, streak: 0, lastLogin: null }; }
  });

  // البيانات المحسوبة
  const currentIdx = save.completedCount;
  const safeIdx = Math.min(currentIdx, (planData.days?.length || 1) - 1);
  const task = planData.days ? planData.days[safeIdx] : null;
  const isBoss = task && DIFFICULTY_WEIGHTS[task.phaseId] >= 2.5;
  const currentRank = [...RANKS].reverse().find(r => save.completedCount >= r.threshold) || RANKS[0];
  const predictedDate = calculatePrediction(save.completedCount, planData.days?.length || 0, save.startDate);
  
  // بيانات المهارات
  const getSkill = (key) => {
    if (!planData.days) return 0;
    const total = planData.days.filter(d => SKILL_MAPPING[d.phaseId] === key).length || 1;
    const done = planData.days.slice(0, save.completedCount).filter(d => SKILL_MAPPING[d.phaseId] === key).length;
    return Math.round((done / total) * 100);
  };
  
  const skillsData = [
    { subject: 'Logic', A: getSkill('Logic'), full: 100 },
    { subject: 'System', A: getSkill('System'), full: 100 },
    { subject: 'Backend', A: getSkill('Backend'), full: 100 },
    { subject: 'Frontend', A: getSkill('Frontend'), full: 100 },
    { subject: 'AI', A: getSkill('AI'), full: 100 },
    { subject: 'Scripting', A: getSkill('Scripting'), full: 100 },
  ];

  useEffect(() => { localStorage.setItem('hunter_save_v3', JSON.stringify(save)); }, [save]);
  useEffect(() => { if (activeTab === 'map' && scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [activeTab]);

  const handleComplete = () => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: isBoss ? ['#ff003c', '#fff'] : ['#66fcf1', '#45a29e'] });
    const today = new Date().toDateString();
    let newStreak = save.streak;
    if (save.lastLogin !== today) {
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        newStreak = (save.lastLogin === yest.toDateString()) ? newStreak + 1 : 1;
    }
    setSave(prev => ({ ...prev, completedCount: prev.completedCount + 1, xp: prev.xp + Math.round(100 * (DIFFICULTY_WEIGHTS[task?.phaseId] || 1)), streak: newStreak, lastLogin: today }));
    window.scrollTo(0,0);
  };

  if (!task) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري تحميل المنهج...</div>;
  
  if (save.completedCount >= planData.days.length) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center text-center p-6 text-white">
        <h1 className="text-6xl mb-4">👑</h1>
        <h2 className="text-4xl font-bold text-[#66fcf1] mb-4">Ging Freecss فخور بك!</h2>
        <p className="text-gray-400">لقد أتممت الرحلة بالكامل.</p>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-8 px-6 py-2 bg-red-600 rounded">إعادة الرحلة</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-200 pb-24 overflow-x-hidden font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#1f2833] z-50 p-3 shadow-lg">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
             <div className="relative">
                <Shield className="w-10 h-10 text-[#45a29e]" fill="rgba(69, 162, 158, 0.2)" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white text-xs">{Math.floor(save.xp/1000)+1}</span>
             </div>
             <div>
               <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rank</div>
               <div className="text-sm font-bold text-white">{currentRank.title.split(' ')[0]}</div>
             </div>
          </div>
          <div className="flex gap-3">
             <div className="text-center"><div className="text-[10px] text-gray-500 uppercase">XP</div><div className="font-mono font-bold text-yellow-400">{save.xp}</div></div>
             <div className="text-center"><div className="text-[10px] text-gray-500 uppercase">Streak</div><div className="font-mono font-bold text-orange-500">{save.streak}🔥</div></div>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-md mx-auto">
        {activeTab === 'map' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Current Mission Card */}
            <div className={`relative bg-[#1f2833] rounded-2xl p-6 border-2 ${isBoss ? 'border-[#ff003c] boss-glow' : 'border-[#66fcf1] hunter-glow'}`}>
              <div className="absolute -top-3 left-4 px-2 py-1 bg-[#0b0c10] text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-gray-800 rounded">Current Mission</div>
              <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white leading-tight flex-1 ml-2">{task.lessonTitle}</h2>
                  <div className="text-[#66fcf1]"><RefreshCw size={20} className="animate-spin-slow" /></div>
              </div>
              <p className="text-xs text-[#45a29e] mb-6 uppercase tracking-wide bg-black/20 p-2 rounded inline-block">{task.phaseName}</p>
              <div className="space-y-2 mb-6">
                {task.tasks.slice(0, 3).map((t, i) => (
                   <div key={i} className="flex gap-2 text-sm text-gray-300 dir-rtl items-start" style={{direction: 'rtl'}}><span className="text-[#66fcf1] mt-1">•</span><span>{t.substring(0, 50)}...</span></div>
                ))}
              </div>
              <div className="flex gap-3">
                {task.resourceURL && <a href={task.resourceURL} target="_blank" rel="noreferrer" className="flex-1 bg-[#0b0c10] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-700"><Play size={16} /> المصدر</a>}
                <button onClick={handleComplete} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isBoss ? 'bg-[#ff003c] text-white' : 'bg-[#66fcf1] text-black'}`}><CheckCircle size={18} /> إنهاء</button>
              </div>
            </div>
            {/* Timeline */}
            <div className="relative border-l-2 border-[#1f2833] ml-4">
              {planData.days.slice(Math.max(0, currentIdx - 2), currentIdx + 5).map((d, idx) => {
                 const realIdx = planData.days.indexOf(d);
                 const status = realIdx < currentIdx ? 'done' : realIdx === currentIdx ? 'curr' : 'lock';
                 return (
                   <div key={realIdx} ref={status === 'curr' ? scrollRef : null} className="mb-6 ml-6 relative">
                     <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${status === 'done' ? 'bg-[#66fcf1] border-[#66fcf1]' : status === 'curr' ? 'bg-[#1f2833] border-[#66fcf1] animate-pulse' : 'bg-[#0b0c10] border-gray-700'}`}></div>
                     <div className={`p-4 rounded-xl border ${status === 'curr' ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-[#0b0c10] border-[#1f2833] opacity-50'}`}>
                       <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-bold text-gray-500">DAY {realIdx + 1}</span>{status === 'done' ? <CheckCircle size={14} className="text-[#66fcf1]" /> : status === 'lock' && <Lock size={14} className="text-gray-700" />}</div>
                       <h3 className="text-sm font-bold text-gray-200">{d.lessonTitle}</h3>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        ) : (
          <div className="perspective-1000 h-[500px] flex items-center justify-center mt-4" onClick={() => setIsFlipped(!isFlipped)}>
             <div className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
               {/* Front */}
               <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1f2833] to-[#0b0c10] rounded-2xl border-2 border-[#66fcf1] hunter-glow p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2"><div className="w-12 h-8 bg-yellow-500/20 rounded flex items-center justify-center border border-yellow-500/50"><div className="w-8 h-5 border border-yellow-500/30 rounded-sm"></div></div><div><div className="text-[#66fcf1] font-bold text-xl tracking-tighter leading-none">HUNTER</div><div className="text-[8px] text-gray-400 tracking-widest">LICENSE CARD</div></div></div>
                    <div className="text-2xl font-bold text-white">★★★</div>
                  </div>
                  <div className="h-48 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                        <PolarGrid stroke="#45a29e" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#c5c6c7', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skills" dataKey="A" stroke="#66fcf1" strokeWidth={2} fill="#66fcf1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div><div className="text-xs text-gray-500 uppercase">Rank</div><div className="text-lg font-bold text-white mb-1">{currentRank.title}</div><div className="text-xs text-gray-400">{currentRank.desc}</div></div>
               </div>
               {/* Back */}
               <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#0b0c10] rounded-2xl border border-gray-700 p-6 flex flex-col justify-between">
                  <div className="space-y-4 pt-10">
                      <div className="bg-[#1f2833] p-4 rounded-xl border-l-4 border-[#66fcf1]">
                        <div className="text-xs text-gray-400 mb-1">Oracle Prediction 🔮</div>
                        <div className="text-base font-bold text-white">{predictedDate}</div>
                        <div className="text-[9px] text-gray-500 mt-1">تاريخ الختم المتوقع</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-[#1f2833] p-3 rounded-lg text-center"><div className="text-[#66fcf1] font-bold text-2xl">{Math.round((currentIdx / (planData.days?.length || 1)) * 100)}%</div><div className="text-[10px] text-gray-400">Done</div></div>
                         <div className="bg-[#1f2833] p-3 rounded-lg text-center"><div className="text-[#ff003c] font-bold text-2xl">{(planData.days?.length || 0) - currentIdx}</div><div className="text-[10px] text-gray-400">Left</div></div>
                      </div>
                  </div>
                  <div className="text-center"><Sword className="w-8 h-8 text-gray-700 mx-auto mb-2" /><div className="text-[10px] text-gray-600">PRO HUNTER ASSOCIATION © 2026</div></div>
               </div>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-[#0b0c10] border-t border-[#1f2833] p-2 pb-6 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button onClick={() => { setActiveTab('map'); window.scrollTo(0,0); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'map' ? 'text-[#66fcf1]' : 'text-gray-600'}`}><Map size={24} /><span className="text-[10px] font-bold">World Map</span></button>
          <div className="w-px h-8 bg-[#1f2833]"></div>
          <button onClick={() => setActiveTab('card')} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${activeTab === 'card' ? 'text-[#66fcf1]' : 'text-gray-600'}`}><User size={24} /><span className="text-[10px] font-bold">License</span></button>
        </div>
      </nav>
    </div>
  );
}

export default App;
