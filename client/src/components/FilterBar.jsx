import React from 'react';
import {
  Filter,
  ArrowUpDown,
  Tag,
  AlertCircle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = ['all', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];
const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  stats,
}) {
  const isFiltered =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    Boolean(filters.search);

  return (
    <div className="filterbar-container">
      {/* Top row: Status Tabs */}
      <div className="filter-status-tabs" role="tablist">
        <button
          className={`status-tab-btn ${filters.status === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('status', 'all')}
        >
          <span>All Tasks</span>
          <span className="tab-badge">{stats.total || 0}</span>
        </button>

        <button
          className={`status-tab-btn tab-pending ${filters.status === 'pending' ? 'active' : ''}`}
          onClick={() => onFilterChange('status', 'pending')}
        >
          <span className="status-dot dot-pending"></span>
          <span>Pending</span>
          <span className="tab-badge">{stats.pending || 0}</span>
        </button>

        <button
          className={`status-tab-btn tab-in-progress ${filters.status === 'in_progress' ? 'active' : ''}`}
          onClick={() => onFilterChange('status', 'in_progress')}
        >
          <span className="status-dot dot-progress"></span>
          <span>In Progress</span>
          <span className="tab-badge">{stats.inProgress || 0}</span>
        </button>

        <button
          className={`status-tab-btn tab-completed ${filters.status === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('status', 'completed')}
        >
          <span className="status-dot dot-completed"></span>
          <span>Completed</span>
          <span className="tab-badge">{stats.completed || 0}</span>
        </button>
      </div>

      {/* Bottom controls: Priority, Category, Sorting */}
      <div className="filter-controls-row">
        {/* Category Pills */}
        <div className="category-scroll-pills">
          <Tag size={14} className="category-label-icon" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${filters.category === cat ? 'active' : ''}`}
              onClick={() => onFilterChange('category', cat)}
            >
              {cat === 'all' ? 'All Tags' : cat}
              {cat !== 'all' && stats.categoryCounts && stats.categoryCounts[cat] ? (
                <span className="category-count">{stats.categoryCounts[cat]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Dropdowns group */}
        <div className="filter-dropdowns-group">
          {/* Priority Dropdown */}
          <div className="filter-select-wrapper">
            <AlertCircle size={14} className="select-icon" />
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="filter-select"
              aria-label="Filter by priority"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="filter-select-wrapper">
            <ArrowUpDown size={14} className="select-icon" />
            <select
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                onFilterChange('sortBy', field);
                onFilterChange('order', direction);
              }}
              className="filter-select"
              aria-label="Sort tasks by"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters button if active */}
          {isFiltered && (
            <button
              className="btn-reset-filters"
              onClick={onResetFilters}
              title="Reset all filters and search"
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
