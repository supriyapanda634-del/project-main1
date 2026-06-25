import { Router, Request, Response, NextFunction } from "express";
import { TaskService } from "../models/Task";
import { validateTaskInput, rateLimiter } from "../middleware/security";

const router = Router();

// Apply rate limiter to all task routes
router.use(rateLimiter);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks sorted by newest first
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await TaskService.getAll();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Creates a new task
 */
router.post("/", validateTaskInput, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;
    const newTask = await TaskService.create({
      title,
      description,
      priority,
      category,
      dueDate,
    });
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/tasks/completed
 * @desc    Removes all completed tasks
 * NOTE: Defined BEFORE :id to prevent route clash!
 */
router.delete("/completed", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedCount = await TaskService.deleteCompleted();
    res.json({ message: "Completed tasks cleared.", deletedCount });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/tasks/:id/toggle
 * @desc    Toggle task status (completed: true <-> false)
 */
router.put("/:id/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const task = await TaskService.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    const updatedTask = await TaskService.update(id, { completed: !task.completed });
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Updates task details
 */
router.put("/:id", validateTaskInput, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { title, description, priority, category, completed, dueDate } = req.body;

    const task = await TaskService.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    const updatedTask = await TaskService.update(id, {
      title,
      description,
      priority,
      category,
      completed,
      dueDate,
    });

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Deletes one task
 */
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const deleted = await TaskService.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json({ message: "Task successfully deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
