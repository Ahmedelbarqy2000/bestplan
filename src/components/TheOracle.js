import React, { useState } from 'react';
import { Bot, BrainCircuit, Send, AlertTriangle, RefreshCw, Sparkles, BookOpen, Key, Wifi } from 'lucide-react';

export default function TheOracle({ organizedData, completedDays }) {
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_key') || '');

  // 1. تحديد الدرس الحالي أو استخدام بديل آمن
  const currentDay = (() => {
    if (organizedData && organizedData.length > 0) {
        for (const phase of organizedData) {
            for (const day of phase.days) {
                if (!completedDays.includes(day.uniqueId)) {
                return { ...day, phaseName: phase.name };
                }
            }
        }
        return organizedData[organizedData.length-1]?.days[0] || null;
    }
    return null;
  })();

  const safeTopic = currentDay?.lessonTitle || "Software Engineering Basics";
  const safeTopics = currentDay?.topics || ["Algorithms", "Data Structures"];

  const [status, setStatus] = useState('idle');
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const saveKey = (e) => {
    const k = e.target.value;
    setApiKey(k);
    localStorage.setItem('gemini_key', k);
  };

  // --- دوال الاتصال (تم التعديل لاستخدام gemini-pro) ---
  const callGemini = async (promptText) => {
    if (!apiKey) {
      setError("No API Key found!");
      return null;
    }
    
    try {
      // التعديل هنا: استخدمنا gemini-pro بدلاً من gemini-1.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || response.statusText);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus('idle');
      return null;
    }
  };

  const testConnection = async () => {
      setError('');
      setStatus('loading');
      const res = await callGemini("Say 'Connection Verified'.");
      if (res) {
          alert("✅ " + res);
          setStatus('idle');
      }
  };

  const generateChallenge = async () => {
    setError('');
    setStatus('loading');
    setFeedback(null);
    setUserAnswer('');

    const prompt = `
      Act as a strict coding mentor.
      Topic: "${safeTopic}".
      Sub-topics: ${safeTopics.join(', ')}.
      Task: Ask ONE tricky conceptual question to test understanding.
      Do not answer it.
    `;

    const text = await callGemini(prompt);
    if (text) {
      setQuestion(text);
      setStatus('asking');
    }
  };

  const submitEvaluation = async () => {
    if (!userAnswer.trim()) return;
    setStatus('loading');

    const prompt = `
      Question: "${question}".
      Answer: "${userAnswer}".
      Topic: "${safeTopic}".
      Task: Grade (0-100) and provide feedback JSON: { "score": 0, "feedback": "...", "action": "..." }
    `;

    const text = await callGemini(prompt);
    if (text) {
      try {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);
        setFeedback(data);
        setStatus('grading');
      } catch (e) {
        setFeedback({ score: 50, feedback: text, action: "Manual Review" });
        setStatus('grading');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-6 px-4 animate-in fade-in">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-purple-900/20 border border-purple-500 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)]">
           <BrainCircuit size={40} className="text-purple-400" />
        </div>
        <div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
             The <span className="text-purple-500">Oracle</span>
           </h1>
           <p className="text-gray-400 text-xs font-mono">SYSTEM ONLINE</p>
        </div>
      </div>

      {!apiKey && (
        <div className="mb-8 p-6 bg-[#111] border border-red-900/50 rounded-xl text-center">
           <Key size={32} className="text-red-500 mx-auto mb-2" />
           <h3 className="text-white font-bold mb-2">Enter API Key</h3>
           <input 
             type="text" 
             placeholder="Paste Key Here..." 
             onChange={saveKey}
             className="bg-black border border-[#333] text-white px-4 py-3 rounded-lg w-full max-w-sm text-center focus:border-purple-500 outline-none font-mono"
           />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 text-white rounded-xl mb-6 font-mono text-sm break-words">
            <strong>❌ ERROR:</strong> {error}
        </div>
      )}

      {apiKey && (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden min-h-[400px] flex flex-col relative shadow-2xl">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

           {status === 'idle' && (
               <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                   <Bot size={64} className="text-purple-500/50 mb-4" />
                   <h2 className="text-2xl font-bold text-white mb-2">Mentor Ready</h2>
                   <p className="text-gray-400 max-w-md mb-8">
                      Target: <span className="text-purple-400 font-mono font-bold">"{safeTopic}"</span>
                   </p>
                   
                   <div className="flex flex-col gap-3 w-full max-w-xs">
                       <button onClick={generateChallenge} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2">
                          <Sparkles size={18} /> START TEST
                       </button>
                       <button onClick={testConnection} className="bg-[#222] border border-[#333] hover:bg-[#333] text-gray-400 text-xs py-2 px-4 rounded-full flex items-center justify-center gap-2">
                          <Wifi size={14} /> Test Connection
                       </button>
                   </div>
               </div>
           )}

           {status === 'loading' && (
               <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                   <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-purple-400 font-mono text-sm animate-pulse">Processing...</p>
               </div>
           )}

           {status === 'asking' && (
               <div className="flex-1 flex flex-col p-6 relative z-10">
                   <div className="flex-1 mb-6">
                      <div className="bg-[#1a1a1a] border border-purple-900/30 p-4 rounded-xl">
                          <p className="text-gray-200 leading-relaxed font-mono text-sm md:text-base">{question}</p>
                      </div>
                   </div>
                   <div className="mt-auto">
                      <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type answer..." className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-white min-h-[100px] mb-4" />
                      <button onClick={submitEvaluation} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2">
                          <Send size={18} /> SUBMIT
                      </button>
                   </div>
               </div>
           )}

           {status === 'grading' && feedback && (
               <div className="flex-1 p-6 relative z-10 overflow-y-auto">
                   <div className="max-w-2xl mx-auto">
                      <div className="text-center mb-8">
                          <span className={`text-6xl font-black ${feedback.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>{feedback.score}</span>
                          <span className="block text-gray-500 text-xs uppercase">Score</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-xl mb-6">
                          <p className="text-gray-200 leading-relaxed">{feedback.feedback}</p>
                      </div>
                      <button onClick={generateChallenge} className="w-full bg-[#222] hover:bg-[#333] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                          <RefreshCw size={18} /> NEW QUESTION
                      </button>
                   </div>
               </div>
           )}
        </div>
      )}
    </div>
  );
              } 
