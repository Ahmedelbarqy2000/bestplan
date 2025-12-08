import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, Map, User, Brain, Terminal, Database, Layout, Cpu, Lock, Star, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import planData from './plan.json';
import { DIFFICULTY_WEIGHTS, RANKS, SKILL_MAPPING, calculatePrediction } from './gameLogic';

const App = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'card'
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollRef = useRef(null);
  
  const [save, setSave] = useState(() => {
    const local = localStorage.getItem('hunter_save_v1');
    return local ? JSON.parse(local) : {
      completedCount: 0,
      startDate: Date.now(),
      xp: 0
    };
  });

  // --- Derived Data & Logic ---
  const currentDayIndex = save.completedCount;
  // التأكد من عدم تخطي حدود المصفوفة
  const safeIndex = Math.min(currentDayIndex, planData.days.length - 1);
  const currentMission = planData.days[safeIndex];
  
  // هل هذه مرحلة "زعيم" (Boss)؟
  const isBoss = currentMission && DIFFICULTY_WEIGHTS[currentMission.phaseId] >= 2.5;
  
  // حساب الرتبة الحالية
  const currentRank = [...RANKS].reverse().find(r => save.completedCount >= r.threshold) || RANKS[0];
  
  // حساب التوقع الزمني
  const predictedDate = calculatePrediction(save.completedCount, planData.days.length, save.startDate);

  // حساب المهارات للرسم البياني (Radar Chart)
  const calculateSkillScore = (skillKey) => {
    // نحسب عدد الأيام المكتملة لهذه المهارة مقارنة بالإجمالي
    // لتبسيط الحساب على الموبايل سنعتمد نسبة مئوية تقريبية بناء على التقدم العام
    const totalForSkill = planData.days.filter(d => SKILL_MAPPING[d.phaseId] === skillKey).length;
    if (totalForSkill === 0) return 0;
    
    // عدد ما تم إنجازه
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

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('hunter_save_v1', JSON.stringify(save));
  }, [save]);

  // التمرير التلقائي للمهمة الحالية عند فتح الخريطة
  useEffect(() => {
    if (activeTab === 'map' && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTab]);

  // --- Actions ---
  const handleComplete = () => {
    // تأثير الاحتفال
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: isBoss ? ['#ff003c', '#ffffff'] : ['#66fcf1', '#45a29e']
    });

    // زيادة الـ XP بناء على صعوبة المرحلة
    const difficultyMultiplier = DIFFICULTY_WEIGHTS[currentMission.phaseId] || 1;
    const gainedXp = Math.round(100 * difficultyMultiplier);

    setSave(prev => ({
      ...prev,
      completedCount: prev.completedCount + 1,
      xp: prev.xp + gainedXp
    }));
  };

  // لو خلصنا المنهج
  if (save.completedCount >= planData.days.length) {
    return (
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-6xl mb-4">👑</h1>
          <h2 className="text-4xl font-bold text-hunter-green mb-4">Ging Freecss فخور بك!</h2>
          <p className="text-gray-400">لقد أتممت الرحلة بالكامل.</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-hunter-dark text-gray-200 pb-20 overflow-x-hidden">
      
      {/* 1. Header & Stats */}
      <header className="fixed top-0 w-full bg-[#0b0c10]/90 backdrop-blur-md border-b border-[#1f2833] z-50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1f2833] border border-hunter-green flex items-center justify-center text-hunter-green font-bold text-lg">
               {currentMission.phaseId}
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Hunter Rank</div>
              <div className="text-sm font-bold text-white truncate max-w-[120px]">{currentRank.title}</div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest">Current XP</div>
             <div className="text-xl font-mono text-hunter-green">{save.xp}</div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="pt-24 px-4 max-w-md mx-auto">
        
        {/* --- TAB: MAP (Mission Control) --- */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            
            {/* Current Mission Card (The Episode) */}
            <div className={`relative bg-[#1f2833] rounded-2xl p-6 border ${isBoss ? 'border-hunter-red boss-glow' : 'border-hunter-green hunter-glow'}`}>
              <div className="absolute -top-3 right-4 px-2 py-1 bg-[#0b0c10] text-[10px] uppercase font-bold tracking-widest text-gray-400 border border-gray-800 rounded">
                Current Mission
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {currentMission.lessonTitle}
              </h2>
              <p className="text-xs text-hunter-dimGreen mb-6 uppercase tracking-wide">
                {currentMission.phaseName}
              </p>

              <div className="space-y-3 mb-6">
                {currentMission.tasks.slice(0, 3).map((task, i) => (
                   <div key={i} className="flex gap-3 text-sm text-gray-400 dir-rtl" style={{direction: 'rtl'}}>
                     <span className="text-hunter-green">•</span>
                     <span>{task.substring(0, 50)}...</span>
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
                    <Play size={18} fill="currentColor" /> المصدر
                  </a>
                )}
                <button 
                  onClick={handleComplete}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95 ${isBoss ? 'bg-hunter-red text-white' : 'bg-hunter-green text-black'}`}
                >
                  <CheckCircle size={18} /> إنهاء
                </button>
              </div>
            </div>

            {/* Episodes List (Timeline) */}
            <div className="space-y-2 mt-8">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 px-2">Mission Timeline</h3>
              {/* عرض نافذة صغيرة من الأيام لتخفيف الحمل (السابق 2 والقادم 5) */}
              {planData.days.slice(Math.max(0, currentDayIndex - 2), currentDayIndex + 6).map((day, idx) => {
                 const realIndex = planData.days.indexOf(day);
                 const isCompleted = realIndex < currentDayIndex;
                 const isCurrent = realIndex === currentDayIndex;
                 
                 return (
                   <div 
                    key={realIndex} 
                    ref={isCurrent ? scrollRef : null}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${isCurrent ? 'bg-[#1f2833] border-hunter-green/30' : 'bg-[#0b0c10] border-[#1f2833] opacity-60'}`}
                   >
                     <div className="text-lg font-bold w-8 text-center text-gray-600">{realIndex + 1}</div>
                     <div className="flex-1">
                       <div className="text-sm font-bold text-gray-300 truncate">{day.lessonTitle}</div>
                       <div className="text-[10px] text-gray-600 uppercase">{day.phaseName}</div>
                     </div>
                     <div>
                       {isCompleted ? <CheckCircle size={20} className="text-hunter-green" /> : isCurrent ? <Play size={20} className="text-white animate-pulse" /> : <Lock size={18} className="text-gray-700" />}
                     </div>
                   </div>
                 );
              })}
              <div className="text-center text-xs text-gray-700 py-4">... وباقي الرحلة مستمرة</div>
            </div>
          </div>
        )}

        {/* --- TAB: HUNTER CARD --- */}
        {activeTab === 'card' && (
          <div className="perspective-1000 h-[500px] flex items-center justify-center mt-4">
             <div 
               className={`relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
               onClick={() => setIsFlipped(!isFlipped)}
             >
               {/* Front Side */}
               <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-[#1f2833] to-[#0b0c10] rounded-2xl border-2 border-hunter-green hunter-glow p-6 flex flex-col justify-between">
                  {/* Top: Logo & Chip */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                       <div className="w-12 h-8 bg-yellow-500/20 rounded flex items-center justify-center border border-yellow-500/50">
                          <div className="w-8 h-5 border border-yellow-500/30 rounded-sm"></div>
                       </div>
                       <div className="text-hunter-green font-anime font-bold text-2xl tracking-tighter">HUNTER</div>
                    </div>
                    <Star className="text-yellow-500 fill-yellow-500 animate-spin-slow" />
                  </div>

                  {/* Middle: Radar Chart */}
                  <div className="h-48 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                        <PolarGrid stroke="#45a29e" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#c5c6c7', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skills" dataKey="A" stroke="#66fcf1" strokeWidth={2} fill="#66fcf1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bottom: Info */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Current Status</div>
                    <div className="text-lg font-bold text-white mb-1">{currentRank.title}</div>
                    <div className="text-xs text-gray-400 leading-relaxed">{currentRank.desc}</div>
                  </div>

                  <div className="absolute bottom-4 right-6 text-[10px] text-hunter-green animate-pulse">
                    Tap to see details
                  </div>
               </div>

               {/* Back Side */}
               <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#0b0c10] rounded-2xl border border-gray-800 p-6 flex flex-col">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white">License Details</h3>
                    <div className="text-xs text-gray-500">ID: 9980-{save.startDate.toString().slice(-4)}</div>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="bg-[#1f2833] p-4 rounded-xl border-l-4 border-hunter-green">
                      <div className="text-xs text-gray-400 mb-1">Time Prediction (Oracle)</div>
                      <div className="text-lg font-bold text-white">
                        {predictedDate}
                      </div>
                      <div className="text-[10px] text-gray-500">موعد الختم المتوقع بناءً على سرعتك الحالية</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                         <div className="text-hunter-green font-bold text-xl">{Math.round((currentDayIndex / planData.days.length) * 100)}%</div>
                         <div className="text-[10px] text-gray-400">Total Progress</div>
                       </div>
                       <div className="bg-[#1f2833] p-3 rounded-lg text-center">
                         <div className="text-hunter-red font-bold text-xl">{927 - currentDayIndex}</div>
                         <div className="text-[10px] text-gray-400">Days Left</div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-[10px] text-gray-600 mt-4">
                    PRO HUNTER ASSOCIATION © 2026
                  </div>
               </div>
             </div>
          </div>
        )}

      </main>

      {/* 3. Bottom
