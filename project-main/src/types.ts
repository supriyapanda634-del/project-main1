export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  category: string;
  completed: boolean;
  dueDate?: string; // Format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type PriorityType = "Low" | "Medium" | "High";

export type FilterType = "All" | "Pending" | "Completed" | "High" | "Medium" | "Low";

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  progress: number;
  streak: number;
  dailyGoal: number;
  completedToday: number;
}
