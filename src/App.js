import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, CheckCircle, Info, Database, Trophy, Zap, 
  Map, Book, Brain, Shield, Clock, AlertTriangle, 
  ChevronRight, Sword, Lock, BarChart2, Calendar
} from 'lucide-react';
import planData from './data';

// --- GAME CONFIG & RANKS ---
const RANKS = [
  { name: "E-Rank Hunter (Noob)", minXP: 0, class: "Civilian" },
  { name: "D-Rank Scripter", minXP: 5000, class: "Script Kiddie" },
  { name: "C-Rank Coder", minXP: 15000, class: "Apprentice" },
  { name: "B-Rank Developer", minXP: 30000, class: "Junior Dev" },
  { name: "A-Rank Engineer", minXP: 60000, class: "Senior Dev" },
  { name: "S-Rank Architect", minXP: 100000, class: "Tech Lead" },
  { name: "Double Star Hunter", minXP: 200000, class: "CTO" }
];

const SKILLS_MAP = {
  1: "Math", 2: "CS Theory", 3: "Algorithms", 
  4: "C++", 5: "Python", 6: "Backend", 
  7: "Frontend", 8: "Fullstack", 9: "AI/ML", 
  10: "Specialization", 11: "Career"
};

const AMBUSH_QUESTIONS = [
  { q: "What is Big O Notation?", a: "Measure of algorithm efficiency." },
  { q: "Explain Recursion.", a: "A function calling itself until a base case." },
  { q: "HTTP vs HTTPS?", a: "HTTPS is encrypted using SSL/TLS." },
  { q: "What is a Promise in JS?", a: "Object representing completion/failure of async op." },
  { q: "Difference between TCP and UDP?", a: "TCP is reliable/ordered, UDP is fast/connectionless." }
];

const App = () => {
  // --- STATE ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('codesaga_save_ultimate');
    return saved ? JSON.parse(saved) : { 
      completed: [], xp: 0, streak: 0, lastLogin: null, 
      focusHours: 0, delayOffset: 0, 
      skills: { Math: 0, Coding: 0, CS: 0, Backend: 0, Frontend: 0 },
      inventory: [], ambushScore: { correct: 0, total: 0 },
      weeklyRetros: []
    };
  });

  const [view, setView] = useState('dashboard');
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [ambush, setAmbush] = useState(null);
  const [isDungeonActive, setIsDungeonActive] = useState(false);
  const [timer, setTimer] = useState(25 * 60); // 25 min pomodoro

  const todayStr = new Date().toISOString().split('T')[0];

  // --- STARTUP LOGIC (THE AMBUSH) ---
  useEffect(() => {
    // 30% chance of ambush on login if not done today
    if (progress.lastLogin !== todayStr && Math.random() < 0.3) {
      const randomQ = AMBUSH_QUESTIONS[Math.floor(Math.random() * AMBUSH_QUESTIONS.length)];
      setAmbush(randomQ);
    }
  }, []);

  // --- HELPERS ---
  const currentRank = RANKS.slice().reverse().find(r => progress.xp >= r.minXP) || RANKS[0];
  
  // Calculate next unwatched episode (respecting delay offset)
  const getHeroEpisode = () => {
    return planData.find(ep => !progress.completed.includes(ep.date)) || planData[planData.length - 1];
  };
  const heroEpisode = getHeroEpisode();

  // The Oracle Algorithm
  const calculateETA = () => {
    const totalHours = planData.reduce((acc, curr) => acc + (curr.hoursPlanned || 0), 0);
    const completedHours = progress.focusHours || 1; // Avoid division by zero
    const daysPassed = progress.completed.length || 1;
    
    const velocity = completedHours / daysPassed; // Hours per day actual
    const remainingHours = totalHours - (progress.xp / 100); // Rough estimate
    const daysLeft = remainingHours / (velocity || 1);
    
    const date = new Date();
    date.setDate(date.getDate() + daysLeft);
    return date.toDateString();
  };

  // --- ACTIONS ---
  const handleComplete = (date, plannedHours, actualFocusTime) => {
    if (progress.completed.includes(date)) return;

    // Calculate XP
    const baseXP = plannedHours * 100;
    const bonusXP = actualFocusTime > 0 ? 100 : 0;
    const totalXP = baseXP + bonusXP;

    // Update Skills based on Phase
    const episode = planData.find(e => e.date === date);
    const skillType = SKILLS_MAP[episode.phaseId] || "Coding";
    
    const newProgress = {
      ...progress,
      completed: [...progress.completed, date],
      xp: progress.xp + totalXP,
      focusHours: progress.focusHours + (actualFocusTime / 60),
      skills: {
        ...progress.skills,
        [skillType]: (progress.skills[skillType] || 0) + 10
      }
    };

    // Streak Logic
    if (newProgress.lastLogin !== todayStr) {
      newProgress.streak += 1;
      newProgress.lastLogin = todayStr;
    }

    // Check for Projects (Inventory)
    if (episode.lessonTitle.includes("Project") || episode.lessonTitle.includes("Capstone")) {
      newProgress.inventory.push(episode.lessonTitle);
    }

    setProgress(newProgress);
    localStorage.setItem('codesaga_save_ultimate', JSON.stringify(newProgress));
    setView('dashboard');
  };

  const handleTimeWarp = () => {
    const confirm = window.confirm("هل كنت مريضاً؟ سيتم ترحيل الجدول يومين للأمام.");
    if(confirm) {
      const newProgress = { ...progress, delayOffset: progress.delayOffset + 2 };
      setProgress(newProgress);
      localStorage.setItem('codesaga_save_ultimate', JSON.stringify(newProgress));
    }
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
    localStorage.setItem('codesaga_save_ultimate', JSON.stringify(newProgress));
    setAmbush(null);
  };

  // --- VIEWS COMPONENTS ---

  const Dashboard = () => (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] flex flex-col justify-end p-6 bg-gradient-to-t from-[#141414] via-black/50 to-gray-900/50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center -z-10 opacity-40" />
        
        <span className="text-red-500 font-bold tracking-widest text-xs uppercase mb-2">Next Mission</span>
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{heroEpisode.lessonTitle}</h1>
        <p className="text-gray-300 line-clamp-2 mb-6 max-w-xl">{heroEpisode.dayGoal}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => { setActiveEpisode(heroEpisode); setView('player'); }}
            className="bg-white text-black px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-200 transition"
          >
            <Play fill="black" size={20} /> Continue
          </button>
          <button onClick={() => setView('map')} className="bg-gray-700/80 text-white px-6 py-3 rounded font-bold hover:bg-gray-600 transition">
             World Map
          </button>
        </div>
      </div>

      {/* The Oracle Section */}
      <div className="p-6 bg-gray-900 border-y border-gray-800 flex justify-between items-center">
        <div>
           <h3 className="text-purple-400 font-bold text-sm uppercase flex items-center gap-2">
             <Brain size={16}/> The Oracle Prediction
           </h3>
           <p className="text-gray-400 text-xs mt-1">Based on your velocity</p>
        </div>
        <div className="text-right">
           <p className="text-2xl font-bold text-white">{calculateETA()}</p>
           <p className="text-xs text-gray-500">Estimated Completion</p>
        </div>
      </div>

      {/* Seasons */}
      <div className="p-6 space-y-8">
        {[...new Set(planData.map(p => p.phaseId))].map(phaseId => {
          const episodes = planData.filter(e => e.phaseId === phaseId);
          return (
            <div key={phaseId}>
              <h3 className="text-white font-bold mb-4 text-lg">Season {phaseId}: {episodes[0].phaseName}</h3>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {episodes.map((ep, idx) => {
                  const isDone = progress.completed.includes(ep.date);
                  return (
                    <div 
                      key={idx}
                      onClick={() => { setActiveEpisode(ep); setView('player'); }}
                      className={`min-w-[160px] h-[100px] rounded-lg relative cursor-pointer group transition-all
                        ${isDone ? 'opacity-50 grayscale' : 'hover:scale-105'}
                        bg-gray-800 border border-gray-700
                      `}
                    >
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                        <span className="text-xs font-bold text-gray-300">{ep.lessonTitle.substring(0,40)}...</span>
                      </div>
                      {isDone && <div className="absolute top-2 right-2 text-green-500"><CheckCircle size={16} /></div>}
                      <div className="absolute bottom-0 w-full h-1 bg-gray-700">
                        {isDone && <div className="h-full bg-red-600 w-full"></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const Player = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);

    useEffect(() => {
      let interval = null;
      if (timerRunning && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      } else if (timeLeft === 0) {
        setTimerRunning(false);
        // Play gong sound here
      }
      return () => clearInterval(interval);
    }, [timerRunning, timeLeft]);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
      <div className="min-h-screen bg-black text-white p-6">
        <button onClick={() => setView('dashboard')} className="mb-6 text-gray-400">← Back to Base</button>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{activeEpisode.lessonTitle}</h1>
            <p className="text-gray-400 mb-6">{activeEpisode.dayGoal}</p>
            
            {/* Focus Dungeon */}
            <div className={`p-6 rounded-xl border mb-6 text-center transition-colors ${timerRunning ? 'bg-red-900/20 border-red-500' : 'bg-gray-900 border-gray-700'}`}>
              <h3 className="text-xl font-bold mb-4 flex justify-center items-center gap-2">
                <Sword size={24} /> Focus Dungeon
              </h3>
              <div className="text-5xl font-mono font-black mb-6">{formatTime(timeLeft)}</div>
              <button 
                onClick={() => setTimerRunning(!timerRunning)}
                className={`px-8 py-2 rounded-full font-bold ${timerRunning ? 'bg-red-600' : 'bg-green-600'}`}
              >
                {timerRunning ? 'PAUSE' : 'ENTER DUNGEON'}
              </button>
              <p className="text-xs text-gray-500 mt-4">Gain Bonus XP by focusing.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-400">Quest Log:</h3>
              {activeEpisode.tasks.map((t, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-800 rounded">
                  <div className="mt-1"><div className="w-4 h-4 border border-gray-500 rounded-sm"></div></div>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
             <div className="bg-yellow-900/20 p-4 rounded border border-yellow-700/50 mb-6">
               <span className="text-yellow-500 font-bold block mb-1">CLIFFHANGER (Stop Here):</span>
               <p className="text-sm text-gray-300">{activeEpisode.stopPoint || "Complete the unit."}</p>
             </div>
             
             <a href={activeEpisode.resourceURL} target="_blank" className="w-full bg-white text-black font-bold py-3 rounded text-center mb-3">
               Open Resources
             </a>
             <button 
               onClick={() => handleComplete(activeEpisode.date, activeEpisode.hoursPlanned, (25*60 - timeLeft)/60)}
               className="w-full bg-green-600 text-white font-bold py-4 rounded text-center"
             >
               Mission Complete
             </button>
          </div>
        </div>
      </div>
    );
  };

  const HunterLicense = () => (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-black text-white mb-8">HUNTER LICENSE</h2>
      
      {/* Flip Card Container */}
      <div className="flip-card w-full max-w-sm h-96">
        <div className="flip-card-inner">
          
          {/* FRONT */}
          <div className="flip-card-front bg-gradient-to-br from-blue-900 to-black border-2 border-blue-500 rounded-xl p-6 flex flex-col justify-between shadow-2xl shadow-blue-900/50">
            <div className="flex justify-between items-start">
               <div className="text-left">
                  <h3 className="text-3xl font-black text-white">AHMED</h3>
                  <p className="text-blue-400 font-mono text-sm uppercase">{currentRank.name}</p>
               </div>
               <div className="w-16 h-16 bg-gray-700 rounded-full border-2 border-white">
                  {/* Placeholder for Avatar */}
                  <div className="w-full h-full flex items-center justify-center text-2xl">👨‍💻</div>
               </div>
            </div>
            
            <div className="text-left space-y-2">
               <div className="bg-black/30 p-2 rounded">
                 <span className="text-gray-400 text-xs block">CLASS</span>
                 <span className="text-white font-bold">{currentRank.class}</span>
               </div>
               <div className="bg-black/30 p-2 rounded">
                 <span className="text-gray-400 text-xs block">SPECIAL ABILITY</span>
                 <span className="text-white font-bold">Copy/Paste Jutsu</span>
               </div>
            </div>

            <div className="flex justify-between items-end">
               <div className="text-left">
                  <span className="text-6xl font-black text-white/10 absolute bottom-4 left-4">OSSU</span>
                  <span className="relative text-white font-mono">{progress.xp} XP</span>
               </div>
               <div className="flex gap-1">
                 {[...Array(Math.min(5, progress.inventory.length))].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                 ))}
               </div>
            </div>
          </div>

          {/* BACK */}
          <div className="flip-card-back bg-gray-800 border-2 border-gray-600 rounded-xl p-6 flex flex-col justify-center">
             <h3 className="text-xl font-bold mb-4 text-gray-300">Skill Matrix</h3>
             <div className="space-y-3">
               {Object.entries(progress.skills).map(([skill, val]) => (
                 <div key={skill}>
                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                     <span>{skill}</span>
                     <span>{val} pts</span>
                   </div>
                   <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500" style={{width: `${Math.min(100, val)}%`}}></div>
                   </div>
                 </div>
               ))}
             </div>
             <p className="mt-6 text-xs text-gray-500 italic">"Job prospects: Currently eligible to center divs."</p>
          </div>

        </div>
      </div>
      
      <p className="text-gray-500 mt-8 text-sm">Tap card to flip for stats</p>
      <button onClick={() => setView('dashboard')} className="mt-4 text-white underline">Back</button>
    </div>
  );

  const Analytics = () => {
    const successRate = Math.round((progress.ambushScore.correct / (progress.ambushScore.total || 1)) * 100);
    
    return (
      <div className="min-h-screen bg-black p-6">
        <button onClick={() => setView('dashboard')} className="mb-6 text-gray-400">← Back</button>
        <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>

        <div className="grid gap-6">
           <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
             <h3 className="text-gray-400 text-sm uppercase mb-2">Ambush Survival Rate</h3>
             <div className="text-4xl font-bold text-white mb-2">{successRate}%</div>
             <p className="text-xs text-gray-500">Based on random interview questions.</p>
             {successRate < 50 && <p className="text-red-500 text-sm mt-2">⚠️ You need to review basic concepts!</p>}
           </div>

           <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
             <h3 className="text-gray-400 text-sm uppercase mb-2">Inventory (Projects)</h3>
             <div className="flex flex-wrap gap-2">
                {progress.inventory.length === 0 && <span className="text-gray-600 italic">No artifacts found. Go code something!</span>}
                {progress.inventory.map((item, i) => (
                  <span key={i} className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-800">{item}</span>
                ))}
             </div>
           </div>

           <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
             <h3 className="text-gray-400 text-sm uppercase mb-2">The Oracle Advice</h3>
             <div className="text-gray-300 text-sm leading-relaxed">
               {progress.xp < 10000 
                  ? "You are still a Novice. Focus on consistency rather than speed. Don't skip the Math!" 
                  : "You are gaining momentum. Check your Skill Matrix on your License to see weak points."}
             </div>
           </div>
        </div>
      </div>
    );
  };

  const WorldMap = () => (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
       <div className="flex justify-between items-center mb-6">
         <button onClick={() => setView('dashboard')} className="text-gray-400">← Exit Map</button>
         <h2 className="font-bold text-xl">World Map</h2>
       </div>

       {/* Heatmap Simulation */}
       <div className="bg-gray-900 p-4 rounded-lg mb-8 overflow-x-auto">
         <h3 className="text-xs font-bold text-gray-500 mb-2">ACTIVITY LOG</h3>
         <div className="flex gap-1 min-w-max">
           {[...Array(30)].map((_, i) => (
             <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.7 ? 'bg-green-600' : 'bg-gray-800'}`}></div>
           ))}
         </div>
       </div>

       {/* Time Warp */}
       <div className="bg-red-900/20 border border-red-900 p-4 rounded-lg mb-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-red-500">Reality Shift</h3>
            <p className="text-xs text-gray-400">Missed days? Shift timeline.</p>
          </div>
          <button onClick={handleTimeWarp} className="bg-red-600 text-white px-4 py-2 rounded text-xs font-bold">
            Activate
          </button>
       </div>

       {/* Full List */}
       <div className="space-y-4">
         {planData.map((ep, i) => {
           const isDone = progress.completed.includes(ep.date);
           return (
             <div key={i} className={`flex items-center gap-4 p-3 rounded ${isDone ? 'bg-gray-900 opacity-50' : 'bg-gray-800'}`}>
                <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <div className="flex-1">
                   <h4 className="text-sm font-bold">{ep.lessonTitle}</h4>
                   <span className="text-xs text-gray-500">{ep.phaseName}</span>
                </div>
             </div>
           )
         })}
       </div>
    </div>
  );

  // --- AMBUSH MODAL ---
  if (ambush) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6">
        <div className="bg-gray-900 border-2 border-red-600 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2">AMBUSH!</h2>
          <p className="text-gray-400 mb-6 text-sm">Wild Interview Question Appeared!</p>
          
          <div className="bg-black p-6 rounded-lg mb-6 border border-gray-800">
             <h3 className="font-bold text-lg text-white">{ambush.q}</h3>
          </div>

          <div className="group">
             <p className="text-gray-500 text-xs mb-2">Hover/Tap to reveal answer</p>
             <div className="h-20 flex items-center justify-center bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-help">
                <p className="text-green-400 font-mono text-sm px-4">{ambush.a}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
             <button onClick={() => handleAmbushResult(false)} className="bg-gray-700 py-3 rounded font-bold hover:bg-gray-600">Failed</button>
             <button onClick={() => handleAmbushResult(true)} className="bg-red-600 py-3 rounded font-bold hover:bg-red-500">Defeated</button>
          </div>
        </div>
      </div>
    );
  }

  // --- ROUTING ---
  return (
    <>
      {/* Navigation Bar (Mobile) */}
      <div className="fixed bottom-0 w-full bg-black border-t border-gray-800 flex justify-around p-3 z-50 text-xs font-bold text-gray-500">
        <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'text-red-500' : ''} flex flex-col items-center`}>
           <Play size={20} /> Home
        </button>
        <button onClick={() => setView('map')} className={`${view === 'map' ? 'text-red-500' : ''} flex flex-col items-center`}>
           <Map size={20} /> Map
        </button>
        <button onClick={() => setView('license')} className={`${view === 'license' ? 'text-red-500' : ''} flex flex-col items-center`}>
           <CheckCircle size={20} /> License
        </button>
        <button onClick={() => setView('analytics')} className={`${view === 'analytics' ? 'text-red-500' : ''} flex flex-col items-center`}>
           <BarChart2 size={20} /> Stats
        </button>
      </div>

      {view === 'dashboard' && <Dashboard />}
      {view === 'player' && <Player />}
      {view === 'license' && <HunterLicense />}
      {view === 'map' && <WorldMap />}
      {view === 'analytics' && <Analytics />}
    </>
  );
};

export default App;
