# 💻 Development Guide

## For Contributors & Developers

### Project Goals
- Demonstrate full-stack MERN development
- Provide clean, maintainable code
- Practice TypeScript best practices
- Learn REST API design
- Implement responsive UI

---

## Development Setup

### Initial Setup
```bash
cd project-main
npm install
npm run lint  # Check for TypeScript errors
npm run dev   # Start development server
```

### IDE Setup
**Recommended:** Visual Studio Code

**Recommended Extensions:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- REST Client (for API testing)

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Code Structure Philosophy

### Frontend (React)
- **Components:** Reusable, focused UI elements
- **Services:** API communication layer
- **Types:** Centralized type definitions
- **State:** Managed at App.tsx level

### Backend (Express)
- **Routes:** Define API endpoints
- **Services:** Business logic and data operations
- **Models:** Data schema and validation
- **Middleware:** Cross-cutting concerns

---

## Adding Features

### Feature Checklist
- [ ] Plan the feature
- [ ] Update types (`src/types.ts` or `server/models/Task.ts`)
- [ ] Implement backend logic
- [ ] Add API endpoint or update existing
- [ ] Implement frontend component
- [ ] Test manually
- [ ] Update documentation

### Example: Add Priority Colors

**1. Update Styles (src/App.tsx):**
```typescript
const priorityColors = {
  'High': 'bg-red-100 text-red-800 border-red-300',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Low': 'bg-green-100 text-green-800 border-green-300'
};

return (
  <div className={`p-2 rounded border ${priorityColors[task.priority]}`}>
    {task.priority}
  </div>
);
```

**2. Update TaskCard Component:**
```typescript
export default function TaskCard({ task, onUpdate }) {
  return (
    <div className={`p-4 rounded ${getPriorityColor(task.priority)}`}>
      {/* Card content */}
    </div>
  );
}

function getPriorityColor(priority: string): string {
  const colors = {
    'High': 'border-l-4 border-red-500',
    'Medium': 'border-l-4 border-yellow-500',
    'Low': 'border-l-4 border-green-500'
  };
  return colors[priority] || colors['Medium'];
}
```

---

## Component Development

### TaskCard.tsx Pattern
```typescript
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onToggle
}: TaskCardProps) {
  
  const handleComplete = () => {
    onToggle(task._id);
  };

  const handleDelete = () => {
    onDelete(task._id);
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="text-gray-600 text-sm">{task.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="badge badge-primary">{task.priority}</span>
            <span className="badge badge-secondary">{task.category}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleComplete} className="btn btn-sm">
            {task.completed ? '✓' : '○'}
          </button>
          <button onClick={handleDelete} className="btn btn-sm btn-danger">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Component Best Practices
```typescript
// ✅ Good: Props interface
interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
}

// ❌ Avoid: Any types
interface Props {
  task: any;
  onUpdate: any;
}

// ✅ Good: Callback names indicate action
onTaskComplete()
onTaskDelete()
onTaskUpdate()

// ❌ Avoid: Generic callback names
onClick()
onHandle()

// ✅ Good: Memoize expensive components
export default React.memo(TaskCard);

// ✅ Good: Extract handlers outside render
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

---

## Backend Development

### API Endpoint Pattern
```typescript
/**
 * @route   GET /api/tasks
 * @desc    Retrieve all tasks sorted by newest first
 * @access  Public
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await TaskService.getAll();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});
```

### Error Handling Pattern
```typescript
// ✅ Good: Centralized error handling
router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const result = await TaskService.create(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);  // Pass to error handler middleware
  }
});

// ❌ Avoid: Inline error handling
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const result = await TaskService.create(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });  // Inconsistent error format
  }
});
```

### Service Layer Pattern
```typescript
export const TaskService = {
  async getAll(): Promise<Task[]> {
    // Business logic here
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    return tasks.map(transformTaskToDTO);
  },

  async create(taskData: CreateTaskDTO): Promise<Task> {
    // Validate input
    if (!taskData.title) throw new Error('Title is required');
    
    // Create document
    const task = new TaskModel(taskData);
    await task.save();
    
    // Return DTO
    return transformTaskToDTO(task);
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await TaskModel.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    if (!task) throw new Error('Task not found');
    return transformTaskToDTO(task);
  }
};

// Helper: Transform database model to API response
function transformTaskToDTO(dbTask: any): Task {
  return {
    _id: dbTask._id.toString(),
    title: dbTask.title,
    description: dbTask.description,
    priority: dbTask.priority,
    category: dbTask.category,
    completed: dbTask.completed,
    dueDate: dbTask.dueDate,
    createdAt: dbTask.createdAt.toISOString(),
    updatedAt: dbTask.updatedAt.toISOString()
  };
}
```

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Create a task
- [ ] View all tasks
- [ ] Update task details
- [ ] Toggle task completion
- [ ] Delete individual task
- [ ] Clear completed tasks
- [ ] Test with empty list
- [ ] Test with many tasks
- [ ] Test on mobile screen
- [ ] Test dark mode toggle

### API Testing with cURL
```bash
# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "priority": "High"
  }'

# Get all tasks
curl http://localhost:3000/api/tasks

# Update task
curl -X PUT http://localhost:3000/api/tasks/ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete task
curl -X DELETE http://localhost:3000/api/tasks/ID
```

### Browser DevTools Testing
1. Open DevTools (F12)
2. Network tab: Monitor API calls
3. Console: Check for errors
4. Application > LocalStorage: Verify theme settings
5. Application > Cookies: Check session data

---

## Performance Optimization

### Frontend Optimizations
```typescript
// ✅ Memoize expensive components
const TaskCard = React.memo(({ task, onUpdate }) => {
  // Component code
});

// ✅ Use useMemo for expensive calculations
const completionRate = useMemo(() => {
  return (completedCount / totalCount) * 100;
}, [completedCount, totalCount]);

// ✅ Lazy load non-critical components
const TaskCharts = lazy(() => import('./TaskCharts'));

// ✅ Pagination for large lists
const [page, setPage] = useState(1);
const visibleTasks = allTasks.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);
```

### Backend Optimizations
```typescript
// ✅ Add database indexes
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ category: 1 });

// ✅ Implement caching
const cache = new Map();
async function getCachedTasks() {
  if (cache.has('tasks')) {
    return cache.get('tasks');
  }
  const tasks = await TaskModel.find();
  cache.set('tasks', tasks);
  return tasks;
}

// ✅ Paginate results
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const tasks = await TaskModel.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  res.json({ tasks, total: await TaskModel.countDocuments() });
});
```

---

## Debugging Tips

### Frontend Debugging
```typescript
// Add console logs strategically
const handleCreateTask = async (taskData) => {
  console.log('Creating task:', taskData);
  try {
    const newTask = await TaskApiService.createTask(taskData);
    console.log('Task created:', newTask);
    setTasks([newTask, ...tasks]);
  } catch (err) {
    console.error('Error creating task:', err);
  }
};

// Use React DevTools
// - Inspect component hierarchy
// - Monitor props and state changes
// - Profile performance
```

### Backend Debugging
```bash
# Enable detailed MongoDB logging
DEBUG=mongoose:* npm run dev

# Check running processes
netstat -ano | findstr :3000

# Monitor memory usage
node --max-old-space-size=4096 dist/server.cjs
```

### Common Issues
```typescript
// Issue: State not updating
// ✅ Solution: Return new object
setState([...state, newItem]);  // Good
setState(state.push(newItem));  // Bad

// Issue: Memory leaks
// ✅ Solution: Cleanup effect
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);  // Cleanup
}, []);

// Issue: Race conditions
// ✅ Solution: Use AbortController
const controller = new AbortController();
api.get('/tasks', { signal: controller.signal });
// Later: controller.abort();
```

---

## Git Workflow

### Branch Naming
```
feature/add-task-categories
fix/task-sorting-bug
docs/update-api-reference
refactor/simplify-state-management
```

### Commit Messages
```
feat: Add task categories feature
fix: Resolve task sorting bug
docs: Update API documentation
refactor: Simplify component state
test: Add unit tests for TaskService
```

### Pull Request Checklist
- [ ] Branch up to date with main
- [ ] All TypeScript errors fixed
- [ ] Code follows project style
- [ ] Feature tested manually
- [ ] Documentation updated
- [ ] Commit messages are clear

---

## Environment-Specific Configuration

### Development (.env.development)
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
MONGODB_URI=mongodb://localhost:27017/todo-dev
```

### Production (.env.production)
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/todo-prod
```

---

## Type Safety Best Practices

### Define All Types
```typescript
// ✅ Good: Explicit types
interface Task {
  _id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

// ❌ Avoid: Any types
interface Task {
  [key: string]: any;
}

// ✅ Good: Use discriminated unions
type Action =
  | { type: 'CREATE'; payload: Task }
  | { type: 'DELETE'; payload: string }
  | { type: 'UPDATE'; payload: Task };
```

### Strict TypeScript Config
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## Documentation Standards

### Code Comments
```typescript
// ✅ Good: Explain why, not what
// Batch updates to reduce API calls and improve perceived performance
const debouncedUpdate = debounce(updateTask, 500);

// ❌ Avoid: Redundant comments
// Increment counter by one
counter++;

// ✅ Good: JSDoc for public functions
/**
 * Toggle a task's completion status
 * @param taskId - The ID of the task to toggle
 * @returns Updated task object
 */
export async function toggleTask(taskId: string): Promise<Task> {
  // ...
}
```

---

## Next Steps for Learners

### Week 1: Understand the Codebase
- [ ] Read PROJECT_DOCUMENTATION.md
- [ ] Review component structure
- [ ] Test all API endpoints
- [ ] Understand database schema

### Week 2: Make Small Changes
- [ ] Add a new task field
- [ ] Change styling
- [ ] Update colors/icons
- [ ] Modify validation

### Week 3: Add a Feature
- [ ] Add task categories
- [ ] Implement search
- [ ] Add task filtering
- [ ] Create dashboard

### Week 4+: Extend the Project
- [ ] Add authentication
- [ ] Implement sharing
- [ ] Add recurring tasks
- [ ] Create mobile app

---

## Resources for Learning

### Documentation
- [React Docs](https://react.dev)
- [Express Guide](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com)

### Tools
- [Postman](https://www.postman.com) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com) - Editor

### Communities
- Stack Overflow
- Dev.to
- Reddit: r/webdev, r/typescript
- GitHub Discussions

---

## Performance Benchmarks

### Current Performance
- Task Creation: ~50ms
- Task Load (10 tasks): ~20ms
- Task Update: ~40ms
- Page Load: ~800ms (cold), ~200ms (warm)

### Optimization Goals
- Reduce page load to <500ms
- Reduce task operations to <20ms
- Support 1000+ tasks without lag

---

## Troubleshooting Development Issues

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run lint
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors After Changes
```bash
npm run lint
# Fix reported errors
```

### Vite HMR Not Working
```env
# In .env
DISABLE_HMR=false
```

---

**Happy coding! 🚀**

For questions, check the main documentation or explore the codebase.
