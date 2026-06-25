# 📝 Personal Todo Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Project Architecture](#project-architecture)
4. [Tech Stack](#tech-stack)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Frontend Structure](#frontend-structure)
10. [File Structure](#file-structure)
11. [Environment Configuration](#environment-configuration)
12. [Development Guide](#development-guide)
13. [Building for Production](#building-for-production)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Personal Todo** is a full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js). It demonstrates core full-stack development concepts including REST APIs, CRUD operations, state management, and responsive UI design.

### Purpose
This project was created as a learning tool to understand:
- Building REST APIs with Express.js
- Database operations with MongoDB and Mongoose
- React component architecture and state management
- Full-stack TypeScript integration
- Responsive UI development with Tailwind CSS

### Key Capabilities
- Create and manage daily tasks
- Organize tasks by priority and category
- Track task completion with visual feedback
- Search and filter capabilities
- Data persistence across sessions
- Analytics and progress tracking

---

## Features

### Core Features
✅ **Task Management**
- Create new tasks with title, description, priority, and due date
- Edit existing tasks
- Delete individual tasks or clear all completed tasks
- Mark tasks as completed/pending

✅ **Organization & Filtering**
- Organize tasks by priority levels (Low, Medium, High)
- Categorize tasks for better organization
- Filter tasks by status (All, Pending, Completed)
- Filter tasks by priority level
- Search tasks by keyword

✅ **User Experience**
- Dark mode / Light mode toggle
- Responsive design for desktop and mobile
- Smooth animations and transitions
- Toast notifications for user feedback
- Real-time task updates

✅ **Analytics & Dashboard**
- View task completion statistics
- Track daily progress
- Visual charts showing task distribution
- Completion streak tracking
- Daily goal management

✅ **Data Persistence**
- MongoDB Atlas integration for cloud storage
- Automatic JSON file fallback for local development
- Data survives page refreshes
- Timestamps for task creation and updates

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ App.tsx → Components → State Management → API Calls  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ (HTTP/JSON)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Express Backend (Node.js/TypeScript)            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes → Controllers → Services → Database            │ │
│  │ /api/tasks GET, POST, PUT, DELETE operations         │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ MongoDB Atlas (Production) / JSON File (Development) │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Architectural Pattern
- **Client-Server**: Classic HTTP request/response
- **RESTful API**: Standard HTTP methods for CRUD operations
- **MVC-inspired Backend**: Routes → Services → Database
- **Component-based Frontend**: Modular React components

---

## Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 19.0.1 |
| Vite | Build Tool & Dev Server | 6.2.3 |
| TypeScript | Type-safe JavaScript | ~5.8.2 |
| Tailwind CSS | Utility-first CSS | 4.1.14 |
| Motion | Animations Library | 12.23.24 |
| Lucide React | Icon Library | 0.546.0 |
| Chart.js | Data Visualization | 4.5.1 |
| React Router | Client-side Routing | 7.18.0 |
| Axios | HTTP Client | 1.18.1 |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | Latest |
| Express | Web Framework | 4.21.2 |
| TypeScript | Type-safe JavaScript | ~5.8.2 |
| MongoDB | Database | (Atlas) |
| Mongoose | MongoDB ODM | 9.7.2 |
| Dotenv | Environment Variables | 17.2.3 |
| Tsx | TypeScript Executor | 4.21.0 |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESBuild | Production Bundler |
| Autoprefixer | CSS Prefixing |
| Tailwind CSS | Styling |

---

## Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control): [Download](https://git-scm.com/)
- **MongoDB Atlas Account** (optional, for cloud database): [Create Account](https://www.mongodb.com/cloud/atlas)

### Installation Steps

#### 1. Clone or Navigate to Project
```bash
cd c:\Users\SUPRIYA\Downloads\project-main\project-main
```

#### 2. Install Dependencies
```bash
npm install
```
This will install all packages listed in `package.json`:
- Frontend dependencies (React, Vite, Tailwind, etc.)
- Backend dependencies (Express, Mongoose, etc.)
- Development dependencies (TypeScript, ESBuild, etc.)

#### 3. Setup Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app

# Server Configuration
NODE_ENV=development
PORT=3000

# Optional: API Keys for external services
GOOGLE_API_KEY=your_google_api_key_here
```

**Note:** If `MONGODB_URI` is not set, the application will fall back to local JSON file storage.

#### 4. Verify Installation
```bash
npm run lint
```
This checks for TypeScript errors without compilation.

---

## Running the Application

### Development Mode
```bash
npm run dev
```

**What happens:**
- Express server starts on `http://localhost:3000`
- Vite dev server starts on `http://localhost:5173` (for HMR)
- Frontend is served from the backend with hot module replacement
- Database connection attempts (MongoDB or JSON fallback)

**Output should show:**
```
> react-example@0.0.0 dev
> tsx server.ts

Server running on http://localhost:3000
Vite v6.2.3 building for production...
```

### Production Build
```bash
npm run build
```

**This:**
1. Builds React frontend with Vite
2. Bundles Express server with ESBuild
3. Creates `dist/` folder with:
   - `index.html` (frontend)
   - `server.cjs` (backend)
   - Assets and static files

### Start Production Server
```bash
npm run start
```
Runs `node dist/server.cjs` - serves bundled application

### Cleanup Build Files
```bash
npm run clean
```
Removes `dist/` and `server.js` files

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently, the API is open (no authentication required). Authentication can be added by implementing JWT middleware.

---

### Endpoints

#### 1. Get All Tasks
```
GET /api/tasks
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the todo app",
    "priority": "High",
    "category": "Work",
    "completed": false,
    "dueDate": "2025-01-15",
    "createdAt": "2025-01-10T14:30:00.000Z",
    "updatedAt": "2025-01-10T14:30:00.000Z"
  }
]
```

---

#### 2. Create New Task
```
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "Medium",
  "category": "Personal",
  "dueDate": "2025-01-12"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "Medium",
  "category": "Personal",
  "completed": false,
  "dueDate": "2025-01-12",
  "createdAt": "2025-01-10T15:45:00.000Z",
  "updatedAt": "2025-01-10T15:45:00.000Z"
}
```

**Validation:**
- `title` is required (string, max 500 chars)
- `priority` must be "Low", "Medium", or "High"
- `dueDate` format: YYYY-MM-DD

---

#### 3. Update Task
```
PUT /api/tasks/:id
```

**Request Body:**
```json
{
  "title": "Updated task title",
  "priority": "High",
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated task title",
  "priority": "High",
  "completed": true,
  ...
}
```

---

#### 4. Toggle Task Status
```
PUT /api/tasks/:id/toggle
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "completed": true,
  ...
}
```

---

#### 5. Delete Task
```
DELETE /api/tasks/:id
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully.",
  "deletedCount": 1
}
```

---

#### 6. Clear Completed Tasks
```
DELETE /api/tasks/completed
```

**Response (200 OK):**
```json
{
  "message": "Completed tasks cleared.",
  "deletedCount": 5
}
```

---

#### 7. Health Check
```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "MongoDB Atlas",
  "time": "2025-01-10T15:45:00.000Z"
}
```

---

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid task input"
}
```

**404 Not Found:**
```json
{
  "error": "Task not found."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

---

## Database Schema

### Task Model (MongoDB/Mongoose)

```typescript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  title: String,           // Required, max 500 chars
  description: String,     // Optional, default: ""
  priority: String,        // Enum: "Low" | "Medium" | "High"
  category: String,        // Grouping field, default: "Other"
  completed: Boolean,      // Task status, default: false
  dueDate: String,         // Format: YYYY-MM-DD, optional
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-updated timestamp
}
```

### Task Model (Local JSON Fallback)

When MongoDB is unavailable, tasks are stored in `tasks.json`:
```json
[
  {
    "_id": "unique-id-string",
    "title": "Task title",
    "description": "Task description",
    "priority": "High",
    "category": "Work",
    "completed": false,
    "dueDate": "2025-01-15",
    "createdAt": "2025-01-10T14:30:00.000Z",
    "updatedAt": "2025-01-10T14:30:00.000Z"
  }
]
```

### Indexes (MongoDB)
- Primary index on `_id` (auto-created)
- Compound index on `createdAt` for sorting

---

## Frontend Structure

### Directory Layout
```
src/
├── App.tsx                 # Main app component, state management
├── main.tsx               # React entry point
├── types.ts               # TypeScript interfaces
├── index.css              # Global styles
├── components/
│   ├── TaskCard.tsx       # Individual task component
│   ├── TaskCharts.tsx     # Analytics charts
│   └── Toast.tsx          # Notification system
└── services/
    └── api.ts             # HTTP API client (Axios)
```

### Component Architecture

#### App.tsx (Main Component)
**Responsibilities:**
- Global state management (tasks, filters, search)
- Task CRUD operations
- UI orchestration
- Event handling

**State Variables:**
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
const [selectedCategory, setSelectedCategory] = useState<string>("All");
const [selectedSort, setSelectedSort] = useState<string>("Newest");
const [isDark, setIsDark] = useState(false);
const [showForm, setShowForm] = useState(false);
const [showAnalytics, setShowAnalytics] = useState(false);
```

#### TaskCard.tsx (Task Display)
**Responsibilities:**
- Display individual task
- Handle task interactions (edit, delete, toggle)
- Show task details (priority, due date, category)

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}
```

#### TaskCharts.tsx (Analytics)
**Responsibilities:**
- Display progress charts
- Show completion statistics
- Visualize data with Chart.js

#### Toast.tsx (Notifications)
**Responsibilities:**
- Show success/error notifications
- Auto-dismiss after timeout
- Queue multiple messages

---

## File Structure

```
project-main/
├── .env.example              # Environment variable template
├── .gitignore               # Git ignore rules
├── index.html               # HTML entry point
├── package.json             # Project metadata & dependencies
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── server.ts                # Express server entry point
├── metadata.json            # Project metadata
├── README.md                # Quick start guide
├── PROJECT_DOCUMENTATION.md # This file
│
├── server/
│   ├── db.ts               # Database connection & management
│   ├── middleware/
│   │   └── security.ts     # Rate limiting, error handling
│   ├── models/
│   │   └── Task.ts         # Data model & service methods
│   └── routes/
│       └── taskRoutes.ts   # API endpoint definitions
│
├── src/
│   ├── App.tsx             # Main React component
│   ├── main.tsx            # React entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── index.css           # Global styles
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskCharts.tsx
│   │   └── Toast.tsx
│   └── services/
│       └── api.ts          # API client
│
├── assets/                  # Static assets
│
└── dist/                    # Build output (after `npm run build`)
    ├── index.html
    ├── server.cjs
    ├── assets/
    └── ...
```

---

## Environment Configuration

### .env File Template
Create `.env` in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Server
NODE_ENV=development
PORT=3000

# Optional: Google GenAI (if using AI features)
GOOGLE_API_KEY=your_api_key_here

# Optional: Debugging
DEBUG=true
```

### Environment Variables Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/todo` |
| `NODE_ENV` | Deployment environment | `development` or `production` |
| `PORT` | Server port | `3000` |
| `GOOGLE_API_KEY` | Google AI API key | Your API key |

### Fallback Behavior
- If `MONGODB_URI` is not set → Uses JSON file storage (`tasks.json`)
- If `NODE_ENV` is not set → Defaults to `development`
- If `PORT` is not set → Defaults to `3000`

---

## Development Guide

### Adding a New Task Field

**1. Update Database Model** (`server/models/Task.ts`):
```typescript
const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"] },
  newField: { type: String, default: "" },  // New field
  // ...
});
```

**2. Update Frontend Type** (`src/types.ts`):
```typescript
export interface Task {
  _id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  newField: string;  // New field
  // ...
}
```

**3. Update API Service** (`src/services/api.ts`):
Include the new field in request/response handling.

**4. Update Components:**
Add UI elements to `TaskCard.tsx` or `App.tsx` to handle the new field.

---

### Adding a New API Endpoint

**1. Add Route** (`server/routes/taskRoutes.ts`):
```typescript
router.get("/custom", async (req, res, next) => {
  try {
    // Implement logic
    res.json({ /* response */ });
  } catch (err) {
    next(err);
  }
});
```

**2. Add Service Method** (`server/models/Task.ts`):
```typescript
export const TaskService = {
  async customMethod() {
    // Implementation
  }
};
```

**3. Update Frontend Service** (`src/services/api.ts`):
```typescript
export const TaskApiService = {
  async customMethod() {
    const response = await api.get("/tasks/custom");
    return response.data;
  }
};
```

---

### Styling Additions

The project uses Tailwind CSS. Add styles directly in JSX:

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
  {/* Content */}
</div>
```

**Key Tailwind Classes Used:**
- Colors: `bg-blue-500`, `text-gray-700`
- Spacing: `p-4`, `m-2`, `gap-3`
- Layout: `flex`, `grid`, `flex-col`
- Responsive: `md:grid-cols-2`, `lg:px-8`
- Dark Mode: `dark:bg-gray-900`

---

### Debugging Tips

**1. Check Browser Console**
```
F12 → Console tab
```

**2. Check Server Logs**
```bash
npm run dev
# Look for error messages in terminal
```

**3. MongoDB Query Logging** (in `.env`):
```env
DEBUG=mongoose:* npm run dev
```

**4. API Testing with Postman/Insomnia**
- Import example requests
- Test endpoints before using in UI

---

## Building for Production

### Build Process
```bash
npm run build
```

**Steps Executed:**
1. React app built with Vite:
   - Code splitting
   - Tree shaking
   - Minification
2. Express server bundled with ESBuild:
   - All dependencies bundled (except npm packages)
   - Minified for smaller size

### Output Structure
```
dist/
├── index.html          # Minified HTML
├── assets/
│   ├── app-HASH.js    # Minified React app
│   ├── app-HASH.css   # Minified styles
│   └── ...
└── server.cjs         # Bundled Express server
```

### Production Deployment

**1. Set Environment Variables**
```bash
set NODE_ENV=production
set MONGODB_URI=your_production_mongodb_url
```

**2. Run Production Build**
```bash
npm run build
npm run start
```

**3. Deploy to Hosting**
- **Vercel**: Push to GitHub, connect to Vercel
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS EC2**: Upload `dist/` folder and `package.json`

---

## Troubleshooting

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Kill the process using port 3000
# Windows (PowerShell as Admin):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001 npm run dev
```

### Issue: MongoDB Connection Failed
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Check MongoDB URI in `.env`
2. Ensure IP is whitelisted in MongoDB Atlas
3. Verify username/password
4. App will automatically fallback to JSON storage

**Fallback Storage Location:**
```
project-main/tasks.json
```

---

### Issue: Module Not Found Errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

---

### Issue: Port 5173 (Vite Dev Server) Not Available
**Solution:**
```bash
# Vite will automatically use next available port
# Or specify port in vite.config.ts:
export default defineConfig({
  server: {
    port: 5174
  }
});
```

---

### Issue: Hot Module Replacement (HMR) Not Working
**Cause:** `DISABLE_HMR` environment variable set to `true`

**Solution:**
```bash
# Remove or set to false
unset DISABLE_HMR
npm run dev
```

---

### Issue: TypeScript Errors After npm install
**Solution:**
```bash
npm run lint
# View specific errors and fix them
```

---

### Issue: Build Size Too Large
**Optimization Tips:**
1. Update dependencies: `npm update`
2. Remove unused packages
3. Enable code splitting in Vite config
4. Use dynamic imports for components:
```typescript
const TaskCharts = lazy(() => import('./components/TaskCharts'));
```

---

## Performance Optimization

### Frontend Optimizations
- Use `React.memo()` for TaskCard to prevent re-renders
- Implement virtual scrolling for large task lists
- Lazy load TaskCharts component
- Use CSS modules for scoped styling

### Backend Optimizations
- Add database indexes on frequently queried fields
- Implement caching with Redis
- Use pagination for large result sets
- Add request validation middleware

### Example Pagination Implementation
```typescript
router.get("/", async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  
  const tasks = await TaskService.getAll().skip(skip).limit(limit);
  res.json(tasks);
});
```

---

## Security Considerations

### Current Security Measures
- Input validation on task creation
- Rate limiting on API routes (10 requests per minute per IP)
- Error handling middleware
- CORS support (configure in Express)

### Recommended Enhancements
1. **Authentication**
   - Implement JWT tokens
   - Add user accounts
   - Secure password storage (bcrypt)

2. **Authorization**
   - Check user ownership of tasks
   - Implement role-based access control

3. **Additional Security**
   - Add HTTPS (in production)
   - Implement CSRF protection
   - Add request logging
   - Sanitize user inputs

---

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Test API endpoints with curl/Postman
- Test UI components manually
- Check responsive design on mobile

### Commit Messages
```
feat: Add new feature description
fix: Bug fix description
docs: Documentation update
refactor: Code refactoring
```

---

## Roadmap & Future Features

### Planned Features
- [ ] User authentication & accounts
- [ ] Task categories management
- [ ] Task sharing with other users
- [ ] Email notifications for due tasks
- [ ] Mobile app (React Native)
- [ ] Dark mode persistence
- [ ] Task templates
- [ ] AI-powered task suggestions
- [ ] Recurring tasks
- [ ] Task dependencies

### Known Limitations
- No user authentication (all tasks are global)
- No real-time updates between clients
- Limited to one database strategy at a time

---

## Support & Resources

### Documentation Links
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Getting Help
1. Check this documentation
2. Review error messages carefully
3. Search existing GitHub issues
4. Create a new issue with error details

---

## License

This project is open source and available under the MIT License.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial release with core task management features |

---

## Project Metadata

- **Project Name:** Personal Todo
- **Repository:** https://github.com/supriyapanda634-del/project-main
- **Tech Stack:** MERN (MongoDB, Express, React, Node.js)
- **Database:** MongoDB Atlas / JSON Fallback
- **Deployment:** Production-ready
- **Last Updated:** January 2025

---

**Happy Task Managing! 🎯**

For questions or improvements, refer to this documentation or check the GitHub repository.
