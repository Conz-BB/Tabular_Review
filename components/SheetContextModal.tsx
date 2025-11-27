import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from './Icons';

interface SheetContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: string) => void;
  initialContext: string;
}

export const SheetContextModal: React.FC<SheetContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContext
}) => {
  const [context, setContext] = useState(initialContext);

  // Update local state when initialContext changes
  useEffect(() => {
    setContext(initialContext);
  }, [initialContext, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(context);
    onClose();
  };

  const handleCancel = () => {
    setContext(initialContext); // Reset to original value
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={handleCancel}></div>
      <div 
        className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 w-[600px] max-h-[80vh] flex flex-col"
        style={{ 
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={handleCancel}
          className="absolute top-3 right-3 p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Header */}
          <div>
            <h2 className="text-lg font-bold text-slate-800">Sheet Context</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add shared context that applies to all column extractions. This is useful for document type, formatting rules, or other instructions that are the same across all columns.
            </p>
          </div>

          {/* Context Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <HelpCircle className="w-3.5 h-3.5" />
              <label className="text-xs font-semibold">Context</label>
            </div>
            <textarea 
              className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none min-h-[200px] resize-none transition-all"
              placeholder="e.g., These are side letter agreements. All dates should be formatted as YYYY-MM-DD. All monetary values are in USD..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg font-medium text-xs transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs shadow-lg shadow-slate-900/10 transition-all active:scale-95"
          >
            Save Context
          </button>
        </div>
      </div>
    </>
  );
};

