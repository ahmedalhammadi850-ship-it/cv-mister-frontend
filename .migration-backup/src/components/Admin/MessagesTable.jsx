// ============================================================
// CV-Mister — Admin Messages Table
// Real-time messages management for administrators
// ============================================================

import React, { useState, useEffect } from 'react';
import { 
  FiMail, FiTrash2, FiCheckCircle, FiClock, FiEye, 
  FiChevronLeft, FiChevronRight, FiSearch, FiX
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../api/config';

const ITEMS_PER_PAGE = 8;

export default function MessagesTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingMessage, setViewingMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('[MessagesTable] Fetching messages with token:', token ? 'Exists' : 'Missing');
      
      const res = await fetch(`${API_ROUTES.ADMIN}/messages`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('[MessagesTable] Fetch Error:', err.message);
      toast.error('فشل تحميل الرسائل: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`/api/admin/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`/api/admin/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success('تم حذف الرسالة');
    } catch (err) {
      console.error(err);
      toast.error('فشل الحذف');
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="admin-page-content" style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(24px)',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
    }}>
       {/* Header */}
       <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>رسائل المستخدمين</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>إجمالي الرسائل: {messages.length}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', width: '260px' }}>
             <FiSearch size={14} color="#64748b" />
             <input 
                type="text" 
                placeholder="بحث فـي الرسائل..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '13px', width: '100%', fontFamily: 'inherit' }}
             />
          </div>
       </div>

       {/* Table */}
       <div className="table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
             <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                   {['المُرسل', 'الموضوع', 'الحالة', 'التاريخ', 'الإجراء'].map(h => (
                      <th key={h} style={{ padding: '14px 24px', fontSize: '11px', fontWeight: 600, color: '#475569', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                   ))}
                </tr>
             </thead>
             <tbody>
                {loading ? (
                    <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ width: '24px', height: '24px', border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'adminBtnSpinner 0.8s linear infinite', margin: '0 auto' }} />
                        <div style={{ marginTop: '12px' }}>جاري التحميل...</div>
                    </td></tr>
                ) : paginated.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>لا توجد رسائل</td></tr>
                ) : paginated.map(msg => (
                   <tr key={msg._id} className="user-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: msg.status === 'new' ? 'rgba(99,102,241,0.04)' : 'transparent', transition: '0.2s' }}>
                      <td style={{ padding: '16px 24px' }}>
                         <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{msg.name}</div>
                         <div style={{ fontSize: '12px', color: '#64748b' }}>{msg.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: '#cbd5e1', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</td>
                      <td style={{ padding: '16px 24px' }}>
                         <span style={{ 
                            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px',
                            background: msg.status === 'new' ? 'rgba(99,102,241,0.15)' : 'rgba(100,116,139,0.1)',
                            color: msg.status === 'new' ? '#818cf8' : '#94a3b8'
                         }}>
                            {msg.status === 'new' ? 'جديدة' : 'تمت القراءة'}
                         </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b' }}>
                         {new Date(msg.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                         <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                               onClick={() => { setViewingMessage(msg); if(msg.status === 'new') handleMarkAsRead(msg._id); }}
                               style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                            >
                               <FiEye size={14} />
                            </button>
                            <button 
                               onClick={() => handleDelete(msg._id)}
                               style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                            >
                               <FiTrash2 size={14} />
                            </button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Pagination */}
       {totalPages > 1 && (
          <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
             <button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1} 
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
             >
                <FiChevronRight />
             </button>
             <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>صفحة {currentPage} من {totalPages}</span>
             <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages} 
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === totalPages ? 0.5 : 1 }}
             >
                <FiChevronLeft />
             </button>
          </div>
       )}

       {/* View Modal */}
       {viewingMessage && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '640px', padding: '36px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <button 
                   onClick={() => setViewingMessage(null)}
                   style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: '36px', height: '36px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                   <FiX size={18} />
                </button>
                
                <div style={{ marginBottom: '32px' }}>
                   <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>بيانات الرسالة</div>
                   <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>{viewingMessage.subject}</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>اسم المُرسل</div>
                      <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{viewingMessage.name}</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>البريد الإلكتروني</div>
                      <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{viewingMessage.email}</div>
                   </div>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                   <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>نص الرسالة</div>
                   <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.8', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                      {viewingMessage.message}
                   </div>
                </div>
                
                <button 
                   onClick={() => setViewingMessage(null)}
                   style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', transition: '0.2s' }}
                   onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                   onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                   إغلاق التفاصيل
                </button>
             </div>
          </div>
       )}
    </div>
  );
}
