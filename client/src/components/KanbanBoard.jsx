import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, Clock, CheckCircle2, AlertCircle, CircleDot } from 'lucide-react';

const COLUMNS = [
  {
    id: 'pending',
    title: 'To Do',
    subtitle: 'Tasks ready to start',
    icon: CircleDot,
    colorClass: 'col-pending',
    accentColor: '#F59E0B',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Active development',
    icon: Clock,
    colorClass: 'col-progress',
    accentColor: '#6366F1',
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'Finished & verified',
    icon: CheckCircle2,
    colorClass: 'col-completed',
    accentColor: '#10B981',
  },
];

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onToggleSubtask,
  onEdit,
  onDelete,
  onOpenCreateWithStatus,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, columnId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="kanban-board-container">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const IconComponent = column.icon;
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`kanban-column ${column.colorClass} ${isOver ? 'column-drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="kanban-column-header">
              <div className="column-title-group">
                <div className="column-icon-dot">
                  <IconComponent size={16} />
                </div>
                <div>
                  <h3 className="column-title">{column.title}</h3>
                  <span className="column-subtitle">{column.subtitle}</span>
                </div>
              </div>

              <div className="column-header-actions">
                <span className="column-counter">{columnTasks.length}</span>
                <button
                  className="column-add-btn"
                  onClick={() => onOpenCreateWithStatus(column.id)}
                  title={`Add task in ${column.title}`}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Column Task List */}
            <div className="kanban-tasks-scroll">
              {columnTasks.length === 0 ? (
                <div
                  className="kanban-empty-dropzone"
                  onClick={() => onOpenCreateWithStatus(column.id)}
                >
                  <Plus size={18} />
                  <span>No tasks here. Click or drop to add</span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="draggable-task-wrapper"
                  >
                    <TaskCard
                      task={task}
                      onStatusChange={onStatusChange}
                      onToggleSubtask={onToggleSubtask}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
