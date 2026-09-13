const Diary = require('../models/Diary');
const Food = require('../models/Food');
const UserGoal = require('../models/UserGoal');
const calculationService = require('../services/calculationService');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/diary?date=YYYY-MM-DD
const getDiaryByDate = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const date = formatDateString(req.query.date || new Date());

    let diary = await Diary.findOne({ userId, date });
    if (!diary) {
      diary = await Diary.create({ userId, date, items: [] });
    }

    const goal = await UserGoal.findOne({ userId });

    const mealSections = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    diary.items.forEach((item) => {
      if (mealSections[item.mealType]) {
        mealSections[item.mealType].push(item);
      }
    });

    const { totalsByMeal, dailyTotal } = calculationService.calculateDiaryTotals(mealSections);

    return successResponse(res, {
      diaryId: diary._id,
      date: diary.date,
      note: diary.note,
      meals: mealSections,
      totalsByMeal,
      dailyTotal,
      goalCalories: goal?.dailyCalories || 2000,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/diary/items
const addDiaryItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      date,
      mealType,
      foodId,
      foodName,
      brand,
      servingSize,
      servingUnit,
      servingWeightGrams,
      quantity,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    } = req.body;

    const normalizedDate = formatDateString(date);

    let diary = await Diary.findOne({ userId, date: normalizedDate });
    if (!diary) {
      diary = new Diary({ userId, date: normalizedDate, items: [] });
    }

    const newItem = {
      foodId,
      foodName,
      brand: brand || '',
      mealType,
      servingSize: servingSize || 1,
      servingUnit: servingUnit || 'serving',
      servingWeightGrams: servingWeightGrams || 100,
      quantity: quantity || 1,
      calories: Math.round(calories || 0),
      protein: parseFloat((protein || 0).toFixed(1)),
      carbs: parseFloat((carbs || 0).toFixed(1)),
      fat: parseFloat((fat || 0).toFixed(1)),
      fiber: parseFloat((fiber || 0).toFixed(1)),
      sugar: parseFloat((sugar || 0).toFixed(1)),
      sodium: Math.round(sodium || 0),
    };

    diary.items.push(newItem);
    await diary.save();

    const createdItem = diary.items[diary.items.length - 1];
    return successResponse(res, { item: createdItem }, 'Food logged to diary successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/diary/items/:id
const updateDiaryItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;
    const { date, mealType, quantity, servingSize, servingUnit, servingWeightGrams, calories, protein, carbs, fat } = req.body;

    const query = { userId, 'items._id': itemId };
    if (date) {
      query.date = formatDateString(date);
    }

    let diary = await Diary.findOne(query);
    if (!diary) {
      // Fallback without date in case date differed slightly
      diary = await Diary.findOne({ userId, 'items._id': itemId });
    }

    if (!diary) {
      return errorResponse(res, 'Diary item not found or unauthorized', 404, 'ITEM_NOT_FOUND');
    }

    const item = diary.items.id(itemId);
    if (!item) {
      return errorResponse(res, 'Diary item not found', 404, 'ITEM_NOT_FOUND');
    }

    if (mealType !== undefined) item.mealType = mealType;
    if (quantity !== undefined) item.quantity = quantity;
    if (servingSize !== undefined) item.servingSize = servingSize;
    if (servingUnit !== undefined) item.servingUnit = servingUnit;
    if (servingWeightGrams !== undefined) item.servingWeightGrams = servingWeightGrams;
    if (calories !== undefined) item.calories = Math.round(calories);
    if (protein !== undefined) item.protein = parseFloat(protein.toFixed(1));
    if (carbs !== undefined) item.carbs = parseFloat(carbs.toFixed(1));
    if (fat !== undefined) item.fat = parseFloat(fat.toFixed(1));

    await diary.save();

    return successResponse(res, { item }, 'Diary item updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/diary/items/:id
const deleteDiaryItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;
    const date = req.query.date || req.body.date;

    const query = { userId, 'items._id': itemId };
    if (date) {
      query.date = formatDateString(date);
    }

    let diary = await Diary.findOne(query);
    if (!diary) {
      // Fallback search by item ID and user ID
      diary = await Diary.findOne({ userId, 'items._id': itemId });
    }

    if (!diary) {
      return errorResponse(res, 'Diary item not found or unauthorized', 404, 'ITEM_NOT_FOUND');
    }

    const item = diary.items.id(itemId);
    if (!item) {
      return errorResponse(res, 'Diary item not found', 404, 'ITEM_NOT_FOUND');
    }

    diary.items.pull(itemId);
    await diary.save();

    return successResponse(res, {}, 'Diary item removed successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/diary/items/:id/duplicate
const duplicateDiaryItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;
    const sourceDate = formatDateString(req.body.sourceDate || new Date());
    const targetDate = formatDateString(req.body.targetDate || sourceDate);
    const targetMeal = req.body.targetMeal;

    const sourceDiary = await Diary.findOne({ userId, date: sourceDate });
    if (!sourceDiary) {
      return errorResponse(res, 'Source diary record not found', 404, 'DIARY_NOT_FOUND');
    }

    const item = sourceDiary.items.id(itemId);
    if (!item) {
      return errorResponse(res, 'Item to duplicate not found', 404, 'ITEM_NOT_FOUND');
    }

    let targetDiary = await Diary.findOne({ userId, date: targetDate });
    if (!targetDiary) {
      targetDiary = new Diary({ userId, date: targetDate, items: [] });
    }

    const duplicatedItem = {
      foodId: item.foodId,
      foodName: item.foodName,
      brand: item.brand,
      mealType: targetMeal || item.mealType,
      servingSize: item.servingSize,
      servingUnit: item.servingUnit,
      servingWeightGrams: item.servingWeightGrams,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber,
      sugar: item.sugar,
      sodium: item.sodium,
    };

    targetDiary.items.push(duplicatedItem);
    await targetDiary.save();

    return successResponse(res, { item: duplicatedItem }, 'Item duplicated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiaryByDate,
  addDiaryItem,
  updateDiaryItem,
  deleteDiaryItem,
  duplicateDiaryItem,
};
