import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

import { API_ROUTES } from '../api/config';

const API_URL = `${API_ROUTES.ADMIN}/content`;
const PUBLIC_API_URL = API_ROUTES.CONTENT;

const useCMSStore = create(
  persist(
    (set, get) => ({
      isLoading: false,
      settings: {
        isAIFreeGlobally: false,
        // ═══════════════════════════════════════════════
        // LANDING PAGE (Home)
        // ═══════════════════════════════════════════════
        heroBadgeAr: 'مدعوم بالذكاء الاصطناعي — 2026',
        heroBadgeEn: 'Powered by AI — 2026',
        heroTitleAr: 'اصنع سيرتك الذاتية<br /><span class="hero-title-accent">باحتراف باستخدام الذكاء الاصطناعي</span>',
        heroTitleEn: 'Build Your Resume<br /><span class="hero-title-accent">Professionally with AI</span>',
        heroSubtitleAr: 'صمّم سيرة ذاتية احترافية ورسالة تغطية مميزة خلال دقائق. دعم كامل للغة العربية والإنجليزية مع قوالب متوافقة مع أنظمة ATS.',
        heroSubtitleEn: 'Create a professional resume and stunning cover letter in minutes. Full Arabic and English support with ATS-compatible templates.',
        features: [
          { iconKey: 'Zap', titleAr: 'سرعة فائقة', titleEn: 'Lightning Fast', descAr: 'أنشئ سيرتك الذاتية في دقائق معدودة.', descEn: 'Build your resume in minutes.', color: '#3B82F6' },
          { iconKey: 'ShieldCheck', titleAr: 'أمان وخصوصية', titleEn: 'Secure & Private', descAr: 'بياناتك محمية بتشفير متقدم.', descEn: 'Your data is protected with advanced encryption.', color: '#10B981' },
          { iconKey: 'FileCheck', titleAr: 'متوافق مع ATS', titleEn: 'ATS Compatible', descAr: 'تجتاز أنظمة فرز السير الذاتية الآلية بنجاح.', descEn: 'Pass Applicant Tracking Systems with flying colors.', color: '#F59E0B' },
          { iconKey: 'Palette', titleAr: 'تصميم احترافي', titleEn: 'Professional Design', descAr: 'قوالب فاخرة مصممة بعناية لتعكس هويتك المهنية.', descEn: 'Premium templates designed to showcase your identity.', color: '#8B5CF6' }
        ],
        steps: [
          { num: '01', titleAr: 'أضف محتواك', titleEn: 'Add Your Content', descAr: 'أدخل بياناتك والذكاء الاصطناعي يساعدك', descEn: 'Enter your details, AI helps you along' },
          { num: '02', titleAr: 'اختر القالب', titleEn: 'Choose Template', descAr: 'اختر من بين أكثر من 10 قوالب احترافية', descEn: 'Select from 10+ professional templates' },
          { num: '03', titleAr: 'صدّر وشارك', titleEn: 'Export & Share', descAr: 'حمّل بصيغة PDF جاهزة للتقديم', descEn: 'Download ATS-ready PDF for applications' }
        ],
        stats: [
             { value: '50K+', labelAr: 'مستخدم سعيد', labelEn: 'Happy Users', iconKey: 'Users' },
             { value: '5M+',  labelAr: 'سيرة ذاتية', labelEn: 'Resumes Built', iconKey: 'Sparkles' },
             { value: '98%',  labelAr: 'معدل النجاح', labelEn: 'Success Rate', iconKey: 'Award' },
             { value: '4.9',  labelAr: 'تقييم المستخدمين', labelEn: 'User Rating', iconKey: 'Star' }
        ],
        copyrightAr: 'جميع الحقوق محفوظة',
        copyrightEn: 'All Rights Reserved',
        socialTelegram: 'https://t.me/cvmister',
        socialWhatsapp: 'https://wa.me/1234567890',

        // ═══════════════════════════════════════════════
        // ABOUT PAGE
        // ═══════════════════════════════════════════════
        aboutHeroLabelAr: 'من نحن',
        aboutHeroLabelEn: 'About Us',
        aboutHeroTitleAr: 'نحن نبني <span class="hero-title-accent">مستقبل التوظيف</span>',
        aboutHeroTitleEn: 'We\'re Building the <span class="hero-title-accent">Future of Hiring</span>',
        aboutHeroSubtitleAr: 'منصة متكاملة تمزج بين خبرة الموارد البشرية وتقنيات الذكاء الاصطناعي لمساعدتك في الحصول على وظيفة أحلامك',
        aboutHeroSubtitleEn: 'An integrated platform that blends HR expertise with AI technologies to help you land your dream job',
        aboutStats: [
          { value: '50,000+', labelAr: 'مستخدم نشط', labelEn: 'Active Users', iconKey: 'Users' },
          { value: '5M+', labelAr: 'سيرة ذاتية', labelEn: 'Resumes Created', iconKey: 'Briefcase' },
          { value: '15+', labelAr: 'دولة', labelEn: 'Countries', iconKey: 'Globe' },
          { value: '98%', labelAr: 'رضا المستخدمين', labelEn: 'User Satisfaction', iconKey: 'Star' },
        ],
        aboutTimeline: [
          {
            year: '2024',
            titleAr: 'بداية الفكرة', titleEn: 'The Spark',
            descAr: 'لاحظنا أن الباحثين عن عمل في العالم العربي يواجهون تحديات كبيرة في إنشاء سير ذاتية احترافية تتوافق مع المعايير العالمية.',
            descEn: 'We noticed job seekers in the Arab world face significant challenges creating professional resumes that meet global standards.',
            iconKey: 'Lightbulb'
          },
          {
            year: '2025',
            titleAr: 'إطلاق المنصة', titleEn: 'Platform Launch',
            descAr: 'أطلقنا النسخة الأولى من CV-Mister مع دعم كامل للعربية والإنجليزية و5 قوالب احترافية.',
            descEn: 'We launched the first version of CV-Mister with full Arabic and English support and 5 professional templates.',
            iconKey: 'Rocket'
          },
          {
            year: '2026',
            titleAr: 'الذكاء الاصطناعي', titleEn: 'AI Integration',
            descAr: 'دمجنا تقنيات الذكاء الاصطناعي المتقدمة لمساعدة المستخدمين في كتابة محتوى احترافي وتحسين سيرهم الذاتية تلقائياً.',
            descEn: 'We integrated advanced AI technologies to help users write professional content and automatically improve their resumes.',
            iconKey: 'Cpu'
          },
        ],
        aboutMissionTitleAr: 'مهمتنا',
        aboutMissionTitleEn: 'Our Mission',
        aboutMissionDescAr: 'تمكين كل باحث عن عمل في العالم العربي من تقديم نفسه بأفضل صورة ممكنة، من خلال أدوات ذكية وقوالب احترافية تتوافق مع المعايير العالمية والمحلية.',
        aboutMissionDescEn: 'Empowering every job seeker in the Arab world to present themselves in the best possible way, through smart tools and professional templates that meet both global and local standards.',
        aboutMissionChecklistAr: ['تبسيط عملية إنشاء السيرة الذاتية', 'توفير أدوات ذكاء اصطناعي متقدمة', 'دعم كامل للغة العربية'],
        aboutMissionChecklistEn: ['Simplify the resume creation process', 'Provide advanced AI tools', 'Full Arabic language support'],
        aboutVisionTitleAr: 'رؤيتنا',
        aboutVisionTitleEn: 'Our Vision',
        aboutVisionDescAr: 'أن نكون المنصة الأولى والموثوقة لكل باحث عن عمل في المنطقة العربية، من خلال دمج التكنولوجيا المتطورة مع فهم عميق لاحتياجات سوق العمل المحلي والعالمي.',
        aboutVisionDescEn: 'To be the leading and trusted platform for every job seeker in the Arab region, by integrating cutting-edge technology with a deep understanding of local and global labor market needs.',
        aboutVisionChecklistAr: ['التوسع إلى 30+ دولة', 'بناء أكبر قاعدة بيانات وظيفية عربية', 'تحقيق معدل توظيف 90%+'],
        aboutVisionChecklistEn: ['Expand to 30+ countries', 'Build the largest Arabic job database', 'Achieve 90%+ employment rate'],
        aboutPillars: [
          { iconKey: 'Cpu', titleAr: 'تكنولوجيا متقدمة', titleEn: 'Advanced Technology', descAr: 'نستخدم أحدث تقنيات الذكاء الاصطناعي والواجهات الحديثة', descEn: 'We use the latest AI technologies and modern interfaces' },
          { iconKey: 'Shield', titleAr: 'أمان وموثوقية', titleEn: 'Security & Trust', descAr: 'بياناتك محمية بأعلى معايير الأمان والخصوصية', descEn: 'Your data is protected with the highest security and privacy standards' },
          { iconKey: 'Heart', titleAr: 'تجربة مستخدم فريدة', titleEn: 'Unique UX', descAr: 'واجهة سهلة وبديهية مصممة لراحتك', descEn: 'Easy and intuitive interface designed for your comfort' },
          { iconKey: 'TrendingUp', titleAr: 'تحسين مستمر', titleEn: 'Continuous Improvement', descAr: 'نطور منصتنا باستمرار بناءً على ملاحظات المستخدمين', descEn: 'We continuously improve our platform based on user feedback' },
          { iconKey: 'Globe', titleAr: 'دعم متعدد اللغات', titleEn: 'Multilingual Support', descAr: 'دعم كامل للعربية والإنجليزية مع اتجاهات مثالية', descEn: 'Full Arabic and English support with perfect directional layouts' },
          { iconKey: 'Award', titleAr: 'معايير عالمية', titleEn: 'Global Standards', descAr: 'قوالب مصممة وفق أفضل الممارسات العالمية في التوظيف', descEn: 'Templates designed according to best global recruitment practices' },
        ],
        aboutCtaTitleAr: 'انضم لمجتمع CV-Mister اليوم',
        aboutCtaTitleEn: 'Join the CV-Mister Community Today',
        aboutCtaSubtitleAr: 'ابدأ رحلتك المهنية الآن وانضم لآلاف المحترفين',
        aboutCtaSubtitleEn: 'Start your career journey now and join thousands of professionals',
        aboutCtaBtnAr: 'ابدأ مجاناً',
        aboutCtaBtnEn: 'Get Started Free',

        // ═══════════════════════════════════════════════
        // PRICING PAGE
        // ═══════════════════════════════════════════════
        pricingHeroLabelAr: 'الأسعار',
        pricingHeroLabelEn: 'Pricing',
        pricingHeroTitleAr: 'خطط <span class="hero-title-accent">تناسب الجميع</span>',
        pricingHeroTitleEn: 'Plans That <span class="hero-title-accent">Fit Everyone</span>',
        pricingHeroSubtitleAr: 'اختر الخطة المناسبة لك وابدأ في بناء سيرتك الذاتية المثالية اليوم',
        pricingHeroSubtitleEn: 'Choose the plan that suits you and start building your perfect resume today',
        pricingPlans: [
          {
            id: 'free',
            nameAr: 'مجاني', nameEn: 'Free',
            price: '0',
            currencyAr: 'ر.س', currencyEn: '$',
            periodAr: '/ شهرياً', periodEn: '/ month',
            descriptionAr: 'مثالي للبدء وتجربة المنصة', descriptionEn: 'Perfect to get started and try the platform',
            iconKey: 'Zap',
            popular: false,
            ctaAr: 'ابدأ مجاناً', ctaEn: 'Start Free',
            features: [
              { textAr: 'سيرة ذاتية واحدة', textEn: '1 Resume', included: true },
              { textAr: '3 قوالب أساسية', textEn: '3 Basic Templates', included: true },
              { textAr: 'تصدير PDF', textEn: 'PDF Export', included: true },
              { textAr: 'دعم اللغة العربية', textEn: 'Arabic Support', included: true },
              { textAr: 'اقتراحات الذكاء الاصطناعي', textEn: 'AI Suggestions', included: false },
              { textAr: 'رسالة تغطية', textEn: 'Cover Letter', included: false },
              { textAr: 'إزالة العلامة المائية', textEn: 'No Watermark', included: false },
              { textAr: 'دعم أولوي', textEn: 'Priority Support', included: false },
            ]
          },
          {
            id: 'pro',
            nameAr: 'احترافي', nameEn: 'Professional',
            price: '29',
            currencyAr: 'ر.س', currencyEn: '$',
            periodAr: '/ شهرياً', periodEn: '/ month',
            descriptionAr: 'الخيار المثالي للباحثين عن عمل بجدية', descriptionEn: 'The ideal choice for serious job seekers',
            iconKey: 'Crown',
            popular: true,
            ctaAr: 'اشترك الآن', ctaEn: 'Subscribe Now',
            features: [
              { textAr: '2 سيرة ذاتية شهرياً', textEn: '2 Resumes per month', included: true },
              { textAr: 'جميع القوالب (10+)', textEn: 'All Templates (10+)', included: true },
              { textAr: 'تصدير PDF عالي الجودة', textEn: 'HD PDF Export', included: true },
              { textAr: 'دعم اللغة العربية والإنجليزية', textEn: 'Arabic & English Support', included: true },
              { textAr: 'اقتراحات الذكاء الاصطناعي', textEn: 'AI Suggestions', included: true },
              { textAr: 'رسالة تغطية', textEn: 'Cover Letter', included: true },
              { textAr: 'إزالة العلامة المائية', textEn: 'No Watermark', included: true },
              { textAr: 'دعم أولوي', textEn: 'Priority Support', included: false },
            ]
          },
          {
            id: 'business',
            nameAr: 'أعمال', nameEn: 'Business',
            price: '79',
            currencyAr: 'ر.س', currencyEn: '$',
            periodAr: '/ شهرياً', periodEn: '/ month',
            descriptionAr: 'للشركات والفرق التي تحتاج إلى حلول متكاملة', descriptionEn: 'For companies and teams that need complete solutions',
            iconKey: 'Building2',
            popular: false,
            ctaAr: 'تواصل معنا', ctaEn: 'Contact Us',
            features: [
              { textAr: 'سير ذاتية غير محدودة شهرياً', textEn: 'Unlimited Resumes per month', included: true },
              { textAr: 'جميع القوالب + حصرية', textEn: 'All Templates + Exclusive', included: true },
              { textAr: 'تصدير PDF عالي الجودة', textEn: 'HD PDF Export', included: true },
              { textAr: 'دعم كامل متعدد اللغات', textEn: 'Full Multilingual Support', included: true },
              { textAr: 'ذكاء اصطناعي متقدم', textEn: 'Advanced AI', included: true },
              { textAr: 'رسائل تغطية غير محدودة', textEn: 'Unlimited Cover Letters', included: true },
              { textAr: 'إزالة العلامة المائية', textEn: 'No Watermark', included: true },
              { textAr: 'دعم أولوي 24/7', textEn: '24/7 Priority Support', included: true },
            ]
          }
        ],
        pricingFAQ: [
          {
            questionAr: 'هل يمكنني تجربة المنصة مجاناً؟', questionEn: 'Can I try the platform for free?',
            answerAr: 'نعم! يمكنك إنشاء سيرة ذاتية واحدة مجاناً بالكامل دون الحاجة لبطاقة ائتمان.', answerEn: 'Yes! You can create one resume completely free without needing a credit card.'
          },
          {
            questionAr: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', questionEn: 'Can I cancel anytime?',
            answerAr: 'بالتأكيد. يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية.', answerEn: 'Absolutely. You can cancel your subscription anytime without any additional charges.'
          },
          {
            questionAr: 'ما هي طرق الدفع المتاحة؟', questionEn: 'What payment methods are available?',
            answerAr: 'نقبل الفيزا، ماستركارد، Apple Pay، وstcpay.', answerEn: 'We accept Visa, Mastercard, Apple Pay, and stcpay.'
          },
        ],
        pricingCtaTitleAr: 'جاهز لبدء مسيرتك المهنية؟',
        pricingCtaTitleEn: 'Ready to Start Your Career Journey?',
        pricingCtaSubtitleAr: 'ابدأ مجاناً الآن — لا حاجة لبطاقة ائتمان',
        pricingCtaSubtitleEn: 'Start free now — no credit card required',
        pricingCtaBtnAr: 'ابدأ مجاناً',
        pricingCtaBtnEn: 'Get Started Free',
      },

      // Methods
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const res = await axios.get(PUBLIC_API_URL);
          if (res.data.success && res.data.settings) {
            set({ settings: res.data.settings });
          }
        } catch (error) {
          console.error("Failed to load CMS content from API", error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncSettings: async (newSettings) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return { success: false, error: 'Unauthorized' };
        
        set({ isLoading: true });
        try {
          const updatedSettings = { ...get().settings, ...newSettings };
          const res = await axios.post(API_URL, 
            { settings: updatedSettings },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data.success) {
            set({ settings: res.data.settings });
            return { success: true };
          }
        } catch (error) {
          console.error("Failed to sync CMS content", error);
          return { success: false, error: error.message };
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    { name: 'cv-mister-cms' }
  )
);

export default useCMSStore;
