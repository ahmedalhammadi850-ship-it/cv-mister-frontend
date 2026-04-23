// ============================================================
// CV-Mister — AI Support Helper
// Simulates professional CV content generation
// ============================================================

const summaryTemplates = {
  en: [
    "Professional {jobTitle} with {years} years of experience in leading projects and driving results. Proven track record in developing high-performance solutions and collaborating with cross-functional teams.",
    "Dynamic and results-oriented {jobTitle} specializing in {keySkills}. Expert in modern architectures and best practices with a focus on delivering scalable, high-quality products.",
    "Highly motivated {jobTitle} dedicated to innovation and efficiency. Experienced in full software development lifecycle and committed to excellence in every project."
  ],
  ar: [
    "خبير {jobTitle} متخصص في {keySkills} مع خبرة تزيد عن {years} سنوات. أمتلك مهارات قيادية قوية وقدرة مثبتة على تحقيق نتائج ملموسة وتطوير حلول برمجية مبتكرة.",
    "{jobTitle} طموح وموجه نحو النتائج، شغوف بالتقنيات الحديثة وأفضل الممارسات البرمجية. أتميز بالقدرة على العمل تحت الضغط وتقديم حلول ذات جودة عالية.",
    "منفذ {jobTitle} محترف مع خلفية تقنية واسعة. أركز على الكفاءة والابتكار في بناء الأنظمة المعقدة وقيادة الفرق التقنية نحو النجاح."
  ]
};

const experienceBullets = {
  en: [
    "Led development of core features resulting in a 30% increase in user engagement.",
    "Architected and implemented a scalable microservices infrastructure handling millions of records.",
    "Optimized legacy codebase reducing server response time by 45%.",
    "Collaborated with UX/UI designers to enhance frontend responsiveness and accessibility."
  ],
  ar: [
    "قدت تطوير الميزات الأساسية مما أدى إلى زيادة تفاعل المستخدمين بنسبة 30%.",
    "صممت ونفذت بنية أساسية للمصغرات البرمجية القابلة للتوسع والتي تعالج ملايين السجلات.",
    "قمت بتحسين الكود القديم مما أدى إلى تقليل وقت استجابة الخادم بنسبة 45%.",
    "تعاونت مع مصممي واجهة وتجربة المستخدم لتحسين استجابة الواجهة الأمامية وسهولة الوصول."
  ]
};

export const generateAISummary = (jobTitle, language = 'en') => {
  const templates = summaryTemplates[language] || summaryTemplates.en;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return template
    .replace('{jobTitle}', jobTitle || (language === 'ar' ? 'مهندس متخصص' : 'Professional Specialist'))
    .replace('{years}', '5+')
    .replace('{keySkills}', language === 'ar' ? 'تطوير الويب والبرمجة الحديثة' : 'Modern Web Development and Engineering');
};

export const generateAIExperience = (position, language = 'en') => {
  const bullets = experienceBullets[language] || experienceBullets.en;
  const count = 3;
  const shuffled = [...bullets].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join('\n');
};
