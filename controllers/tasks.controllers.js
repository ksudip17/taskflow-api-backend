import Task from '../models/tasks.model.js';
import Team from '../models/team.model.js';

// Create task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, team, assignedTo } = req.body;

    // Check if team exists and user is a member
    const teamDoc = await Team.findById(team);
    
    if (!teamDoc) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isMember = teamDoc.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a team member to create tasks'
      });
    }

    // If assignedTo is provided, check if they're a team member
    if (assignedTo) {
      const isAssigneeMember = teamDoc.members.some(
        member => member.user.toString() === assignedTo
      );

      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to non-team member'
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      team,
      assignedTo,
      createdBy: req.user._id
    });

    await task.populate([
      { path: 'team', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a team
export const getTeamTasks = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    // Check if user is team member
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isMember = team.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Get tasks with optional filters
    const { status, priority, assignedTo } = req.query;
    
    const filter = { team: teamId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// Get my tasks (assigned to me)
export const getMyTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('team', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is team member
    const team = await Team.findById(task.team._id);
    const isMember = team.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is team member
    const team = await Team.findById(task.team);
    const userMember = team.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!userMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task'
      });
    }

    // Members can only update status of their own tasks
    if (userMember.role === 'member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own tasks'
        });
      }
      // Members can only update status
      if (title || description || priority || dueDate || assignedTo) {
        return res.status(403).json({
          success: false,
          message: 'You can only update task status'
        });
      }
    }

    // If assignedTo is being changed, verify they're a team member
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      const isAssigneeMember = team.members.some(
        member => member.user.toString() === assignedTo
      );

      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to non-team member'
        });
      }
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    await task.populate([
      { path: 'team', select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is team admin/manager or task creator
    const team = await Team.findById(task.team);
    const userMember = team.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!userMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task'
      });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'manager'].includes(userMember.role);

    if (!isCreator && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator or team admin/manager can delete tasks'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};