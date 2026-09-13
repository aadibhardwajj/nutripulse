const Recipe = require('../models/Recipe');
const Diary = require('../models/Diary');
const calculationService = require('../services/calculationService');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// GET /api/recipes
const getRecipes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [recipes, total] = await Promise.all([
      Recipe.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Recipe.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Recipes retrieved successfully',
      data: {
        recipes,
      },
      recipes,
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

// GET /api/recipes/:id
const getRecipeById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recipe = await Recipe.findOne({ _id: req.params.id, userId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }
    return successResponse(res, { recipe });
  } catch (error) {
    next(error);
  }
};

// POST /api/recipes
const createRecipe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, servings, prepTimeMinutes, cookTimeMinutes, ingredients, instructions } = req.body;

    const { total, perServing } = calculationService.calculateRecipeNutrition(ingredients, servings);

    const recipe = await Recipe.create({
      userId,
      name,
      description: description || '',
      servings: servings || 1,
      prepTimeMinutes: prepTimeMinutes || 15,
      cookTimeMinutes: cookTimeMinutes || 15,
      ingredients,
      instructions: instructions || [],
      totalNutrition: total,
      perServingNutrition: perServing,
    });

    return successResponse(res, { recipe }, 'Recipe created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/recipes/:id
const updateRecipe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, servings, prepTimeMinutes, cookTimeMinutes, ingredients, instructions } = req.body;

    const recipe = await Recipe.findOne({ _id: req.params.id, userId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (servings) recipe.servings = servings;
    if (prepTimeMinutes !== undefined) recipe.prepTimeMinutes = prepTimeMinutes;
    if (cookTimeMinutes !== undefined) recipe.cookTimeMinutes = cookTimeMinutes;
    if (ingredients) recipe.ingredients = ingredients;
    if (instructions) recipe.instructions = instructions;

    const { total, perServing } = calculationService.calculateRecipeNutrition(recipe.ingredients, recipe.servings);
    recipe.totalNutrition = total;
    recipe.perServingNutrition = perServing;

    await recipe.save();

    return successResponse(res, { recipe }, 'Recipe updated successfully');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/recipes/:id
const deleteRecipe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }
    return successResponse(res, {}, 'Recipe deleted successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/recipes/:id/log (Log 1 or more servings of recipe to diary)
const addRecipeToDiary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recipeId = req.params.id;
    const { date, mealType, servingsLogged = 1 } = req.body;

    const recipe = await Recipe.findOne({ _id: recipeId, userId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    const normalizedDate = formatDateString(date || new Date());
    let diary = await Diary.findOne({ userId, date: normalizedDate });
    if (!diary) {
      diary = new Diary({ userId, date: normalizedDate, items: [] });
    }

    const per = recipe.perServingNutrition;
    const factor = parseFloat(servingsLogged) || 1;

    diary.items.push({
      foodId: recipe._id, // References recipe ID
      foodName: `${recipe.name} (Recipe)`,
      brand: 'Homemade',
      mealType: mealType || 'dinner',
      servingSize: 1,
      servingUnit: 'serving',
      servingWeightGrams: 250,
      quantity: factor,
      calories: Math.round(per.calories * factor),
      protein: parseFloat((per.protein * factor).toFixed(1)),
      carbs: parseFloat((per.carbs * factor).toFixed(1)),
      fat: parseFloat((per.fat * factor).toFixed(1)),
      fiber: parseFloat(((per.fiber || 0) * factor).toFixed(1)),
      sugar: parseFloat(((per.sugar || 0) * factor).toFixed(1)),
      sodium: Math.round((per.sodium || 0) * factor),
    });

    await diary.save();

    return successResponse(res, { recipeName: recipe.name, servingsLogged: factor }, 'Recipe logged to diary');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addRecipeToDiary,
};
