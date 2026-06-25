import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Moon,
  Sun,
  Trash2,
  CheckSquare,
  Zap,
  Award,
  BarChart3,
  RefreshCw,
  SlidersHorizontal,
  FolderHeart,
  Flame,
  CalendarDays,
  Sparkles,
} from "lucide-react";

import { Task, PriorityType, FilterType, DashboardStats } from "./types";
import { TaskApiService } from "./services/api";
import TaskCardComponent from "./components/TaskCard";
const TaskCard = TaskCardComponent as any;
import TaskCharts from "./components/TaskCharts";
import ToastContainer, { ToastMessage } from "./components/Toast";

export default function App() {
  // Task states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("Newest");

  // New task form fields
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<PriorityType>("Medium");
  const [newCategory, setNewCategory] = useState("Study");
  const [newDueDate, setNewDueDate] = useState("");

  // UI display triggers
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  // Daily goal tracker state (persisted to localStorage)
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem("daily_goal");
    return saved ? parseInt(saved, 10) : 3;
  });

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show a toast message helper
  const addToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all tasks from Server API
  const fetchTasks = async (showSilently = false) => {
    if (!showSilently) setIsLoading(true);
    try {
      const data = await TaskApiService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.error || "Failed to load tasks from server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & Theme setting
  useEffect(() => {
    fetchTasks();
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Handle Theme Toggle
  const toggleTheme = () => {
    setIsDark((prev) => {
      const newVal = !prev;
      localStorage.setItem("theme", newVal ? "dark" : "light");
      return newVal;
    });
    addToast(isDark ? "Light mode enabled!" : "Dark mode enabled!", "info");
  };

  // Handle Daily Goal Update
  const updateDailyGoal = (val: number) => {
    if (val < 1 || val > 50) return;
    setDailyGoal(val);
    localStorage.setItem("daily_goal", val.toString());
    addToast(`Daily goal updated to ${val} tasks!`, "info");
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await TaskApiService.createTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        category: newCategory,
        dueDate: newDueDate,
      });

      setTasks((prev) => [created, ...prev]);
      
      // Reset fields
      setNewTitle("");
      setNewDesc("");
      setNewPriority("Medium");
      setNewCategory("Study");
      setNewDueDate("");
      setShowForm(false);

      addToast(`Task "${created.title}" created successfully!`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to create task.", "error");
    }
  };

  // Toggle Task Status
  const handleToggleTask = async (id: string) => {
    try {
      const updated = await TaskApiService.toggleTaskStatus(id);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      
      const statusText = updated.completed ? "Completed!" : "Pending.";
      addToast(`Task marked as ${statusText}`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to toggle task.", "error");
    }
  };

  // Update Task details
  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    try {
      const updated = await TaskApiService.updateTask(id, updatedFields);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      addToast("Task updated successfully!", "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to update task.", "error");
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t._id === id);
    if (!taskToDelete) return;

    try {
      await TaskApiService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      addToast(`Deleted task "${taskToDelete.title}"`, "info");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to delete task.", "error");
    }
  };

  // Clear all Completed Tasks
  const handleClearCompleted = async () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      addToast("No completed tasks to clear.", "info");
      return;
    }

    if (!confirm(`Are you sure you want to clear all ${completedCount} completed tasks? This is permanent!`)) {
      return;
    }

    try {
      const response = await TaskApiService.clearCompletedTasks();
      setTasks((prev) => prev.filter((t) => !t.completed));
      addToast(response.message || `Cleared ${response.deletedCount} completed tasks!`, "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Failed to clear completed tasks.", "error");
    }
  };

  // Dynamic Metrics calculations
  const stats: DashboardStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Filter tasks completed today (matching local YYYY-MM-DD date format)
    const todayStr = new Date().toISOString().split("T")[0];
    const completedToday = tasks.filter((t) => {
      if (!t.completed || !t.updatedAt) return false;
      return t.updatedAt.split("T")[0] === todayStr;
    }).length;

    // Calculate Completion Streak
    const completedDates = tasks
      .filter((t) => t.completed && t.updatedAt)
      .map((t) => t.updatedAt.split("T")[0]); // Array of date strings

    let streak = 0;
    if (completedDates.length > 0) {
      const uniqueDates = Array.from(new Set(completedDates)).sort(
        (a, b) => new Date(b as string).getTime() - new Date(a as string).getTime()
      );

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Streak exists only if completed today or yesterday
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        let currentDate = new Date(uniqueDates[0] + "T00:00:00");
        for (let i = 0; i < uniqueDates.length; i++) {
          const checkDateStr = currentDate.toISOString().split("T")[0];
          if (uniqueDates.includes(checkDateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1); // step backward
          } else {
            break;
          }
        }
      }
    }

    return {
      total,
      completed,
      pending,
      progress,
      streak,
      dailyGoal,
      completedToday,
    };
  }, [tasks, dailyGoal]);

  // List of unique categories for category filtering
  const allCategories = useMemo(() => {
    const list = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) list.add(t.category);
    });
    return ["All", ...Array.from(list)];
  }, [tasks]);

  // Instant-Updating Filtering & Sorting Engine
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // 2. Main Tab Filters
    if (selectedFilter !== "All") {
      if (selectedFilter === "Completed") {
        result = result.filter((t) => t.completed);
      } else if (selectedFilter === "Pending") {
        result = result.filter((t) => !t.completed);
      } else {
        // Priority filter (Low, Medium, High)
        result = result.filter((t) => t.priority === selectedFilter);
      }
    }

    // 3. Category Dropdown Filter
    if (selectedCategory !== "All") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // 4. Sorting Engine
    if (selectedSort === "Newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === "Oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (selectedSort === "Priority") {
      const weight = { High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => weight[b.priority] - weight[a.priority]);
    } else if (selectedSort === "Alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tasks, searchQuery, selectedFilter, selectedCategory, selectedSort]);

  // Editorial category counts (with dynamic fallback defaults)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const defaults = ["Study", "Work", "Health", "Personal", "Shopping", "Other"];
    defaults.forEach((c) => {
      counts[c] = 0;
    });
    tasks.forEach((t) => {
      const cat = t.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  // Editorial task grouping engine
  const groupedTasks = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const future: Task[] = [];
    const completed: Task[] = [];

    const todayStr = new Date().toISOString().split("T")[0];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    processedTasks.forEach((task) => {
      if (task.completed) {
        completed.push(task);
      } else if (!task.dueDate) {
        today.push(task);
      } else {
        const taskDate = new Date(task.dueDate + "T00:00:00");
        if (task.dueDate === todayStr) {
          today.push(task);
        } else if (taskDate.getTime() < todayStart.getTime()) {
          overdue.push(task);
        } else {
          future.push(task);
        }
      }
    });

    return { overdue, today, future, completed };
  }, [processedTasks]);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/65 px-8 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">S</div>
          <span className="text-lg font-bold tracking-tight uppercase dark:text-white">StudyFlow // Planner</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative w-48 md:w-64 hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-slate-100 dark:bg-slate-900/40 border-none rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sync trigger */}
            <button
              onClick={() => fetchTasks(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-250 dark:hover:bg-slate-750 transition-all cursor-pointer"
              title="Refresh Task List"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-250 dark:hover:bg-slate-750 transition-all cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-350 font-bold text-xs">
                MP
              </div>
              <span className="text-xs font-medium hidden md:inline-block dark:text-slate-300">mpreetham</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar / Stats Column */}
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700/65 p-6 flex flex-col space-y-8 overflow-y-auto flex-shrink-0">
          
          {/* Dashboard Overview */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/40">
                <p className="text-2xl font-bold font-mono dark:text-white">{stats.total}</p>
                <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Total Tasks</p>
              </div>
              <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-mono">{stats.completed}</p>
                <p className="text-[10px] uppercase font-semibold text-green-600 dark:text-green-500">Completed</p>
              </div>
            </div>
            
            {/* Weekly Progress Card */}
            <div className="mt-4 p-4 bg-indigo-600 dark:bg-indigo-750 rounded-xl text-white relative overflow-hidden shadow-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <Award size={14} className="opacity-80" />
                <p className="text-xs font-medium opacity-80">Course Progress</p>
              </div>
              <p className="text-3xl font-bold font-mono">{stats.progress}%</p>
              <div className="mt-3 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${stats.progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Interactive Categories list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Categories</h2>
              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-250 cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span>All Categories</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  selectedCategory === "All"
                    ? "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400"
                }`}>
                  {stats.total < 10 ? `0${stats.total}` : stats.total}
                </span>
              </button>

              {["Study", "Work", "Health", "Personal", "Shopping", "Other"].map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isActive ? "All" : cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-250 cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-indigo-200 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400"
                    }`}>
                      {count < 10 ? `0${count}` : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Streak Counter and Daily Goal */}
          <div className="mt-auto p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Current Streak</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white uppercase font-mono tracking-tight my-1">
              {stats.streak} {stats.streak === 1 ? "DAY" : "DAYS"}
            </p>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center gap-1">
              <Flame size={12} className="fill-orange-500 text-orange-500" /> Keep it up, champion!
            </p>
            
            {/* Daily Goal inside Streak widget */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/65 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Daily Target</span>
                <div className="flex items-center gap-1 font-mono">
                  <button
                    onClick={() => updateDailyGoal(stats.dailyGoal - 1)}
                    className="px-1.5 rounded bg-slate-150 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-350 hover:bg-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-bold dark:text-slate-300">{stats.dailyGoal}</span>
                  <button
                    onClick={() => updateDailyGoal(stats.dailyGoal + 1)}
                    className="px-1.5 rounded bg-slate-150 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-350 hover:bg-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="dark:text-slate-400">Completed today:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  stats.completedToday >= stats.dailyGoal
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                }`}>
                  {stats.completedToday} / {stats.dailyGoal} {stats.completedToday >= stats.dailyGoal ? "🎉" : ""}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Task List / Main Column */}
        <section className="flex-1 p-6 lg:p-8 flex flex-col overflow-y-auto">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Daily Tasks</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base mt-1">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAnalytics
                    ? "bg-slate-200 border-slate-300 text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
                title="Toggle dashboard analytics visualization"
              >
                <BarChart3 size={14} />
                {showAnalytics ? "Hide Analytics" : "View Analytics"}
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} className={showForm ? "rotate-45 transition-transform" : "transition-transform"} />
                {showForm ? "Close Creator" : "New Task"}
              </button>
            </div>
          </div>

          {/* Quick Task input search and sort area */}
          <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/65 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title or description..."
                className="w-full text-xs rounded-xl pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-450 hover:text-indigo-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cat:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-350 focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  {allCategories.filter((cat) => cat !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-350 focus:outline-hidden"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Priority">Priority Rank</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* New Task Creation Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                id="creation-form-wrapper"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <form
                  onSubmit={handleCreateTask}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-700/55">
                    <Sparkles size={14} className="text-indigo-500" />
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Create a Task
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Complete ER diagram module..."
                          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Task Description
                        </label>
                        <textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Include bullet points, references, and milestones..."
                          rows={3}
                          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                            Priority
                          </label>
                          <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as PriorityType)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100"
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                            Category
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100"
                          >
                            <option value="Work">Work</option>
                            <option value="Study">Study</option>
                            <option value="Personal">Personal</option>
                            <option value="Health">Health</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newTitle.trim()}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                        >
                          Save Task
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                id="analytics-form-wrapper"
                initial={{ opacity: 0, scale: 0.98, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: "auto" }}
                exit={{ opacity: 0, scale: 0.98, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1">
                    <BarChart3 size={12} /> Task Performance Analytics
                  </h3>
                  <TaskCharts tasks={tasks} isDark={isDark} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTER CHIPS ROW */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5">
              {(["All", "Pending", "Completed", "High", "Medium", "Low"] as FilterType[]).map((filter) => {
                const isActive = selectedFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight uppercase transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/65"
                    }`}
                  >
                    {filter === "High" || filter === "Medium" || filter === "Low"
                      ? `${filter} Priority`
                      : filter}
                  </button>
                );
              })}
            </div>
            
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              MATCHING: {processedTasks.length} {processedTasks.length === 1 ? "TASK" : "TASKS"}
            </span>
          </div>

          {/* TASK LIST CONTENT */}
          {isLoading ? (
            <div id="loader-view" className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw size={28} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 animate-pulse">Syncing task records with server...</span>
            </div>
          ) : (
            <div className="space-y-8 flex-1">
              <AnimatePresence mode="popLayout">
                {processedTasks.length > 0 ? (
                  <div className="space-y-8">
                    
                    {/* 1. OVERDUE ITEMS */}
                    {groupedTasks.overdue.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-extrabold text-rose-500 uppercase tracking-widest whitespace-nowrap">Overdue Items</span>
                          <div className="h-px w-full bg-rose-200/55 dark:bg-rose-950/40"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedTasks.overdue.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. TODAY'S ITEMS */}
                    {groupedTasks.today.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Scheduled For Today</span>
                          <div className="h-px w-full bg-slate-200/60 dark:bg-slate-700/40"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedTasks.today.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. FUTURE/UPCOMING ITEMS */}
                    {groupedTasks.future.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-extrabold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest whitespace-nowrap">Upcoming Goals</span>
                          <div className="h-px w-full bg-indigo-100/50 dark:bg-indigo-950/30"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedTasks.future.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. COMPLETED ITEMS */}
                    {groupedTasks.completed.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-extrabold text-green-500/85 dark:text-green-400/85 uppercase tracking-widest whitespace-nowrap">Completed Tasks</span>
                          <div className="h-px w-full bg-green-100/50 dark:bg-green-950/30"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedTasks.completed.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onToggle={handleToggleTask}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* Empty state */
                  <motion.div
                    id="empty-state-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/60 text-center space-y-3"
                  >
                    <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600">
                      <CalendarDays size={36} className="stroke-[1.5]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-750 dark:text-slate-200">
                      No matching task items found
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                      {searchQuery || selectedFilter !== "All" || selectedCategory !== "All"
                        ? "Try tweaking your active search filters or category chips to locate your items."
                        : "Your study checklist is empty! Create a new task above to set up your upcoming targets."}
                    </p>
                    {(searchQuery || selectedFilter !== "All" || selectedCategory !== "All") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedFilter("All");
                          setSelectedCategory("All");
                        }}
                        className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-250 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* TOAST NOTIFICATIONS DRAWER */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Bottom Utility Bar */}
      <footer className="h-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/65 px-8 flex items-center justify-between text-[11px] font-medium text-slate-500 flex-shrink-0">
        <div className="flex space-x-6">
          <span className="hidden sm:inline">ACTIVE TASKS: {stats.pending}</span>
          <span className="hidden sm:inline">COMPLETED TODAY: {stats.completedToday}</span>
          <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">● ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleClearCompleted}
            className="hover:text-rose-600 dark:hover:text-rose-400 uppercase tracking-wider cursor-pointer"
          >
            Clear Completed
          </button>
          <span className="text-slate-300">|</span>
          <span className="uppercase tracking-wider">V 2.1.0</span>
        </div>
      </footer>
    </div>
  );
}
