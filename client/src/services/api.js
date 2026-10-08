const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/tasks';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Fetch tasks with query filters
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, value);
      }
    });

    const url = `${API_BASE_URL}?${query.toString()}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Get task statistics
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse(res);
  },

  // Get single task by ID
  async getTask(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse(res);
  },

  // Create new task
  async createTask(taskData) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  // Update full task
  async updateTask(id, taskData) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  // Quick patch status
  async patchStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Toggle subtask completion
  async toggleSubtask(id, subtaskId) {
    const res = await fetch(`${API_BASE_URL}/${id}/subtasks/${subtaskId}`, {
      method: 'PATCH',
    });
    return handleResponse(res);
  },

  // Delete task
  async deleteTask(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Seed sample tasks
  async seedTasks(force = false) {
    const res = await fetch(`${API_BASE_URL}/seed?force=${force}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
