import React, { useState, useMemo } from 'react';
import planData from './plan.json';
import Roadmap from './components/Roadmap';
import Dashboard from './components/Dashboard';
import ActiveMission from './components/ActiveMission';
import { LayoutDashboard, Map, Trophy } from 'lucide-react';

function App() {
  // 1. Load Progress
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('batman_completed_days');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('dashboard');
  const [selectedDay, setSelectedDay] = useState(null);

  // 2. Logic Path: Re-ordering Phases based on your preference
  // 1:Math, 4:CS50(Intro), 2:Nand2Tetris, 5:C++, 6:Python, 7:Node, 8:React, ...
  // Note: Check plan.json IDs carefully. Assuming:
  // 1=Math, 2=CompFund, 3=Intro, 4=C++, 5=Python... based on your file structure provided earlier.
  // Let's stick to the requested logic path:
  const phasesOrder = [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11]; 
  // *تنبيه*: قمت بوضع IDs افتراضية بناء على ملفك، لو الترتيب اختلف في العرض، غير الارقام دي بس.

  const organizedData = useMemo(() => {
    let globalIndexCounter = 0;
    const orderedPhases = [];

    // Loop through the specific order we want
    phasesOrder.forEach(phaseId => {
      const phaseInfo = planData.phases.find(p => p.id === phaseId);
      
      // Safety check if phase exists
      if (phaseInfo) {
        const phaseDays = planData.days
          .filter(d => d.phaseId === phaseId)
          .map(d => ({
            ...d,
            globalId: globalIndexCounter++, 
            isBoss: d.lessonTitle.toLowerCase().includes("project") || d.lessonTitle.toLowerCase().includes("capstone")
          }));
        
        if (phaseDays.length > 0) {
            orderedPhases.push({
            ...phaseInfo,
            days: phaseDays
            });
        }
      }
    });

    // Add any missing phases at the end (just in case we missed one)
    planData.phases.forEach(p => {
        if (!phasesOrder.includes(p.id)) {
            const phaseDays = planData.days.filter(d => d.phaseId === p.id).map(d => ({...d, globalId: globalIndexCounter++}));
            if(phaseDays.length > 0) orderedPhases.push({...p, days: phaseDays});
        }
    });

    return orderedPhases;
  }, []);

  const totalDays = organizedData.reduce((acc, phase) => acc + phase.days.length, 0);
  const progressPercentage = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0;
  
  // Find next mission (First non-completed day)
  const nextMission = useMemo(() => {
    for (const phase of organizedData) {
      for (const day of phase.days) {
        if (!completedDays.includes(day.globalId)) {
          return { ...day, phaseName: phase.name };
        }
      }
    }
    return null;
  }, [organizedData, completedDays]);

  const handleComplete = (dayGlobalId) => {
    if (!completedDays.includes(dayGlobalId)) {
      const newCompleted = [...completedDays, dayGlobalId];
      setCompletedDays(newCompleted);
      localStorage.setItem('batman_completed_days', JSON.stringify(newCompleted));
    }
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col md:flex-row font-sans">
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 w-full md:w-20 md:relative md:h-screen bg-[#0a0a0a] border-t md:border-t-0 md:border-r border-[#2a2a2a] flex md:flex-col justify-around md:justify-center items-center py-4 md:gap-12 z-50 shadow-2xl">
        <button onClick={() => setView('dashboard')} className={`p-3 rounded-xl transition-all duration-300 ${view === 'dashboard' ? 'text-[#8a0000] bg-[#8a0000]/10 scale-110' : 'text-gray-600 hover:text-gray-300'}`}>
          <LayoutDashboard size={28} />
        </button>
        <button onClick={() => setView('roadmap')} className={`p-3 rounded-xl transition-all duration-300 ${view === 'roadmap' ? 'text-[#8a0000] bg-[#8a0000]/10 scale-110' : 'text-gray-600 hover:text-gray-300'}`}>
          <Map size={28} />
        </button>
        <button className="p-3 text-gray-700 cursor-not-allowed opacity-50" title="Locked">
          <Trophy size={28} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative">
        {/* Background Ambient Effect */}
        <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a0505] via-black to-black -z-10 pointer-events-none opacity-60" />

        {view === 'dashboard' && (
          <Dashboard 
            stats={{ total: totalDays, completed: completedDays.length, percentage: progressPercentage }}
            nextMission={nextMission}
            onStartMission={(day) => { setSelectedDay(day); setView('mission'); }}
          />
        )}

        {view === 'roadmap' && (
          <Roadmap 
            data={organizedData} 
            completedDays={completedDays}
            onSelectDay={(day) => { setSelectedDay(day); setView('mission'); }}
          />
        )}

        {view === 'mission' && selectedDay && (
          <ActiveMission 
            day={selectedDay} 
            onBack={() => setView('dashboard')}
            onComplete={() => handleComplete(selectedDay.globalId)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
