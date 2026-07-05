const { User, Worker, Booking, Review, Dispute, AdminAction, sequelize } = require('../models');
const { Op } = require('sequelize');

const adminController = {
  dashboard: async (req, res, next) => {
    try {
      const stats = {
        totalUsers: await User.count(),
        totalWorkers: await Worker.count(),
        totalBookings: await Booking.count(),
        pendingBookings: await Booking.count({ where: { status: 'pending' } }),
        completedBookings: await Booking.count({ where: { status: 'completed' } }),
        totalReviews: await Review.count(),
        openDisputes: await Dispute.count({ where: { status: 'open' } }),
        totalDisputes: await Dispute.count(),
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  },

  listUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['passwordHash'] },
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: { users, count: users.length },
      });
    } catch (error) {
      next(error);
    }
  },

  banUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      if (user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot ban admin users.',
        });
      }

      user.isActive = false;
      await user.save();

      await AdminAction.create({
        adminId: req.user.id,
        actionType: 'ban_user',
        targetType: 'user',
        targetId: user.id,
        details: { reason: 'Banned by admin' },
      });

      res.json({
        success: true,
        message: 'User banned successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  listDisputes: async (req, res, next) => {
    try {
      const { status } = req.query;
      const where = status ? { status } : {};

      const disputes = await Dispute.findAll({
        where,
        include: [
          { model: Booking, include: [{ model: User, as: 'client' }, { model: Worker, include: [{ model: User }] }] },
          { model: User, as: 'filedBy', attributes: ['id', 'firstName', 'lastName', 'email'] },
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: { disputes, count: disputes.length },
      });
    } catch (error) {
      next(error);
    }
  },

  resolveDispute: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { resolution, adminNotes } = req.body;

      const dispute = await Dispute.findByPk(id);
      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found.',
        });
      }

      if (dispute.status === 'resolved') {
        return res.status(400).json({
          success: false,
          message: 'Dispute already resolved.',
        });
      }

      dispute.status = 'resolved';
      dispute.resolution = resolution;
      dispute.adminNotes = adminNotes;
      dispute.resolvedAt = new Date();
      await dispute.save();

      await AdminAction.create({
        adminId: req.user.id,
        actionType: 'resolve_dispute',
        targetType: 'dispute',
        targetId: dispute.id,
        details: { resolution, adminNotes },
      });

      res.json({
        success: true,
        message: 'Dispute resolved successfully.',
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  },

  rejectDispute: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const dispute = await Dispute.findByPk(id);
      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: 'Dispute not found.',
        });
      }

      if (dispute.status === 'resolved' || dispute.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Dispute already closed.',
        });
      }

      dispute.status = 'rejected';
      dispute.adminNotes = adminNotes;
      await dispute.save();

      await AdminAction.create({
        adminId: req.user.id,
        actionType: 'reject_dispute',
        targetType: 'dispute',
        targetId: dispute.id,
        details: { adminNotes },
      });

      res.json({
        success: true,
        message: 'Dispute rejected.',
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  },

  listActions: async (req, res, next) => {
    try {
      const actions = await AdminAction.findAll({
        where: { adminId: req.user.id },
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: { actions, count: actions.length },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
