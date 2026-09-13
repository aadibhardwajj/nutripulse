const express = require('express');
const router = express.Router();
const weightController = require('../controllers/weightController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { logWeightSchema, logMeasurementSchema } = require('../validators/logValidators');

router.use(protect);

router.get('/', weightController.getWeightLogs);
router.post('/', validate(logWeightSchema), weightController.logWeight);
router.get('/measurements', weightController.getMeasurements);
router.post('/measurements', validate(logMeasurementSchema), weightController.logMeasurement);

module.exports = router;
