import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_FILE_PATH = path.join(process.cwd(), "tasks_db.json");

// Define a structure for tasks in fallback JSON storage
export interface ITask {
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

class DatabaseManager {
  private isUsingMongoose = false;

  constructor() {
    if (MONGODB_URI) {
      this.isUsingMongoose = true;
    } else {
      console.warn(
        "⚠️ MONGODB_URI environment variable is missing. Falling back to high-fidelity JSON File Storage for instant usage."
      );
      // Ensure the database file exists
      if (!fs.existsSync(DB_FILE_PATH)) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      }
    }
  }

  async connect(): Promise<void> {
    if (this.isUsingMongoose) {
      try {
        await mongoose.connect(MONGODB_URI);
        console.log("🚀 Securely connected to MongoDB Atlas successfully!");
      } catch (err) {
        console.error("❌ Failed to connect to MongoDB Atlas:", err);
        console.log("⚠️ Switching database fallback to local JSON storage.");
        this.isUsingMongoose = false;
        if (!fs.existsSync(DB_FILE_PATH)) {
          fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
        }
      }
    }
  }

  get isMongoose() {
    return this.isUsingMongoose;
  }

  // Fallback JSON-file database CRUD operations
  readLocalTasks(): ITask[] {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        return [];
      }
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(data || "[]");
    } catch (e) {
      console.error("Error reading fallback database:", e);
      return [];
    }
  }

  writeLocalTasks(tasks: ITask[]): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing to fallback database:", e);
    }
  }
}

export const dbManager = new DatabaseManager();
