const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  patchTaskStatus,
  toggleSubtask,
  deleteTask,
  seedTasks,
} = require('../controllers/taskController');

// Routes
router.route('/stats').get(getTaskStats);
router.route('/seed').post(seedTasks);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/status')
  .patch(patchTaskStatus);

router.route('/:id/subtasks/:subtaskId')
  .patch(toggleSubtask);

module.exports = router;
