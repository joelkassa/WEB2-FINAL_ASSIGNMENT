const { Booking, Worker, User } = require('../models');
const { Op } = require('sequelize');

const bookingController = {
  create: async (req, res, next) => {
    try {
      const clientId = req.user.id;
      const { workerId, requestedDate, requestedTime, notes } = req.body;

      if (req.user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'Only clients can create bookings.',
        });
      }

      const worker = await Worker.findByPk(workerId, {
        include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found.',
        });
      }

      if (worker.userId === clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book yourself.',
        });
      }

      const booking = await Booking.create({
        clientId,
        workerId,
        requestedDate,
        requestedTime,
        notes,
        status: 'pending',
      });

      const bookingWithDetails = await Booking.findByPk(booking.id, {
        include: [
          { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Worker, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }] },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Booking request sent successfully.',
        data: { booking: bookingWithDetails },
      });
    } catch (error) {
      next(error);
    }
  },

  listMyBookings: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let where = {};
      if (userRole === 'client') {
        where.clientId = userId;
      } else if (userRole === 'worker') {
        const worker = await Worker.findOne({ where: { userId } });
        if (!worker) {
          return res.status(404).json({
            success: false,
            message: 'Worker profile not found.',
          });
        }
        where.workerId = worker.id;
      }

      const bookings = await Booking.findAll({
        where,
        include: [
          { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Worker, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }] },
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: { bookings, count: bookings.length },
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const booking = await Booking.findByPk(id, {
        include: [
          { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Worker, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }] },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found.',
        });
      }

      const isParticipant = 
        booking.clientId === userId || 
        (userRole === 'worker' && booking.Worker && booking.Worker.userId === userId);

      if (!isParticipant && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not a participant in this booking.',
        });
      }

      res.json({
        success: true,
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  },

  accept: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const worker = await Worker.findOne({ where: { userId } });
      if (!worker) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned worker can accept this booking.',
        });
      }

      const booking = await Booking.findOne({
        where: { id, workerId: worker.id, status: 'pending' },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or not in pending status.',
        });
      }

      booking.status = 'accepted';
      await booking.save();

      res.json({
        success: true,
        message: 'Booking accepted successfully.',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  },

  decline: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { cancellationReason } = req.body;

      const worker = await Worker.findOne({ where: { userId } });
      if (!worker) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned worker can decline this booking.',
        });
      }

      const booking = await Booking.findOne({
        where: { id, workerId: worker.id, status: 'pending' },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or not in pending status.',
        });
      }

      booking.status = 'declined';
      booking.cancellationReason = cancellationReason || 'Declined by worker';
      booking.cancelledBy = userId;
      await booking.save();

      res.json({
        success: true,
        message: 'Booking declined successfully.',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  },

  complete: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const worker = await Worker.findOne({ where: { userId } });
      if (!worker) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned worker can complete this booking.',
        });
      }

      const booking = await Booking.findOne({
        where: { id, workerId: worker.id, status: 'accepted' },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or not in accepted status.',
        });
      }

      booking.status = 'completed';
      booking.completedAt = new Date();
      await booking.save();

      res.json({
        success: true,
        message: 'Booking marked as completed.',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  },

  cancel: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { cancellationReason } = req.body;

      const booking = await Booking.findByPk(id, {
        include: [{ model: Worker }],
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found.',
        });
      }

      const isClient = booking.clientId === userId;
      const isWorker = booking.Worker && booking.Worker.userId === userId;

      if (!isClient && !isWorker) {
        return res.status(403).json({
          success: false,
          message: 'Only participants can cancel this booking.',
        });
      }

      if (!['pending', 'accepted'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel booking in current status.',
        });
      }

      booking.status = 'cancelled';
      booking.cancellationReason = cancellationReason || 'Cancelled by participant';
      booking.cancelledBy = userId;
      await booking.save();

      res.json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookingController;
