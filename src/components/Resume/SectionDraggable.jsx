import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function SectionDraggable({ id, index, children, isDraggingOver }) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative transition-all duration-200 
            ${snapshot.isDragging ? 'z-50' : 'z-auto'}
          `}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* Subtle Shadow & Lift on drag */}
          <div className={`transition-all duration-300 rounded-lg
            ${snapshot.isDragging 
              ? 'ring-2 ring-blue-500/20 shadow-2xl scale-[1.02] bg-white pointer-events-none cursor-grabbing' 
              : 'hover:ring-1 hover:ring-blue-500/10 cursor-grab'}
          `}>
             {/* Visual Overlay for Draggable state (only visible on hover or drag) */}
             <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity p-1 cursor-grab">
                <div className="grid grid-cols-2 gap-0.5">
                  {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"/>)}
                </div>
             </div>
             
             {children}
          </div>
          
          {/* Optional: Placeholder Landing animation helper handled by Droppable placeholder */}
        </div>
      )}
    </Draggable>
  );
}
