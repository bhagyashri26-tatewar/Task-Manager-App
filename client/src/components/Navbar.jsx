import React, { useEffect, useRef } from 'react';
import {
  CheckSquare,
  Plus,
  Moon,
  Sun,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function Navbar({
  darkMode,
  setDarkMode,
  searchQuery,
  onSearchChange,
  viewMode,
  setViewMode,
  onOpenCreateModal,
  onSeedData,
  totalTasks,
}) {
  const searchInputRef = useRef(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-badge-icon">
            <Zap className="brand-zap-icon" size={20} />
          </div>
          <div className="brand-text-group">
            <h1 className="brand-title">
              Task<span className="brand-highlight">Flow</span>
            </h1>
            <span className="brand-subtitle">MERN Stack</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search-wrapper">
          <Search className="search-icon" size={17} />
          <input
            ref={searchInputRef}
            type="text"
            className="navbar-search-input"
            placeholder="Search tasks, descriptions, tags... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              ×
            </button>
          )}
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        {/* Navbar Actions */}
        <div className="navbar-actions">
          {/* View Mode Switcher */}
          <div className="view-toggle-group" role="group" aria-label="View toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
              <span className="hide-mobile">Board</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
              <span className="hide-mobile">List</span>
            </button>
          </div>

          {/* Quick Demo Seed */}
          <button
            className="btn-icon-pill"
            onClick={() => onSeedData(true)}
            title="Reset & Load Starter Demo Data"
          >
            <Sparkles size={16} />
            <span className="hide-tablet">Demo</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            className="btn-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} className="theme-icon-sun" /> : <Moon size={18} className="theme-icon-moon" />}
          </button>

          {/* Create Task Button */}
          <button
            className="btn btn-primary btn-create"
            onClick={onOpenCreateModal}
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
