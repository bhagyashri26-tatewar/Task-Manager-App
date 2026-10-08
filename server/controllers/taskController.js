const Task = require('../models/Task');

// @desc    Get all tasks with filtering, search & sorting
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, sortBy = 'createdAt', order = 'desc', overdue } = req.query;

    const query = { isArchived: false };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Overdue filter
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    // Search query (case-insensitive in title or description)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    // Sorting map
    const sortOptions = {};
    const sortDirection = order === 'asc' ? 1 : -1;

    if (sortBy === 'priority') {
      // In JS sort, or we can sort custom after or by field
      sortOptions.priority = sortDirection;
    } else if (sortBy === 'dueDate') {
      sortOptions.dueDate = sortDirection;
    } else if (sortBy === 'title') {
      sortOptions.title = sortDirection;
    } else {
      sortOptions.createdAt = sortDirection;
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching tasks',
      error: error.message,
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
const getTaskStats = async (req, res) => {
  try {
    const now = new Date();
    const tasks = await Task.find({ isArchived: false });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;
    const urgent = tasks.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
    ).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category breakdown
    const categoryCounts = {};
    tasks.forEach((t) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        overdue,
        urgent,
        completionRate,
        categoryCounts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching task statistics',
      error: error.message,
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error fetching task',
      error: error.message,
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, priority, category, status, dueDate, subtasks, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      category: category || 'General',
      status: status || 'pending',
      dueDate: dueDate || null,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create task',
    });
  }
};

// @desc    Update an entire task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, category, status, dueDate, subtasks, tags } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task || task.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.title = title !== undefined ? title.trim() : task.title;
    task.description = description !== undefined ? description.trim() : task.description;
    task.priority = priority || task.priority;
    task.category = category || task.category;
    task.status = status || task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    if (Array.isArray(subtasks)) {
      task.subtasks = subtasks;
    }
    if (Array.isArray(tags)) {
      task.tags = tags;
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update task',
    });
  }
};

// @desc    Quick update task status
// @route   PATCH /api/tasks/:id/status
const patchTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task || task.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Task status changed to ${status}`,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update task status',
    });
  }
};

// @desc    Toggle subtask completion
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
const toggleSubtask = async (req, res) => {
  try {
    const { id, subtaskId } = req.params;
    const task = await Task.findById(id);

    if (!task || task.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found',
      });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle subtask',
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

// @desc    Seed sample tasks
// @route   POST /api/tasks/seed
const seedTasks = async (req, res) => {
  try {
    // Clear existing or append if count is 0
    const count = await Task.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: 'Tasks already exist in database. Pass ?force=true to reset.',
      });
    }

    if (req.query.force) {
      await Task.deleteMany({});
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sampleTasks = [
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
    ];

    const inserted = await Task.insertMany(sampleTasks);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} sample tasks!`,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed sample tasks',
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  patchTaskStatus,
  toggleSubtask,
  deleteTask,
  seedTasks,
};
