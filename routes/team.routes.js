import { Router } from 'express';
import {
  createTeam,
  getMyTeams,
  getTeam,
  updateTeam,
  addMember,
  removeMember,
  deleteTeam
} from '../controllers/team.constroller.js';
import { protect } from '../middleware/auth.middleware.js';

const teamRouter = Router();


teamRouter.use(protect);

teamRouter.post('/', createTeam);
teamRouter.get('/', getMyTeams);              
teamRouter.get('/:id', getTeam);               
teamRouter.put('/:id', updateTeam);
teamRouter.post('/:id/members', addMember);
teamRouter.delete('/:id/members/:userId', removeMember);
teamRouter.delete('/:id', deleteTeam);

export default teamRouter;