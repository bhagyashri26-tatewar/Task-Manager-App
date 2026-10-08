import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    urgent: 0,
    completionRate: 0,
    categoryCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and sorting state
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  // View mode: 'board' | 'list'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskflow_view_mode') || 'board';
  });

  // Save view mode in localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_view_mode', viewMode);
  }, [viewMode]);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err.message);
    }
  }, []);

  // Fetch tasks with current filters
  const fetchTasks = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = customFilters || filters;
      const res = await api.getTasks(activeFilters);
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      }
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
      addToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, fetchStats, addToast]);

  // Debounced search trigger
  const searchTimeoutRef = useRef(null);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  };

  const handleSearchChange = (searchValue) => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: '',
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  // Initial load and filter change trigger
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchTasks(filters);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.status, filters.priority, filters.category, filters.sortBy, filters.order, filters.search]);

  // Create Task
  const createTask = async (taskData) => {
    try {
      const res = await api.createTask(taskData);
      if (res.success && res.data) {
        setTasks((prev) => [res.data, ...prev]);
        await fetchStats();
        addToast(`Task "${res.data.title}" created successfully!`, 'success');
        return res.data;
      }
    } catch (err) {
      addToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  // Update Task
  const updateTask = async (id, taskData) => {
    try {
      const res = await api.updateTask(id, taskData);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
        await fetchStats();
        addToast(`Task updated successfully!`, 'success');
        return res.data;
      }
    } catch (err) {
      addToast(err.message || 'Failed to update task', 'error');
      throw err;
    }
  };

  // Quick Status Patch
  const updateTaskStatus = async (id, newStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    if (newStatus === 'completed') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#6366F1', '#10B981', '#F59E0B', '#38BDF8'],
        });
      } catch (e) {
        // ignore if canvas confetti fails
      }
    }

    try {
      const res = await api.patchStatus(id, newStatus);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
        await fetchStats();
        addToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'info');
        return res.data;
      }
    } catch (err) {
      setTasks(previousTasks); // Rollback
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Toggle Subtask
  const toggleSubtask = async (taskId, subtaskId) => {
    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((st) =>
          st._id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );

    try {
      const res = await api.toggleSubtask(taskId, subtaskId);
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      }
    } catch (err) {
      // Refresh on failure
      fetchTasks();
      addToast(err.message || 'Failed to toggle subtask', 'error');
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    const taskToDelete = tasks.find((t) => t._id === id);
    const previousTasks = [...tasks];

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      const res = await api.deleteTask(id);
      if (res.success) {
        await fetchStats();
        addToast(`Task deleted`, 'info');
      }
    } catch (err) {
      setTasks(previousTasks); // Rollback
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Seed sample tasks
  const seedSampleTasks = async (force = false) => {
    try {
      const res = await api.seedTasks(force);
      if (res.success) {
        addToast(res.message || 'Sample tasks loaded!', 'success');
        await fetchTasks();
      }
    } catch (err) {
      addToast(err.message || 'Failed to load sample tasks', 'error');
    }
  };

  return {
    tasks,
    stats,
    loading,
    error,
    filters,
    viewMode,
    toasts,
    setViewMode,
    handleFilterChange,
    handleSearchChange,
    resetFilters,
    createTask,
    updateTask,
    updateTaskStatus,
    toggleSubtask,
    deleteTask,
    seedSampleTasks,
    refresh: fetchTasks,
    removeToast,
    addToast,
  };
}
