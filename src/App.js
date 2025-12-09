import React, { useState, useEffect, useMemo } from 'react';
import planData from './plan.json';
import Roadmap from './components/Roadmap';
import ActiveMission from './components/ActiveMission';
import HunterLicense from './components/HunterLicense'; // بديل الـ Trophies
import TheOracle from './components/TheOracle';
import Navigation from './components/Navigation'; // النافبار الجديد

function App() {
  // 1. إدارة الحالة (State)
  const [view, setView] = useState(() => localStorage.getItem('batman_view') || 'roadmap');
  
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

  // حفظ الحالة
  useEffect(() => { localStorage.setItem('batman_view', view); }, [view]);
  useEffect(() => { 
    if (selectedDayId) localStorage.setItem('batman_selected_day_id', selectedDayId); 
  }, [selectedDayId]);

  // 2. معالجة البيانات (Data Processing)
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
          globalId: globalCounter++, // للحفاظ على التوافق
          isBoss: d.lessonTitle.toLowerCase().includes("project") || d.lessonTitle.toLowerCase().includes("capstone"),
          hoursPlanned: d.hoursPlanned || 4 
        }));

      if (days.length > 0) result.push({ ...phase, days });
    };
    phasesOrder.forEach(pid => processPhase(pid));
    planData.phases.forEach(p => { if (!phasesOrder.includes(p.id)) processPhase(p.id); });
    return result;
  }, []);

  // 3. الدوال المساعدة
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
    setView('roadmap'); // الرجوع للماب بعد الإنجاز
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

  const handleResetSystem = () => {
    if (window.confirm("⚠️ SECURITY ALERT: FACTORY RESET INITIATED.\nAre you sure you want to wipe your Hunter License?")) {
      setCompletedDays([]);
      localStorage.removeItem('batman_completed');
      window.location.reload();
    }
  };

  // 4. العرض (Render)
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-[#8a0000] selection:text-white">
      
      {/* Background Texture */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Main Content */}
      <main className="relative z-10 h-screen overflow-y-auto pb-24 scrollbar-hide px-4 md:px-8 pt-6">
        
        {view === 'roadmap' && (
          <Roadmap 
            data={organizedData} 
            completedDays={completedDays}
            onSelectDay={(day) => { setSelectedDayId(day.uniqueId); setView('mission'); }}
          />
        )}

        {view === 'license' && (
          <HunterLicense 
            completedDays={completedDays} 
            organizedData={organizedData}
            startDate={startDate}
            onReset={handleResetSystem}
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

      {/* Floating Navigation Gadget */}
      <Navigation currentView={view} setView={setView} />
    </div>
  );
}

export default App; 
