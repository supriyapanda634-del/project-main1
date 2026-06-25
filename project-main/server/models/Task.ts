import mongoose, { Schema, Document } from "mongoose";
import { dbManager, ITask } from "../db";

// Mongoose interface
export interface ITaskDoc extends Document {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  category: string;
  completed: boolean;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    category: { type: String, default: "Other", trim: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: String, default: "" }, // Format: YYYY-MM-DD
  },
  {
    timestamps: true,
  }
);

export const TaskModel = (mongoose.models.Task || mongoose.model<ITaskDoc>("Task", TaskSchema)) as any;

// Unified helper functions so controllers don't have to worry about Mongoose vs Local JSON file
export const TaskService = {
  async getAll(): Promise<ITask[]> {
    if (dbManager.isMongoose) {
      const docs = await TaskModel.find({}).sort({ createdAt: -1 });
      return docs.map(doc => ({
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        priority: doc.priority,
        category: doc.category,
        completed: doc.completed,
        dueDate: doc.dueDate,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }));
    } else {
      const tasks = dbManager.readLocalTasks();
      // Sort newest first
      return [...tasks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  },

  async create(data: {
    title: string;
    description?: string;
    priority?: "Low" | "Medium" | "High";
    category?: string;
    dueDate?: string;
  }): Promise<ITask> {
    const title = data.title || "Untitled Task";
    const description = data.description || "";
    const priority = data.priority || "Medium";
    const category = data.category || "Other";
    const dueDate = data.dueDate || "";

    if (dbManager.isMongoose) {
      const doc = await TaskModel.create({
        title,
        description,
        priority,
        category,
        completed: false,
        dueDate,
      });
      return {
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        priority: doc.priority,
        category: doc.category,
        completed: doc.completed,
        dueDate: doc.dueDate,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    } else {
      const tasks = dbManager.readLocalTasks();
      const now = new Date().toISOString();
      const newTask: ITask = {
        _id: "local_" + Math.random().toString(36).substr(2, 9),
        title,
        description,
        priority,
        category,
        completed: false,
        dueDate,
        createdAt: now,
        updatedAt: now,
      };
      tasks.push(newTask);
      dbManager.writeLocalTasks(tasks);
      return newTask;
    }
  },

  async findById(id: string): Promise<ITask | null> {
    if (dbManager.isMongoose) {
      try {
        const doc = await TaskModel.findById(id);
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          title: doc.title,
          description: doc.description,
          priority: doc.priority,
          category: doc.category,
          completed: doc.completed,
          dueDate: doc.dueDate,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        };
      } catch {
        return null;
      }
    } else {
      const tasks = dbManager.readLocalTasks();
      const task = tasks.find(t => t._id === id);
      return task || null;
    }
  },

  async update(
    id: string,
    updates: {
      title?: string;
      description?: string;
      priority?: "Low" | "Medium" | "High";
      category?: string;
      completed?: boolean;
      dueDate?: string;
    }
  ): Promise<ITask | null> {
    if (dbManager.isMongoose) {
      try {
        const doc = await TaskModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          title: doc.title,
          description: doc.description,
          priority: doc.priority,
          category: doc.category,
          completed: doc.completed,
          dueDate: doc.dueDate,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        };
      } catch {
        return null;
      }
    } else {
      const tasks = dbManager.readLocalTasks();
      const index = tasks.findIndex(t => t._id === id);
      if (index === -1) return null;

      const updatedTask: ITask = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      tasks[index] = updatedTask;
      dbManager.writeLocalTasks(tasks);
      return updatedTask;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (dbManager.isMongoose) {
      try {
        const result = await TaskModel.findByIdAndDelete(id);
        return !!result;
      } catch {
        return false;
      }
    } else {
      const tasks = dbManager.readLocalTasks();
      const initialLength = tasks.length;
      const filtered = tasks.filter(t => t._id !== id);
      dbManager.writeLocalTasks(filtered);
      return filtered.length < initialLength;
    }
  },

  async deleteCompleted(): Promise<number> {
    if (dbManager.isMongoose) {
      const result = await TaskModel.deleteMany({ completed: true });
      return result.deletedCount || 0;
    } else {
      const tasks = dbManager.readLocalTasks();
      const completedCount = tasks.filter(t => t.completed).length;
      const filtered = tasks.filter(t => !t.completed);
      dbManager.writeLocalTasks(filtered);
      return completedCount;
    }
  },
};
