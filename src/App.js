import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, CheckCircle, Info, Database, Trophy, Zap, 
  Map, Brain, Sword, BarChart2, Clock, Calendar, 
  X, AlertTriangle, ChevronRight, RotateCcw, Filter, Star, Shield
} from 'lucide-react';

import rawData from './data'; 

// --- DATA NORMALIZER ---
const normalizeData = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const potentialArray = data.schedule || data.days || data.episodes || data.plan || data.data;
    if (Array.isArray(potentialArray)) return potentialArray;
  }
  return [];
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

const PHASE_SKILLS = {
  1: "Math & Logic", 2: "CS Fundamentals", 3: "Programming Basics",
  4: "C++ Mastery", 5: "Python Scripting", 6: "Backend Engineering",
  7: "Frontend & UX", 8: "Fullstack Scaling", 9: "AI & Data Science",
  10: "Specialization", 11: "Career Prep"
};

const AMBUSH_QUESTIONS = [
  { q: "Define Big O Notation.", a: "Measure of algorithm efficiency." },
  { q: "What is a Closure?", a: "Function bundled with lexical environment." },
  { q: "HTTP vs HTTPS?", a: "HTTPS is encrypted via TLS/SSL." },
  { q: "Explain Recursion.", a: "Function calls itself until base condition." }
];

const App = () => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_v5');
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

  useEffect(() => {
    if (progress.lastLogin !== todayStr && Math.random() < 0.25) {
      setAmbush(AMBUSH_QUESTIONS[Math.floor(Math.random() * AMBUSH_QUESTIONS.length)]);
    }
  }, []);

  const getHeroEpisode = () => {
    if (!planData || planData.length === 0) return null;
    return planData.find(ep => !progress.completed.includes(ep.date)) || planData[planData.length - 1];
  };
  const heroEpisode = getHeroEpisode();

  useEffect(() => {
    if (heroEpisode) setSelectedPhase(heroEpisode.phaseId);
  }, []);

  const currentRank = RANKS.slice().reverse().find(r => progress.xp >= r.minXP) || RANKS[0];

  const phaseStats = useMemo(() => {
    if (!planData || planData.length === 0) return { episodes: [], totalHours: 0, weeks: 0, completedInPhase: 0, totalDays: 0 };
    const episodes = planData.filter(e => e.phaseId === selectedPhase);
    const totalDays = episodes.length;
    const completedInPhase = episodes.filter(e => progress.completed.includes(e.date)).length;
    const totalHours = episodes.reduce((acc, curr) => acc + (curr.hoursPlanned || 0), 0);
    const weeks = Math.ceil(totalDays / 7);
    return { episodes, totalDays, completedInPhase, totalHours, weeks };
  }, [selectedPhase, progress.completed]);

  const calculateETA = () => {
    if (!planData || planData.length === 0) return "Loading...";
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

  const toggleEpisodeCompletion = (episode, actualFocusTime = 0) => {
    const isCompleted = progress.completed.includes(episode.date);
    let newCompleted = [...progress.completed];
    let newXP = progress.xp;
    let newInventory = [...progress.inventory];
    let newFocus = progress.focusHours;
    const xpValue = (episode.hoursPlanned * 100) + (actualFocusTime > 0 ? 50 : 0);

    if (isCompleted) {
      newCompleted = newCompleted.filter(d => d !== episode.date);
      newXP = Math.max(0, newXP - xpValue);
      if (episode.lessonTitle && episode.lessonTitle.includes("Project")) {
        newInventory = newInventory.filter(t => t !== episode.lessonTitle);
      }
    } else {
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
       // logic for streak could go here
    }

    setProgress(newProgress);
    localStorage.setItem('codesaga_save_v5', JSON.stringify(newProgress));
    if (!isCompleted) setView('dashboard');
  };

  const handleTimeWarp = () => {
    if(window.confirm("Shift Timeline?")) alert("Timeline Shifted!");
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
    localStorage.setItem('codesaga_save_v5', JSON.stringify(newProgress));
    setAmbush(null);
  };

  // --- VIEWS ---
  const Dashboard = () => {
    if (!planData || planData.length === 0) return <div className="p-10 text-center text-gray-500">Loading Data...</div>;
    const phases = [...new Set(planData.map(p => p.phaseId))].sort((a,b) => a-b);
    
    return (
      <div className="pb-24">
        <div className="relative h-[45vh] flex flex-col justify-end p-6 bg-gradient-to-t from-[#141414] via-black/60 to-gray-900/40">
           <div className="absolute inset-0 bg-gray-900 opacity-20 -z-10" />
           <div className="z-10">
             <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider mb-2 inline-block">Next Mission</span>
             <h1 className="text-2xl md:text-5xl font-black mb-2 leading-tight text-white">
               {heroEpisode ? heroEpisode.lessonTitle : "All Caught Up!"}
             </h1>
             <p className="text-gray-300 text-sm line-clamp-2 mb-4">
               {heroEpisode ? heroEpisode.dayGoal : "Wait for new content..."}
             </p>
             {heroEpisode && (
               <button onClick={() => { setActiveEpisode(heroEpisode); setView('player'); }} className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition w-fit">
                 <Play fill="black" size={18} /> Play Episode
               </button>
             )}
           </div>
        </div>

        <div className="p-4 bg-gray-900 border-y border-gray-800 flex justify-between items-center">
          <div>
             <h3 className="text-purple-400 font-bold text-sm uppercase flex items-center gap-2"><Brain size={16}/> Oracle Prediction</h3>
             <p className="text-gray-400 text-xs mt-1">Based on velocity</p>
          </div>
          <div className="text-right">
             <p className="text-lg font-bold text-white">{calculateETA()}</p>
             <p className="text-xs text-gray-400">Estimated Finish</p>
          </div>
        </div>

        <div className="sticky top-0 bg-[#141414]/95 backdrop-blur z-30 pt-4 pb-2 border-b border-gray-800">
          <div className="flex overflow-x-auto gap-2 px-4 pb-2 scrollbar-hide">
            {phases.map(id => (
              <button key={id} onClick={() => setSelectedPhase(id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${selectedPhase === id ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700'}`}>Season {id}</button>
            ))}
          </div>
          <div className="px-6 pb-2 pt-2 flex justify-between items-center text-xs text-gray-400">
             <div className="flex gap-4">
                <span className="flex items-center gap-1"><Clock size={14} className="text-blue-500"/> {phaseStats.totalHours}h</span>
                <span className="flex items-center gap-1"><Calendar size={14} className="text-green-500"/> {phaseStats.weeks}w</span>
             </div>
             <span className="text-white font-bold">{phaseStats.totalDays > 0 ? Math.round((phaseStats.completedInPhase / phaseStats.totalDays) * 100) : 0}% Done</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
           {phaseStats.episodes.map((ep, idx) => {
             const isDone = progress.completed.includes(ep.date);
             return (
               <div key={ep.date} onClick={() => { setActiveEpisode(ep); setView('player'); }} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${isDone ? 'bg-green-900/5 border-green-900/20' : 'bg-[#1f1f1f] border-[#2a2a2a]'}`}>
                 <div className={`relative min-w-[50px] h-[50px] rounded flex items-center justify-center border ${isDone ? 'bg-green-900/20 border-green-900/50 text-green-500' : 'bg-black border-gray-700 text-gray-500'}`}>
                    {isDone ? <CheckCircle size={20}/> : <span className="text-xs font-bold">{idx + 1}</span>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${isDone ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{ep.lessonTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 bg-black px-1.5 py-0.5 rounded border border-gray-800">{ep.date}</span>
                      {ep.hoursPlanned === 0 && <span className="text-[10px] text-yellow-600 font-bold">REST</span>}
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
      <div className="min-h-screen bg-black p-6 pb-24 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setView('dashboard')} className="text-gray-400 text-sm hover:text-white flex items-center gap-1"><ChevronRight className="rotate-180" size={16}/> Back</button>
           <span className="text-[10px] font-mono text-red-500 border border-red-900/50 px-2 py-1 rounded bg-red-900/10">S{activeEpisode.phaseId}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black mb-2 text-white">{activeEpisode.lessonTitle}</h1>
        <div className={`p-6 rounded-2xl border mb-6 text-center transition-all ${timerActive ? 'bg-red-900/10 border-red-600' : 'bg-gray-900 border-gray-800'}`}>
           <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Focus Dungeon</h3>
           <div className="text-5xl font-black font-mono mb-4 tracking-tighter text-white">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</div>
           <button onClick={() => setTimerActive(!timerActive)} className={`px-8 py-2 rounded-full font-bold text-xs tracking-wider ${timerActive ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{timerActive ? 'PAUSE' : 'ENTER DUNGEON'}</button>
        </div>
        <div className="bg-[#111] p-5 rounded-xl mb-6 border border-gray-800">
           <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm"><Info size={16} className="text-blue-500"/> Objective</h3>
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
        <div className="mt-auto space-y-3">
           <div className="bg-yellow-900/10 border border-yellow-800/30 p-3 rounded text-xs text-yellow-600 text-center mb-2">🛑 Stop Point: {activeEpisode.stopPoint || "Complete all tasks."}</div>
           {activeEpisode.resourceURL && <a href={activeEpisode.resourceURL} target="_blank" rel="noreferrer" className="block w-full py-3 bg-white text-black font-bold text-center rounded-lg text-sm hover:bg-gray-200">Open Resource</a>}
           <button onClick={() => toggleEpisodeCompletion(activeEpisode, (25*60 - timer)/60)} className={`block w-full py-3 font-bold text-center rounded-lg border transition-all text-sm flex items-center justify-center gap-2 ${isCompleted ? 'bg-transparent border-red-900 text-red-500' : 'bg-green-600 border-green-600 text-white'}`}>
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
       <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
         <div className="grid grid-cols-7 gap-1">
           {planData.map((ep, i) => {
             const isDone = progress.completed.includes(ep.date);
             const isToday = ep.date === todayStr;
             let bg = "bg-gray-800";
             if (isDone) bg = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]";
             else if (isToday) bg = "bg-white animate-pulse z-10 scale-110";
             else if (ep.hoursPlanned === 0) bg = "bg-gray-800/30";
             return <div key={i} onClick={() => { setActiveEpisode(ep); setView('player'); }} className={`aspect-square rounded-[2px] cursor-pointer transition-all hover:scale-150 hover:z-20 hover:border hover:border-white relative group ${bg}`}></div>
           })}
         </div>
       </div>
       <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl mt-8 flex justify-between items-center">
          <div><h3 className="font-bold text-red-500 text-sm">Reality Shift</h3><p className="text-[10px] text-gray-400">Shift timeline.</p></div>
          <button onClick={handleTimeWarp} className="bg-red-600/80 text-white px-4 py-2 rounded-lg text-xs font-bold">Activate</button>
       </div>
    </div>
  );

  const Analytics = () => {
    const successRate = Math.round((progress.ambushScore.correct / (progress.ambushScore.total || 1)) * 100);
    const userSkills = progress.completed.reduce((acc, date) => {
      const ep = planData.find(e => e.date === date);
      if (ep) {
        const skillName = PHASE_SKILLS[ep.phaseId] || "General";
        acc[skillName] = (acc[skillName] || 0) + (ep.hoursPlanned || 0);
      }
      return acc;
    }, {});
    const sortedSkills = Object.entries(userSkills).sort((a,b) => b[1] - a[1]);
    const topSkill = sortedSkills[0];

    return (
      <div className="min-h-screen bg-black p-6 pb-32">
        <h1 className="text-3xl font-black mb-8 text-white">Analytics</h1>
        <div className="grid gap-4">
           <div className="bg-[#111] p-5 rounded-xl border border-gray-800 flex justify-between items-center">
             <div><h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Ambush Survival</h3><div className="text-3xl font-black text-white">{successRate}%</div></div>
             <div className="bg-gray-800 p-3 rounded-full"><Shield size={24} className={successRate > 50 ? "text-green-500" : "text-red-500"}/></div>
           </div>
           <div className="bg-green-900/10 p-4 rounded-xl border border-green-900/30">
              <h3 className="text-green-500 text-[10px] uppercase font-bold mb-1">Strongest Skill</h3>
              <p className="text-white font-bold text-sm">{topSkill ? topSkill[0] : "None"}</p>
           </div>
           <div className="bg-[#111] p-5 rounded-xl border border-gray-800 mt-2">
             <h3 className="text-gray-400 text-xs uppercase mb-4 font-bold flex items-center gap-2"><BarChart2 size={14}/> Skill Distribution (Hours)</h3>
             <div className="space-y-4">
               {sortedSkills.map(([skill, hours]) => (
                 <div key={skill}>
                   <div className="flex justify-between text-xs text-gray-300 mb-1"><span>{skill}</span><span className="font-mono text-gray-500">{hours}h</span></div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{width: `${Math.min(100, hours * 2)}%`}}></div></div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  };

  const HunterLicense = () => (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center pb-24">
      <div className="bg-gradient-to-br from-blue-900 to-black border border-blue-500/50 w-full max-w-sm rounded-xl p-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-20"><Database size={100} /></div>
         <div className="flex justify-between items-start mb-8">
            <div><h2 className="text-sm text-blue-400 font-bold tracking-widest uppercase">Hunter License</h2><h1 className="text-3xl font-black text-white mt-1">AHMED</h1></div>
            <div className="w-16 h-16 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center text-3xl">👨‍💻</div>
         </div>
         <div className="space-y-4 relative z-10">
            <div className="bg-black/40 p-3 rounded border border-white/10"><span className="text-[10px] text-gray-400 uppercase block">Current Rank</span><span className="text-white font-bold text-lg">{currentRank.name}</span></div>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-black/40 p-3 rounded border border-white/10"><span className="text-[10px] text-gray-400 uppercase block">Class</span><span className="text-white font-bold">{currentRank.class}</span></div>
               <div className="bg-black/40 p-3 rounded border border-white/10"><span className="text-[10px] text-gray-400 uppercase block">XP</span><span className="text-white font-bold">{progress.xp.toLocaleString()}</span></div>
            </div>
         </div>
         <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center"><div className="text-[10px] text-gray-500">ID: 99482390-OSSU</div><div className="flex gap-1 text-yellow-500">★★★★★</div></div>
      </div>
      <div className="w-full max-w-sm mt-8"><h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Artifacts</h3><div className="flex flex-wrap gap-2">{progress.inventory.map((item, i) => <span key={i} className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-[10px] border border-purple-900/50">{item}</span>)}</div></div>
    </div>
  );

  if (ambush) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-red-600 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2">AMBUSH!</h2>
          <div className="bg-black p-6 rounded-lg mb-6 border border-gray-800"><h3 className="font-bold text-lg text-white">{ambush.q}</h3></div>
          <div className="group mb-6"><p className="text-gray-500 text-xs mb-2">Hover/Tap to reveal answer</p><div className="h-20 flex items-center justify-center bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-help"><p className="text-green-400 font-mono text-sm px-4">{ambush.a}</p></div></div>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleAmbushResult(false)} className="bg-gray-700 py-3 rounded font-bold hover:bg-gray-600">Failed</button>
             <button onClick={() => handleAmbushResult(true)} className="bg-red-600 py-3 rounded font-bold hover:bg-red-500">Defeated</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white pb-24 relative">
      <div className="w-full max-w-2xl mx-auto min-h-screen shadow-2xl bg-[#0f0f0f]">
        {view === 'dashboard' && <Dashboard />}
        {view === 'player' && <Player />}
        {view === 'license' && <HunterLicense />}
        {view === 'map' && <WorldMap />}
        {view === 'analytics' && <Analytics />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-t border-gray-800">
        <div className="flex justify-around items-center p-3 max-w-md mx-auto w-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-red-500' : ''}`}><Play size={20} /> Home</button>
          <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 ${view === 'map' ? 'text-red-500' : ''}`}><Map size={20} /> Map</button>
          <button onClick={() => setView('license')} className={`flex flex-col items-center gap-1 ${view === 'license' ? 'text-red-500' : ''}`}><CheckCircle size={20} /> License</button>
          <button onClick={() => setView('analytics')} className={`flex flex-col items-center gap-1 ${view === 'analytics' ? 'text-red-500' : ''}`}><BarChart2 size={20} /> Stats</button>
        </div>
      </div>
    </main>
  );
};

export default App;
