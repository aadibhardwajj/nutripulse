const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createMealSchema } = require('../validators/logValidators');

router.use(protect);

router.get('/', mealController.getMeals);
router.post('/', validate(createMealSchema), mealController.createMeal);
router.patch('/:id', mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);
router.post('/:id/log', mealController.addMealToDiary);

module.exports = router;
