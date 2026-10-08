import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Tag,
  ListTodo,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];
const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#10B981' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'high', label: 'High', color: '#F97316' },
  { id: 'urgent', label: 'Urgent', color: '#EF4444' },
];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultStatus = 'pending',
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'General',
    dueDate: '',
    subtasks: [],
    tags: [],
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Populate or reset form on open
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'pending',
        priority: initialData.priority || 'medium',
        category: initialData.category || 'General',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        subtasks: initialData.subtasks
          ? initialData.subtasks.map((st) => ({
              _id: st._id,
              title: st.title,
              completed: st.completed || false,
            }))
          : [],
        tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus || 'pending',
        priority: 'medium',
        category: 'Work',
        dueDate: '',
        subtasks: [],
        tags: [],
      });
    }
    setNewSubtaskTitle('');
    setTagInput('');
    setErrorMessage('');
  }, [initialData, defaultStatus, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && errorMessage) {
      setErrorMessage('');
    }
  };

  // Subtask management
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { title: newSubtaskTitle.trim(), completed: false },
      ],
    }));
    setNewSubtaskTitle('');
  };

  const handleToggleSubtaskLocal = (index) => {
    setFormData((prev) => {
      const updated = [...prev.subtasks];
      updated[index] = {
        ...updated[index],
        completed: !updated[index].completed,
      };
      return { ...prev, subtasks: updated };
    });
  };

  const handleRemoveSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  // Tag management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const formatted = tagInput.trim().replace(/^#/, '');
      if (formatted && !formData.tags.includes(formatted)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, formatted] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">
              {initialData ? 'Edit Task' : 'Create New Task'}
            </h2>
            <span className="modal-subtitle">
              {initialData
                ? 'Update task details, checklist, and deadlines'
                : 'Add a new item to your project board'}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMessage && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Task Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span className="text-danger">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input form-input-title"
              placeholder="e.g. Design Landing Page Wireframes"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={150}
              autoFocus
              required
            />
          </div>

          {/* Task Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description / Notes
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Add comprehensive details, links, or context..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* 2-Column Grid: Priority & Status */}
          <div className="form-grid-2">
            {/* Priority Selector */}
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div className="priority-button-group">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`priority-select-btn priority-${p.id} ${
                      formData.priority === p.id ? 'active' : ''
                    }`}
                    onClick={() => handleChange('priority', p.id)}
                  >
                    <span
                      className="priority-indicator-dot"
                      style={{ backgroundColor: p.color }}
                    ></span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selector */}
            <div className="form-group">
              <label className="form-label">Task Status</label>
              <div className="status-button-group">
                <button
                  type="button"
                  className={`status-btn-pill ${formData.status === 'pending' ? 'active pending' : ''}`}
                  onClick={() => handleChange('status', 'pending')}
                >
                  <Clock size={13} />
                  <span>To Do</span>
                </button>
                <button
                  type="button"
                  className={`status-btn-pill ${formData.status === 'in_progress' ? 'active progress' : ''}`}
                  onClick={() => handleChange('status', 'in_progress')}
                >
                  <Sparkles size={13} />
                  <span>In Progress</span>
                </button>
                <button
                  type="button"
                  className={`status-btn-pill ${formData.status === 'completed' ? 'active completed' : ''}`}
                  onClick={() => handleChange('status', 'completed')}
                >
                  <CheckCircle2 size={13} />
                  <span>Completed</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Category & Due Date */}
          <div className="form-grid-2">
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">
                Category
              </label>
              <select
                id="task-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                Due Date
              </label>
              <div className="date-input-wrapper">
                <Calendar size={16} className="date-icon" />
                <input
                  id="task-due-date"
                  type="date"
                  className="form-input form-input-date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Subtasks Checklist Builder */}
          <div className="form-group">
            <div className="subtasks-form-header">
              <label className="form-label mb-0">
                <ListTodo size={15} /> Subtasks & Action Items ({formData.subtasks.length})
              </label>
            </div>

            {/* Add Subtask Input */}
            <div className="subtask-add-row">
              <input
                type="text"
                className="form-input form-input-sm"
                placeholder="Add a step (e.g. Test on Safari)..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSubtask}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            {/* List of subtasks */}
            {formData.subtasks.length > 0 && (
              <div className="modal-subtasks-list">
                {formData.subtasks.map((st, index) => (
                  <div key={index} className="modal-subtask-item">
                    <label className="modal-subtask-label">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtaskLocal(index)}
                      />
                      <span className={st.completed ? 'subtask-done' : ''}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn-subtask-delete"
                      onClick={() => handleRemoveSubtask(index)}
                      title="Delete subtask"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <Tag size={14} /> Tags
            </label>
            <div className="tags-input-container">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="modal-tag-chip">
                  #{tag}
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="tags-sub-input"
                placeholder="Type tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-submit-task"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{initialData ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
