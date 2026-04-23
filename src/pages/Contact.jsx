// ============================================================
// CV-Mister — Contact Us Page
// Premium SaaS "Contact" with Form and Information
// ============================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, MessageSquare, 
  CheckCircle2, AlertCircle, Globe, Clock
} from 'lucide-react';
import useStyleStore from '../store/useStyleStore';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Contact() {
  const language = useStyleStore((s) => s.language);
  const isAr = language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(isAr ? 'تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.' : 'Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(isAr ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.' : 'Error sending message. Please try again later.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(isAr ? 'فشل الاتصال بالخادم.' : 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      icon: <Mail className="text-blue-500" />, 
      title: isAr ? 'البريد الإلكتروني' : 'Email Us', 
      value: 'support@cvmister.com',
      desc: isAr ? 'دعم فني سريع على مدار الساعة' : 'Fast support 24/7'
    },
    { 
      icon: <Phone className="text-indigo-500" />, 
      title: isAr ? 'اتصل بنا' : 'Call Us', 
      value: '+967 77X XXX XXX',
      desc: isAr ? 'متاح من الأحد إلى الخميس' : 'Available Sun to Thu'
    },
    { 
      icon: <MapPin className="text-purple-500" />, 
      title: isAr ? 'الموقع' : 'Location', 
      value: isAr ? 'صنعاء، اليمن' : 'Sanaa, Yemen',
      desc: isAr ? 'المكتب الرئيسي' : 'HQ Office'
    }
  ];

  return (
    <div className="contact-page" style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <span style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            color: '#6366f1', 
            padding: '6px 16px', 
            borderRadius: '100px', 
            fontSize: '14px', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {isAr ? 'تواصل معنا' : 'Get in Touch'}
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: 900, marginTop: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {isAr ? 'نحن هنا لمساعدتك' : 'How can we help you?'}
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0' }}>
            {isAr ? 'هل لديك استفسار أو اقتراح؟ فريقنا جاهز للرد عليك في أقرب وقت ممكن.' : 'Have a question or feedback? Our team is ready to assist you as soon as possible.'}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
          
          {/* Contact Info Sidebar */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{ display: 'grid', gap: '24px' }}
          >
            {contactInfo.map((info, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                style={{ 
                  background: 'var(--bg-surface)', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  background: 'var(--bg-app)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center' 
                }}>
                  {React.cloneElement(info.icon, { size: 24 })}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>{info.title}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>{info.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{info.desc}</div>
                </div>
              </motion.div>
            ))}

            <motion.div 
              variants={fadeInUp}
              style={{ 
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', 
                padding: '32px', 
                borderRadius: '24px', 
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
               <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
               <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                 {isAr ? 'ساعات العمل' : 'Working Hours'}
               </h4>
               <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                 {isAr ? 'الأحد - الخميس' : 'Sun - Thu'}: 9:00 AM - 6:00 PM<br/>
                 {isAr ? 'الجمعة - السبت' : 'Fri - Sat'}: {isAr ? 'مغلق' : 'Closed'}
               </p>
               <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <Clock size={16} /> {isAr ? 'الاستجابة عادة خلال أقل من ساعتين' : 'Usually responds in under 2 hours'}
               </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              background: 'var(--bg-surface)', 
              padding: '40px', 
              borderRadius: '32px', 
              border: '1px solid var(--border-default)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input 
                    type="text" 
                    required
                    style={{ 
                      width: '100%', padding: '14px 20px', borderRadius: '14px', 
                      background: 'var(--bg-app)', border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder={isAr ? 'مثلاً: علي أحمد' : 'e.g. John Doe'}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    required
                    style={{ 
                      width: '100%', padding: '14px 20px', borderRadius: '14px', 
                      background: 'var(--bg-app)', border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'الموضوع' : 'Subject'}
                </label>
                <input 
                  type="text" 
                  required
                  style={{ 
                    width: '100%', padding: '14px 20px', borderRadius: '14px', 
                    background: 'var(--bg-app)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                  placeholder={isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help?'}
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  {isAr ? 'الرسالة' : 'Message'}
                </label>
                <textarea 
                  required
                  rows="5"
                  style={{ 
                    width: '100%', padding: '18px 20px', borderRadius: '16px', 
                    background: 'var(--bg-app)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', outline: 'none', resize: 'none'
                  }}
                  placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '16px', 
                  background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', 
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? (
                   <span className="animate-pulse">{isAr ? 'جاري الإرسال...' : 'Sending...'}</span>
                ) : (
                  <>
                    <Send size={18} />
                    {isAr ? 'إرسال الرسالة' : 'Send Message'}
                  </>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
      
      <style>{`
        .contact-page input:focus, .contact-page textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        @media (max-width: 800px) {
          .contact-page > div > div {
             grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
