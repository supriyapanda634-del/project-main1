import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, Edit2, Trash2, Calendar, Tag, ShieldAlert, X, Save, RefreshCw } from "lucide-react";
import { Task, PriorityType } from "../types";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdate: (id: string, updatedFields: Partial<Task>) => void | Promise<void>;
}

export default function TaskCard({ task, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editPriority, setEditPriority] = useState<PriorityType>(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");

  // Priority color maps
  const priorityColors = {
    High: "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
    Medium: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    Low: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
  };

  // Category color highlights
  const categoryColors: Record<string, string> = {
    work: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
    study: "bg-violet-50 text-violet-700 border border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/40",
    personal: "bg-pink-50 text-pink-700 border border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/40",
    health: "bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40",
    shopping: "bg-amber-55 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
    other: "bg-slate-50 text-slate-700 border border-slate-100 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-850",
  };

  const getCategoryStyle = (cat: string) => {
    const norm = cat.toLowerCase().trim();
    return categoryColors[norm] || categoryColors["other"];
  };

  // Compute relative due date status
  const dueStatus = (() => {
    if (!task.dueDate) return null;

    // Normalize date strings
    const todayStr = new Date().toISOString().split("T")[0];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const taskDate = new Date(task.dueDate + "T00:00:00");

    if (task.completed) {
      return { text: "Completed", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" };
    }

    if (task.dueDate === todayStr) {
      return { text: "Due Today 🚨", color: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900 font-semibold shadow-xs" };
    }

    if (task.dueDate === tomorrowStr) {
      return { text: "Due Tomorrow ⏳", color: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900" };
    }

    if (taskDate.getTime() < today.getTime()) {
      return { text: "Overdue ⚠️", color: "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-900 font-bold" };
    }

    // Normal future due date
    const formattedDate = taskDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return { text: `Due ${formattedDate}`, color: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-750" };
  })();

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(task._id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate || "");
    setIsEditing(false);
  };

  const formattedCreatedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      id={`task-card-${task._id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border bg-white p-5 shadow-xs transition-shadow duration-250 hover:shadow-sm dark:bg-slate-800 ${
        task.completed
          ? "border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/45 opacity-60"
          : `border-slate-200/90 dark:border-slate-700/60 border-l-4 ${
              task.priority === "High"
                ? "border-l-red-500"
                : task.priority === "Medium"
                ? "border-l-indigo-500 dark:border-l-indigo-400"
                : "border-l-slate-300 dark:border-l-slate-600"
            }`
      }`}
    >
      {isEditing ? (
        // EDIT MODE INLINE FORM
        <div id={`task-card-edit-${task._id}`} className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Edit Task details
            </h4>
            <button
              onClick={handleCancel}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Buy student supplies..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Description
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Include notebook sizes, pencils..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as PriorityType)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Save size={13} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        // READ-ONLY DISPLAY CARD
        <div id={`task-card-read-${task._id}`} className="flex flex-col h-full justify-between">
          <div>
            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* Category badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${getCategoryStyle(task.category)}`}>
                  <Tag size={10} />
                  {task.category}
                </span>

                {/* Priority badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${priorityColors[task.priority]}`}>
                  <ShieldAlert size={10} />
                  {task.priority}
                </span>
              </div>

              {/* Due Date Indicator */}
              {dueStatus && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${dueStatus.color}`}>
                  <Calendar size={10} />
                  {dueStatus.text}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3
                onClick={() => onToggle(task._id)}
                className={`text-base font-semibold leading-snug cursor-pointer select-none text-slate-800 dark:text-slate-100 flex items-start gap-2.5 ${
                  task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-xs text-slate-500 dark:text-slate-400 break-words line-clamp-3 leading-relaxed ${
                  task.completed ? "opacity-60" : ""
                }`}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons & Creation timestamp */}
          <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-slate-700/40 flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-mono select-none tracking-tight">
              Created: {formattedCreatedDate}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Toggle Status Button */}
              <button
                onClick={() => onToggle(task._id)}
                title={task.completed ? "Mark as Pending" : "Mark as Completed"}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  task.completed
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-400"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-750 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
                }`}
              >
                {task.completed ? <RefreshCw size={14} className="animate-spin-slow" /> : <Check size={14} />}
              </button>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Task"
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-slate-900 dark:border-slate-750 dark:hover:bg-blue-950/20 dark:hover:text-blue-400 transition-all cursor-pointer"
              >
                <Edit2 size={14} />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(task._id)}
                title="Delete Task"
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-rose-600 hover:border-rose-200 dark:bg-slate-900 dark:border-slate-750 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
