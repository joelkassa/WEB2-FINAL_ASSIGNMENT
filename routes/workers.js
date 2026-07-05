const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate, workerProfileSchema, workerUpdateSchema, skillSchema } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/', workerController.listWorkers);
router.get('/:id', workerController.getWorkerById);

// Protected worker-only routes
router.post('/', authenticate, authorize(['worker']), validate(workerProfileSchema), workerController.createProfile);
router.get('/me/profile', authenticate, authorize(['worker']), workerController.getMyProfile);
router.put('/me/profile', authenticate, authorize(['worker']), validate(workerUpdateSchema), workerController.updateProfile);
router.post('/me/skills', authenticate, authorize(['worker']), validate(skillSchema), workerController.addSkill);
router.delete('/me/skills/:skillId', authenticate, authorize(['worker']), workerController.removeSkill);
router.post('/me/portfolio', authenticate, authorize(['worker']), upload.single('image'), workerController.uploadPortfolio);
router.delete('/me/portfolio/:itemId', authenticate, authorize(['worker']), workerController.removePortfolio);

module.exports = router;