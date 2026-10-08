import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  ListTodo,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function TaskCard({
  task,
  onStatusChange,
  onToggleSubtask,
  onEdit,
  onDelete,
}) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Calculate subtasks progress
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((st) => st.completed).length
    : 0;
  const subtaskProgress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Format Due Date
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((taskDate - today) / (1000 * 60 * 60 * 24));

    let label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    let statusClass = 'due-normal';

    if (task.status !== 'completed') {
      if (diffDays < 0) {
        label = `Overdue (${Math.abs(diffDays)}d)`;
        statusClass = 'due-overdue';
      } else if (diffDays === 0) {
        label = 'Due Today';
        statusClass = 'due-today';
      } else if (diffDays === 1) {
        label = 'Due Tomorrow';
        statusClass = 'due-soon';
      }
    }

    return { label, statusClass };
  };

  const dueInfo = formatDueDate(task.dueDate);

  // Priority color config
  const priorityConfig = {
    urgent: { label: 'Urgent', class: 'priority-urgent' },
    high: { label: 'High', class: 'priority-high' },
    medium: { label: 'Medium', class: 'priority-medium' },
    low: { label: 'Low', class: 'priority-low' },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.medium;

  // Cycle status
  const getNextStatus = () => {
    if (task.status === 'pending') return 'in_progress';
    if (task.status === 'in_progress') return 'completed';
    return 'pending';
  };

  return (
    <div
      className={`task-card-item card-priority-${task.priority} ${task.status === 'completed' ? 'card-completed' : ''}`}
    >
      {/* Top Header Row */}
      <div className="task-card-header">
        <div className="task-badges-row">
          <span className={`priority-badge ${currentPriority.class}`}>
            <span className="priority-pulse-dot"></span>
            {currentPriority.label}
          </span>
          <span className="category-badge">
            <Tag size={11} />
            {task.category}
          </span>
        </div>

        {/* Quick Menu / Actions */}
        <div className="task-actions-dropdown-wrapper">
          <button
            className="btn-icon-more"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Task Actions"
            aria-label="Task Actions"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="task-dropdown-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Task</span>
              </button>
              <button
                className="dropdown-item dropdown-item-danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task._id);
                }}
              >
                <Trash2 size={14} />
                <span>Delete Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Main Content */}
      <div className="task-card-body">
        <div className="task-title-row">
          <button
            className={`status-checkbox-btn ${task.status === 'completed' ? 'checked' : ''}`}
            onClick={() => onStatusChange(task._id, task.status === 'completed' ? 'pending' : 'completed')}
            title={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {task.status === 'completed' ? (
              <CheckCircle2 size={19} className="checkbox-icon checked" />
            ) : (
              <Circle size={19} className="checkbox-icon" />
            )}
          </button>
          <h4 className={`task-title ${task.status === 'completed' ? 'title-completed' : ''}`}>
            {task.title}
          </h4>
        </div>

        {task.description && (
          <p className="task-description-text">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags-list">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="task-tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtasks Section */}
      {totalSubtasks > 0 && (
        <div className="task-subtasks-container">
          <button
            className="subtasks-toggle-btn"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            <div className="subtasks-label-group">
              <ListTodo size={14} />
              <span>
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </span>
            </div>
            <div className="subtasks-progress-mini">
              <div className="subtasks-progress-bar-bg">
                <div
                  className="subtasks-progress-bar-fill"
                  style={{ width: `${subtaskProgress}%` }}
                ></div>
              </div>
              {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {showSubtasks && (
            <div className="subtasks-checklist">
              {task.subtasks.map((st) => (
                <label key={st._id} className="subtask-checkbox-item">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onToggleSubtask(task._id, st._id)}
                  />
                  <span className={`subtask-title ${st.completed ? 'subtask-done' : ''}`}>
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="task-card-footer">
        {/* Due date info */}
        {dueInfo ? (
          <div className={`task-due-badge ${dueInfo.statusClass}`}>
            <Calendar size={13} />
            <span>{dueInfo.label}</span>
          </div>
        ) : (
          <div className="task-due-badge due-none">
            <Clock size={13} />
            <span>No deadline</span>
          </div>
        )}

        {/* Status Selector Dropdown */}
        <div className="task-status-pill-selector">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className={`status-select-pill status-pill-${task.status}`}
            aria-label="Change task status"
          >
            <option value="pending">⏳ Pending</option>
            <option value="in_progress">⚡ In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
