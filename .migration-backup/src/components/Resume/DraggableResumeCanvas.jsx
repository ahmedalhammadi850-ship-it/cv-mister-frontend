import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import useResumeStore from '../../store/useResumeStore';

/**
 * DraggableResumeCanvas
 * Wraps the ResumeRenderer to enable Section DND.
 * Note: DND in multiple pages is handled by having multiple droppable columns 
 * that share the same ID prefix, but we'll focus on a single context sync.
 */
export default function DraggableResumeCanvas({ children }) {
  const { reorderLayoutColumns, saveToBackend, setSectionColumn } = useResumeStore();

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // IDs are formatted as "key-pageId" or "column-pageId"
    const sectionId = draggableId.split('-')[0];
    const sourceCol = source.droppableId.split('-')[0];
    const destCol = destination.droppableId.split('-')[0];

    // If moved between columns
    if (sourceCol !== destCol) {
      setSectionColumn(sectionId, destCol === 'columnSide' ? 'sidebar' : 'main');
    } else {
      // Reorder within same column
      // We need to re-map the column ID for the store action
      reorderLayoutColumns(
        { ...source, droppableId: sourceCol },
        { ...destination, droppableId: destCol }
      );
    }
    
    // Auto-save debounced
    const timeout = setTimeout(() => {
      saveToBackend();
    }, 1000);
    return () => clearTimeout(timeout);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}
