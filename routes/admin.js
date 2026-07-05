const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/dashboard', authenticate, authorize(['admin']), adminController.dashboard);
router.get('/users', authenticate, authorize(['admin']), adminController.listUsers);
router.put('/users/:id/ban', authenticate, authorize(['admin']), adminController.banUser);
router.get('/disputes', authenticate, authorize(['admin']), adminController.listDisputes);
router.put('/disputes/:id/resolve', authenticate, authorize(['admin']), adminController.resolveDispute);
router.put('/disputes/:id/reject', authenticate, authorize(['admin']), adminController.rejectDispute);
router.get('/actions', authenticate, authorize(['admin']), adminController.listActions);

module.exports = router;