import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

export function SortableImage({ id, src, onRemove, index, isSmall = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative rounded-lg overflow-hidden border border-gray-200 group cursor-move ${isSmall ? "w-14 h-14 rounded-xl shadow-sm" : "w-20 h-20"
                }`}
        >
            <img src={src} alt="preview" className="w-full h-full object-cover pointer-events-none" />

            {/* REMOVE BUTTON */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start when clicking remove
                    onRemove();
                }}
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on touch/mouse down
                className={`absolute top-1 right-1 bg-white/80 rounded-full text-red-500 hover:bg-white cursor-pointer transition ${isSmall
                    ? "w-5 h-5 flex items-center justify-center -top-2 -right-2 shadow-md opacity-0 group-hover:opacity-100"
                    : "p-1"
                    }`}
            >
                {isSmall ? "✕" : <X size={12} />}
            </button>
        </div>
    );
}
