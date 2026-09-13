const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { logExerciseSchema } = require('../validators/logValidators');

router.get('/catalog', exerciseController.getExerciseCatalog);

router.use(protect);

router.get('/', exerciseController.getExerciseLogs);
router.post('/log', validate(logExerciseSchema), exerciseController.logExercise);
router.delete('/log/:id', exerciseController.deleteExerciseLog);

module.exports = router;
