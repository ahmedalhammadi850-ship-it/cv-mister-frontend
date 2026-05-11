// ============================================================
// CV-Mister — CV Scan Panel
// AI-powered Resume Analysis via N8N Webhook
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useCMSStore from '../../store/useCMSStore';
import PaymentModal from './PaymentModal';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Briefcase,
  ClipboardList,
  Loader2,
  BarChart3,
  Target,
  TrendingUp,
  Lightbulb,
  ScanSearch,
  Trash2,
  RefreshCw,
  Brain,
  Award,
  BookOpen,
  Zap,
  Star,
  ShieldCheck,
  TriangleAlert
} from 'lucide-react';

const N8N_WEBHOOK_URL = '/n8n/webhook/b091e0d0-e2ed-4429-b40d-628e66276696';

// ── Key Mapping: Normalize any response shape to our standard fields ──
const KEY_MAP = {
  score: ['score', 'Score', 'cv_score', 'النتيجة', 'الدرجة', 'matchScore', 'match_score', 'نتيجة_التوافق'],
  match_level: ['match_level', 'matchLevel', 'cv_level', 'مستوى_التوافق', 'مستوى التوافق', 'level', 'Level', 'المستوى'],
  candidate_name: ['candidate_name', 'candidateName', 'اسم_المرشح', 'الاسم', 'name'],
  found_skills: ['found_skills', 'foundSkills', 'skills', 'المهارات_الموجودة', 'المهارات الموجودة', 'matched_skills', 'matchedSkills', 'skills_found', 'المهارات'],
  missing_skills: ['missing_skills', 'missingSkills', 'المهارات_المفقودة', 'المهارات المفقودة', 'missing', 'skills_missing'],
  strength_points: ['strength_points', 'strengthPoints', 'نقاط_القوة', 'نقاط القوة', 'strengths'],
  weak_points: ['weak_points', 'weakPoints', 'نقاط_الضعف', 'نقاط الضعف', 'weaknesses'],
  analysis: ['analysis', 'Analysis', 'التحليل', 'تحليل', 'summary', 'feedback', 'الملخص'],
  recommendation: ['recommendation', 'Recommendation', 'improvement_tips', 'improvementTips', 'التوصية', 'توصية', 'التوصيات', 'recommendations', 'نصيحة', 'advice', 'tips'],
};

function extractField(data, fieldName, fallback = null) {
  const candidates = KEY_MAP[fieldName] || [fieldName];
  for (const key of candidates) {
    if (data[key] !== undefined && data[key] !== null) return data[key];
  }
  return fallback;
}

function cleanJsonFromMarkdown(raw) {
  if (typeof raw !== 'string') return raw;
  let cleaned = raw.trim();
  // Strip ```json ... ``` wrapping
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned;
}

function normalizeResponse(raw) {
  let data = raw;
  let responseMode = null;

  // If the response is a string (possibly markdown-wrapped JSON), parse it
  if (typeof data === 'string') {
    try {
      data = JSON.parse(cleanJsonFromMarkdown(data));
    } catch {
      // If parsing fails, treat the entire string as analysis text
      return {
        mode: 'UNKNOWN',
        candidate_name: '',
        score: 0,
        match_level: '—',
        found_skills: [],
        missing_skills: [],
        strength_points: [],
        weak_points: [],
        analysis: data,
        recommendation: '',
      };
    }
  }

  // If response is an array, take the first element
  if (Array.isArray(data)) data = data[0] || {};

  // Extract mode if it exists at the root level
  if (data.mode) {
    responseMode = data.mode;
  }

  // If there's a "result" key wrapping the real payload, unwrap it
  if (data.result && typeof data.result === 'object') {
    data = data.result;
  } else if (data.output && typeof data.output === 'object') {
    // Legacy support for "output" wrapping
    data = data.output;
  }

  const candidate_name = String(extractField(data, 'candidate_name', '') || '');
  const score = Number(extractField(data, 'score', 0));
  const match_level = String(extractField(data, 'match_level', '—'));

  let found_skills = extractField(data, 'found_skills', []);
  if (typeof found_skills === 'string') found_skills = found_skills.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);

  let missing_skills = extractField(data, 'missing_skills', []);
  if (typeof missing_skills === 'string') missing_skills = missing_skills.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);

  let strength_points = extractField(data, 'strength_points', []);
  if (typeof strength_points === 'string') strength_points = strength_points.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);

  let weak_points = extractField(data, 'weak_points', []);
  if (typeof weak_points === 'string') weak_points = weak_points.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);

  const analysis = String(extractField(data, 'analysis', '') || '');
  const recommendation = String(extractField(data, 'recommendation', '') || '');

  return { mode: responseMode, candidate_name, score, match_level, found_skills, missing_skills, strength_points, weak_points, analysis, recommendation };
}


export default function CVScanPanel({ language = 'en' }) {
// ── State ──────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanMode, setScanMode] = useState('with_job'); // 'with_job' | 'general'
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAIFreeGlobally = useCMSStore((s) => s.settings?.isAIFreeGlobally);

  const checkProStatus = () => {
    if (isAIFreeGlobally || user?.plan === 'pro') return true;
    setPaymentModalOpen(true);
    return false;
  };

  const isAr = language === 'ar';

  // ── Labels ─────────────────────────────────────────────────
  const t = {
    pageTitle: isAr ? 'فحص السيرة الذاتية' : 'CV Scanner',
    pageSubtitle: isAr ? 'حلل سيرتك الذاتية مقابل أي وصف وظيفي باستخدام الذكاء الاصطناعي' : 'Analyze your resume against any job description with AI',
    uploadTitle: isAr ? 'ارفع سيرتك الذاتية' : 'Upload Your Resume',
    uploadHint: isAr ? 'اسحب وأفلت ملف PDF هنا أو اضغط للاختيار' : 'Drag & drop your PDF here, or click to browse',
    uploadFormat: isAr ? 'يدعم صيغة PDF فقط (الحد الأقصى 10MB)' : 'Supports PDF only (Max 10MB)',
    tabTitle: isAr ? 'مسمى وظيفي' : 'Job Title',
    tabManual: isAr ? 'وصف وظيفي كامل' : 'Full Job Description',
    jobTitlePlaceholder: isAr ? 'مثال: مطور واجهات أمامية' : 'e.g. Senior Frontend Developer',
    jobDescPlaceholder: isAr ? 'الصق الوصف الوظيفي الكامل هنا...' : 'Paste the full job description here...',
    scanBtn: isAr ? 'ابدأ الفحص' : 'Start Scan',
    scanning: isAr ? 'جاري التحليل بالذكاء الاصطناعي...' : 'AI is analyzing your resume...',
    matchScore: isAr ? 'نسبة التوافق' : 'Match Score',
    matchLevel: isAr ? 'مستوى التطابق' : 'Match Level',
    foundSkills: isAr ? 'المهارات الموجودة' : 'Found Skills',
    missingSkills: isAr ? 'المهارات المفقودة' : 'Missing Skills',
    analysisTitle: isAr ? 'التحليل التفصيلي' : 'Detailed Analysis',
    recommendationTitle: isAr ? 'نصيحة الذكاء الاصطناعي لتحسين سيرتك' : 'AI Recommendation to Improve Your CV',
    feedback: isAr ? 'نصائح التحسين' : 'Improvement Tips',
    scanAgain: isAr ? 'فحص جديد' : 'Scan Again',
    removeFile: isAr ? 'إزالة الملف' : 'Remove file',
    errorNoFile: isAr ? 'يرجى رفع ملف السيرة الذاتية' : 'Please upload your resume file',
    errorNoInput: isAr ? 'يرجى إدخال المسمى أو الوصف الوظيفي' : 'Please enter a job title or description',
    errorScan: isAr ? 'فشل في التحليل، يرجى المحاولة مرة أخرى' : 'Scan failed. Please try again.',
    excellent: isAr ? 'ممتاز!' : 'Excellent!',
    good: isAr ? 'جيد' : 'Good',
    needsWork: isAr ? 'يحتاج تحسين' : 'Needs Improvement',
    noFound: isAr ? 'لم يتم العثور على مهارات متطابقة' : 'No matching skills found',
    noMissing: isAr ? 'لا توجد مهارات مفقودة - عمل ممتاز!' : 'No missing skills — great job!',
    noAnalysis: isAr ? 'لا يوجد تحليل إضافي' : 'No additional analysis provided.',
    noRecommendation: isAr ? 'لا توجد توصيات إضافية حالياً' : 'No additional recommendations at this time.',
    modeWithJob: isAr ? 'تحليل مع وصف وظيفي' : 'Analysis with Job Description',
    modeGeneral: isAr ? 'تحليل بدون وصف وظيفي (عام)' : 'General Analysis (No Job)',
  };

  // ── File Handlers ──────────────────────────────────────────
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error(isAr ? 'يرجى رفع ملف PDF فقط' : 'Please upload a PDF file only');
    }
  }, [isAr]);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    } else if (selected) {
      toast.error(isAr ? 'يرجى رفع ملف PDF فقط' : 'Please upload a PDF file only');
    }
  };

  // ── Scan Handler ───────────────────────────────────────────
  const handleScan = async () => {
    if (!checkProStatus()) return;

    if (!file) {
      toast.error(t.errorNoFile);
      return;
    }
    
    const hasInput = jobTitle.trim() !== '' || jobDescription.trim() !== '';
    if (!hasInput) {
      toast.error(t.errorNoInput);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobTitle', jobTitle.trim() || '');
      formData.append('jobDescription', jobDescription.trim() || '');

      const response = await axios.post(N8N_WEBHOOK_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });

      const normalized = normalizeResponse(response.data);
      setResults(normalized);
      toast.success(isAr ? 'تم التحليل بنجاح!' : 'Analysis complete!');
    } catch (err) {
      console.error('Scan error:', err);
      toast.error(isAr ? 'حدث خطأ في الاتصال: ' + err.message : 'Connection Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setJobTitle('');
    setJobDescription('');
    setResults(null);
    setScanMode('with_job');
  };

  // ── Score Helpers ──────────────────────────────────────────
  const getScoreColor = (score) => {
    if (score > 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score) => {
    if (score > 70) return t.excellent;
    if (score >= 50) return t.good;
    return t.needsWork;
  };

  // ── Stagger Container ─────────────────────────────────────
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  // ── Circular Progress SVG ──────────────────────────────────
  const CircularProgress = ({ score }) => {
    const radius = 74;
    const strokeWidth = 10;
    const size = 200;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={strokeWidth}
            opacity="0.2"
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 10px ${color}50)` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, type: 'spring', stiffness: 200 }}
            style={{ fontSize: '48px', fontWeight: 900, color, lineHeight: 1 }}
          >
            {score}%
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            style={{
              fontSize: '13px', fontWeight: 700,
              color, opacity: 0.85,
              marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em'
            }}
          >
            {getScoreLabel(score)}
          </motion.span>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        templateName="فحص السيرة الذاتية (CV Scan AI)" 
      />
      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
          }}>
            <ScanSearch size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.pageTitle}</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.pageSubtitle}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════════════════ */}
        {/* ══  RESULTS VIEW  ══════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════ */}
        {results ? (
          <motion.div
            key="results"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >

            {/* ╔══════════════════════════════════════════════════╗
                ║  TOP SECTION: Score Circle + Match Level         ║
                ╚══════════════════════════════════════════════════╝ */}
            <motion.div
              variants={staggerItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '40px',
                padding: '40px 48px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '24px',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative radial glow */}
              <div style={{
                position: 'absolute',
                top: '-60px',
                [isAr ? 'right' : 'left']: '-20px',
                width: '280px', height: '280px', borderRadius: '50%',
                background: `radial-gradient(circle, ${getScoreColor(results.score)}12, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              {/* Circular Progress */}
              <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
                <CircularProgress score={results.score} />
              </div>

              {/* Match Level + Quick Info */}
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Award size={20} color={getScoreColor(results.score)} />
                  <span style={{
                    fontSize: '13px', fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                  }}>
                    {t.matchLevel}
                  </span>
                </div>
                <motion.h2
                  initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: getScoreColor(results.score),
                    marginBottom: '16px',
                    lineHeight: 1.2
                  }}
                >
                  {results.match_level}
                </motion.h2>

                {results.candidate_name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    style={{ marginBottom: '8px', fontSize: '15px', color: 'var(--text-secondary)' }}
                  >
                    <strong>{isAr ? 'المرشح: ' : 'Candidate: '}</strong> {results.candidate_name}
                  </motion.div>
                )}

                {results.mode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.4 }}
                    style={{
                      marginBottom: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(99,102,241,0.1)',
                      color: '#6366F1',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <Target size={14} />
                    {results.mode === 'ATS_WITH_JOB'
                      ? (isAr ? 'تحليل مع وظيفة (ATS Mode)' : 'ATS Mode (With Job)')
                      : results.mode === 'CV_ONLY'
                        ? (isAr ? 'تحليل بدون وظيفة (CV Mode)' : 'CV Mode (No Job)')
                        : results.mode}
                  </motion.div>
                )}

                {/* Mini stats */}
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={16} color="#10B981" />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>
                        {results.found_skills.length}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t.foundSkills}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <TriangleAlert size={16} color="#EF4444" />
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444' }}>
                        {results.missing_skills.length}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t.missingSkills}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* ╔══════════════════════════════════════════════════╗
                ║  SKILLS SECTION: Found (Right) + Missing (Left) ║
                ╚══════════════════════════════════════════════════╝ */}
            <motion.div
              variants={staggerItem}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}
            >
              {/* ── Found Skills (Right in RTL, Left in LTR) ─── */}
              <div style={{
                padding: '28px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle top border accent */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                  borderRadius: '20px 20px 0 0'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={20} color="#10B981" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t.foundSkills}
                    <span style={{
                      marginInlineStart: '8px', fontSize: '13px',
                      color: '#10B981', fontWeight: 600
                    }}>
                      ({results.found_skills.length})
                    </span>
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {results.found_skills.length > 0 ? results.found_skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10B981',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      ✅ {skill}
                    </motion.span>
                  )) : (
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      {t.noFound}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Missing Skills ──────────────────────────── */}
              <div style={{
                padding: '28px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle top border accent */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, #EF4444, #F87171)',
                  borderRadius: '20px 20px 0 0'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <TriangleAlert size={20} color="#EF4444" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t.missingSkills}
                    <span style={{
                      marginInlineStart: '8px', fontSize: '13px',
                      color: '#EF4444', fontWeight: 600
                    }}>
                      ({results.missing_skills.length})
                    </span>
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {results.missing_skills.length > 0 ? results.missing_skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      ⚠️ {skill}
                    </motion.span>
                  )) : (
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      {t.noMissing}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ╔══════════════════════════════════════════════════╗
                ║  STRENGTHS & WEAKNESSES SECTION (General Mode)   ║
                ╚══════════════════════════════════════════════════╝ */}
            {(results.strength_points?.length > 0 || results.weak_points?.length > 0) && (
              <motion.div
                variants={staggerItem}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}
              >
                {/* ── Strengths ─── */}
                <div style={{
                  padding: '24px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(59,130,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <TrendingUp size={16} color="#3B82F6" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isAr ? 'نقاط القوة' : 'Strength Points'}
                    </h3>
                  </div>
                  <ul style={{ margin: 0, paddingInlineStart: '24px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
                    {results.strength_points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* ── Weaknesses ─── */}
                <div style={{
                  padding: '24px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(249,115,22,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Target size={16} color="#F97316" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isAr ? 'نقاط الضعف' : 'Weak Points'}
                    </h3>
                  </div>
                  <ul style={{ margin: 0, paddingInlineStart: '24px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
                    {results.weak_points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}


            {/* ╔══════════════════════════════════════════════════╗
                ║  ANALYSIS SECTION                                ║
                ╚══════════════════════════════════════════════════╝ */}
            <motion.div
              variants={staggerItem}
              style={{
                padding: '32px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#6366F1" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.analysisTitle}
                </h3>
              </div>
              <div style={{
                padding: '24px',
                borderRadius: '14px',
                background: 'var(--bg-elevated, rgba(0,0,0,0.02))',
                border: '1px solid var(--border-default)',
              }}>
                <p style={{
                  fontSize: '15px', lineHeight: '2',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}>
                  {results.analysis || t.noAnalysis}
                </p>
              </div>
            </motion.div>


            {/* ╔══════════════════════════════════════════════════╗
                ║  RECOMMENDATION SECTION (HIGHLIGHT)              ║
                ╚══════════════════════════════════════════════════╝ */}
            <motion.div
              variants={staggerItem}
              style={{
                padding: '32px',
                borderRadius: '20px',
                marginBottom: '32px',
                background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.04) 100%)',
                border: '1px solid rgba(251,191,36,0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative shimmer line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)',
                borderRadius: '20px 20px 0 0'
              }} />

              {/* Decorative corner sparkle */}
              <div style={{
                position: 'absolute',
                top: '16px',
                [isAr ? 'left' : 'right']: '24px',
                opacity: 0.15, pointerEvents: 'none'
              }}>
                <Sparkles size={48} color="#F59E0B" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Brain size={22} color="#F59E0B" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px', fontWeight: 800,
                    color: '#D97706',
                    marginBottom: '2px'
                  }}>
                    {t.recommendationTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={12} color="#F59E0B" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', opacity: 0.7 }}>
                      {isAr ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '15px', lineHeight: '2',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                margin: 0,
                position: 'relative', zIndex: 1
              }}>
                {results.recommendation || t.noRecommendation}
              </p>
            </motion.div>


            {/* ── Scan Again Button ──────────────────────────── */}
            <motion.div variants={staggerItem} style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(99,102,241,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={resetAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 40px',
                  borderRadius: '14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshCw size={18} /> {t.scanAgain}
              </motion.button>
            </motion.div>
          </motion.div>

        ) : (
          /* ══════════════════════════════════════════════════════ */
          /* ══  UPLOAD / INPUT VIEW  ════════════════════════════ */
          /* ══════════════════════════════════════════════════════ */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* ── File Upload Area ─────────────────────────── */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                padding: '32px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(59,130,246,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Upload size={18} color="#3B82F6" />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t.uploadTitle}
                  </h3>
                </div>

                {!file ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? '#6366F1' : 'var(--border-hover)'}`,
                      borderRadius: '16px',
                      padding: '48px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: dragActive ? 'rgba(99,102,241,0.04)' : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '16px',
                      background: 'rgba(99,102,241,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <Upload size={28} color="#6366F1" />
                    </div>
                    <p style={{
                      fontSize: '15px', fontWeight: 600,
                      color: 'var(--text-primary)', marginBottom: '8px'
                    }}>
                      {t.uploadHint}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {t.uploadFormat}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: 'rgba(99,102,241,0.04)',
                      border: '1px solid rgba(99,102,241,0.15)',
                      display: 'flex', alignItems: 'center', gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={24} color="#fff" />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{
                        fontSize: '15px', fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      title={t.removeFile}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#EF4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* ── Job Input Area ───────────────────────────── */}
              <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '20px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '14px', fontWeight: 700,
                      color: 'var(--text-primary)', marginBottom: '10px'
                    }}>
                      <Briefcase size={16} color="#6366F1" />
                      {isAr ? 'المسمى الوظيفي' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder={t.jobTitlePlaceholder}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        fontSize: '15px',
                        borderRadius: '12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.2s'
                      }}
                    />
                    <p style={{
                      fontSize: '12px', color: 'var(--text-muted)',
                      marginTop: '8px', lineHeight: '1.6'
                    }}>
                      {isAr
                        ? 'أدخل المسمى الوظيفي المستهدف.'
                        : 'Enter the target job title.'}
                    </p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '14px', fontWeight: 700,
                      color: 'var(--text-primary)', marginBottom: '10px'
                    }}>
                      <ClipboardList size={16} color="#6366F1" />
                      {isAr ? 'الوصف الوظيفي' : 'Job Description'}
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={t.jobDescPlaceholder}
                      className="form-input"
                      style={{
                        width: '100%',
                        flex: 1,
                        minHeight: '140px',
                        padding: '14px 18px',
                        fontSize: '14px',
                        lineHeight: '1.7',
                        borderRadius: '12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
              </div>
            </div>

            {/* ── Scan Button ────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 8px 30px rgba(99,102,241,0.35)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleScan}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '16px 48px',
                  borderRadius: '14px',
                  background: loading
                    ? 'var(--bg-elevated)'
                    : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  border: loading ? '1px solid var(--border-default)' : 'none',
                  color: loading ? 'var(--text-secondary)' : '#fff',
                  fontSize: '16px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.25)',
                  minWidth: '240px',
                  justifyContent: 'center'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="spin-icon" />
                    {t.scanning}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    {t.scanBtn}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
