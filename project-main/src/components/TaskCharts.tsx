import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { Task } from "../types";

// Register ChartJS plugins/components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TaskChartsProps {
  tasks: Task[];
  isDark: boolean;
}

export default function TaskCharts({ tasks, isDark }: TaskChartsProps) {
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const gridColor = isDark ? "rgba(71, 85, 105, 0.3)" : "rgba(226, 232, 240, 0.8)";

  // 1. Completed vs Pending Doughnut Data
  const doughnutData = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;

    return {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [completed, pending],
          backgroundColor: isDark
            ? ["#10b981", "#64748b"] // Emerald Green vs Slate
            : ["#10b981", "#cbd5e1"], // Emerald Green vs Light Slate
          borderColor: isDark ? "#1e293b" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [tasks, isDark]);

  // 2. Tasks by Category Bar Data
  const barData = useMemo(() => {
    const categories = ["Work", "Study", "Personal", "Health", "Shopping", "Other"];
    const counts = categories.map(
      (cat) => tasks.filter((t) => t.category.toLowerCase() === cat.toLowerCase()).length
    );

    return {
      labels: categories,
      datasets: [
        {
          label: "Number of Tasks",
          data: counts,
          backgroundColor: [
            "#3b82f6", // Blue for Work
            "#8b5cf6", // Purple for Study
            "#ec4899", // Pink for Personal
            "#14b8a6", // Teal for Health
            "#f59e0b", // Amber for Shopping
            "#64748b", // Slate for Other
          ],
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  }, [tasks]);

  // 3. Weekly Progress Line Data (tasks completed in the last 7 days)
  const lineData = useMemo(() => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const completedPerDay = Array(7).fill(0);

    // Get current date and find previous 6 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return {
        dateString: d.toDateString(),
        dayName: daysOfWeek[d.getDay()],
        dayIndex: d.getDay(),
      };
    });

    tasks.forEach((task) => {
      if (task.completed && task.updatedAt) {
        const compDate = new Date(task.updatedAt).toDateString();
        const matchIndex = last7Days.findIndex((day) => day.dateString === compDate);
        if (matchIndex !== -1) {
          completedPerDay[matchIndex]++;
        }
      }
    });

    return {
      labels: last7Days.map((d) => d.dayName),
      datasets: [
        {
          fill: true,
          label: "Tasks Completed",
          data: completedPerDay,
          borderColor: "#10b981", // Emerald
          backgroundColor: isDark
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(16, 185, 129, 0.08)",
          tension: 0.4,
          pointBackgroundColor: "#10b981",
          pointHoverRadius: 6,
        },
      ],
    };
  }, [tasks, isDark]);

  // Chart config options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: textColor,
          boxWidth: 12,
          font: { family: "Inter", size: 12 },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: "Inter", size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          stepSize: 1,
          font: { family: "Inter", size: 11 },
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: "Inter", size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          stepSize: 1,
          font: { family: "Inter", size: 11 },
        },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div id="analytics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Doughnut Chart */}
      <div id="doughnut-card" className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col h-72">
        <h3 id="doughnut-title" className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Status Distribution
        </h3>
        <div id="doughnut-wrapper" className="flex-1 relative min-h-0">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* 2. Bar Chart */}
      <div id="bar-card" className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col h-72">
        <h3 id="bar-title" className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tasks by Category
        </h3>
        <div id="bar-wrapper" className="flex-1 relative min-h-0">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* 3. Line Chart */}
      <div id="line-card" className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col h-72">
        <h3 id="line-title" className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> Weekly Completion Progress
        </h3>
        <div id="line-wrapper" className="flex-1 relative min-h-0">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}
