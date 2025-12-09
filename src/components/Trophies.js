import React from 'react';
import { Award, Lock } from 'lucide-react';

export default function Trophies({ completedCount, total }) {
  const trophies = [
    { name: 'First Blood', desc: 'Complete your first day', condition: 1 },
    { name: 'Vigilante', desc: 'Complete 10 days', condition: 10 },
    { name: 'Detective', desc: 'Complete 50 days', condition: 50 },
    { name: 'Dark Knight', desc: 'Complete 100 days', condition: 100 },
    { name: 'Gotham Savior', desc: 'Complete the whole plan', condition: total },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-500">
      <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-[#8a0000] pl-4">
        TROPHY ROOM
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {trophies.map((t, i) => {
          const unlocked = completedCount >= t.condition;
          return (
            <div key={i} className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${unlocked ? 'bg-[#141414] border-[#8a0000] shadow-[0_0_15px_rgba(138,0,0,0.2)]' : 'bg-[#0a0a0a] border-[#1f1f1f] opacity-50 grayscale'}`}>
              <div className={`p-4 rounded-full ${unlocked ? 'bg-[#8a0000]/20 text-[#8a0000]' : 'bg-[#1a1a1a] text-gray-600'}`}>
                {unlocked ? <Award size={32} /> : <Lock size={32} />}
              </div>
              <div>
                <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-500'}`}>{t.name}</h3>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
