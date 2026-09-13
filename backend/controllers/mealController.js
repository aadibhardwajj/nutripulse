const Meal = require('../models/Meal');
const Diary = require('../models/Diary');
const calculationService = require('../services/calculationService');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// GET /api/meals
const getMeals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [meals, total] = await Promise.all([
      Meal.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Meal.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Meals retrieved successfully',
      data: {
        meals,
      },
      meals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/meals
const createMeal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, defaultMealType, items } = req.body;

    const totalNutrition = calculationService.calculateMealNutrition(items);

    const meal = await Meal.create({
      userId,
      name,
      description: description || '',
      defaultMealType: defaultMealType || 'breakfast',
      items,
      totalCalories: totalNutrition.calories,
      totalProtein: totalNutrition.protein,
      totalCarbs: totalNutrition.carbs,
      totalFat: totalNutrition.fat,
    });

    return successResponse(res, { meal }, 'Meal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/meals/:id
const updateMeal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, defaultMealType, items } = req.body;

    const meal = await Meal.findOne({ _id: req.params.id, userId });
    if (!meal) {
      return errorResponse(res, 'Meal not found', 404, 'MEAL_NOT_FOUND');
    }

    if (name) meal.name = name;
    if (description !== undefined) meal.description = description;
    if (defaultMealType) meal.defaultMealType = defaultMealType;

    if (items && items.length > 0) {
      meal.items = items;
      const total = calculationService.calculateMealNutrition(items);
      meal.totalCalories = total.calories;
      meal.totalProtein = total.protein;
      meal.totalCarbs = total.carbs;
      meal.totalFat = total.fat;
    }

    await meal.save();

    return successResponse(res, { meal }, 'Meal updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/meals/:id
const deleteMeal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId });
    if (!meal) {
      return errorResponse(res, 'Meal not found', 404, 'MEAL_NOT_FOUND');
    }
    return successResponse(res, {}, 'Meal deleted successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/meals/:id/log (Log all items in this meal to diary)
const addMealToDiary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const mealId = req.params.id;
    const { date, mealType } = req.body;

    const meal = await Meal.findOne({ _id: mealId, userId });
    if (!meal) {
      return errorResponse(res, 'Meal not found', 404, 'MEAL_NOT_FOUND');
    }

    const normalizedDate = formatDateString(date || new Date());
    let diary = await Diary.findOne({ userId, date: normalizedDate });
    if (!diary) {
      diary = new Diary({ userId, date: normalizedDate, items: [] });
    }

    const targetMealType = mealType || meal.defaultMealType || 'breakfast';

    meal.items.forEach((item) => {
      diary.items.push({
        foodId: item.foodId,
        foodName: item.foodName,
        mealType: targetMealType,
        servingSize: item.servingSize,
        servingUnit: item.servingUnit,
        servingWeightGrams: item.servingWeightGrams,
        quantity: item.quantity,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
    });

    await diary.save();

    return successResponse(res, { itemsCount: meal.items.length }, 'Meal logged to diary successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  addMealToDiary,
};
