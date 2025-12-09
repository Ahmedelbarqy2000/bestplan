import React from 'react';
import { Play, TrendingUp, Clock, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats, nextMission, onStartMission }) {
  const data = [
    { name: 'Completed', value: stats.completed },
    { name: 'Remaining', value: stats.total - stats.completed },
  ];
  const COLORS = ['#8a0000', '#1f1f1f'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter uppercase">
            Batcomputer <span className="text-[#8a0000]">.</span>
          </h1>
          <p className="text-gray-500 font-mono mt-2 text-sm">SYSTEM STATUS: ONLINE | PROTOCOL: KNIGHTFALL</p>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-2xl font-bold text-white">{stats.percentage}%</div>
            <div className="text-xs text-gray-500 font-mono">SYSTEM INTEGRITY</div>
        </div>
      </div>

      {/* Hero Section (Netflix Style) */}
      {nextMission ? (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden group cursor-pointer border border-[#2a2a2a] hover:border-[#8a0000] transition-all" onClick={() => onStartMission(nextMission)}>
          {/* Background Gradient/Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />
          
          <div className="absolute z-20 bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
            <span className="bg-[#8a0000] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">
              Current Mission
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-3 mb-2 leading-tight">
              {nextMission.lessonTitle}
            </h2>
            <p className="text-gray-400 text-sm md:text-base line-clamp-2 mb-6">
              {nextMission.phaseName}
            </p>
            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-bold hover:bg-[#8a0000] hover:text-white transition-colors">
              <Play fill="currentColor" size={18} />
              RESUME TRAINING
            </button>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-green-500 font-mono text-xl">
          ALL SYSTEMS SECURE. MISSION ACCOMPLISHED.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Circle */}
        <div className="bg-[#141414] p-5 rounded-xl border border-[#2a2a2a] flex items-center justify-between">
            <div>
                <div className="text-gray-500 text-xs font-mono uppercase mb-1">Total Progress</div>
                <div className="text-3xl font-bold text-white">{stats.completed} <span className="text-sm text-gray-600">/ {stats.total}</span></div>
            </div>
            <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} innerRadius={20} outerRadius={30} paddingAngle={0} dataKey="value" stroke="none">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Rank */}
        <div className="bg-[#141414] p-5 rounded-xl border border-[#2a2a2a] flex items-center gap-4">
            <div className="p-3 bg-[#8a0000]/10 rounded-full text-[#8a0000]">
                <Activity size={24} />
            </div>
            <div>
                <div className="text-gray-500 text-xs font-mono uppercase mb-1">Current Rank</div>
                <div className="text-2xl font-bold text-white">VIGILANTE</div>
            </div>
        </div>

        {/* Time (Fake for now) */}
        <div className="bg-[#141414] p-5 rounded-xl border border-[#2a2a2a] flex items-center gap-4">
            <div className="p-3 bg-blue-900/10 rounded-full text-blue-500">
                <Clock size={24} />
            </div>
            <div>
                <div className="text-gray-500 text-xs font-mono uppercase mb-1">Est. Completion</div>
                <div className="text-2xl font-bold text-white">2027</div>
            </div>
        </div>
      </div>
    </div>
  );
}
