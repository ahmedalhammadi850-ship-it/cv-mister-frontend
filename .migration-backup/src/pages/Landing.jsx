// ============================================================
// CV-Mister — Landing Page
// Premium SaaS Landing with Framer Motion animations & Dynamic CMS props
// ============================================================

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Zap, ShieldCheck, FileCheck, Palette,
  ArrowRight, ArrowLeft, Star, Users, Award, CheckCircle,
  ChevronRight
} from 'lucide-react';
import useStyleStore from '../store/useStyleStore';
import useCMSStore from '../store/useCMSStore';

// ── Reusable: Animated Section ──────────────────────────────
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Reusable: Feature Card ─────────────────────────────────
function FeatureCard({ icon, title, desc, index }) {
  return (
    <motion.div 
      className="feature-card-v2"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="feature-icon-wrapper">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </motion.div>
  );
}

export default function Landing() {
  const language = useStyleStore((s) => s.language);
  const isAr = language === 'ar';
  
  // Dynamic CMS Props
  const settings = useCMSStore((s) => s.settings);

  // Icon Mapper
  const ICON_MAP = {
    Zap: <Zap size={28} />, 
    ShieldCheck: <ShieldCheck size={28} />, 
    FileCheck: <FileCheck size={28} />, 
    Palette: <Palette size={28} />,
    Users: <Users size={24} />, 
    Sparkles: <Sparkles size={24} />, 
    Award: <Award size={24} />, 
    Star: <Star size={24} />
  };

  // Parallax for hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div className="landing-v2">
      {/* ═══════════ Hero Section ═══════════ */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid-bg" />

        <motion.div 
          className="hero-content"
          style={{ y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            <Sparkles size={14} />
            <span>{isAr ? settings.heroBadgeAr : settings.heroBadgeEn}</span>
          </motion.div>

          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            dangerouslySetInnerHTML={{ __html: isAr ? settings.heroTitleAr : settings.heroTitleEn }}
          />

          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {isAr ? settings.heroSubtitleAr : settings.heroSubtitleEn}
          </motion.p>

          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link to="/builder/resume" className="hero-btn-primary">
              <span>{isAr ? 'ابدأ الآن' : 'Get Started'}</span>
              {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </Link>
            <Link to="/about" className="hero-btn-secondary">
              {isAr ? 'اعرف المزيد' : 'Learn More'}
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* ═══════════ Features ═══════════ */}
      <section className="features-section">
        <AnimatedSection className="section-header">
          <span className="section-label">{isAr ? 'المميزات' : 'Features'}</span>
          <h2 className="section-title">
            {isAr ? 'كل ما تحتاجه لبناء مسارك المهني' : 'Everything You Need to Build Your Career'}
          </h2>
          <p className="section-subtitle">
            {isAr 
              ? 'أدوات احترافية مصممة بعناية لمساعدتك في الحصول على وظيفة أحلامك'
              : 'Professional tools carefully designed to help you land your dream job'}
          </p>
        </AnimatedSection>

        <div className="features-grid">
          {settings.features.map((f, i) => (
            <FeatureCard 
              key={i}
              icon={React.cloneElement(ICON_MAP[f.iconKey] || <Zap size={28}/>, { color: f.color })}
              title={isAr ? f.titleAr : f.titleEn}
              desc={isAr ? f.descAr : f.descEn}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ How it Works ═══════════ */}
      <section className="how-section">
        <AnimatedSection className="section-header">
          <span className="section-label">{isAr ? 'كيف تعمل المنصة' : 'How It Works'}</span>
          <h2 className="section-title">
            {isAr ? 'ثلاث خطوات بسيطة فقط' : 'Just Three Simple Steps'}
          </h2>
        </AnimatedSection>

        <div className="steps-grid">
          {settings.steps.map((step, i) => (
            <motion.div 
              key={i}
              className="step-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="step-number">{step.num}</div>
              <h3 className="step-title">{isAr ? step.titleAr : step.titleEn}</h3>
              <p className="step-desc">{isAr ? step.descAr : step.descEn}</p>
              {i < settings.steps.length - 1 && (
                <div className="step-connector">
                  <ChevronRight size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ Stats ═══════════ */}
      <section className="stats-section">
        <div className="stats-grid">
          {settings.stats.map((stat, i) => (
            <motion.div 
              key={i}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="stat-icon">{ICON_MAP[stat.iconKey]}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{isAr ? stat.labelAr : stat.labelEn}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="cta-section">
        <motion.div 
          className="cta-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-orb cta-orb-1" />
          <div className="cta-orb cta-orb-2" />
          <h2 className="cta-title">
            {isAr ? 'مستقبلك المهني يبدأ هنا' : 'Your Career Journey Starts Here'}
          </h2>
          <p className="cta-subtitle">
            {isAr 
              ? 'انضم لآلاف المحترفين الذين حصلوا على وظائف أحلامهم باستخدام CV-Mister'
              : 'Join thousands of professionals who landed their dream jobs using CV-Mister'}
          </p>
          <div className="cta-actions">
            <Link to="/register" className="hero-btn-primary">
              <span>{isAr ? 'سجّل مجاناً الآن' : 'Sign Up for Free'}</span>
              {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
