import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCMSStore from '../../store/useCMSStore';
import PaymentModal from '../Builder/PaymentModal';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً، كيف يمكنني مساعدتك اليوم؟', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Pro Plan Checks
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAIFreeGlobally = useCMSStore((s) => s.settings?.isAIFreeGlobally);

  const checkProStatus = () => {
    if (isAIFreeGlobally || user?.plan === 'pro') return true;
    setPaymentModalOpen(true);
    return false;
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!checkProStatus()) return;
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input.trim(), sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://ahmeddd111.app.n8n.cloud/webhook/1d6ee35d-0280-4d68-a839-eeb1b13e298e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const rawData = await response.text();
      let botText = "";

      try {
        const data = JSON.parse(rawData);
        botText = data.reply || data.response || data.message || data.text || (typeof data === 'string' ? data : "");
      } catch (e) {
        botText = rawData;
      }

      // Handle the generic N8N Test response
      if (botText === "Workflow was started") {
        botText = "⚠️ يبدو أن الـ Webhook مضبوط على رد فوري (Immediate). يرجى تغييره في N8N إلى 'When Last Node Finishes' لكي أستطيع إرسال رد الذكاء الاصطناعي لك.";
      }

      if (!botText) botText = "استلمت رسالتك، ولكن لم يصلني رد محدد من الخادم.";

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'عذراً، حدث خطأ في الاتصال. تأكد من ضغط زر (Execute Workflow) في N8N قبل الإرسال لتفعيل وضع الاختبار.', sender: 'bot' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div dir="rtl" className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-colors"
          >
            <MessageCircle size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 right-0 w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: '550px', maxHeight: '85vh', transformOrigin: 'bottom right' }}
          >
            <PaymentModal 
              isOpen={isPaymentModalOpen} 
              onClose={() => setPaymentModalOpen(false)} 
              templateName="الدردشة الذكية (AI Chat)" 
            />
            {/* Header */}
            <div 
              className="bg-blue-600 text-white shadow-md z-10 flex items-center justify-between"
              style={{ padding: '16px 20px', minHeight: '70px' }}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, lineHeight: '1.2', color: '#fff' }}>الدعم الفني</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#4ADE80', borderRadius: '50%', boxShadow: '0 0 8px #4ADE80' }}></div>
                    <p style={{ fontSize: '11px', color: '#DBEAFE', margin: 0, lineHeight: '1' }}>متاح للرد الآن</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      ...(msg.sender === 'user'
                        ? { background: '#2563EB', color: '#fff', borderRadius: '16px 2px 16px 16px' }
                        : { background: '#E5E7EB', color: '#1F2937', borderRadius: '2px 16px 16px 16px' })
                    }}
                  >
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#E5E7EB', color: '#6B7280', padding: '12px 16px', borderRadius: '2px 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" color="#2563EB" />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>جاري الكتابة...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100" style={{ padding: '12px 16px' }}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-sans"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    margin: 0
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex shrink-0 items-center justify-center transition-colors shadow-sm"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={20} className="rotate-180" style={{ transform: 'translateX(-2px) rotate(180deg)' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
