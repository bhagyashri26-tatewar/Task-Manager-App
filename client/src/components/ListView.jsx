import React from 'react';
import TaskCard from './TaskCard';

export default function ListView({
  tasks,
  onStatusChange,
  onToggleSubtask,
  onEdit,
  onDelete,
}) {
  return (
    <div className="list-view-container">
      <div className="list-view-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
            onToggleSubtask={onToggleSubtask}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
