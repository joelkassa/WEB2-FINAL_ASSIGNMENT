const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, bookingCreateSchema } = require('../middleware/validation');

router.post('/', authenticate, authorize(['client']), validate(bookingCreateSchema), bookingController.create);
router.get('/my', authenticate, bookingController.listMyBookings);
router.get('/:id', authenticate, bookingController.getById);
router.put('/:id/accept', authenticate, authorize(['worker']), bookingController.accept);
router.put('/:id/decline', authenticate, authorize(['worker']), bookingController.decline);
router.put('/:id/complete', authenticate, authorize(['worker']), bookingController.complete);
router.put('/:id/cancel', authenticate, bookingController.cancel);

module.exports = router;
