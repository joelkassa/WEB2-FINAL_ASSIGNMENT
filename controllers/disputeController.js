const { Dispute, Booking, Worker } = require('../models');

const disputeController = {
  create: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { bookingId, reason, description } = req.body;

      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: Worker }],
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found.',
        });
      }

      const isParticipant = 
        booking.clientId === userId || 
        (booking.Worker && booking.Worker.userId === userId);

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'Only booking participants can file disputes.',
        });
      }

      if (!['accepted', 'completed'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Can only dispute accepted or completed bookings.',
        });
      }

      const existingDispute = await Dispute.findOne({ where: { bookingId } });
      if (existingDispute) {
        return res.status(409).json({
          success: false,
          message: 'Dispute already exists for this booking.',
        });
      }

      booking.status = 'disputed';
      await booking.save();

      const dispute = await Dispute.create({
        bookingId,
        filedBy: userId,
        reason,
        description,
        status: 'open',
      });

      res.status(201).json({
        success: true,
        message: 'Dispute filed successfully.',
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  },

  getMyDisputes: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const disputes = await Dispute.findAll({
        where: { filedBy: userId },
        include: [{ model: Booking }],
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
};

module.exports = disputeController;
