const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createFoodSchema } = require('../validators/foodValidators');

// Public or optionally authenticated food search
router.get('/', (req, res, next) => {
  // Try protect softly if header present
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, foodController.searchFoods);

router.get('/user/favorites', protect, foodController.getFavorites);
router.get('/user/recent', protect, foodController.getRecentFoods);
router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, foodController.getFoodById);

router.post('/', protect, validate(createFoodSchema), foodController.createCustomFood);
router.post('/:id/favorite', protect, foodController.toggleFavorite);

module.exports = router;
