const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { addDiaryItemSchema, updateDiaryItemSchema } = require('../validators/diaryValidators');

router.use(protect);

router.get('/', diaryController.getDiaryByDate);
router.post('/items', validate(addDiaryItemSchema), diaryController.addDiaryItem);
router.patch('/items/:id', validate(updateDiaryItemSchema), diaryController.updateDiaryItem);
router.delete('/items/:id', diaryController.deleteDiaryItem);
router.post('/items/:id/duplicate', diaryController.duplicateDiaryItem);

module.exports = router;
