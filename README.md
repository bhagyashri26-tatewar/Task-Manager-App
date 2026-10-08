# ⚡ TaskFlow — Full-Stack MERN Task & Project Manager

A modern, high-performance Full-Stack Task Management Application built with **MongoDB, Express.js, React, and Node.js (MERN)**. Features a glassmorphic Cyber-Sleek UI, real-time analytics dashboard, interactive Kanban board, dynamic subtasks checklist, search debounce, and full CRUD REST API.

---

## 🌟 Key Features

### 🖥️ Frontend (React + Vite + Modern CSS)
- **Component-Based UI Architecture**: Modular, maintainable components with clean state separation.
- **Custom React Hooks State Management**: Centralized `useTasks` hook handling optimistic updates, API synchronization, filter states, and debounced search.
- **Dual View Modes**:
  - 📋 **Kanban Board View**: Interactive drag-and-and-drop & status columns (*To Do*, *In Progress*, *Completed*).
  - 📑 **List View**: Responsive card grid with quick-actions.
- **Live Analytics Dashboard**: Real-time metric cards calculating total tasks, active in-progress items, completion rate percentage, overdue alerts, and category distributions.
- **Dynamic Subtasks Checklist**: Create, toggle, and manage multi-step subtasks directly inside cards or the modal.
- **Rich Filtering & Sorting**: Filter by Status, Priority (Urgent, High, Medium, Low), Category pills, and multi-criteria sorting (Due Date, Priority, Title, Date Created).
- **Dark & Light Mode**: Persistent theme switcher with modern CSS custom property tokens and backdrop blur glassmorphism.
- **Celebration Feedback**: Confetti animations upon task completion and non-blocking toast notifications.

---

### ⚙️ Backend (Node.js + Express.js + Mongoose)
- **RESTful API Endpoints**: Full CRUD support with robust validation and error handling.
- **MongoDB / Mongoose ODM**: Schema modeling with subdocument arrays, indexed search fields, and timestamps.
- **Aggregation & Analytics**: Statistics route (`/api/tasks/stats`) calculating live totals, overdue tasks, and category breakdown.
- **Auto-Seeding**: Automatic seed starter data on first startup for immediate testing out of the box.

---

## 🏗️ Architecture & Project Structure

```text
TaskManagerApp/
├── package.json              # Root script orchestrator (concurrently)
│
├── server/                   # Backend Node.js / Express API
│   ├── config/
│   │   └── db.js             # Mongoose MongoDB connection
│   ├── controllers/
│   │   └── taskController.js # CRUD handlers, stats aggregation, subtasks
│   ├── models/
│   │   └── Task.js           # Mongoose Task & Subtask schema
│   ├── routes/
│   │   └── taskRoutes.js     # Express REST API routes
│   ├── .env                  # Server environment configuration
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express app entry point
│
└── client/                   # Frontend React Application
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # App bar with search, theme & view toggles
    │   │   ├── DashboardStats.jsx # Metric cards & completion rate gauge
    │   │   ├── FilterBar.jsx      # Status tabs, priority & category filters
    │   │   ├── KanbanBoard.jsx    # 3-column Drag & Drop workflow board
    │   │   ├── ListView.jsx       # Grid list representation
    │   │   ├── TaskCard.jsx       # Interactive task item with subtask checklist
    │   │   ├── TaskModal.jsx      # Create/Edit task modal with tag chips
    │   │   ├── Toast.jsx          # Notification system
    │   │   └── EmptyState.jsx     # Zero-data state with demo loader
    │   ├── hooks/
    │   │   └── useTasks.js        # Centralized state management hook
    │   ├── services/
    │   │   └── api.js             # REST API HTTP client
    │   ├── App.jsx                # Main Application container
    │   ├── index.css              # Master modern design system
    │   └── main.jsx               # React DOM entry
    ├── index.html                 # HTML shell with Google Fonts & SEO
    ├── vite.config.js             # Vite config with backend proxy
    └── package.json               # Frontend dependencies
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks (supports `status`, `priority`, `category`, `search`, `sortBy`, `order`) |
| `GET` | `/api/tasks/stats` | Aggregated metrics (total, inProgress, completed, overdue, urgent, completionRate) |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update full task details |
| `PATCH` | `/api/tasks/:id/status` | Quick status update (`pending`, `in_progress`, `completed`) |
| `PATCH` | `/api/tasks/:id/subtasks/:subtaskId` | Toggle subtask completion status |
| `DELETE` | `/api/tasks/:id` | Delete task by ID |
| `POST` | `/api/tasks/seed` | Seed demo starter tasks (`?force=true` to reset) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB instance running on port 27017 or MongoDB Atlas connection URI

### 2. Run Both Frontend & Backend (One Command)
From the root directory:
```bash
npm run dev
```

This starts:
- 🚀 **Backend Server**: [http://localhost:5000](http://localhost:5000)
- ⚡ **Frontend Client**: [http://localhost:3000](http://localhost:3000)

---

### 3. Running Individually

**Backend Server:**
```bash
cd server
npm run dev
```

**Frontend Client:**
```bash
cd client
npm run dev
```
