import { Router } from 'express';
import {
  createTask,
  getTeamTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const taskRouter = Router();

// All routes require authentication
taskRouter.use(protect);

taskRouter.post('/', createTask);
taskRouter.get('/my-tasks', getMyTasks);
taskRouter.get('/team/:teamId', getTeamTasks);
taskRouter.get('/:id', getTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);

export default taskRouter;