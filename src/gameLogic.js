// أوزان الصعوبة للمراحل (تقديري)
// 1 = عادي، 1.5 = متوسط، 2.0 = صعب، 3.0 = Boss Fight
export const DIFFICULTY_WEIGHTS = {
  1: 1.8, // Math Core (صعب شوية)
  2: 2.2, // Nand2Tetris (صعب جدا)
  3: 1.2, // Intro C (متوسط)
  4: 1.5, // C++ (متوسط لصعب)
  5: 0.8, // Python (سهل نسبيا)
  6: 1.2, // Backend
  7: 1.0, // Frontend
  8: 3.0, // Fullstack Projects (BOSS)
  9: 2.0, // AI (صعب)
  10: 1.5, // Electives
  11: 1.5  // Capstone
};

// الرتب والألقاب
export const RANKS = [
  { threshold: 0, title: "Zaban City Candidate", desc: "لسه بتقول يا هادي. معرفتك الحالية: تشغيل الكمبيوتر." },
  { threshold: 50, title: "Exam Rookie", desc: "بدأت تفهم يعني ايه Variable. تقدر تشتغل: قهوجي في شركة برمجة." },
  { threshold: 150, title: "Nen Student", desc: "بقيت تعرف تكتب Loop من غير ما تعيط. تقدر تشتغل: Intern تحت السلم." },
  { threshold: 300, title: "Licensed Hunter", desc: "معاك رخصة المبادئ. تقدر تعمل مشاريع صغيرة." },
  { threshold: 500, title: "Single Star Hunter", desc: "مبرمج شاطر. تقدر تشتغل: Junior Developer بمرتب محترم." },
  { threshold: 750, title: "Double Star Hunter", desc: "تنين مجنح. فاهم System Design و Algorithms." },
  { threshold: 900, title: "Triple Star Hunter", desc: "أسطورة حية. الشركات هي اللي بتجري وراك." }
];

// توزيع المهارات على المراحل (عشان الرسم البياني)
export const SKILL_MAPPING = {
  1: 'Logic', 2: 'System', 3: 'System', 4: 'System',
  5: 'Scripting', 6: 'Backend', 7: 'Frontend',
  8: 'Fullstack', 9: 'AI', 10: 'Special', 11: 'Career'
};

// دالة حساب التوقع الزمني
export const calculatePrediction = (completedCount, totalDays, startDateStr) => {
  if (completedCount < 5) return "لسه بدري على التوقع..."; // محتاج داتا اكتر

  const startDate = new Date(startDateStr || Date.now());
  const today = new Date();
  const daysPassed = (today - startDate) / (1000 * 60 * 60 * 24);
  
  // سرعتك الحالية (يوم / يوم فعلي)
  const velocity = completedCount / (daysPassed || 1); 
  
  // الأيام الباقية مع مراعاة الصعوبة (كل يوم صعب بيتحسب بيومين مثلا)
  // دي معادلة تقريبية لتبسيط الكود
  const remainingRawDays = totalDays - completedCount;
  const averageDifficulty = 1.4; // متوسط صعوبة المنهج
  const estimatedDaysLeft = (remainingRawDays * averageDifficulty) / (velocity || 0.5);

  const finishDate = new Date();
  finishDate.setDate(today.getDate() + estimatedDaysLeft);

  return finishDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};
