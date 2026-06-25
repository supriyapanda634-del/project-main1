import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
  };

  const colors = {
    success: "bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900 shadow-emerald-500/5",
    error: "bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900 shadow-rose-500/5",
    info: "bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900 shadow-blue-500/5",
  };

  return (
    <div id="toast-wrapper" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            id={`toast-${toast.id}`}
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${colors[toast.type]}`}
          >
            <div id={`toast-icon-${toast.id}`} className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div id={`toast-text-${toast.id}`} className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 break-words">
              {toast.text}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
