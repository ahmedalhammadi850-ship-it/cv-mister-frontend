// ============================================================
// CV-Mister — Cover Letter Store (Zustand)
// Handles cover letter content & backend sync
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './useAuthStore';

const initialCLData = {
  recipientName: '',
  recipientTitle: '',
  companyName: '',
  companyAddress: '',
  date: new Date().toLocaleDateString(),
  subject: '',
  body: '',
  templateId: 'professional',
};

const useCoverLetterStore = create(
  persist(
    (set, get) => ({
      letterId: null,
      data: { ...initialCLData },
      saveStatus: 'saved',
      
      setField: (field, value) => set((state) => ({
        data: { ...state.data, [field]: value },
        saveStatus: 'unsaved'
      })),

      setTemplate: (templateId) => set((state) => ({
        data: { ...state.data, templateId },
        saveStatus: 'unsaved'
      })),

      resetContent: () => set({ data: { ...initialCLData }, letterId: null, saveStatus: 'saved' }),

      saveToBackend: async () => {
        const state = get();
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ saveStatus: 'saving' });
        try {
          const method = state.letterId ? 'PUT' : 'POST';
          const url = state.letterId ? `/api/cover-letters/${state.letterId}` : '/api/cover-letters';
          
          const res = await fetch(url, {
            method,
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: state.data.recipientName ? `Letter for ${state.data.recipientName}` : 'Untitled Letter',
              content: state.data,
              templateId: state.data.templateId
            })
          });

          const result = await res.json();
          set({ letterId: result._id, saveStatus: 'saved' });
        } catch (err) {
          console.error('CL Save error:', err);
          set({ saveStatus: 'unsaved' });
        }
      },

      loadFromBackend: async (id) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        try {
          const res = await fetch(`/api/cover-letters/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          set({ letterId: result._id, data: result.content, saveStatus: 'saved' });
        } catch (err) {
          console.error('CL Load error:', err);
        }
      },

      generateDraft: (jobTitle, name) => {
        const body = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle || '[Job Title]'} position at [Company Name]. With my background and proven track record in the field, I am confident that I can contribute significantly to your team.\n\nThank you for your time and consideration.\n\nBest regards,\n${name || '[Your Name]'}`;
        set((state) => ({
          data: { ...state.data, body },
          saveStatus: 'unsaved'
        }));
      }
    }),
    { name: 'cv-mister-cover-letter' }
  )
);

export default useCoverLetterStore;
