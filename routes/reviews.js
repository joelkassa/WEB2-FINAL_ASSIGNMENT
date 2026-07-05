const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, reviewSchema } = require('../middleware/validation');

router.post('/', authenticate, authorize(['client']), validate(reviewSchema), reviewController.create);
router.get('/worker/:workerId', reviewController.listByWorker);
router.put('/:id', authenticate, authorize(['client']), reviewController.update);
router.delete('/:id', authenticate, authorize(['admin']), reviewController.hide);

module.exports = router;
