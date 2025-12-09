import React, { useMemo } from 'react';
import { Activity, Brain, Briefcase, Calendar, ChevronRight, Cpu, Zap } from 'lucide-react';

// --- 1. مصفوفة المهارات (The Skill Matrix) ---
// نربط كل مرحلة بالمهارات والوظائف
const SKILL_MATRIX = {
  1: { name: "Logical Thinking & Math", jobs: ["Data Analyst Intern"], xp: 100 },
  3: { name: "C Programming & Memory Mgmt", jobs: ["Embedded Systems Intern"], xp: 300 },
  2: { name: "Computer Architecture (Low Level)", jobs: ["Hardware Engineer Assistant"], xp: 250 },
  4: { name: "Object Oriented Programming (C++)", jobs: ["Game Dev Junior", "System Software Dev"], xp: 400 },
  5: { name: "Python Scripting & Automation", jobs: ["Python Developer", "Data Entry Automator"], xp: 200 },
  6: { name: "Backend Logic (Node/Express)", jobs: ["Junior Backend Developer"], xp: 500 },
  7: { name: "Frontend Engineering (React)", jobs: ["Junior Frontend Developer", "UI Specialist"], xp: 500 },
  8: { name: "Fullstack Architecture", jobs: ["Fullstack Developer", "Freelancer"], xp: 800 },
  9: { name: "Artificial Intelligence", jobs: ["ML Engineer", "AI Researcher"], xp: 1000 },
  10: { name: "Specialized Security", jobs: ["Cybersecurity Analyst"], xp: 600 },
  11: { name: "Software Engineering Capstone", jobs: ["Senior Software Engineer", "CTO"], xp: 1500 },
};

export default function TheOracle({ organizedData, completedDays, startDate }) {
  
  // --- 2. محرك التحليل (The Analytical Engine) ---
  const analysis = useMemo(() => {
    // A. حساب الزمن
    const now = new Date();
    const start = new Date(startDate);
    const daysPassed = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24))); // الأيام المنقضية (على الأقل 1)

    // B. حساب الجهد (Hours)
    let totalHoursPlanned = 0;
    let completedHours = 0;
    
    // تجميع الساعات لكل مرحلة
    const phaseProgress = {}; // لتتبع المهارات

    organizedData.forEach(phase => {
        let phaseTotal = 0;
        let phaseDone = 0;

        phase.days.forEach(day => {
            const hours = day.hoursPlanned || 0;
            totalHoursPlanned += hours;
            phaseTotal += hours;

            if (completedDays.includes(day.uniqueId)) {
                completedHours += hours;
                phaseDone += hours;
            }
        });

        // نسبة إتمام المرحلة
        phaseProgress[phase.id] = phaseTotal > 0 ? (phaseDone / phaseTotal) : 0;
    });

    // C. حساب السرعة (Velocity)
    // Velocity = كم ساعة من الخطة تنجزها في اليوم الواحد الحقيقي
    const velocity = completedHours / daysPassed; 
    
    // D. التوقعات (Prediction)
    const remainingHours = totalHoursPlanned - completedHours;
    // نتوقع الأيام المتبقية بناء على سرعتك الحالية
    // لو سرعتك 0 (لسه مبدأتش)، نفترض سرعة افتراضية 4 ساعات/يوم
    const currentSpeed = velocity > 0 ? velocity : 4; 
    const daysRemaining = Math.ceil(remainingHours / currentSpeed);
    
    // تاريخ الانتهاء المتوقع
    const estimatedFinishDate = new Date();
    estimatedFinishDate.setDate(estimatedFinishDate.getDate() + daysRemaining);

    // E. تحليل المهارات والوظائف
    const acquiredSkills = [];
    const currentJobs = [];
    const nextSkills = [];

    Object.keys(SKILL_MATRIX).forEach(phaseId => {
        const pId = parseInt(phaseId);
        const progress = phaseProgress[pId] || 0;
        const info = SKILL_MATRIX[pId];

        if (progress > 0.9) { // لو خلصت 90% من المرحلة
            acquiredSkills.push({ ...info, level: "Mastered" });
            currentJobs.push(...info.jobs);
        } else if (progress > 0.3) { // لو خلصت 30%
            acquiredSkills.push({ ...info, level: "In Progress" });
        } else {
            nextSkills.push(info);
        }
    });

    return {
        velocity: velocity.toFixed(2),
        daysPassed,
        totalHoursPlanned,
        completedHours,
        daysRemaining,
        finishDate: estimatedFinishDate.toDateString(),
        originalPlanYears: (totalHoursPlanned / (4 * 365)).toFixed(1), // لو مشينا 4 ساعات يوميا
        actualYears: (daysRemaining / 365).toFixed(1),
        acquiredSkills,
        currentJobs,
        phaseProgress
    };

  }, [organizedData, completedDays, startDate]);

  // --- 3. العرض (The UI) ---
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#2a2a2a] pb-6">
        <div className="p-4 bg-[#8a0000]/10 rounded-full border border-[#8a0000]">
            <Brain size={32} className="text-[#8a0000]" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-widest">The Oracle</h1>
            <p className="text-gray-500 font-mono text-sm">ADVANCED PERFORMANCE ANALYTICS V1.0</p>
        </div>
      </div>

      {/* 1. Time & Prediction Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            icon={<Zap className="text-yellow-500" />} 
            label="Current Velocity" 
            value={`${analysis.velocity} Hrs/Day`} 
            sub={`Based on ${analysis.daysPassed} days of data`}
          />
          <Card 
            icon={<Calendar className="text-blue-500" />} 
            label="Estimated Finish" 
            value={analysis.finishDate} 
            sub={analysis.velocity > 4 ? "You are FASTER than plan!" : "Keep pushing to improve."}
            highlight={analysis.velocity > 4}
          />
           <Card 
            icon={<ClockIcon className="text-green-500" />} 
            label="Time To Complete" 
            value={`${analysis.actualYears} Years`} 
            sub={`Instead of ${analysis.originalPlanYears} Years (Original)`}
          />
           <Card 
            icon={<Activity className="text-red-500" />} 
            label="Effort Logged" 
            value={`${Math.round(analysis.completedHours)} Hours`} 
            sub={`Out of ${analysis.totalHoursPlanned} total hours`}
          />
      </div>

      {/* 2. Employability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Job Eligibility */}
        <div className="lg:col-span-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Briefcase size={100} /></div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[#8a0000]" /> Employment Status
            </h3>
            
            {analysis.currentJobs.length > 0 ? (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm">Based on your current skills, you are eligible for:</p>
                    {analysis.currentJobs.map((job, i) => (
                        <div key={i} className="bg-[#1a1a1a] p-3 rounded border border-green-900/30 text-green-400 font-mono text-sm flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {job}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-600 font-mono text-sm">No job roles unlocked yet.</p>
                    <p className="text-[#8a0000] text-xs mt-2">Complete Phase 3 to unlock first role.</p>
                </div>
            )}
        </div>

        {/* Skill Tree Progress */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Cpu size={20} className="text-[#8a0000]" /> Skill Acquisition Matrix
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {Object.entries(SKILL_MATRIX).map(([id, skill]) => {
                    const progress = analysis.phaseProgress[id] || 0;
                    const percent = Math.round(progress * 100);
                    const isDone = percent === 100;
                    
                    return (
                        <div key={id} className="group">
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm font-bold ${isDone ? 'text-white' : 'text-gray-500'}`}>{skill.name}</span>
                                <span className="text-xs font-mono text-gray-600">{percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isDone ? 'bg-green-600' : 'bg-[#8a0000]'}`} 
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* 3. Mentor Advice (Alfred's Note) */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-l-4 border-[#8a0000] p-6 rounded-r-xl">
          <h4 className="text-gray-400 text-xs font-mono uppercase mb-2">Alfred's Insight</h4>
          <p className="text-white text-lg italic leading-relaxed">
            "{analysis.velocity > 5 
                ? "Your speed is impressive, Master Wayne. But remember, clarity is more important than speed. Ensure your foundation is solid." 
                : analysis.daysPassed < 7 
                ? "Every journey begins with a single step. Consistency is your superpower now."
                : "The pace is steady. At this rate, Gotham will have its protector ready by " + analysis.finishDate.split(' ')[3] + "."
            }"
          </p>
      </div>

    </div>
  );
}

const Card = ({ icon, label, value, sub, highlight }) => (
    <div className={`bg-[#0f0f0f] border p-6 rounded-xl flex flex-col justify-between h-32 transition-all ${highlight ? 'border-green-900 bg-green-900/10' : 'border-[#2a2a2a]'}`}>
        <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs font-mono uppercase">{label}</span>
            <div>{icon}</div>
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{sub}</div>
        </div>
    </div>
);

const ClockIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
