# 🚀 Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- npm
- Git

### Steps

#### 1. Navigate to Project
```bash
cd c:\Users\SUPRIYA\Downloads\project-main\project-main
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment (Optional)
Create `.env` file:
```env
NODE_ENV=development
PORT=3000
```

For MongoDB:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app
```

#### 4. Run Development Server
```bash
npm run dev
```

#### 5. Open in Browser
```
http://localhost:3000
```

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check TypeScript errors
npm run lint

# Clean build files
npm run clean
```

---

## Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- --port 3001
```

### Dependencies not installing?
```bash
rm -r node_modules package-lock.json
npm install
```

### TypeScript errors?
```bash
npm run lint
```

---

## Need Help?
See `PROJECT_DOCUMENTATION.md` for complete guide.
