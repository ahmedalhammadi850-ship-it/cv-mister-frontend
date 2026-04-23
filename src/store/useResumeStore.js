// ============================================================
// CV-Mister — Resume Data Store (Zustand)
// Handles resume content state + backend sync
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialResumeData } from '../utils/initialData';
import useAuthStore from './useAuthStore';
import { API_ROUTES } from '../api/config';

const useResumeStore = create(
  persist(
    (set, get) => ({
      // ── Core Data ──────────────────────────────────
      resumeId: null,
      data: { ...initialResumeData },
      saveStatus: 'saved', // 'saved' | 'saving' | 'unsaved'
      customTitles: {}, // { 'experience': 'My Work History' }
      alignments: {}, // { 'summary': 'center', 'experience-<id>': 'right' }
      sectionsStyles: {}, // { 'skills': { color: '#3B82F6' }, 'experience': { color: '#EF4444' } }
      pageBreaks: [], // ['experience']
      layoutOverrides: {}, // { 'skills': 'main', 'experience': 'sidebar' }
      layoutColumns: {
        columnSide: ['skills', 'languages', 'certificates', 'awards', 'references'],
        columnMain: ['header', 'summary', 'experience', 'education', 'projects', 'volunteering']
      },
      renamingSection: null,
      lastSaved: null,

      // ── Setters ────────────────────────────────────
      setField: (section, value) =>
        set((state) => ({
          data: { ...state.data, [section]: value },
          saveStatus: 'unsaved',
        })),

      setPersonalInfo: (field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, [field]: value },
          },
          saveStatus: 'unsaved',
        })),

      setSummary: (value) =>
        set((state) => ({
          data: { ...state.data, summary: value },
          saveStatus: 'unsaved',
        })),

      // ── Array Item CRUD ────────────────────────────
      addItem: (section, item) =>
        set((state) => ({
          data: {
            ...state.data,
            [section]: [...(state.data[section] || []), item],
          },
          saveStatus: 'unsaved',
        })),

      updateItem: (section, id, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            [section]: (state.data[section] || []).map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
          saveStatus: 'unsaved',
        })),

      removeItem: (section, id) => set((state) => ({
        data: {
          ...state.data,
          [section]: (state.data[section] || []).filter((item) => item.id !== id),
        },
        saveStatus: 'unsaved',
      })),

      // ✨ Section Meta Controls ✨
      setAlignment: (key, value) => set((state) => ({
        alignments: { ...state.alignments, [key]: value },
        saveStatus: 'unsaved',
      })),
      setCustomTitle: (section, title) => set((state) => ({
        customTitles: { ...state.customTitles, [section]: title },
        saveStatus: 'unsaved',
      })),
      clearSection: (section) => set((state) => ({
        data: { ...state.data, [section]: [] },
        saveStatus: 'unsaved',
      })),
      togglePageBreak: (section) => set((state) => {
        const active = state.pageBreaks.includes(section);
        return {
          pageBreaks: active 
            ? state.pageBreaks.filter(k => k !== section)
            : [...state.pageBreaks, section],
          saveStatus: 'unsaved',
        };
      }),
      setSectionColumn: (section, targetColumn) => set((state) => {
        const layoutColumns = { ...state.layoutColumns };
        
        // Remove from all potential columns first
        const columnMain = (layoutColumns.columnMain || []).filter(k => k !== section);
        const columnSide = (layoutColumns.columnSide || []).filter(k => k !== section);
        
        // Add to targeted column if not already there
        if (targetColumn === 'main') {
          columnMain.push(section);
        } else if (targetColumn === 'sidebar') {
          columnSide.push(section);
        }

        return { 
          layoutColumns: { columnMain, columnSide },
          saveStatus: 'unsaved' 
        };
      }),

      reorderLayoutColumns: (source, destination) => set((state) => {
        const layoutColumns = { ...state.layoutColumns };
        const sourceCol = [...layoutColumns[source.droppableId]];
        const [moved] = sourceCol.splice(source.index, 1);

        if (source.droppableId === destination.droppableId) {
          sourceCol.splice(destination.index, 0, moved);
          layoutColumns[source.droppableId] = sourceCol;
        } else {
          const destCol = [...layoutColumns[destination.droppableId]];
          destCol.splice(destination.index, 0, moved);
          layoutColumns[source.droppableId] = sourceCol;
          layoutColumns[destination.droppableId] = destCol;
        }

        return { layoutColumns, saveStatus: 'unsaved' };
      }),

      setRenamingSection: (section) => set({ renamingSection: section }),
      
      setSectionStyle: (section, style) => set((state) => ({
        sectionsStyles: { 
          ...state.sectionsStyles, 
          [section]: { ...(state.sectionsStyles[section] || {}), ...style } 
        },
        saveStatus: 'unsaved'
      })),

      addCustomSection: (title) => set((state) => {
        const id = `custom_${Date.now()}`;
        return {
          data: { ...state.data, [id]: [] },
          customTitles: { ...state.customTitles, [id]: title },
          layoutColumns: {
            ...state.layoutColumns,
            columnMain: [...state.layoutColumns.columnMain, id]
          },
          saveStatus: 'unsaved'
        };
      }),

      removeCustomSection: (sectionKey) => set((state) => {
        const newData = { ...state.data };
        delete newData[sectionKey];
        
        const newCustomTitles = { ...state.customTitles };
        delete newCustomTitles[sectionKey];

        const layoutColumns = {
          columnMain: state.layoutColumns.columnMain.filter(k => k !== sectionKey),
          columnSide: state.layoutColumns.columnSide.filter(k => k !== sectionKey)
        };

        return {
          data: newData,
          customTitles: newCustomTitles,
          layoutColumns,
          saveStatus: 'unsaved'
        };
      }),

      reorderItems: (section, items) =>
        set((state) => ({
          data: { ...state.data, [section]: items },
          saveStatus: 'unsaved',
        })),

      // ── Full Data Operations ───────────────────────
      setData: (data) => set({ data, saveStatus: 'unsaved' }),
      resetData: () => set({ data: { ...initialResumeData }, saveStatus: 'unsaved', resumeId: null }),

      // ── Backend Sync ───────────────────────────────
      saveToBackend: async () => {
        const state = get();
        set({ saveStatus: 'saving' });

        try {
          const method = state.resumeId ? 'PUT' : 'POST';
          const url = state.resumeId
            ? `${API_ROUTES.RESUMES}/${state.resumeId}`
            : API_ROUTES.RESUMES;

          const token = useAuthStore.getState().token;
          const response = await fetch(url, {
            method,
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              content: state.data,
              metadata: {
                layoutColumns: state.layoutColumns,
                customTitles: state.customTitles,
                alignments: state.alignments,
                sectionsStyles: state.sectionsStyles,
                pageBreaks: state.pageBreaks,
              },
              title: state.data.personalInfo?.fullName || 'Untitled Resume',
            }),
          });

          if (!response.ok) throw new Error('Save failed');

          const result = await response.json();
          set({
            resumeId: result._id || result.id || state.resumeId,
            saveStatus: 'saved',
            lastSaved: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Backend save failed, keeping localStorage:', err.message);
          set({ saveStatus: 'saved', lastSaved: new Date().toISOString() });
        }
      },

      loadFromBackend: async (id) => {
        try {
          const token = useAuthStore.getState().token;
          const response = await fetch(`${API_ROUTES.RESUMES}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Load failed');

          const result = await response.json();
          const metadata = result.metadata || {};
          
          // Deep safety merge with initial data to prevent crashes
          const loadedData = result.content || result.data || {};
          const safeData = {
            ...initialResumeData,
            ...loadedData,
            personalInfo: { ...initialResumeData.personalInfo, ...(loadedData.personalInfo || {}) }
          };

          set({
            resumeId: result._id || id,
            data: safeData,
            layoutColumns: metadata.layoutColumns || {
              columnSide: ['skills', 'languages', 'certificates', 'awards', 'references'],
              columnMain: ['header', 'summary', 'experience', 'education', 'projects', 'volunteering']
            },
            customTitles: metadata.customTitles || {},
            alignments: metadata.alignments || {},
            sectionsStyles: metadata.sectionsStyles || {},
            pageBreaks: metadata.pageBreaks || [],
            saveStatus: 'saved',
          });
        } catch (err) {
          console.warn('Backend load failed:', err.message);
        }
      },
    }),
    {
      name: 'cv-mister-resume',
      partialize: (state) => ({
        resumeId: state.resumeId,
        data: state.data,
        layoutColumns: state.layoutColumns,
        customTitles: state.customTitles,
        alignments: state.alignments,
        sectionsStyles: state.sectionsStyles,
        pageBreaks: state.pageBreaks,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

export default useResumeStore;
