import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, CheckCircle, Map, Brain, Sword, 
  BarChart2, X, Clock, Calendar, ChevronRight, 
  AlertTriangle, RotateCcw, Filter
} from 'lucide-react';
import planData from './data';

// --- CONFIG ---
const RANKS = [
  { name: "E-Rank Hunter", minXP: 0, class: "Novice" },
  { name: "D-Rank Scripter", minXP: 5000, class: "Beginner" },
  { name: "C-Rank Coder", minXP: 20000, class: "Apprentice" },
  { name: "B-Rank Developer", minXP: 50000, class: "Professional" },
  { name: "A-Rank Engineer", minXP: 100000, class: "Expert" },
  { name: "S-Rank Architect", minXP: 200000, class: "Legend" }
];

// ربط المراحل بالمهارات للتحليل
const PHASE_SKILLS = {
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
  { q: "Define Big O Notation.", a: "Describes the performance or complexity of an algorithm." },
  { q: "What is a Closure?", a: "A function bundled with its lexical environment." },
  { q: "HTTP vs HTTPS?", a: "HTTPS uses TLS/SSL for encryption." },
  { q: "Explain Recursion.", a: "A function that calls itself until a base condition is met." }
];

const App = () => {
  // --- STATE ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_v3');
    return saved ? JSON.parse(saved) : { 
      completed: [], xp: 0, streak: 0, lastLogin: null, 
      focusHours: 0, inventory: [], ambushScore: { correct: 0, total: 0 }
    };
  });

  const [view, setView] = useState('dashboard');
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(1); // للتحكم في عرض المواسم
  const [ambush, setAmbush] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  // --- EFFECTS ---
  useEffect(() => {
    // 20% Chance of Ambush on login
    if (progress.lastLogin !== todayStr && Math.random() < 0.2) {
      setAmbush(AMBUSH_QUESTIONS[Math.floor(Math.random() * AMBUSH_QUESTIONS.length)]);
    }
  }, []);

  useEffect(() => {
    // تحديث الموسم المختار تلقائياً بناءً على "البطل"
    const hero = getHeroEpisode();
    if (hero) setSelectedPhase(hero.phaseId);
  }, []);

  // --- HELPERS ---
  const currentRank = RANKS.slice().reverse().find(r => progress.xp >= r.minXP) || RANKS[0];
  
  const getHeroEpisode = () => {
    return planData.find(ep => !progress.completed.includes(ep.date)) || planData[planData.length - 1];
  };
  const heroEpisode = getHeroEpisode();

  // حساب إحصائيات الموسم المختار
  const phaseStats = useMemo(() => {
    const episodes = planData.filter(e => e.phaseId === selectedPhase);
    const totalDays = episodes.length;
    const completedInPhase = episodes.filter(e => progress.completed.includes(e.date)).length;
    const totalHours = episodes.reduce((acc, curr) => acc + (curr.hoursPlanned || 0), 0);
    const weeks = Math.ceil(totalDays / 7);
    const months = (totalDays / 30).toFixed(1);
    
    return { episodes, totalDays, completedInPhase, totalHours, weeks, months };
  }, [selectedPhase, progress.completed]);

  // --- ACTIONS ---
  
  // دالة الإكمال والإلغاء (Toggle)
  const toggleEpisodeCompletion = (episode, actualFocusTime = 0) => {
    const isCompleted = progress.completed.includes(episode.date);
    let newCompleted = [...progress.completed];
    let newXP = progress.xp;
    let newInventory = [...progress.inventory];

    const xpValue = (episode.hoursPlanned * 100) + (actualFocusTime > 0 ? 50 : 0);

    if (isCompleted) {
      // Undo
      newCompleted = newCompleted.filter(d => d !== episode.date);
      newXP = Math.max(0, newXP - xpValue); // خصم النقاط
      if (episode.lessonTitle.includes("Project")) {
        newInventory = newInventory.filter(t => t !== episode.lessonTitle);
      }
    } else {
      // Complete
      newCompleted.push(episode.date);
      newXP += xpValue;
      if (episode.lessonTitle.includes("Project")) {
        newInventory.push(episode.lessonTitle);
      }
    }

    const newProgress = {
      ...progress,
      completed: newCompleted,
      xp: newXP,
      inventory: newInventory,
      lastLogin: todayStr
    };
    
    setProgress(newProgress);
    localStorage.setItem('codesaga_save_v3', JSON.stringify(newProgress));
    
    if (!isCompleted) setView('dashboard'); // الرجوع فقط عند الإكمال
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
    localStorage.setItem('codesaga_save_v3', JSON.stringify(newProgress));
    setAmbush(null);
  };

  // --- COMPONENT: DASHBOARD ---
  const Dashboard = () => {
    const phases = [...new Set(planData.map(p => p.phaseId))];

    return (
      <div className="pb-24">
        {/* Hero Section */}
        <div className="relative h-[50vh] flex flex-col justify-end p-6 bg-gradient-to-t from-[#141414] via-black/60 to-gray-900/40">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center -z-10 opacity-30" />
           
           <div className="z-10">
             <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider mb-2 inline-block">
               Continue Journey
             </span>
             <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">{heroEpisode.lessonTitle}</h1>
             <p className="text-gray-300 text-sm line-clamp-2 mb-4">{heroEpisode.dayGoal}</p>
             <button 
               onClick={() => { setActiveEpisode(heroEpisode); setView('player'); }}
               className="bg-white text-black px-6 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-200 transition w-fit"
             >
               <Play fill="black" size={18} /> Play Episode
             </button>
           </div>
        </div>

        {/* Phase Selector & Stats (حل مشكلة معرفة مدة المرحلة) */}
        <div className="sticky top-0 bg-[#141414]/95 backdrop-blur z-40 border-b border-gray-800">
          <div className="flex overflow-x-auto gap-2 p-4 scrollbar-hide">
            {phases.map(id => (
              <button
                key={id}
                onClick={() => setSelectedPhase(id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                  ${selectedPhase === id ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}
                `}
              >
                Season {id}
              </button>
            ))}
          </div>
          
          {/* Phase Stats Banner */}
          <div className="px-6 pb-4 flex justify-between items-center text-xs text-gray-400">
             <div className="flex gap-4">
                <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500"/> {phaseStats.totalHours} Hrs</span>
                <span className="flex items-center gap-1"><Calendar size={14} className="text-green-500"/> {phaseStats.weeks} Weeks</span>
             </div>
             <span className="text-white font-bold">{Math.round((phaseStats.completedInPhase / phaseStats.totalDays) * 100)}% Complete</span>
          </div>
        </div>

        {/* Episodes List (Filtered by Phase) */}
        <div className="p-4 grid gap-4">
           {phaseStats.episodes.map((ep, idx) => {
             const isDone = progress.completed.includes(ep.date);
             return (
               <div 
                 key={ep.date}
                 onClick={() => { setActiveEpisode(ep); setView('player'); }}
                 className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border border-gray-800
                    ${isDone ? 'bg-green-900/10 border-green-900/30' : 'bg-gray-900 hover:bg-gray-800'}
                 `}
               >
                 <div className="relative min-w-[80px] h-16 bg-black rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">EP {idx + 1}</span>
                    {isDone && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><CheckCircle className="text-green-500" size={24}/></div>}
                 </div>
                 <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${isDone ? 'text-gray-500' : 'text-white'}`}>{ep.lessonTitle}</h3>
                    <p className="text-[10px] text-gray-500">{ep.date}</p>
                 </div>
                 <ChevronRight size={16} className="text-gray-600"/>
               </div>
             )
           })}
        </div>
      </div>
    );
  };

  // --- COMPONENT: PLAYER (With Undo) ---
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
      <div className="min-h-screen bg-black p-6 pb-24 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setView('dashboard')} className="text-gray-400 text-sm">← Back</button>
           <span className="text-xs font-mono text-red-500">S{activeEpisode.phaseId} // {activeEpisode.date}</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black mb-4">{activeEpisode.lessonTitle}</h1>
        
        {/* Focus Dungeon */}
        <div className={`p-6 rounded-2xl border mb-8 text-center transition-all ${timerActive ? 'bg-red-900/10 border-red-600' : 'bg-gray-900 border-gray-800'}`}>
           <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2">Focus Dungeon</h3>
           <div className="text-6xl font-black font-mono mb-4">
             {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
           </div>
           <button 
             onClick={() => setTimerActive(!timerActive)}
             className={`px-6 py-2 rounded-full font-bold text-sm ${timerActive ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
           >
             {timerActive ? 'PAUSE' : 'START TIMER'}
           </button>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl mb-6">
           <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Info size={16}/> Objective</h3>
           <p className="text-sm text-gray-300 leading-relaxed">{activeEpisode.dayGoal}</p>
        </div>

        <div className="flex-1">
           <h3 className="font-bold text-gray-500 text-xs uppercase mb-3">Tasks</h3>
           <div className="space-y-2">
             {activeEpisode.tasks.map((t, i) => (
               <div key={i} className="flex gap-3 p-3 bg-gray-900/50 rounded border border-gray-800">
                 <div className="w-4 h-4 rounded-sm border border-gray-600 mt-1"></div>
                 <span className="text-sm text-gray-300">{t}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="mt-8 space-y-3">
           <a 
             href={activeEpisode.resourceURL} 
             target="_blank" 
             rel="noreferrer" 
             className="block w-full py-4 bg-white text-black font-bold text-center rounded-xl"
           >
             Open Resource
           </a>
           
           <button 
             onClick={() => toggleEpisodeCompletion(activeEpisode, (25*60 - timer)/60)}
             className={`block w-full py-4 font-bold text-center rounded-xl border-2 transition-all
               ${isCompleted 
                 ? 'bg-transparent border-red-600 text-red-500 hover:bg-red-600/10' 
                 : 'bg-green-600 border-green-600 text-white hover:bg-green-500'}
             `}
           >
             {isCompleted ? '✕ Undo Completion' : '✔ Mark Complete'}
           </button>
        </div>
      </div>
    );
  };

  // --- COMPONENT: WORLD MAP (Grid View) ---
  const WorldMap = () => (
    <div className="min-h-screen bg-[#0a0a0a] p-4 pb-24">
       <div className="flex justify-between items-center mb-6">
         <h2 className="font-bold text-xl flex items-center gap-2"><Map className="text-red-500"/> World Map</h2>
         <div className="text-xs text-gray-500">Total: {planData.length} Days</div>
       </div>

       <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
         <div className="grid grid-cols-7 gap-1">
           {planData.map((ep, i) => {
             const isDone = progress.completed.includes(ep.date);
             const isToday = ep.date === todayStr;
             const isRest = ep.hoursPlanned === 0;

             let color = "bg-gray-800";
             if (isDone) color = "bg-green-500";
             else if (isToday) color = "bg-white animate-pulse";
             else if (isRest) color = "bg-gray-700/30";

             return (
               <div 
                 key={i}
                 onClick={() => { setActiveEpisode(ep); setView('player'); }}
                 className={`aspect-square rounded-sm cursor-pointer ${color}`}
               />
             )
           })}
         </div>
       </div>
       <div className="mt-4 flex gap-4 justify-center text-[10px] text-gray-500 uppercase font-bold">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-sm"></div> Done</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white rounded-sm"></div> Current</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-800 rounded-sm"></div> Future</span>
       </div>
    </div>
  );

  // --- COMPONENT: ANALYTICS (Smart Analysis) ---
  const Analytics = () => {
    // حساب مهارات المستخدم بناءً على الحلقات المكتملة
    const userSkills = progress.completed.reduce((acc, date) => {
      const ep = planData.find(e => e.date === date);
      if (ep) {
        const skill = PHASE_SKILLS[ep.phaseId] || "General";
        acc[skill] = (acc[skill] || 0) + ep.hoursPlanned;
      }
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-black p-6 pb-24">
        <h1 className="text-3xl font-bold mb-6">Skill Analysis</h1>
        
        {/* Radar Chart Simulation (List Style) */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-gray-400 text-xs uppercase mb-4 font-bold">Skill Distribution (Hours)</h3>
          <div className="space-y-4">
            {Object.entries(userSkills).length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet. Complete episodes to analyze skills.</p>
            ) : (
              Object.entries(userSkills).map(([skill, hours]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{skill}</span>
                    <span className="text-white font-mono">{hours}h</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{width: `${Math.min(100, hours * 2)}%`}}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ambush Stats */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6">
           <h3 className="text-gray-400 text-xs uppercase mb-2 font-bold">Interview Readiness</h3>
           <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-white">
               {progress.ambushScore.total > 0 
                 ? Math.round((progress.ambushScore.correct / progress.ambushScore.total) * 100) 
                 : 0}%
             </span>
             <span className="text-gray-500 text-sm mb-1">Success Rate</span>
           </div>
           <p className="text-xs text-gray-500 mt-2">
             {progress.ambushScore.total < 5 ? "Not enough data." : "Keep solving Ambush questions!"}
           </p>
        </div>

        {/* Weakness Detector */}
        <div className="bg-red-900/10 p-6 rounded-xl border border-red-900/30">
          <h3 className="text-red-500 text-xs uppercase mb-2 font-bold flex items-center gap-2"><AlertTriangle size={14}/> Weak Points</h3>
          <p className="text-sm text-gray-300">
             {progress.xp < 5000 
               ? "You are just starting. Consistency is your biggest weakness right now." 
               : "Analysis requires more data. Keep pushing!"}
          </p>
        </div>
      </div>
    );
  };

  // --- COMPONENT: HUNTER LICENSE ---
  const HunterLicense = () => (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center pb-24">
      <div className="bg-gradient-to-br from-blue-900 to-black border border-blue-500/50 w-full max-w-sm rounded-xl p-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-20"><Database size={100} /></div>
         
         <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-sm text-blue-400 font-bold tracking-widest uppercase">Hunter License</h2>
              <h1 className="text-3xl font-black text-white mt-1">AHMED</h1>
            </div>
            <div className="w-16 h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-3xl">
               👨‍💻
            </div>
         </div>

         <div className="space-y-4 relative z-10">
            <div className="bg-black/40 p-3 rounded border border-white/10">
               <span className="text-[10px] text-gray-400 uppercase block">Current Rank</span>
               <span className="text-white font-bold text-lg">{currentRank.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-black/40 p-3 rounded border border-white/10">
                 <span className="text-[10px] text-gray-400 uppercase block">Class</span>
                 <span className="text-white font-bold">{currentRank.class}</span>
               </div>
               <div className="bg-black/40 p-3 rounded border border-white/10">
                 <span className="text-[10px] text-gray-400 uppercase block">XP</span>
                 <span className="text-white font-bold">{progress.xp.toLocaleString()}</span>
               </div>
            </div>
         </div>

         <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
            <div className="text-[10px] text-gray-500">ID: 99482390-OSSU</div>
            <div className="flex gap-1 text-yellow-500">★★★★★</div>
         </div>
      </div>
    </div>
  );

  // --- AMBUSH MODAL ---
  if (ambush) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-red-600 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2">AMBUSH!</h2>
          <p className="text-gray-400 mb-6 text-sm">Wild Interview Question Appeared!</p>
          
          <div className="bg-black p-6 rounded-lg mb-6 border border-gray-800">
             <h3 className="font-bold text-lg text-white">{ambush.q}</h3>
          </div>

          <div className="group mb-6">
             <p className="text-gray-500 text-xs mb-2">Hover/Tap to reveal answer</p>
             <div className="h-20 flex items-center justify-center bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-help">
                <p className="text-green-400 font-mono text-sm px-4">{ambush.a}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleAmbushResult(false)} className="bg-gray-700 py-3 rounded font-bold hover:bg-gray-600">Failed</button>
             <button onClick={() => handleAmbushResult(true)} className="bg-red-600 py-3 rounded font-bold hover:bg-red-500">Defeated</button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <main className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white pb-24 relative">
      <div className="w-full max-w-2xl mx-auto min-h-screen shadow-2xl bg-[#0f0f0f]">
        {view === 'dashboard' && <Dashboard />}
        {view === 'player' && <Player />}
        {view === 'license' && <HunterLicense />}
        {view === 'map' && <WorldMap />}
        {view === 'analytics' && <Analytics />}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-t border-gray-800">
        <div className="flex justify-around items-center p-3 max-w-md mx-auto w-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-red-500' : ''}`}>
             <Play size={20} /> Home
          </button>
          <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 ${view === 'map' ? 'text-red-500' : ''}`}>
             <Map size={20} /> Map
          </button>
          <button onClick={() => setView('license')} className={`flex flex-col items-center gap-1 ${view === 'license' ? 'text-red-500' : ''}`}>
             <CheckCircle size={20} /> License
          </button>
          <button onClick={() => setView('analytics')} className={`flex flex-col items-center gap-1 ${view === 'analytics' ? 'text-red-500' : ''}`}>
             <BarChart2 size={20} /> Stats
          </button>
        </div>
      </div>
    </main>
  );
};

export default App;
