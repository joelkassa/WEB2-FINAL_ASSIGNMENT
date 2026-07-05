const { Review, Booking, Worker, User } = require('../models');

const reviewController = {
  create: async (req, res, next) => {
    try {
      const clientId = req.user.id;
      const { bookingId, rating, comment } = req.body;

      if (req.user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'Only clients can leave reviews.',
        });
      }

      const booking = await Booking.findByPk(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found.',
        });
      }

      if (booking.clientId !== clientId) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own bookings.',
        });
      }

      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only review completed bookings.',
        });
      }

      const existingReview = await Review.findOne({ where: { bookingId } });
      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'Review already exists for this booking.',
        });
      }

      const review = await Review.create({
        bookingId,
        clientId,
        workerId: booking.workerId,
        rating,
        comment,
      });

      await updateWorkerRating(booking.workerId);

      const reviewWithDetails = await Review.findByPk(review.id, {
        include: [
          { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName'] },
          { model: Booking, attributes: ['id', 'requestedDate', 'status'] },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        data: { review: reviewWithDetails },
      });
    } catch (error) {
      next(error);
    }
  },

  listByWorker: async (req, res, next) => {
    try {
      const { workerId } = req.params;

      const reviews = await Review.findAll({
        where: { workerId, isVisible: true },
        include: [
          { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName'] },
          { model: Booking, attributes: ['id', 'requestedDate'] },
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: { reviews, count: reviews.length },
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const clientId = req.user.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found.',
        });
      }

      if (review.clientId !== clientId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own reviews.',
        });
      }

      const hoursSinceCreated = (new Date() - new Date(review.createdAt)) / (1000 * 60 * 60);
      if (hoursSinceCreated > 48) {
        return res.status(400).json({
          success: false,
          message: 'Reviews can only be edited within 48 hours.',
        });
      }

      review.rating = rating || review.rating;
      review.comment = comment || review.comment;
      await review.save();

      await updateWorkerRating(review.workerId);

      res.json({
        success: true,
        message: 'Review updated successfully.',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },

  hide: async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can hide reviews.',
        });
      }

      const { id } = req.params;

      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found.',
        });
      }

      review.isVisible = false;
      await review.save();

      res.json({
        success: true,
        message: 'Review hidden by moderator.',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  },
};

async function updateWorkerRating(workerId) {
  const reviews = await Review.findAll({
    where: { workerId, isVisible: true },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  await Worker.update(
    { averageRating: parseFloat(averageRating.toFixed(1)), totalReviews },
    { where: { id: workerId } }
  );
}

module.exports = reviewController;