// ============================================================
// CV-Mister — Pricing Page
// Premium SaaS Pricing with 3 tiers and animations
// Fully dynamic — reads all content from CMS Store
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, X, Star, Zap, Crown, Building2,
  ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';
import useStyleStore from '../store/useStyleStore';
import useCMSStore from '../store/useCMSStore';

// ── Icon Map for plan icons ─────────────────────────────────
const PLAN_ICON_MAP = {
  Zap: <Zap size={28} />,
  Crown: <Crown size={28} />,
  Building2: <Building2 size={28} />,
  Star: <Star size={28} />,
  Sparkles: <Sparkles size={28} />,
};

export default function Pricing() {
  const language = useStyleStore((s) => s.language);
  const isAr = language === 'ar';
  const settings = useCMSStore((s) => s.settings);

  // ── Dynamic Plans from CMS ───────────────────────────────
  const plans = (settings.pricingPlans || []).map(plan => ({
    id: plan.id,
    name: isAr ? plan.nameAr : plan.nameEn,
    price: plan.price,
    currency: isAr ? plan.currencyAr : plan.currencyEn,
    period: isAr ? plan.periodAr : plan.periodEn,
    description: isAr ? plan.descriptionAr : plan.descriptionEn,
    icon: PLAN_ICON_MAP[plan.iconKey] || <Zap size={28} />,
    popular: plan.popular,
    cta: isAr ? plan.ctaAr : plan.ctaEn,
    features: plan.features.map(f => ({
      text: isAr ? f.textAr : f.textEn,
      included: f.included,
    })),
  }));

  // ── Dynamic FAQ from CMS ─────────────────────────────────
  const faqs = (settings.pricingFAQ || []).map(faq => ({
    q: isAr ? faq.questionAr : faq.questionEn,
    a: isAr ? faq.answerAr : faq.answerEn,
  }));

  return (
    <div className="pricing-v2">
      {/* ═══════════ Hero ═══════════ */}
      <section className="pricing-hero">
        <div className="about-hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <motion.div 
          className="pricing-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">{isAr ? settings.pricingHeroLabelAr : settings.pricingHeroLabelEn}</span>
          <h1 
            className="pricing-hero-title"
            dangerouslySetInnerHTML={{ __html: isAr ? settings.pricingHeroTitleAr : settings.pricingHeroTitleEn }}
          />
          <p className="pricing-hero-subtitle">
            {isAr ? settings.pricingHeroSubtitleAr : settings.pricingHeroSubtitleEn}
          </p>
        </motion.div>
      </section>

      {/* ═══════════ Pricing Cards ═══════════ */}
      <section className="pricing-cards-section">
        <div className="pricing-cards-grid">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              {plan.popular && (
                <div className="pricing-popular-badge">
                  <Star size={14} fill="currentColor" />
                  <span>{isAr ? 'الأكثر شيوعاً' : 'Most Popular'}</span>
                </div>
              )}

              <div className="pricing-card-header">
                <div className={`pricing-icon-wrapper ${plan.popular ? 'pricing-icon-popular' : ''}`}>
                  {plan.icon}
                </div>
                <h3 className="pricing-plan-name">{plan.name}</h3>
                <p className="pricing-plan-desc">{plan.description}</p>
              </div>

              <div className="pricing-price-row">
                <span className="pricing-currency">{plan.currency}</span>
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>

              <Link 
                to="/register" 
                className={`pricing-cta-btn ${plan.popular ? 'pricing-cta-popular' : ''}`}
              >
                <span>{plan.cta}</span>
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>

              <div className="pricing-features">
                {plan.features.map((feature, fi) => (
                  <div key={fi} className={`pricing-feature-item ${!feature.included ? 'pricing-feature-disabled' : ''}`}>
                    {feature.included 
                      ? <Check size={16} className="pricing-feature-check" />
                      : <X size={16} className="pricing-feature-x" />
                    }
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      {faqs.length > 0 && (
        <section className="pricing-faq-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              {isAr ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
            </h2>
          </motion.div>

          <div className="faq-grid">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="faq-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="faq-question">{faq.q}</h4>
                <p className="faq-answer">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

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
            {isAr ? settings.pricingCtaTitleAr : settings.pricingCtaTitleEn}
          </h2>
          <p className="cta-subtitle">
            {isAr ? settings.pricingCtaSubtitleAr : settings.pricingCtaSubtitleEn}
          </p>
          <Link to="/register" className="hero-btn-primary" style={{ display: 'inline-flex' }}>
            <span>{isAr ? settings.pricingCtaBtnAr : settings.pricingCtaBtnEn}</span>
            <Sparkles size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
