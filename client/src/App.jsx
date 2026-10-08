import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import { useTasks } from './hooks/useTasks';

export default function App() {
  // Theme state with localStorage persistence (defaults to dark for modern developer feel)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskflow_theme');
    if (saved !== null) return saved === 'dark';
    return true; // default dark mode
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [darkMode]);

  // Tasks state management from custom hook
  const {
    tasks,
    stats,
    loading,
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
    removeToast,
  } = useTasks();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState('pending');

  // Open modal for new task
  const handleOpenCreate = (status = 'pending') => {
    setEditingTask(null);
    setDefaultModalStatus(status);
    setIsModalOpen(true);
  };

  // Open modal for editing existing task
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Handle Form Submit (Create or Update)
  const handleModalSubmit = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask._id, formData);
    } else {
      await createTask(formData);
    }
  };

  const isFiltered =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    Boolean(filters.search);

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Main Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={filters.search}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreateModal={() => handleOpenCreate('pending')}
        onSeedData={seedSampleTasks}
        totalTasks={stats.total}
      />

      {/* Main App Content Area */}
      <main className="main-content">
        {/* Dashboard Analytics & Metrics */}
        <DashboardStats
          stats={stats}
          activeStatus={filters.status}
          onStatusFilter={(status) => handleFilterChange('status', status)}
        />

        {/* Filter & Sorting Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          stats={stats}
        />

        {/* Task View Area */}
        {loading && tasks.length === 0 ? (
          <div className="skeleton-loader">
            <div className="skeleton-col"></div>
            <div className="skeleton-col"></div>
            <div className="skeleton-col"></div>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            onOpenCreate={() => handleOpenCreate('pending')}
            onSeedSample={seedSampleTasks}
          />
        ) : viewMode === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={updateTaskStatus}
            onToggleSubtask={toggleSubtask}
            onEdit={handleOpenEdit}
            onDelete={deleteTask}
            onOpenCreateWithStatus={handleOpenCreate}
          />
        ) : (
          <ListView
            tasks={tasks}
            onStatusChange={updateTaskStatus}
            onToggleSubtask={toggleSubtask}
            onEdit={handleOpenEdit}
            onDelete={deleteTask}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
        defaultStatus={defaultModalStatus}
      />
    </div>
  );
}
