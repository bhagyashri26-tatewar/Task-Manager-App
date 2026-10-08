require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(async () => {
  // Auto-seed sample tasks if database is completely fresh
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      console.log('🌱 Database is empty. Seeding starter tasks...');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      await Task.insertMany([
        {
          title: 'Design Dark Theme UI & Glassmorphism Design System',
          description: 'Implement modern color palette, dynamic card glows, responsive layout, and interactive micro-animations for the Task Manager.',
          status: 'completed',
          priority: 'high',
          category: 'Work',
          dueDate: yesterday,
          tags: ['Design', 'UI/UX', 'CSS'],
          subtasks: [
            { title: 'Define CSS variables and color tokens', completed: true },
            { title: 'Create glassmorphism card elevation styles', completed: true },
            { title: 'Add responsive breakpoints for mobile and desktop', completed: true },
          ],
        },
        {
          title: 'Build Express & MongoDB REST API Endpoints',
          description: 'Develop full CRUD operations, filtering by status/priority, search queries, aggregate statistics, and subtask management.',
          status: 'in_progress',
          priority: 'urgent',
          category: 'Work',
          dueDate: tomorrow,
          tags: ['Backend', 'Node.js', 'Express', 'MongoDB'],
          subtasks: [
            { title: 'Setup Mongoose Schema with validation', completed: true },
            { title: 'Implement CRUD controllers with status patching', completed: true },
            { title: 'Add aggregate dashboard stats route', completed: true },
            { title: 'Test endpoints with mock & live MongoDB', completed: false },
          ],
        },
        {
          title: 'Implement React Hooks State Management & Kanban View',
          description: 'Connect frontend to REST API with custom useTasks hook, optimistic updates, drag/drop status board, and toast notifications.',
          status: 'in_progress',
          priority: 'high',
          category: 'Study',
          dueDate: nextWeek,
          tags: ['React', 'Hooks', 'Vite', 'Frontend'],
          subtasks: [
            { title: 'Build useTasks custom hook with debounce search', completed: true },
            { title: 'Create Kanban Board & List View switcher', completed: true },
            { title: 'Integrate task creation modal & subtask checklist', completed: false },
          ],
        },
        {
          title: 'Quarterly Financial Planning & Budget Review',
          description: 'Review monthly cloud infrastructure costs, project subscriptions, and prepare annual budget projection spreadsheet.',
          status: 'pending',
          priority: 'medium',
          category: 'Finance',
          dueDate: nextWeek,
          tags: ['Finance', 'Planning'],
          subtasks: [
            { title: 'Export AWS and MongoDB Atlas invoices', completed: false },
            { title: 'Analyze cost reduction opportunities', completed: false },
          ],
        },
        {
          title: 'Morning 5km Jog & Mindfulness Meditation',
          description: 'Cardio workout and 15-minute mindfulness breathing session for peak mental clarity and well-being.',
          status: 'completed',
          priority: 'low',
          category: 'Health',
          dueDate: today,
          tags: ['Fitness', 'Routine'],
          subtasks: [
            { title: 'Warm-up stretches', completed: true },
            { title: '5km jog in the park', completed: true },
            { title: 'Meditation session', completed: true },
          ],
        },
      ]);
      console.log('✨ Seeded starter tasks successfully!');
    }
  } catch (err) {
    console.warn('⚠️ Auto-seed check failed:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'TaskManager REST API',
  });
});

// Task Routes
app.use('/api/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 TaskManager Server running at http://localhost:${PORT}`);
});
