import Team from '../models/team.model.js';
import User from '../models/users.model.js';

// Create team
export const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      creator: req.user._id
    });

    // Populate creator info
    await team.populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// Get all teams for logged-in user
export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    next(error);
  }
};

// Get single team
export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email role');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is a member
    const isMember = team.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// Update team
export const updateTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is admin or creator
    const userMember = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMember || (userMember.role !== 'admin' && team.creator.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can update team details'
      });
    }

    team.name = name || team.name;
    team.description = description || team.description;
    await team.save();

    await team.populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// Add member to team
export const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if requester is admin
    const requesterMember = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can add members'
      });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(
      (member) => member.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Add member
    team.members.push({
      user: userId,
      role: role || 'member'
    });

    await team.save();
    await team.populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from team
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if requester is admin
    const requesterMember = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only team admins can remove members'
      });
    }

    // Can't remove creator
    if (team.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team creator'
      });
    }

    // Remove member
    team.members = team.members.filter(
      (member) => member.user.toString() !== userId
    );

    await team.save();
    await team.populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
};

// Delete team
export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Only creator can delete team
    if (team.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only team creator can delete the team'
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};