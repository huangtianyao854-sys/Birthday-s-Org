import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Sparkles } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  label?: string;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  isAdminMode: boolean;
  children?: React.ReactNode;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  label = 'Text',
  multiline = false,
  className = '',
  style,
  as: Tag = 'span',
  isAdminMode,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleOpenEdit = (e: React.MouseEvent) => {
    if (!isAdminMode) return;
    e.stopPropagation();
    setCurrentValue(value);
    setIsEditing(true);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentValue.trim() !== value) {
      onSave(currentValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      handleSave();
    }
  };

  // Normal view when not in Admin Mode
  if (!isAdminMode) {
    return (
      <Tag className={className} style={style}>
        {children || value}
      </Tag>
    );
  }

  return (
    <>
      <Tag
        onClick={handleOpenEdit}
        title={`Click to edit ${label}`}
        style={style}
        className={`${className} cursor-pointer relative group/edit-item transition-all duration-200 hover:outline hover:outline-dashed hover:outline-pink-400 hover:outline-2 rounded px-1 -mx-1 hover:bg-pink-500/10`}
      >
        {children || value}

        {/* Hover Edit Pill */}
        <span className="opacity-0 group-hover/edit-item:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-slate-900/95 text-pink-200 border border-pink-400/50 text-[10px] font-sans px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
          <Pencil className="w-2.5 h-2.5 text-pink-400" />
          <span>Edit {label}</span>
        </span>
      </Tag>

      {/* In-Place Quick Edit Modal Popover */}
      {isEditing && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleCancel();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-default"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-2xl p-4 sm:p-5 border border-pink-500/40 text-slate-100 shadow-2xl bg-slate-950/95 space-y-3 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-pink-400" />
                <h4 className="text-sm font-semibold text-pink-200 font-sans">
                  Edit {label}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-sans">
              {multiline ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 leading-relaxed font-sans"
                />
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-sans"
                />
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Press Enter to save, Esc to cancel</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-medium text-xs shadow-md shadow-pink-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
