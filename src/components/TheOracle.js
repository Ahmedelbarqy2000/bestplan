import React, { useState } from 'react';
import { Bot, BrainCircuit, Send, AlertTriangle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

export default function TheOracle({ organizedData, completedDays }) {
  
  // --- 1. مفتاحك مدمج هنا مباشرة (لن يطلب منك إدخاله مرة أخرى) ---
  const API_KEY = "AIzaSyDtKxuCB3F3Me-IMAPP28LkMv4QZFx_Iww";

  // --- 2. تحديد الدرس الحالي تلقائياً ---
  const currentDay = (() => {
    for (const phase of organizedData) {
      for (const day of phase.days) {
        if (!completedDays.includes(day.uniqueId)) {
          return { ...day, phaseName: phase.name };
        }
      }
    }
    // لو كله خلص، هات آخر واحد
    return organizedData[organizedData.length-1]?.days[0] || {};
  })();

  // --- States ---
  const [status, setStatus] = useState('idle'); // idle, loading, asking, grading
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  // --- دوال الاتصال بـ Google Gemini (بدون مكتبات خارجية) ---
  const callGemini = async (promptText) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;

    } catch (err) {
      console.error(err);
      setError("Connection Failed. The Oracle cannot reach the server.");
      setStatus('idle');
      return null;
    }
  };

  // 1. توليد السؤال
  const generateChallenge = async () => {
    setError('');
    setStatus('loading');
    setFeedback(null);
    setUserAnswer('');

    const prompt = `
      You are "The Oracle", a strict coding mentor in a dark RPG world (Batman style).
      The student is currently studying: "${currentDay.lessonTitle}" in Phase "${currentDay.phaseName}".
      Topics: ${(currentDay.topics || []).join(', ')}.
      
      TASK: Generate ONE specific, tricky conceptual question about this topic to test deep understanding.
      Do NOT ask general questions like "What is X?". Ask "What happens if...?" or "Why does...?"
      Do NOT provide the answer yet. Just the question.
    `;

    const text = await callGemini(prompt);
    if (text) {
      setQuestion(text);
      setStatus('asking');
    }
  };

  // 2. تصحيح الإجابة
  const submitEvaluation = async () => {
    if (!userAnswer.trim()) return;
    setStatus('loading');

    const prompt = `
      Context: The question was "${question}".
      Student Answer: "${userAnswer}".
      Topic: "${currentDay.lessonTitle}".

      TASK: Grade this answer from 0 to 100.
      Provide a JSON response ONLY with this format:
      {
        "score": 85,
        "feedback": "Short explanation of why it is right or wrong.",
        "action": "One specific topic to review if score is low"
      }
    `;

    const text = await callGemini(prompt);
    
    if (text) {
      try {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);
        setFeedback(data);
        setStatus('grading');
      } catch (e) {
        // Fallback لو الرد مش JSON
        setFeedback({
            score: 50,
            feedback: text,
            action: "Review this topic manually."
        });
        setStatus('grading');
      }
    }
  };

  // --- الرندر (الشكل النهائي) ---
  return (
    <div className="max-w-4xl mx-auto pb-24 pt-6 px-4 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-purple-900/20 border border-purple-500 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)]">
           <BrainCircuit size={40} className="text-purple-400" />
        </div>
        <div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
             The <span className="text-purple-500">Oracle</span>
           </h1>
           <p className="text-gray-400 text-xs font-mono">
             AI MENTOR • SYSTEM ONLINE
           </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-xl mb-6 flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* --- Chat Interface --- */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden min-h-[400px] flex flex-col relative shadow-2xl">
         
         <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

         {/* 1. الشاشة الرئيسية (Idle) */}
         {status === 'idle' && (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                 <Bot size={64} className="text-purple-500/50 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">Mentor System Ready</h2>
                 <p className="text-gray-400 max-w-md mb-8">
                    Target Subject: <span className="text-purple-400 font-mono font-bold">"{currentDay.lessonTitle || "Loading..."}"</span>.
                    <br/>Are you ready for examination?
                 </p>
                 <button 
                   onClick={generateChallenge}
                   className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                 >
                    <Sparkles size={18} /> INITIATE CHALLENGE
                 </button>
             </div>
         )}

         {/* 2. شاشة التحميل (Loading) */}
         {status === 'loading' && (
             <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                 <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-purple-400 font-mono text-sm animate-pulse">The Oracle is analyzing data...</p>
             </div>
         )}

         {/* 3. شاشة السؤال (Asking) */}
         {status === 'asking' && (
             <div className="flex-1 flex flex-col p-6 relative z-10">
                 <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-2 bg-purple-900/20 rounded-lg">
                            <Bot size={24} className="text-purple-400" />
                        </div>
                        <div className="bg-[#1a1a1a] border border-purple-900/30 p-4 rounded-xl rounded-tl-none max-w-2xl shadow-lg">
                            <p className="text-gray-200 leading-relaxed font-mono text-sm md:text-base">
                                {question}
                            </p>
                        </div>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <textarea 
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full bg-[#111] border border-[#333] rounded-xl p-4 text-white focus:border-purple-500 outline-none min-h-[100px] font-mono text-sm mb-4 resize-none"
                    />
                    <button 
                        onClick={submitEvaluation}
                        disabled={!userAnswer.trim()}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} /> SUBMIT ANSWER
                    </button>
                 </div>
             </div>
         )}

         {/* 4. شاشة النتيجة (Grading) */}
         {status === 'grading' && feedback && (
             <div className="flex-1 p-6 relative z-10 overflow-y-auto">
                 <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* الدائرة بتاعة النتيجة */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-6 rounded-full border-4 border-[#333] relative">
                             <span className={`text-5xl font-black ${feedback.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                                 {feedback.score}
                             </span>
                        </div>
                        <div className="text-gray-500 text-xs uppercase mt-2 font-bold tracking-widest">Score / 100</div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-xl mb-6 shadow-lg">
                        <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                            <Bot size={14} /> Analysis
                        </h3>
                        <p className="text-gray-200 leading-relaxed font-light">
                            {feedback.feedback}
                        </p>
                    </div>

                    {/* Recommendation */}
                    {feedback.action && (
                        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl flex items-start gap-3 mb-8">
                            <BookOpen size={20} className="text-blue-400 mt-1" />
                            <div>
                                <h4 className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Recommended Action</h4>
                                <p className="text-gray-400 text-sm">{feedback.action}</p>
                            </div>
                        </div>
                    )}

                    {/* الأزرار */}
                    <div className="flex gap-4">
                        <button 
                            onClick={generateChallenge} 
                            className="flex-1 bg-[#222] hover:bg-[#333] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-gray-600"
                        >
                            <RefreshCw size={18} /> NEW QUESTION
                        </button>
                    </div>

                 </div>
             </div>
         )}
      </div>
    </div>
  );
}
