import React from 'react';

// A draggable, resizable layer on the canvas
export function CanvasLayer({
  x, y, width,
  dragBind, resizeBind,
  selected, onSelect, onRemove,
  exporting, children, style = {},
  resizable = true, centered = false,
}) {
  return (
    <div
      {...dragBind()}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className="absolute touch-none"
      style={{
        left: centered ? '50%' : `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        transform: centered ? 'translateX(-50%)' : undefined,
        cursor: exporting ? 'default' : 'move',
        outline: exporting ? 'none' : selected
          ? '1.5px solid rgba(124,58,237,0.8)'
          : 'none',
        outlineOffset: 3,
        borderRadius: 4,
        ...style,
      }}
    >
      {children}

      {/* Remove button */}
      {!exporting && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseDown={e => e.stopPropagation()}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border border-white flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100"
          style={{ fontSize: 9, lineHeight: 1 }}
        >×</button>
      )}

      {/* Resize handle */}
      {!exporting && resizable && (
        <div
          {...(resizeBind ? resizeBind() : {})}
          onMouseDown={(e) => { e.stopPropagation(); resizeBind?.().onMouseDown?.(e); }}
          onClick={e => e.stopPropagation()}
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm z-10"
          style={{
            background: selected ? 'rgba(124,58,237,0.9)' : 'rgba(255,255,255,0.3)',
            cursor: 'ew-resize',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        />
      )}
    </div>
  );
}

// Non-resizable draggable layer
export function DraggableElement({
  x, y, dragBind, selected, onSelect, onRemove, exporting, children, style = {}, centered = false,
}) {
  return (
    <div
      {...dragBind()}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      className="absolute touch-none group"
      style={{
        left: centered ? '50%' : `${x}%`,
        top: `${y}%`,
        transform: centered ? 'translateX(-50%)' : undefined,
        cursor: exporting ? 'default' : 'move',
        outline: exporting ? 'none' : selected
          ? '1.5px solid rgba(124,58,237,0.8)'
          : '1px dashed rgba(255,255,255,0.0)',
        outlineOffset: 3,
        borderRadius: 4,
        ...style,
      }}
    >
      {children}
      {!exporting && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseDown={e => e.stopPropagation()}
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 border border-white flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 hover:opacity-100"
          style={{ fontSize: 9, lineHeight: 1 }}
        >×</button>
      )}
    </div>
  );
}