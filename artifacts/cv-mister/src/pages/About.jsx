// ============================================================
// CV-Mister — About Us Page
// Premium SaaS "About" with timeline, stats, mission, vision
// Fully dynamic — reads all content from CMS Store
// ============================================================

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Target, Eye, Rocket, Heart, Users, Award, Globe, 
  Lightbulb, Shield, Cpu, TrendingUp, Briefcase,
  Star, CheckCircle, Zap
} from 'lucide-react';
import useStyleStore from '../store/useStyleStore';
import useCMSStore from '../store/useCMSStore';

// ── Icon Map ────────────────────────────────────────────────
const ICON_MAP = {
  Target, Eye, Rocket, Heart, Users, Award, Globe,
  Lightbulb, Shield, Cpu, TrendingUp, Briefcase,
  Star, CheckCircle, Zap
};

function getIcon(key, size = 24) {
  const Icon = ICON_MAP[key] || Star;
  return <Icon size={size} />;
}

// ── Animation Variants ──────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function About() {
  const language = useStyleStore((s) => s.language);
  const isAr = language === 'ar';
  const settings = useCMSStore((s) => s.settings);

  // ── Dynamic Data from CMS ────────────────────────────────
  const stats = (settings.aboutStats || []).map(stat => ({
    value: stat.value,
    label: isAr ? stat.labelAr : stat.labelEn,
    icon: getIcon(stat.iconKey, 28),
  }));

  const timeline = (settings.aboutTimeline || []).map(item => ({
    year: item.year,
    title: isAr ? item.titleAr : item.titleEn,
    desc: isAr ? item.descAr : item.descEn,
    icon: getIcon(item.iconKey, 20),
  }));

  const pillars = (settings.aboutPillars || []).map(p => ({
    icon: getIcon(p.iconKey, 24),
    title: isAr ? p.titleAr : p.titleEn,
    desc: isAr ? p.descAr : p.descEn,
  }));

  const missionChecklist = isAr ? (settings.aboutMissionChecklistAr || []) : (settings.aboutMissionChecklistEn || []);
  const visionChecklist = isAr ? (settings.aboutVisionChecklistAr || []) : (settings.aboutVisionChecklistEn || []);

  return (
    <div className="about-v2">
      {/* ═══════════ Hero ═══════════ */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <motion.div 
          className="about-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">{isAr ? settings.aboutHeroLabelAr : settings.aboutHeroLabelEn}</span>
          <h1 
            className="about-hero-title"
            dangerouslySetInnerHTML={{ __html: isAr ? settings.aboutHeroTitleAr : settings.aboutHeroTitleEn }}
          />
          <p className="about-hero-subtitle">
            {isAr ? settings.aboutHeroSubtitleAr : settings.aboutHeroSubtitleEn}
          </p>
        </motion.div>
      </section>

      {/* ═══════════ Stats ═══════════ */}
      <section className="about-stats-section">
        <motion.div
          className="section-header"
          style={{ marginBottom: '48px' }}
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
        >
          <span className="section-label">{isAr ? 'أرقام نفتخر بها' : 'Numbers We\'re Proud Of'}</span>
          <h2 className="section-title">
            {isAr ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers'}
          </h2>
        </motion.div>
        
        <motion.div 
          className="about-stats-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              className="about-stat-card"
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="about-stat-icon">{stat.icon}</div>
              <div className="about-stat-value">{stat.value}</div>
              <div className="about-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ Story Timeline ═══════════ */}
      <section className="timeline-section">
        <motion.div 
          className="section-header"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
        >
          <span className="section-label">{isAr ? 'رحلتنا' : 'Our Journey'}</span>
          <h2 className="section-title">
            {isAr ? 'كيف بدأت القصة؟' : 'How the Story Began'}
          </h2>
        </motion.div>

        <div className="timeline-container">
          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              className="timeline-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={i % 2 === 0 ? fadeInLeft : fadeInRight}
              transition={{ delay: i * 0.15 }}
            >
              <div className="timeline-dot">
                {item.icon}
              </div>
              <div className="timeline-content">
                <div className="timeline-year">{item.year}</div>
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-desc">{item.desc}</p>
              </div>
            </motion.div>
          ))}
          <div className="timeline-line" />
        </div>
      </section>

      {/* ═══════════ Mission & Vision ═══════════ */}
      <section className="mv-section">
        <div className="mv-grid">
          <motion.div 
            className="mv-card mv-card-mission"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeInRight}
            whileHover={{ y: -5 }}
          >
            <div className="mv-icon-wrapper mv-icon-mission">
              <Target size={32} />
            </div>
            <h3 className="mv-title">{isAr ? settings.aboutMissionTitleAr : settings.aboutMissionTitleEn}</h3>
            <p className="mv-desc">
              {isAr ? settings.aboutMissionDescAr : settings.aboutMissionDescEn}
            </p>
            <div className="mv-checklist">
              {missionChecklist.map((item, i) => (
                <div key={i} className="mv-check-item">
                  <CheckCircle size={16} className="mv-check-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="mv-card mv-card-vision"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeInLeft}
            whileHover={{ y: -5 }}
          >
            <div className="mv-icon-wrapper mv-icon-vision">
              <Eye size={32} />
            </div>
            <h3 className="mv-title">{isAr ? settings.aboutVisionTitleAr : settings.aboutVisionTitleEn}</h3>
            <p className="mv-desc">
              {isAr ? settings.aboutVisionDescAr : settings.aboutVisionDescEn}
            </p>
            <div className="mv-checklist">
              {visionChecklist.map((item, i) => (
                <div key={i} className="mv-check-item">
                  <CheckCircle size={16} className="mv-check-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Pillars of Strength ═══════════ */}
      <section className="pillars-section">
        <motion.div 
          className="section-header"
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
        >
          <span className="section-label">{isAr ? 'ركائز قوتنا' : 'Our Pillars'}</span>
          <h2 className="section-title">
            {isAr ? 'ما الذي يميزنا؟' : 'What Makes Us Different?'}
          </h2>
        </motion.div>

        <motion.div 
          className="pillars-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {pillars.map((pillar, i) => (
            <motion.div 
              key={i}
              className="pillar-card"
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="pillar-icon">{pillar.icon}</div>
              <h4 className="pillar-title">{pillar.title}</h4>
              <p className="pillar-desc">{pillar.desc}</p>
            </motion.div>
          ))}
        </motion.div>
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
            {isAr ? settings.aboutCtaTitleAr : settings.aboutCtaTitleEn}
          </h2>
          <p className="cta-subtitle">
            {isAr ? settings.aboutCtaSubtitleAr : settings.aboutCtaSubtitleEn}
          </p>
          <a href="/register" className="hero-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            <span>{isAr ? settings.aboutCtaBtnAr : settings.aboutCtaBtnEn}</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
}
