import React, { useState, useEffect, useMemo } from 'react';
import planData from './plan.json';
import addonsData from './holberton_addons.json';

// Components
import Roadmap from './components/Roadmap';
import ActiveMission from './components/ActiveMission';
import HunterLicense from './components/HunterLicense';
import TheOracle from './components/TheOracle';
import Navigation from './components/Navigation';
import SideTracks from './components/SideTracks';

function App() {
  // --- STATE ---
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('batman_view');
    const validViews = ['roadmap', 'mission', 'license', 'oracle', 'ops'];
    if (!saved || !validViews.includes(saved)) return 'roadmap';
    return saved;
  });
  
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('batman_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDayId, setSelectedDayId] = useState(() => {
    return localStorage.getItem('batman_selected_day_id') || null;
  });

  const [startDate] = useState(() => {
    const saved = localStorage.getItem('batman_start_date');
    if (saved) return new Date(saved);
    const now = new Date();
    localStorage.setItem('batman_start_date', now.toISOString());
    return now;
  });

  // --- FEATURE 1: COMBO STREAK LOGIC ---
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const lastVisit = localStorage.getItem('batman_last_visit');
    const savedStreak = parseInt(localStorage.getItem('batman_streak') || '0');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
            const newStreak = savedStreak + 1;
            setStreak(newStreak);
            localStorage.setItem('batman_streak', newStreak);
        } else {
            setStreak(1);
            localStorage.setItem('batman_streak', 1);
        }
        localStorage.setItem('batman_last_visit', today);
    } else {
        setStreak(savedStreak);
    }
  }, []);

  // --- DATA PROCESSING ---
  const phasesOrder = [1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11]; 
  const organizedData = useMemo(() => {
    let globalCounter = 0;
    const result = [];
    const processPhase = (pid) => {
      const phase = planData.phases.find(p => p.id === pid);
      if (!phase) return;
      const days = planData.days
        .filter(d => d.phaseId === pid)
        .map(d => ({
          ...d,
          uniqueId: `day_${globalCounter}`,
          dayNumber: globalCounter + 1, 
          globalId: globalCounter++,
          isBoss: d.lessonTitle.toLowerCase().includes("project") || d.lessonTitle.toLowerCase().includes("capstone"),
          hoursPlanned: d.hoursPlanned || 4 
        }));
      if (days.length > 0) result.push({ ...phase, days });
    };
    phasesOrder.forEach(pid => processPhase(pid));
    planData.phases.forEach(p => { if (!phasesOrder.includes(p.id)) processPhase(p.id); });
    return result;
  }, []);

  // --- FEATURE 3: FLASHBACK BATTLES ---
  // Pick a random completed mission to highlight for review
  const flashbackDayId = useMemo(() => {
    if (completedDays.length < 5) return null;
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % completedDays.length;
    return completedDays[index];
  }, [completedDays]);

  // --- FEATURE 4: SKILL HEXAGON CALCULATOR ---
  const skillStats = useMemo(() => {
    let stats = { "Low Lvl": 10, "Scripting": 10, "DevOps": 10, "Frontend": 10, "Backend": 10, "Algo": 10 };

    const completedPhaseIds = new Set();
    organizedData.forEach(phase => {
        const days = phase.days.map(d => d.uniqueId);
        const doneCount = days.filter(d => completedDays.includes(d)).length;
        if (days.length > 0 && doneCount >= days.length / 2) completedPhaseIds.add(phase.id);
    });

    if (completedPhaseIds.has(1)) { stats["DevOps"] += 20; stats["Low Lvl"] += 10; } // Shell
    if (completedPhaseIds.has(2)) { stats["DevOps"] += 15; } // Vim
    if (completedPhaseIds.has(3)) { stats["Low Lvl"] += 30; stats["Algo"] += 15; } // C
    if (completedPhaseIds.has(4)) { stats["Scripting"] += 25; stats["Backend"] += 10; } // Python
    if (completedPhaseIds.has(7)) { stats["Frontend"] += 40; } // Frontend
    if (completedPhaseIds.has(8)) { stats["Backend"] += 30; } // Backend
    
    // Cap at 100
    Object.keys(stats).forEach(k => { if(stats[k] > 100) stats[k] = 100; });
    
    return stats;
  }, [completedDays, organizedData]);


  // --- HELPERS ---
  const getSelectedDayObject = () => {
    if (!selectedDayId) return null;
    for (const phase of organizedData) {
      const found = phase.days.find(d => d.uniqueId === selectedDayId);
      if (found) return { ...found, phaseName: phase.name };
    }
    return null;
  };
  const selectedDayObj = getSelectedDayObject();

  const handleComplete = (id) => {
    if (!completedDays.includes(id)) {
      const newCompleted = [...completedDays, id];
      setCompletedDays(newCompleted);
      localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
    }
    setView('roadmap');
  };

  const toggleDayCompletion = (id) => {
    let newCompleted;
    if (completedDays.includes(id)) {
      newCompleted = completedDays.filter(dayId => dayId !== id);
    } else {
      newCompleted = [...completedDays, id];
    }
    setCompletedDays(newCompleted);
    localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
  };

  const handleRevokePhase = (phaseId) => {
    if (window.confirm(`⚠️ WARNING: Reset Phase ${phaseId}?`)) {
        const phase = organizedData.find(p => p.id === phaseId);
        if (!phase) return;
        const phaseDayIds = phase.days.map(d => d.uniqueId);
        const newCompleted = completedDays.filter(id => !phaseDayIds.includes(id));
        setCompletedDays(newCompleted);
        localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
    }
  };

  const handleResetSystem = () => {
    if (window.confirm("⚠️ SECURITY ALERT: FACTORY RESET INITIATED?")) {
      setCompletedDays([]);
      localStorage.removeItem('batman_completed');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-[#8a0000] selection:text-white">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <main className="relative z-10 h-screen overflow-y-auto pb-24 scrollbar-hide px-4 md:px-8 pt-6">
        
        {view === 'roadmap' && (
          <Roadmap 
            data={organizedData} 
            completedDays={completedDays}
            onSelectDay={(day) => { setSelectedDayId(day.uniqueId); setView('mission'); }}
            onRevokePhase={handleRevokePhase}
            flashbackDayId={flashbackDayId} // Passed down
          />
        )}

        {view === 'ops' && (
           <SideTracks 
             addons={addonsData} 
             organizedData={organizedData}
             completedDays={completedDays}
           />
        )}

        {view === 'license' && (
          <HunterLicense 
            completedDays={completedDays} 
            organizedData={organizedData}
            startDate={startDate}
            onReset={handleResetSystem}
            streak={streak} // Passed down
            skillStats={skillStats} // Passed down
          />
        )}

        {view === 'oracle' && (
           <TheOracle 
             organizedData={organizedData} 
             completedDays={completedDays} 
             startDate={startDate}
           />
        )}

        {view === 'mission' && selectedDayObj && (
          <ActiveMission 
            day={selectedDayObj} 
            isCompleted={completedDays.includes(selectedDayObj.uniqueId)}
            onBack={() => setView('roadmap')}
            onToggleComplete={() => toggleDayCompletion(selectedDayObj.uniqueId)}
            onComplete={() => handleComplete(selectedDayObj.uniqueId)}
          />
        )}
      </main>

      <Navigation currentView={view} setView={setView} />
    </div>
  );
}

export default App; 
