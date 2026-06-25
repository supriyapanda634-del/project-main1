import { Request, Response, NextFunction } from "express";

// 1. Custom rate-limiting middleware (zero external dependencies)
const ipRequests = new Map<string, { count: number; firstRequestTime: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_LIMIT = 200; // Limit each IP to 200 requests per window

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const userData = ipRequests.get(ip);

  if (!userData) {
    ipRequests.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  if (now - userData.firstRequestTime > WINDOW_MS) {
    // Reset window
    ipRequests.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  userData.count += 1;
  if (userData.count > MAX_LIMIT) {
    return res.status(429).json({
      error: "Too many requests. Please try again in 15 minutes.",
    });
  }

  next();
};

// 2. Sanitization helper to prevent basic XSS injections
export const sanitizeString = (str: string): string => {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
};

// 3. Input Validation middleware for creating and updating tasks
export const validateTaskInput = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, priority, category, dueDate } = req.body;

  // Title is required for creation
  if (req.method === "POST" && (!title || typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "Task title is required and must be a valid string." });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length > 150) {
      return res.status(400).json({ error: "Task title must be a string under 150 characters." });
    }
    // Sanitize title
    req.body.title = sanitizeString(title);
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 1000) {
      return res.status(400).json({ error: "Description must be a string under 1000 characters." });
    }
    req.body.description = sanitizeString(description);
  }

  if (priority !== undefined) {
    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ error: "Priority must be either 'Low', 'Medium', or 'High'." });
    }
  }

  if (category !== undefined) {
    if (typeof category !== "string" || category.trim().length > 50) {
      return res.status(400).json({ error: "Category must be a string under 50 characters." });
    }
    req.body.category = sanitizeString(category);
  }

  if (dueDate !== undefined && dueDate !== "") {
    // Quick regex validation for YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof dueDate !== "string" || !dateRegex.test(dueDate)) {
      return res.status(400).json({ error: "Due date must be in YYYY-MM-DD format." });
    }
  }

  next();
};

// 4. Centralized Error Handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Error caught by security middleware:", err);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred. Please try again later.",
  });
};
