// ============================================================
// CV-Mister — Admin Stats Cards (V2 Premium)
// Glassmorphism cards with animated counters, sparklines & glow
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiFileText, FiClock, FiDollarSign, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';

// ── Animated Counter Hook ───────────────────────────────────
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    startTime.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

// ── Mini Sparkline Chart ────────────────────────────────────
function MiniSparkline({ data, color, width = 80, height = 32 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Area fill */}
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-${color.replace('#','')})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last dot */}
      {(() => {
        const lastX = (data.length - 1) * stepX;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return (
          <circle cx={lastX} cy={lastY} r="3" fill={color} stroke="#0f172a" strokeWidth="1.5" />
        );
      })()}
    </svg>
  );
}

// ── Card Config ─────────────────────────────────────────────
const STAT_CONFIGS = [
  {
    key: 'totalUsers',
    label: 'إجمالي المستخدمين',
    icon: FiUsers,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#818cf8',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    trend: null,
    trendUp: true,
    sparkData: [20, 35, 28, 42, 50, 45, 62, 58, 72, 85, 92, 98],
  },
  {
    key: 'premiumUsers',
    label: 'مستخدمي Pro',
    icon: FiFileText,
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    color: '#22d3ee',
    shadowColor: 'rgba(6, 182, 212, 0.25)',
    trend: null,
    trendUp: true,
    sparkData: [2, 5, 4, 6, 8, 7, 10, 9, 12, 11, 14, 15],
  },
  {
    key: 'pendingRequests',
    label: 'طلبات ترقية معلّقة',
    icon: FiClock,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fbbf24',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    trend: null,
    trendUp: null,
    sparkData: [2, 5, 3, 8, 6, 4, 7, 5, 9, 6, 8, 7],
  },
  {
    key: 'totalTemplates',
    label: 'عدد القوالب',
    icon: FiDollarSign,
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#34d399',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    trend: null,
    trendUp: true,
    sparkData: [10, 12, 14, 15, 17, 18, 19, 20, 21, 22, 23, 23],
  },
];

export default function StatsCards({ stats = {} }) {
  const defaultStats = {
    totalUsers: stats.totalUsers ?? 0,
    premiumUsers: stats.premiumUsers ?? 0,
    pendingRequests: stats.pendingRequests ?? 0,
    totalTemplates: stats.totalTemplates ?? 23,
  };

  return (
    <>
      <style>{`
        @keyframes statsCardEntry {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .admin-stat-card {
          animation: statsCardEntry 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          position: relative;
          overflow: hidden;
        }
        .admin-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .admin-stat-card:hover {
          transform: translateY(-3px) !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
      `}</style>

      <div className="admin-grid-4">
        {STAT_CONFIGS.map((config, index) => {
          const Icon = config.icon;
          const rawValue = defaultStats[config.key];
          const animatedValue = useAnimatedCounter(rawValue, 1200 + index * 200);
          const displayValue = config.isCurrency
            ? `$${animatedValue.toLocaleString()}`
            : animatedValue.toLocaleString();

          return (
            <div
              key={config.key}
              className="admin-stat-card"
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(24px)',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                animationDelay: `${index * 100}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 12px 40px ${config.shadowColor}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Background Glow Orb */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                left: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: config.gradient,
                opacity: 0.06,
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }} />

              {/* Top: Icon + Sparkline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: config.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 20px ${config.shadowColor}`,
                }}>
                  <Icon size={21} color="#fff" strokeWidth={2.2} />
                </div>
                <MiniSparkline data={config.sparkData} color={config.color} />
              </div>

              {/* Value */}
              <div style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: '6px',
                fontFeatureSettings: '"tnum"',
              }}>
                {displayValue}
              </div>

              {/* Label */}
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 500,
                marginBottom: '12px',
              }}>
                {config.label}
              </div>

              {/* Trend Badge */}
              {config.trend && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: config.trendUp
                    ? 'rgba(16, 185, 129, 0.1)'
                    : config.trendUp === false
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                  color: config.trendUp
                    ? '#34d399'
                    : config.trendUp === false
                      ? '#f87171'
                      : '#fbbf24',
                  border: `1px solid ${
                    config.trendUp
                      ? 'rgba(52,211,153,0.15)'
                      : config.trendUp === false
                        ? 'rgba(248,113,113,0.15)'
                        : 'rgba(251,191,36,0.15)'
                  }`,
                }}>
                  {config.trendUp !== null && <FiArrowUpRight size={12} />}
                  {config.trend}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
