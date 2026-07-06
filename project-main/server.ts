import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { dbManager } from "./server/db";
import taskRoutes from "./server/routes/taskRoutes";
import { errorHandler } from "./server/middleware/security";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Connect to database (with automatic JSON fallback if URI is missing)
  await dbManager.connect();

  // Basic request body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes FIRST
  app.use("/api/tasks", taskRoutes);

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      database: dbManager.isMongoose ? "MongoDB Atlas" : "Local JSON Storage",
      time: new Date().toISOString()
    });
  });

  // Centralized Error Handling for API routes
  app.use(errorHandler);

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route for React Router client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Ingress routing enabled for container host port`);
  });
}

startServer();
