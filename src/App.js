import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, CheckCircle, Info, Database, Trophy, Zap, 
  Map, Brain, Sword, BarChart2, Clock, Calendar, 
  X, AlertTriangle, ChevronRight, RotateCcw, Filter, Star
} from 'lucide-react';
import rawData from './data';

// --- DATA NORMALIZER (المعالج الذكي للبيانات) ---
// هذه الوظيفة تحول البيانات المعقدة (الجديدة) أو البسيطة (القديمة) إلى شكل موحد يفهمه التطبيق
const normalizeData = (data) => {
  // الحالة 1: البيانات عبارة عن قائمة مباشرة (النظام القديم)
  if (Array.isArray(data)) return data;

  // الحالة 2: البيانات عبارة عن كائن معقد (النظام الجديد من ChatGPT)
  // سنحاول البحث عن مصفوفة الجدول الزمني ودمجها مع المصادر والمراحل
  const schedule = data.schedule || data.days || data.episodes || data.plan || [];
  
  if (schedule.length === 0) {
    console.error("Critical: No schedule array found in plan.json");
    return [];
  }

  // دمج البيانات (Mapping)
  return schedule.map(item => {
    // محاولة العثور على اسم المرحلة
    let phaseName = "General";
    if (data.phases) {
      const phase = data.phases.find(p => p.id === item.phaseId);
      if (phase) phaseName = phase.name;
    } else if (item.phaseName) {
      phaseName = item.phaseName;
    }

    // محاولة العثور على تفاصيل المهام من القوالب
    let tasks = item.tasks || [];
    if (data.taskTemplates && item.taskTemplateId) {
      const template = data.taskTemplates.find(t => t.id === item.taskTemplateId);
      if (template) tasks = template.steps || template.tasks;
    }

    // محاولة العثور على الرابط
    let resourceURL = item.resourceURL || "";
    if (data.resources && item.resourceId) {
      const res = data.resources.find(r => r.id === item.resourceId);
      if (res) resourceURL = res.url;
    }

    // توحيد شكل الكائن النهائي
    return {
      ...item,
      phaseName,
      tasks,
      resourceURL,
      // التأكد من وجود العناوين الأساسية
      lessonTitle: item.lessonTitle || item.title || `Episode ${item.id}`,
      hoursPlanned: item.hoursPlanned || 2, // قيمة افتراضية
      dayGoal: item.dayGoal || "Complete the assigned tasks.",
      date: item.date || "Unknown Date"
    };
  });
};

const planData = normalizeData(rawData);

// --- CONFIG ---
const RANKS = [
  { name: "E-Rank Hunter", minXP: 0, class: "Novice" },
  { name: "D-Rank Scripter", minXP: 5000, class: "Beginner" },
  { name: "C-Rank Coder", minXP: 20000, class: "Apprentice" },
  { name: "B-Rank Developer", minXP: 50000, class: "Professional" },
  { name: "A-Rank Engineer", minXP: 100000, class: "Expert" },
  { name: "S-Rank Architect", minXP: 200000, class: "Legend" }
];

const SKILLS_MAP = {
  1: "Math & Logic",
  2: "CS Fundamentals",
  3: "Programming Basics",
  4: "C++ Mastery",
  5: "Python Scripting",
  6: "Backend Engineering",
  7: "Frontend & UX",
  8: "Fullstack Scaling",
  9: "AI & Data Science",
  10: "Specialization",
  11: "Career Prep"
};

const AMBUSH_QUESTIONS = [
  { q: "What is Big O Notation?", a: "Describes algorithm efficiency/complexity." },
  { q: "Explain Recursion.", a: "A function calling itself until a base condition." },
  { q: "HTTP vs HTTPS?", a: "HTTPS is encrypted using SSL/TLS." },
  { q: "What is a Promise?", a: "Object representing async operation completion." },
  { q: "Difference: TCP vs UDP?", a: "TCP: Reliable/Ordered. UDP: Fast/Connectionless." }
];

const App = () => {
  // --- STATE ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_v4');
    return saved ? JSON.parse(saved) : { 
      completed: [], xp: 0, streak: 0, lastLogin: null, 
      focusHours: 0, inventory: [], ambushScore: { correct: 0, total: 0 }
    };
  });

  const [view, setView] = useState('dashboard');
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [ambush, setAmbush] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  // --- EFFECTS ---
  useEffect(() => {
    if (progress.lastLogin !== todayStr && Math.random() < 0.25) {
      setAmbush(AMBUSH_QUESTIONS[Math.floor(Math.random() * AMBUSH_QUESTIONS.length)]);
    }
  }, []);

  const getHeroEpisode = () => {
    if (planData.length === 0) return null;
    return planData.find(ep => !progress.completed.includes(ep.date)) || planData[planData.length - 1];
  };
  const heroEpisode = getHeroEpisode();

  useEffect(() => {
    if (heroEpisode) setSelectedPhase(heroEpisode.phaseId);
  }, []); // Run once on mount

  // --- HELPERS ---
  const currentRank = RANKS.slice().reverse().find(r => progress.xp >= r.minXP) || RANKS[0];

  const phaseStats = useMemo(() => {
    if (!planData.length) return { episodes: [], totalHours: 0 };
    const episodes = planData.filter(e => e.phaseId === selectedPhase);
    const totalDays = episodes.length;
    const completedInPhase = episodes.filter(e => progress.completed.includes(e.date)).length;
    const totalHours = episodes.reduce((acc, curr) => acc + (curr.hoursPlanned || 0), 0);
    const weeks = Math.ceil(totalDays / 7);
    
    return { episodes, totalDays, completedInPhase, totalHours, weeks };
  }, [selectedPhase, progress.completed]);

  const calculateETA = () => {
    const totalHours = planData.reduce((acc, curr) => acc + (curr.hoursPlanned || 0), 0);
    const completedHours = progress.focusHours || 1;
    const daysPassed = Math.max(1, progress.completed.length);
    
    const velocity = completedHours / daysPassed; 
    const remainingHours = totalHours - (progress.xp / 100); 
    const daysLeft = remainingHours / (Math.max(0.1, velocity));
    
    const date = new Date();
    date.setDate(date.getDate() + daysLeft);
    return date.toDateString();
  };

  // --- ACTIONS ---
  const toggleEpisodeCompletion = (episode, actualFocusTime = 0) => {
    const isCompleted = progress.completed.includes(episode.date);
    let newCompleted = [...progress.completed];
    let newXP = progress.xp;
    let newInventory = [...progress.inventory];
    let newFocus = progress.focusHours;

    const xpValue = (episode.hoursPlanned * 100) + (actualFocusTime > 0 ? 50 : 0);

    if (isCompleted) {
      // Undo Logic
      newCompleted = newCompleted.filter(d => d !== episode.date);
      newXP = Math.max(0, newXP - xpValue);
      if (episode.lessonTitle && episode.lessonTitle.includes("Project")) {
        newInventory = newInventory.filter(t => t !== episode.lessonTitle);
      }
    } else {
      // Complete Logic
      newCompleted.push(episode.date);
      newXP += xpValue;
      newFocus += (actualFocusTime / 60);
      if (episode.lessonTitle && (episode.lessonTitle.includes("Project") || episode.lessonTitle.includes("Capstone"))) {
        newInventory.push(episode.lessonTitle);
      }
    }

    const newProgress = {
      ...progress,
      completed: newCompleted,
      xp: newXP,
      inventory: newInventory,
      focusHours: newFocus,
      lastLogin: todayStr
    };
    
    if (!isCompleted && newProgress.lastLogin !== todayStr) {
        newProgress.streak += 1;
    }

    setProgress(newProgress);
    localStorage.setItem('codesaga_save_v4', JSON.stringify(newProgress));
    
    // الرجوع للداشبورد فقط عند الإكمال، البقاء عند الإلغاء
    if (!isCompleted) setView('dashboard');
  };

  const handleTimeWarp = () => {
    const confirm = window.confirm("Reality Shift: هل تريد ترحيل الخطة يومين للأمام؟");
    if(confirm) alert("Time Warp Activated! (Visual only for now)");
  };

  const handleAmbushResult = (success) => {
    const newProgress = {
      ...progress,
      ambushScore: {
        correct: progress.ambushScore.correct + (success ? 1 : 0),
        total: progress.ambushScore.total + 1
      }
    };
    setProgress(newProgress);
    localStorage.setItem('codesaga_save_v4', JSON.stringify(newProgress));
    setAmbush(null);
  };

  // --- VIEWS ---

  const Dashboard = () => {
    const phases = [...new Set(planData.map(p => p.phaseId))].sort((a,b) => a-b);
    
    if (!heroEpisode) return <div className="p-10 text-center">Loading Data or Empty Plan...</div>;

    return (
      <div className="pb-32">
        {/* Hero */}
        <div className="relative h-[45vh] flex flex-col justify-end p-6 bg-gradient-to-t from-[#141414] via-black/60 to-gray-900/40 border-b border-gray-800">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center -z-10 opacity-20" />
           <div className="z-10">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Next Up
                </span>
                <span className="text-gray-400 text-xs font-mono">{heroEpisode.date}</span>
             </div>
             <h1 className="text-2xl md:text-4xl font-black mb-2 leading-tight text-white">{heroEpisode.lessonTitle}</h1>
             <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-4">{heroEpisode.dayGoal}</p>
             <button 
               onClick={() => { setActiveEpisode(heroEpisode); setView('player'); }}
               className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition w-fit text-sm"
             >
               <Play fill="black" size={16} /> Continue Learning
             </button>
           </div>
        </div>

        {/* Oracle Bar */}
        <div className="bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-gray-800">
           <div className="flex items-center gap-3">
              <div className="bg-purple-900/30 p-2 rounded-full"><Brain size={18} className="text-purple-400"/></div>
              <div>
                <h3 className="text-purple-400 font-bold text-xs uppercase">Oracle Prediction</h3>
                <p className="text-gray-500 text-[10px]">Based on your velocity</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-white font-bold text-sm">{calculateETA()}</p>
              <p className="text-gray-500 text-[10px]">Estimated Finish</p>
           </div>
        </div>

        {/* Seasons / Phases Selector */}
        <div className="sticky top-0 bg-[#141414]/95 backdrop-blur-md z-30 pt-4 pb-2 border-b border-gray-800">
          <div className="px-4 mb-2 flex justify-between items-end">
             <h3 className="text-white font-bold text-sm">Season {selectedPhase}</h3>
             <span className="text-xs text-gray-500">{phaseStats.totalHours} Hrs • {phaseStats.weeks} Weeks</span>
          </div>
          <div className="flex overflow-x-auto gap-2 px-4 pb-2 scrollbar-hide">
            {phases.map(id => (
              <button
                key={id}
                onClick={() => setSelectedPhase(id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border
                  ${selectedPhase === id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}
                `}
              >
                S{id}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes List */}
        <div className="p-4 space-y-3">
           {phaseStats.episodes.map((ep, idx) => {
             const isDone = progress.completed.includes(ep.date);
             return (
               <div 
                 key={ep.date}
                 onClick={() => { setActiveEpisode(ep); setView('player'); }}
                 className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border
                    ${isDone 
                      ? 'bg-green-900/5 border-green-900/20 hover:bg-green-900/10' 
                      : 'bg-[#1f1f1f] border-[#2a2a2a] hover:bg-[#252525]'}
                 `}
               >
                 <div className={`relative min-w-[50px] h-[50px] rounded flex items-center justify-center border
                    ${isDone ? 'bg-green-900/20 border-green-900/50 text-green-500' : 'bg-black border-gray-700 text-gray-500'}
                 `}>
                    {isDone ? <CheckCircle size={20}/> : <span className="text-xs font-bold">{idx + 1}</span>}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${isDone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {ep.lessonTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 bg-black px-1.5 py-0.5 rounded border border-gray-800">{ep.date}</span>
                      {ep.hoursPlanned === 0 && <span className="text-[10px] text-yellow-600 font-bold">REST DAY</span>}
                    </div>
                 </div>
                 
                 {!isDone && <Play size={14} className="text-gray-600"/>}
               </div>
             )
           })}
        </div>
      </div>
    );
  };

  const Player = () => {
    const isCompleted = progress.completed.includes(activeEpisode.date);
    const [timer, setTimer] = useState(25 * 60);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
      let interval;
      if (timerActive && timer > 0) interval = setInterval(() => setTimer(t => t-1), 1000);
      return () => clearInterval(interval);
    }, [timerActive, timer]);

    return (
      <div className="min-h-screen bg-black p-6 pb-32 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setView('dashboard')} className="text-gray-400 text-sm hover:text-white flex items-center gap-1">
             <ChevronRight className="rotate-180" size={16}/> Back
           </button>
           <span className="text-[10px] font-mono text-red-500 border border-red-900/50 px-2 py-1 rounded bg-red-900/10">
             S{activeEpisode.phaseId} E{activeEpisode.id || '#'}
           </span>
        </div>

        <h1 className="text-2xl font-black mb-2 text-white">{activeEpisode.lessonTitle}</h1>
        <div className="flex gap-2 mb-6">
           <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{activeEpisode.date}</span>
           <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{activeEpisode.hoursPlanned} Hours</span>
        </div>
        
        {/* Focus Dungeon */}
        <div className={`p-6 rounded-2xl border mb-6 text-center transition-all relative overflow-hidden group
            ${timerActive ? 'bg-red-900/10 border-red-600' : 'bg-gray-900 border-gray-800'}
        `}>
           <div className="absolute top-2 right-2 text-gray-600 group-hover:text-red-500"><Sword size={16}/></div>
           <h3 className="text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-bold">Focus Dungeon</h3>
           <div className="text-5xl font-black font-mono mb-4 tracking-tighter text-white">
             {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
           </div>
           <button 
             onClick={() => setTimerActive(!timerActive)}
             className={`px-8 py-2 rounded-full font-bold text-xs tracking-wider transition-all
               ${timerActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
             `}
           >
             {timerActive ? 'PAUSE BATTLE' : 'ENTER DUNGEON'}
           </button>
        </div>

        {/* Objective & Tasks */}
        <div className="bg-[#111] p-5 rounded-xl mb-6 border border-gray-800">
           <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm"><Info size={16} className="text-blue-500"/> Mission Objective</h3>
           <p className="text-sm text-gray-400 leading-relaxed mb-4">{activeEpisode.dayGoal}</p>
           
           <div className="space-y-2 border-t border-gray-800 pt-4">
             {activeEpisode.tasks && activeEpisode.tasks.map((t, i) => (
               <div key={i} className="flex gap-3 items-start">
                 <div className="mt-1 min-w-[16px]"><div className="w-4 h-4 rounded-sm border border-gray-600"></div></div>
                 <span className="text-sm text-gray-300">{t}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
           <div className="bg-yellow-900/10 border border-yellow-800/30 p-3 rounded text-xs text-yellow-600 text-center mb-2">
             🛑 Stop Point: {activeEpisode.stopPoint || "Complete all tasks."}
           </div>

           {activeEpisode.resourceURL && (
             <a href={activeEpisode.resourceURL} target="_blank" rel="noreferrer" className="block w-full py-3 bg-white text-black font-bold text-center rounded-lg text-sm hover:bg-gray-200">
               Open Learning Resource
             </a>
           )}
           
           <button 
             onClick={() => toggleEpisodeCompletion(activeEpisode, (25*60 - timer)/60)}
             className={`block w-full py-3 font-bold text-center rounded-lg border transition-all text-sm flex items-center justify-center gap-2
               ${isCompleted 
                 ? 'bg-transparent border-red-900 text-red-500 hover:bg-red-900/10' 
                 : 'bg-green-600 border-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'}
             `}
           >
             {isCompleted ? <><RotateCcw size={16}/> Undo Completion</> : <><CheckCircle size={16}/> Mission Complete</>}
           </button>
        </div>
      </div>
    );
  };

  const WorldMap = () => (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-28">
       <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0a0a0a] z-10 py-2 border-b border-gray-800/50">
         <h2 className="font-bold text-lg flex items-center gap-2 text-white"><Map className="text-red-600" size={20}/> World Map</h2>
         <span className="text-xs text-gray-500 font-mono">{planData.length} Days</span>
       </div>

       {/* Heatmap Grid */}
       <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
         <div className="grid grid-cols-7 gap-1">
           {planData.map((ep, i) => {
             const isDone = progress.completed.includes(ep.date);
             const isToday = ep.date === todayStr;
             const isRest = ep.hoursPlanned === 0;

             let bg = "bg-gray-800";
             if (isDone) bg = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]";
             else if (isToday) bg = "bg-white animate-pulse z-10 scale-110";
             else if (isRest) bg = "bg-gray-800/30";

             return (
               <div 
                 key={i}
                 onClick={() => { setActiveEpisode(ep); setView('player'); }}
                 className={`aspect-square rounded-[2px] cursor-pointer transition-all hover:scale-150 hover:z-20 hover:border hover:border-white relative group ${bg}`}
               >
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black text-white text-[9px] p-2 rounded border border-gray-700 z-50 pointer-events-none text-center shadow-xl">
                    <p className="text-red-500 font-bold mb-1">{ep.date}</p>
                    <p className="line-clamp-2">{ep.lessonTitle}</p>
                  </div>
               </div>
             )
           })}
         </div>
       </div>
       
       <div className="mt-6 flex justify-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Done</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white rounded-sm"></div> Today</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-800 rounded-sm"></div> Pending</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-800/30 rounded-sm"></div> Rest</span>
       </div>

       <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl mt-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-red-500 text-sm">Reality Shift</h3>
            <p className="text-[10px] text-gray-400">Sick leave? Shift timeline.</p>
          </div>
          <button onClick={handleTimeWarp} className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
            Activate
          </button>
       </div>
    </div>
  );

  const Analytics = () => {
    const successRate = Math.round((progress.ambushScore.correct / (progress.ambushScore.total || 1)) * 100);
    
    // حساب المهارات الحقيقي
    const userSkills = progress.completed.reduce((acc, date) => {
      const ep = planData.find(e => e.date === date);
      if (ep) {
        const skillName = PHASE_SKILLS[ep.phaseId] || "General";
        acc[skillName] = (acc[skillName] || 0) + (ep.hoursPlanned || 0);
      }
      return acc;
    }, {});

    // تحديد نقاط القوة والضعف
    const sortedSkills = Object.entries(userSkills).sort((a,b) => b[1] - a[1]);
    const topSkill = sortedSkills[0];
    const weakSkill = Object.keys(PHASE_SKILLS).length > sortedSkills.length ? "Exploration needed" : sortedSkills[sortedSkills.length-1][0];

    return (
      <div className="min-h-screen bg-black p-6 pb-32">
        <h1 className="text-3xl font-black mb-8 text-white">Analytics Center</h1>

        <div className="grid gap-4">
           {/* Ambush Stats */}
           <div className="bg-[#111] p-5 rounded-xl border border-gray-800 flex justify-between items-center">
             <div>
                <h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Ambush Survival</h3>
                <div className="text-3xl font-black text-white">{successRate}%</div>
                <p className="text-[10px] text-gray-600">{progress.ambushScore.correct}/{progress.ambushScore.total} Questions</p>
             </div>
             <div className="bg-gray-800 p-3 rounded-full"><Shield size={24} className={successRate > 50 ? "text-green-500" : "text-red-500"}/></div>
           </div>

           {/* Insights */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/10 p-4 rounded-xl border border-green-900/30">
                 <h3 className="text-green-500 text-[10px] uppercase font-bold mb-1">Strongest Skill</h3>
                 <p className="text-white font-bold text-sm">{topSkill ? topSkill[0] : "None"}</p>
              </div>
              <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/30">
                 <h3 className="text-red-500 text-[10px] uppercase font-bold mb-1">Needs Focus</h3>
                 <p className="text-white font-bold text-sm">{weakSkill}</p>
              </div>
           </div>

           {/* Skills Chart (List) */}
           <div className="bg-[#111] p-5 rounded-xl border border-gray-800 mt-2">
             <h3 className="text-gray-400 text-xs uppercase mb-4 font-bold flex items-center gap-2">
                <BarChart2 size={14}/> Skill Distribution (Hours)
             </h3>
             <div className="space-y-4">
               {sortedSkills.length === 0 ? (
                 <p className="text-gray-600 text-xs text-center py-4">Complete episodes to generate data.</p>
               ) : (
                 sortedSkills.map(([skill, hours]) => (
                   <div key={skill}>
                     <div className="flex justify-between text-xs text-gray-300 mb-1">
                       <span>{skill}</span>
                       <span className="font-mono text-gray-500">{hours}h</span>
                     </div>
                     <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600" style={{width: `${Math.min(100, hours * 2)}%`}}></div>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </div>
        </div>
      </div>
    );
  };

  const HunterLicense = () => (
    <div className="min-h-screen bg-[#0f0f0f] p-6 flex flex-col items-center justify-center pb-32">
      <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
         
         {/* Holographic Effect Simulation */}
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

         <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-[10px] text-blue-400 font-black tracking-[0.2em] uppercase">Software Hunter</h2>
              <h1 className="text-3xl font-black text-white mt-1">AHMED</h1>
            </div>
            <div className="w-14 h-14 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-2xl shadow-inner">
               👨‍💻
            </div>
         </div>

         <div className="space-y-3 relative z-10">
            <div className="flex gap-3">
               <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                 <span className="text-[9px] text-gray-500 uppercase block font-bold">Rank</span>
                 <span className="text-white font-bold text-sm">{currentRank.name}</span>
               </div>
               <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                 <span className="text-[9px] text-gray-500 uppercase block font-bold">Class</span>
                 <span className="text-white font-bold text-sm">{currentRank.class}</span>
               </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded border border-white/10 flex justify-between items-center">
                 <div>
                    <span className="text-[9px] text-gray-500 uppercase block font-bold">Experience</span>
                    <span className="text-white font-mono text-sm">{progress.xp.toLocaleString()} XP</span>
                 </div>
                 <div className="text-yellow-500 flex gap-0.5 text-xs">
                    <Star size={12} fill="currentColor"/>
                    <Star size={12} fill="currentColor"/>
                    <Star size={12} fill="currentColor"/>
                 </div>
            </div>
         </div>

         <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-600 font-mono relative z-10">
            <span>ID: 99482390-OSSU</span>
            <span>VALID: PERMANENT</span>
         </div>
      </div>
      
      {/* Inventory */}
      <div className="w-full max-w-sm mt-8">
         <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Artifacts (Completed Projects)</h3>
         <div className="flex flex-wrap gap-2">
            {progress.inventory.length === 0 && <span className="text-gray-700 text-xs italic">No artifacts yet.</span>}
            {progress.inventory.map((item, i) => (
              <span key={i} className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-[10px] border border-purple-900/50">
                {item}
              </span>
            ))}
         </div>
      </div>
    </div>
  );

  if (ambush) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="bg-[#111] border-2 border-red-600/50 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
          <AlertTriangle className="text-red-600 mx-auto mb-4 animate-bounce" size={48} />
          <h2 className="text-2xl font-black text-white mb-2">AMBUSH!</h2>
          <p className="text-gray-400 mb-6 text-sm">Wild Interview Question Appeared!</p>
          
          <div className="bg-black p-6 rounded-xl mb-6 border border-gray-800">
             <h3 className="font-bold text-lg text-white">{ambush.q}</h3>
          </div>

          <div className="group mb-6 relative">
             <div className="absolute inset-0 bg-gray-800 rounded opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center cursor-help z-10">
                <p className="text-gray-500 text-xs">Hover/Tap to Reveal Answer</p>
             </div>
             <div className="h-24 flex items-center justify-center bg-gray-900 rounded border border-gray-700 p-4">
                <p className="text-green-400 font-mono text-sm">{ambush.a}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleAmbushResult(false)} className="bg-gray-800 py-3 rounded-lg font-bold text-sm hover:bg-gray-700 transition">Failed</button>
             <button onClick={() => handleAmbushResult(true)} className="bg-red-600 py-3 rounded-lg font-bold text-sm hover:bg-red-500 transition text-white">Defeated</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-600 selection:text-white pb-24 relative">
      <div className="w-full max-w-lg mx-auto min-h-screen bg-[#0f0f0f] shadow-2xl border-x border-gray-900/50">
        {view === 'dashboard' && <Dashboard />}
        {view === 'player' && <Player />}
        {view === 'license' && <HunterLicense />}
        {view === 'map' && <WorldMap />}
        {view === 'analytics' && <Analytics />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-gray-800 safe-area-pb">
        <div className="flex justify-around items-center p-3 max-w-lg mx-auto w-full te
