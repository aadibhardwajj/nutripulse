const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  onboardingSchema,
} = require('../validators/authValidators');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/onboarding', protect, validate(onboardingSchema), authController.completeOnboarding);
router.post('/change-password', protect, validate(changePasswordSchema), authController.changePassword);
router.delete('/account', protect, authController.deleteAccount);

module.exports = router;
