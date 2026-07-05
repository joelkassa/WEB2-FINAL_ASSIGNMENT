const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const authenticate = require('../middleware/authenticate');
const { validate, disputeSchema } = require('../middleware/validation');

router.post('/', authenticate, validate(disputeSchema), disputeController.create);
router.get('/my', authenticate, disputeController.getMyDisputes);

module.exports = router;
