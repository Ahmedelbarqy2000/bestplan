import React, { useState, useEffect, useMemo } from 'react';
import planData from './plan.json';
import Roadmap from './components/Roadmap';
import Dashboard from './components/Dashboard';
import ActiveMission from './components/ActiveMission';
import Trophies from './components/Trophies';
import { LayoutDashboard, Map, Trophy } from 'lucide-react';

function App() {
  // --- 1. State Management (الذاكرة) ---
  const [view, setView] = useState(() => localStorage.getItem('batman_view') || 'dashboard');
  
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('batman_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDayId, setSelectedDayId] = useState(() => {
    return localStorage.getItem('batman_selected_day_id') || null;
  });

  // حفظ المكان عند عمل Refresh
  useEffect(() => { localStorage.setItem('batman_view', view); }, [view]);
  useEffect(() => { 
    if (selectedDayId) localStorage.setItem('batman_selected_day_id', selectedDayId); 
  }, [selectedDayId]);

  // --- 2. Data Organization (ترتيب المنهج) ---
  // الترتيب: Math(1) -> CS50(4) -> Nand(3/2) -> C++(5?) -> Python(6?)
  // *ملاحظة:* الأرقام هنا تعتمد على الـ IDs في ملف JSON الخاص بك.
  // قمت بوضع مصفوفة ذكية تبحث عن الـ IDs وتتجاهل الأخطاء.
  const phasesOrder = [1, 4, 3, 2, 5, 6, 7, 8, 9, 10, 11]; 

  const organizedData = useMemo(() => {
    let globalCounter = 0;
    const result = [];

    // دالة مساعدة لجلب البيانات بأمان
    const processPhase = (pid) => {
      const phase = planData.phases.find(p => p.id === pid);
      if (!phase) return;

      const days = planData.days
        .filter(d => d.phaseId === pid)
        .map(d => ({
          ...d,
          // نصنع ID فريد وثابت لكل يوم بناء على ترتيبه
          uniqueId: `day_${globalCounter++}`, 
          dayNumber: globalCounter, // رقم اليوم (1, 2, 3...)
          isBoss: d.lessonTitle.toLowerCase().includes("project") || d.lessonTitle.toLowerCase().includes("capstone")
        }));

      if (days.length > 0) {
        result.push({ ...phase, days });
      }
    };

    // 1. ترتيب المراحل المختارة
    phasesOrder.forEach(pid => processPhase(pid));

    // 2. إضافة أي مراحل منسية في JSON لم نذكرها (للأمان)
    planData.phases.forEach(p => {
      if (!phasesOrder.includes(p.id)) processPhase(p.id);
    });

    return result;
  }, []);

  // --- 3. Helper Logic ---
  // البحث عن اليوم المختار بالكامل
  const getSelectedDayObject = () => {
    if (!selectedDayId) return null;
    for (const phase of organizedData) {
      const found = phase.days.find(d => d.uniqueId === selectedDayId);
      if (found) return { ...found, phaseName: phase.name };
    }
    return null;
  };

  const selectedDayObj = getSelectedDayObject();

  // حساب الإحصائيات
  const totalDays = organizedData.reduce((acc, p) => acc + p.days.length, 0);
  const progressPercent = totalDays === 0 ? 0 : Math.round((completedDays.length / totalDays) * 100);

  // تحديد المهمة القادمة (أول يوم غير مكتمل)
  const nextMission = useMemo(() => {
    for (const phase of organizedData) {
      for (const day of phase.days) {
        if (!completedDays.includes(day.uniqueId)) {
          return { ...day, phaseName: phase.name };
        }
      }
    }
    return null; // All done!
  }, [organizedData, completedDays]);

  // إتمام المهمة
  const handleComplete = (id) => {
    if (!completedDays.includes(id)) {
      const newCompleted = [...completedDays, id];
      setCompletedDays(newCompleted);
      localStorage.setItem('batman_completed', JSON.stringify(newCompleted));
    }
    setView('dashboard');
  };

  // --- 4. Render ---
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed bottom-0 w-full md:w-24 md:relative md:h-screen bg-[#0a0a0a] border-t md:border-t-0 md:border-r border-[#2a2a2a] flex md:flex-col justify-around md:justify-center items-center py-4 md:gap-14 z-50 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <NavButton icon={<LayoutDashboard size={28} />} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavButton icon={<Map size={28} />} active={view === 'roadmap'} onClick={() => setView('roadmap')} />
        <NavButton icon={<Trophy size={28} />} active={view === 'trophies'} onClick={() => setView('trophies')} />
      </nav>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 pb-28 md:pb-8 relative scrollbar-hide">
        {/* Background Ambient */}
        <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a0505] via-[#050505] to-black -z-10 pointer-events-none opacity-50" />

        {view === 'dashboard' && (
          <Dashboard 
            stats={{ total: totalDays, completed: completedDays.length, percent: progressPercent }}
            nextMission={nextMission}
            onStart={(day) => { setSelectedDayId(day.uniqueId); setView('mission'); }}
          />
        )}

        {view === 'roadmap' && (
          <Roadmap 
            data={organizedData} 
            completedDays={completedDays}
            onSelectDay={(day) => { setSelectedDayId(day.uniqueId); setView('mission'); }}
          />
        )}

        {view === 'trophies' && (
          <Trophies completed={completedDays.length} total={totalDays} />
        )}

        {view === 'mission' && selectedDayObj && (
          <ActiveMission 
            day={selectedDayObj} 
            isCompleted={completedDays.includes(selectedDayObj.uniqueId)}
            onBack={() => setView('roadmap')}
            onComplete={() => handleComplete(selectedDayObj.uniqueId)}
          />
        )}
      </main>
    </div>
  );
}

const NavButton = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`p-4 rounded-2xl transition-all duration-300 ${active ? 'text-[#ff0000] bg-[#ff0000]/10 scale-110 shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'text-gray-600 hover:text-gray-300'}`}
  >
    {icon}
  </button>
);

export default App;
