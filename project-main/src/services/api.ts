import axios from "axios";
import { Task } from "../types";

// Setup API client with root base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const TaskApiService = {
  /**
   * Fetch all tasks sorted newest first
   */
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>("/tasks");
    return response.data;
  },

  /**
   * Create a new task
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: "Low" | "Medium" | "High";
    category?: string;
    dueDate?: string;
  }): Promise<Task> {
    const response = await api.post<Task>("/tasks", taskData);
    return response.data;
  },

  /**
   * Toggle completion status of a task
   */
  async toggleTaskStatus(id: string): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}/toggle`);
    return response.data;
  },

  /**
   * Update full details of a task
   */
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * Delete a single task
   */
  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Clear all completed tasks
   */
  async clearCompletedTasks(): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete<{ message: string; deletedCount: number }>("/tasks/completed");
    return response.data;
  },
};
