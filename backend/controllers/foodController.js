const Food = require('../models/Food');
const Favorite = require('../models/Favorite');
const Diary = require('../models/Diary');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/foods
const searchFoods = async (req, res, next) => {
  try {
    const {
      q,
      category,
      brand,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { brand: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (brand && brand !== 'All') {
      query.brand = brand;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    if (sortBy === 'calories') {
      sortOptions['nutritionPer100g.calories'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'protein') {
      sortOptions['nutritionPer100g.protein'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const [foods, total] = await Promise.all([
      Food.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Food.countDocuments(query),
    ]);

    // Check user favorites to flag isFavorite
    let favoriteFoodIds = new Set();
    if (req.user) {
      const favorites = await Favorite.find({ userId: req.user._id }).select('foodId').lean();
      favoriteFoodIds = new Set(favorites.map((f) => f.foodId.toString()));
    }

    const enrichedFoods = foods.map((food) => ({
      ...food,
      isFavorite: favoriteFoodIds.has(food._id.toString()),
    }));

    return successResponse(res, {
      foods: enrichedFoods,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/foods/:id
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return errorResponse(res, 'Food item not found', 404, 'FOOD_NOT_FOUND');
    }

    let isFavorite = false;
    if (req.user) {
      const favorite = await Favorite.findOne({ userId: req.user._id, foodId: food._id });
      isFavorite = !!favorite;
    }

    return successResponse(res, { food, isFavorite });
  } catch (error) {
    next(error);
  }
};

// POST /api/foods (Custom food created by user)
const createCustomFood = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      name,
      brand,
      category,
      servingSize,
      servingUnit,
      servingWeightGrams,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
    } = req.body;

    const baseWeight = servingWeightGrams || 100;
    const factor = 100 / baseWeight;

    const newFood = await Food.create({
      name,
      brand: brand || 'Custom / Home-cooked',
      category: category || 'Other',
      isCustom: true,
      createdBy: userId,
      servings: [
        {
          servingSize: servingSize || 1,
          servingUnit: servingUnit || 'serving',
          weightGrams: baseWeight,
        },
      ],
      defaultServingIndex: 0,
      nutritionPer100g: {
        calories: Math.round(calories * factor),
        protein: parseFloat((protein * factor).toFixed(1)),
        carbs: parseFloat((carbs * factor).toFixed(1)),
        fat: parseFloat((fat * factor).toFixed(1)),
        fiber: parseFloat(((fiber || 0) * factor).toFixed(1)),
        sugar: parseFloat(((sugar || 0) * factor).toFixed(1)),
        sodium: Math.round((sodium || 0) * factor),
      },
    });

    return successResponse(res, { food: newFood }, 'Custom food item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/foods/:id/favorite (Toggle favorite status)
const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const foodId = req.params.id;

    const existing = await Favorite.findOne({ userId, foodId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return successResponse(res, { isFavorite: false }, 'Removed from favorites');
    } else {
      await Favorite.create({ userId, foodId });
      return successResponse(res, { isFavorite: true }, 'Added to favorites');
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/foods/user/favorites
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ userId }).populate('foodId').sort({ createdAt: -1 });
    const foods = favorites.filter((f) => f.foodId).map((f) => ({ ...f.foodId.toObject(), isFavorite: true }));
    return successResponse(res, { foods });
  } catch (error) {
    next(error);
  }
};

// GET /api/foods/user/recent
const getRecentFoods = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Look at last 10 days of diary logs
    const diaries = await Diary.find({ userId }).sort({ date: -1 }).limit(10).lean();
    const seenFoodIds = new Set();
    const recentFoodIds = [];

    diaries.forEach((d) => {
      d.items?.forEach((item) => {
        const idStr = item.foodId?.toString();
        if (idStr && !seenFoodIds.has(idStr)) {
          seenFoodIds.add(idStr);
          recentFoodIds.push(item.foodId);
        }
      });
    });

    const recentFoods = await Food.find({ _id: { $in: recentFoodIds.slice(0, 15) } }).lean();

    return successResponse(res, { foods: recentFoods });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchFoods,
  getFoodById,
  createCustomFood,
  toggleFavorite,
  getFavorites,
  getRecentFoods,
};
