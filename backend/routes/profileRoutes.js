const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.patch('/goals', profileController.updateGoals);
router.patch('/notifications', profileController.updateNotificationPreferences);

module.exports = router;
