import React from 'react';
import { ClipboardList, Plus, Sparkles, RotateCcw } from 'lucide-react';

export default function EmptyState({ isFiltered, onResetFilters, onOpenCreate, onSeedSample }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrapper">
        <div className="empty-state-icon-glow"></div>
        <ClipboardList className="empty-state-icon" size={48} />
      </div>

      <h3 className="empty-state-title">
        {isFiltered ? 'No matching tasks found' : 'Your workspace is clear & ready!'}
      </h3>

      <p className="empty-state-subtitle">
        {isFiltered
          ? 'Try adjusting your search query, status tabs, priority filter, or categories.'
          : 'Organize your work, boost productivity, and keep your projects on track effortlessly.'}
      </p>

      <div className="empty-state-actions">
        {isFiltered ? (
          <button className="btn btn-secondary" onClick={onResetFilters}>
            <RotateCcw size={16} />
            <span>Reset All Filters</span>
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={onOpenCreate}>
              <Plus size={16} />
              <span>Create First Task</span>
            </button>
            <button className="btn btn-glass" onClick={() => onSeedSample(true)}>
              <Sparkles size={16} />
              <span>Load Sample Tasks</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
