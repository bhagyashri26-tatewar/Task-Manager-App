import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  TrendingUp,
  Flame,
} from 'lucide-react';

export default function DashboardStats({ stats, activeStatus, onStatusFilter }) {
  const {
    total = 0,
    completed = 0,
    inProgress = 0,
    pending = 0,
    overdue = 0,
    urgent = 0,
    completionRate = 0,
  } = stats || {};

  return (
    <section className="stats-grid-container" aria-label="Task Statistics">
      {/* 1. Total Tasks Card */}
      <div
        className={`stat-card stat-total ${activeStatus === 'all' ? 'active-stat' : ''}`}
        onClick={() => onStatusFilter('all')}
        role="button"
        tabIndex={0}
        title="View All Tasks"
      >
        <div className="stat-card-header">
          <span className="stat-label">Total Tasks</span>
          <div className="stat-icon-badge total-badge">
            <Layers size={18} />
          </div>
        </div>
        <div className="stat-value-group">
          <span className="stat-number">{total}</span>
          <span className="stat-meta">Active workspace</span>
        </div>
        <div className="stat-footer-bar">
          <div className="stat-progress-track">
            <div
              className="stat-progress-fill total-fill"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. In Progress Card */}
      <div
        className={`stat-card stat-progress ${activeStatus === 'in_progress' ? 'active-stat' : ''}`}
        onClick={() => onStatusFilter('in_progress')}
        role="button"
        tabIndex={0}
        title="Filter by In Progress"
      >
        <div className="stat-card-header">
          <span className="stat-label">In Progress</span>
          <div className="stat-icon-badge progress-badge">
            <Clock size={18} />
          </div>
        </div>
        <div className="stat-value-group">
          <span className="stat-number">{inProgress}</span>
          <span className="stat-meta">Currently ongoing</span>
        </div>
        <div className="stat-footer-bar">
          <div className="stat-progress-track">
            <div
              className="stat-progress-fill progress-fill"
              style={{ width: `${total ? (inProgress / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Completed Tasks Card */}
      <div
        className={`stat-card stat-completed ${activeStatus === 'completed' ? 'active-stat' : ''}`}
        onClick={() => onStatusFilter('completed')}
        role="button"
        tabIndex={0}
        title="Filter by Completed"
      >
        <div className="stat-card-header">
          <span className="stat-label">Completed</span>
          <div className="stat-icon-badge completed-badge">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="stat-value-group">
          <span className="stat-number">{completed}</span>
          <span className="stat-meta badge-pill-rate">
            <TrendingUp size={12} /> {completionRate}% Done
          </span>
        </div>
        <div className="stat-footer-bar">
          <div className="stat-progress-track">
            <div
              className="stat-progress-fill completed-fill"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. Urgent & Overdue Card */}
      <div
        className="stat-card stat-urgent"
        role="button"
        tabIndex={0}
      >
        <div className="stat-card-header">
          <span className="stat-label">Urgent & Overdue</span>
          <div className="stat-icon-badge urgent-badge">
            <Flame size={18} className={urgent > 0 || overdue > 0 ? 'pulse-icon' : ''} />
          </div>
        </div>
        <div className="stat-value-group">
          <span className="stat-number">{urgent + overdue}</span>
          <div className="stat-meta-chips">
            {overdue > 0 && <span className="chip-overdue">{overdue} Overdue</span>}
            {urgent > 0 && <span className="chip-urgent">{urgent} Urgent</span>}
            {overdue === 0 && urgent === 0 && <span className="chip-good">All Clear ✨</span>}
          </div>
        </div>
        <div className="stat-footer-bar">
          <div className="stat-progress-track">
            <div
              className="stat-progress-fill urgent-fill"
              style={{ width: `${total ? ((urgent + overdue) / total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
