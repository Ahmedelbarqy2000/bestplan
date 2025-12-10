import React, { useState } from 'react';
import { Map, BrainCircuit, Wallet, X, Menu, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation({ currentView, setView }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'roadmap', icon: <Map size={24} />, label: 'Map' },
    { id: 'ops', icon: <Shield size={24} />, label: 'Spec Ops' }, // New Item
    { id: 'license', icon: <Wallet size={24} />, label: 'License' },
    { id: 'oracle', icon: <BrainCircuit size={24} />, label: 'Oracle' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-2"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setIsOpen(false); }}
                className={`flex items-center justify-end gap-3 px-4 py-3 rounded-full backdrop-blur-md border shadow-xl transition-all
                  ${currentView === item.id 
                    ? 'bg-[#8a0000] border-[#ff0000] text-white' 
                    : 'bg-black/80 border-[#333] text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                {item.icon}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button (The Bat-Gadget) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-[0_0_20px_rgba(138,0,0,0.5)] border-2 transition-all duration-300 hover:scale-110
          ${isOpen ? 'bg-white border-white text-black' : 'bg-[#8a0000] border-[#8a0000] text-white'}
        `}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  );
}
