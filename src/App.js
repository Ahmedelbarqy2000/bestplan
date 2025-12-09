import React, { useState, useEffect, useMemo } from 'react';
import planData from './plan.json';
import Roadmap from './components/Roadmap';
import Dashboard from './components/Dashboard';
import ActiveMission from './components/ActiveMission';
import { LayoutDashboard, Map, Trophy } from 'lucide-react';

function App() {
  // 1. نظام الحفظ (أين توقفت؟)
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('batman_completed_days');
    return saved ? JSON.parse(saved) : [];
  });

  // الصفحة الحالية (Dashboard, Roadmap, Mission)
  const [view, setView] = useState('dashboard');
  const [selectedDay, setSelectedDay] = useState(null);

  // 2. إعادة ترتيب المنهج (The Re-ordering Logic)
  // الترتيب المطلوب: Math(1) -> Intro+C(3) -> Nand(2) -> C++(4) -> Python(5) -> Others...
  const phasesOrder = [1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11];

  // دمج البيانات وإضافة Global Index
  const organizedData = useMemo(() => {
    let globalIndexCounter = 0;
    const orderedPhases = [];

    phasesOrder.forEach(phaseId => {
      const phaseInfo = planData.phases.find(p => p.id === phaseId);
      // جلب أيام هذه المرحلة
      const phaseDays = planData.days
        .filter(d => d.phaseId === phaseId)
        .map(d => ({
          ...d,
          globalId: globalIndexCounter++, // رقم تسلسلي جديد بناءً على الترتيب الجديد
          isBoss: d.lessonTitle.toLowerCase().includes("project") || d.lessonTitle.toLowerCase().includes("capstone")
        }));
      
      if (phaseInfo) {
        orderedPhases.push({
          ...phaseInfo,
          days: phaseDays
        });
      }
    });

    return orderedPhases;
  }, []);

  // حساب الإحصائيات
  const totalDays = organizedData.reduce((acc, phase) => acc + phase.days.length, 0);
  const progressPercentage = Math.round((completedDays.length / totalDays) * 100);
  
  // تحديد المهمة التالية تلقائياً
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

  // دالة إتمام المهمة
  const handleComplete = (dayGlobalId) => {
    if (!completedDays.includes(dayGlobalId)) {
      const newCompleted = [...completedDays, dayGlobalId];
      setCompletedDays(newCompleted);
      localStorage.setItem('batman_completed_days', JSON.stringify(newCompleted));
    }
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col md:flex-row">
      
      {/* 1. Sidebar Navigation (Mobile: Bottom Bar) */}
      <nav className="fixed bottom-0 w-full md:w-20 md:relative md:h-screen bg-[#0a0a0a] border-t md:border-t-0 md:border-r border-[#2a2a2a] flex md:flex-col justify-around md:justify-center items-center py-3 md:gap-10 z-50">
        <button onClick={() => setView('dashboard')} className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'text-[#8a0000] bg-[#8a0000]/10' : 'text-gray-500'}`}>
          <LayoutDashboard size={28} />
        </button>
        <button onClick={() => setView('roadmap')} className={`p-3 rounded-xl transition-all ${view === 'roadmap' ? 'text-[#8a0000] bg-[#8a0000]/10' : 'text-gray-500'}`}>
          <Map size={28} />
        </button>
        <button onClick={() => alert("Achievements Locked until Level 5")} className="p-3 text-gray-600 cursor-not-allowed">
          <Trophy size={28} />
        </button>
      </nav>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        
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
