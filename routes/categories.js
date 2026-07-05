const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, categorySchema } = require('../middleware/validation');

router.get('/', categoryController.listAll);
router.post('/', authenticate, authorize(['admin']), validate(categorySchema), categoryController.create);

module.exports = router;
