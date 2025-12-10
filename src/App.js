import React, { useState, useEffect, useMemo } from 'react';
import planData from './plan.json';
import addonsData from './holberton_addons.json'; // Import Side Tracks Data

// Components
import Roadmap from './components/Roadmap';
import ActiveMission from './components/ActiveMission';
import HunterLicense from './components/HunterLicense';
import TheOracle from './components/TheOracle';
import Navigation from './components/Navigation';
import SideTracks from './components/SideTracks'; // Import Side Tracks Component

function App() {
  // --- 1. State Management ---
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('batman_view');
    // Ensure 'ops' is valid, but default to roadmap if unknown
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

  // Save State Effects
  useEffect(() => { localStorage.setItem('batman_view', view); }, [view]);
  useEffect(() => { 
    if (selectedDayId) localStorage.setItem('batman_selected_day_id', selectedDayId); 
  }, [selectedDayId]);

  // --- 2. Data Processing (Organize Plan.json) ---
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

  // --- 3. Helper Functions ---
  const getSelectedDayObject = () => {
    if (!selectedDayId) return null;
    for (const phase of organizedData) {
      const found = phase.days.find(d => d.uniqueId === selectedDayId);
      if (found) return { ...found, phaseName: phase.name };
    }
    return null;
  };
  const selectedDayObj = getSelectedDayObject();

  // Complete a day
  const handleComplete = (id) => {
    if (!completedDays.includes(id)) {
      const newCompleted = [...completedDays, id];
      setCompletedDays(newCompleted);
      localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
    }
    setView('roadmap');
  };

  // Undo/Toggle a day
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

  // Revoke/Reset an entire Phase
  const handleRevokePhase = (phaseId) => {
    if (window.confirm(`⚠️ WARNING: You are about to wipe all progress for Phase ${phaseId}.\nAre you sure you want to reset this sector?`)) {
        const phase = organizedData.find(p => p.id === phaseId);
        if (!phase) return;
        
        const phaseDayIds = phase.days.map(d => d.uniqueId);
        const newCompleted = completedDays.filter(id => !phaseDayIds.includes(id));
        
        setCompletedDays(newCompleted);
        localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
    }
  };

  // Full System Reset
  const handleResetSystem = () => {
    if (window.confirm("⚠️ SECURITY ALERT: FACTORY RESET INITIATED.\nAre you sure you want to wipe your Hunter License?")) {
      setCompletedDays([]);
      localStorage.removeItem('batman_completed');
      window.location.reload();
    }
  };

  // --- 4. Render View ---
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-[#8a0000] selection:text-white">
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <main className="relative z-10 h-screen overflow-y-auto pb-24 scrollbar-hide px-4 md:px-8 pt-6">
        
        {/* VIEW: Main Roadmap (Default) */}
        {view === 'roadmap' && (
          <Roadmap 
            data={organizedData} 
            completedDays={completedDays}
            onSelectDay={(day) => { setSelectedDayId(day.uniqueId); setView('mission'); }}
            onRevokePhase={handleRevokePhase}
          />
        )}

        {/* VIEW: Special Ops / Side Tracks (NEW) */}
        {view === 'ops' && (
           <SideTracks 
             addons={addonsData} 
             organizedData={organizedData}
             completedDays={completedDays}
           />
        )}

        {/* VIEW: Hunter License */}
        {view === 'license' && (
          <HunterLicense 
            completedDays={completedDays} 
            organizedData={organizedData}
            startDate={startDate}
            onReset={handleResetSystem}
          />
        )}

        {/* VIEW: The Oracle */}
        {view === 'oracle' && (
           <TheOracle 
             organizedData={organizedData} 
             completedDays={completedDays} 
             startDate={startDate}
           />
        )}

        {/* VIEW: Active Mission Details */}
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

      {/* Navigation Gadget */}
      <Navigation currentView={view} setView={setView} />
    </div>
  );
}

export default App; 
