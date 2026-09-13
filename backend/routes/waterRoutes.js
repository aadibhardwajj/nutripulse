const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { logWaterSchema } = require('../validators/logValidators');

router.use(protect);

router.get('/', waterController.getWaterByDate);
router.post('/', validate(logWaterSchema), waterController.addWater);
router.delete('/:id', waterController.deleteWaterLog);

module.exports = router;
