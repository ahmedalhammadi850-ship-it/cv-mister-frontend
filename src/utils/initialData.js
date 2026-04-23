// ============================================================
// CV-Mister — Initial Resume Data
// Default empty state for new resumes
// ============================================================

export const initialResumeData = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    photo: '',
  },

  summary: '',

  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certificates: [],
  awards: [],
  volunteering: [],
  references: [],
  customSections: [],
};

// ── Sample Data for Demo ──────────────────────────────────────
export const sampleResumeData = {
  personalInfo: {
    fullName: 'Alexander Mitchell',
    jobTitle: 'Senior Full-Stack Engineer',
    email: 'alex.mitchell@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmitchell.dev',
    linkedin: 'linkedin.com/in/alexmitchell',
    github: 'github.com/alexmitchell',
    photo: '',
  },

  summary: 'Results-driven full-stack engineer with 8+ years of experience building scalable web applications...',

  experience: [
    {
      id: 'exp-1',
      company: 'TechVault Inc.',
      position: 'Lead Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: 'Present',
      description: 'Led a team of 12 engineers in building the next-generation SaaS platform.',
    }
  ],

  education: [
    {
      id: 'edu-1',
      institution: 'Stanford University',
      degree: 'Master of Science in Computer Science',
      location: 'Stanford, CA',
      startDate: '2014-09',
      endDate: '2016-06',
      description: 'Specialization in Distributed Systems and Machine Learning.',
    }
  ],

  skills: [
    { id: 'sk-1', name: 'React / Next.js', level: 95 },
    { id: 'sk-2', name: 'Node.js / Express', level: 92 }
  ],

  projects: [],
  languages: [],
  certificates: [],
  awards: [],
  volunteering: [],
  references: [],
  customSections: [],
};
