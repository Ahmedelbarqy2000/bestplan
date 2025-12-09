import React from 'react';
import { Play, Activity, Clock, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats, nextMission, onStart, onOpenOracle }) {
  const data = [
    { name: 'Done', value: stats.completed },
    { name: 'Left', value: stats.total - stats.completed },
  ];
  const COLORS = ['#8a0000', '#1a1a1a'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header with Oracle Button */}
      <div className="flex flex-row justify-between items-end border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
            Batcomputer<span className="text-[#8a0000]">.</span>
          </h1>
          <p className="text-gray-500 font-mono mt-2 text-xs md:text-sm tracking-widest">
            SYSTEM STATUS: ONLINE // USER: BRUCE
          </p>
        </div>
        <button onClick={onOpenOracle} className="hidden md:flex flex-col items-center gap-1 text-gray-500 hover:text-[#8a0000] transition-colors">
            <BrainCircuit size={24} />
            <span className="text-[10px] font-mono">ORACLE</span>
        </button>
      </div>

      {/* Next Mission Banner */}
      {nextMission ? (
        <div 
            onClick={() => onStart(nextMission)}
            className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-[#2a2a2a] group cursor-pointer hover:border-[#8a0000] transition-all duration-500"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-30 z-0" />
            
            <div className="absolute bottom-0 left-0 z-20 p-6 md:p-12 w-full md:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-red-500 font-mono text-xs uppercase tracking-widest">Active Protocol</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-red-500 transition-colors">
                    {nextMission.lessonTitle}
                </h2>
                <p className="text-gray-400 mb-8 font-mono text-sm md:text-base border-l-2 border-gray-700 pl-4">
                    Phase: {nextMission.phaseName}
                </p>
                <button className="bg-white text-black px-8 py-3 rounded font-bold flex items-center gap-3 hover:bg-[#8a0000] hover:text-white transition-all">
                    <Play size={20} fill="currentColor" />
                    INITIALIZE MISSION
                </button>
            </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-green-900/30 bg-green-900/5 rounded-2xl">
            <h2 className="text-2xl text-green-500 font-mono">ALL OBJECTIVES CLEARED. GOTHAM IS SAFE.</h2>
        </div>
      )}

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <StatCard icon={<Activity />} title="Completion" value={`${stats.percent}%`} />
         <StatCard icon={<Clock />} title="Missions Done" value={stats.completed} />
         <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-4 rounded-xl h-32 flex items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-gray-600">
                 {stats.completed}/{stats.total}
             </div>
            <div className="w-20 h-20">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} innerRadius={28} outerRadius={35} paddingAngle={5} dataKey="value" stroke="none">
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, title, value }) => (
    <div className="bg-[#0f0f0f] border border-[#1f1f1f] p-6 rounded-xl flex flex-col justify-between h-32 group hover:border-[#8a0000] transition-colors">
        <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs font-mono uppercase">{title}</span>
            <div className="text-gray-600 group-hover:text-[#8a0000] transition-colors">{icon}</div>
        </div>
        <div className="text-4xl font-bold text-white">{value}</div>
    </div>
);
