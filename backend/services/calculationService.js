const CONSTANTS = require('../config/constants');

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 * Weight in kg, height in cm, age in years, gender: male | female | other
 */
const calculateBMR = ({ weightKg, heightCm, age, gender }) => {
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) || 170;
  const a = parseInt(age, 10) || 25;

  let bmr = (10 * w) + (6.25 * h) - (5 * a);
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    // Neutral estimate for other/unspecified
    bmr -= 78;
  }
  return Math.round(bmr);
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity level
 */
const calculateTDEE = (bmr, activityLevel = 'lightly_active') => {
  const multiplier = CONSTANTS.ACTIVITY_LEVELS[activityLevel]?.multiplier || 1.375;
  return Math.round(bmr * multiplier);
};

/**
 * Calculates Recommended Daily Calories based on fitness goal
 */
const calculateDailyCalories = ({ weightKg, heightCm, age, gender, activityLevel, goal }) => {
  const bmr = calculateBMR({ weightKg, heightCm, age, gender });
  const tdee = calculateTDEE(bmr, activityLevel);

  let targetCalories = tdee;
  switch (goal) {
    case 'lose_weight':
      targetCalories = Math.max(1200, tdee - 500); // 500 kcal deficit for ~0.5kg/week
      break;
    case 'gain_weight':
      targetCalories = tdee + 400; // 400 kcal surplus
      break;
    case 'improve_nutrition':
    case 'improve_fitness':
    case 'maintain_weight':
    default:
      targetCalories = tdee;
      break;
  }
  return { bmr, tdee, targetCalories: Math.round(targetCalories) };
};

/**
 * Calculates target macronutrient grams based on calorie target & distribution ratios
 */
const calculateMacroTargets = (targetCalories, customRatios = null) => {
  const ratios = customRatios || CONSTANTS.DEFAULT_MACRO_RATIOS;
  const carbsCalories = targetCalories * (ratios.carbsPct / 100);
  const proteinCalories = targetCalories * (ratios.proteinPct / 100);
  const fatCalories = targetCalories * (ratios.fatPct / 100);

  return {
    calories: Math.round(targetCalories),
    carbs: Math.round(carbsCalories / 4),       // 4 kcal per gram
    protein: Math.round(proteinCalories / 4),   // 4 kcal per gram
    fat: Math.round(fatCalories / 9),           // 9 kcal per gram
  };
};

/**
 * Calculates nutrition for an item given food base nutrition, serving size, and quantity
 */
const calculateItemNutrition = (foodNutrition, servingWeightGrams, baseServingGrams, quantity = 1) => {
  const ratio = (servingWeightGrams / (baseServingGrams || 100)) * quantity;
  return {
    calories: Math.round((foodNutrition.calories || 0) * ratio),
    protein: parseFloat(((foodNutrition.protein || 0) * ratio).toFixed(1)),
    carbs: parseFloat(((foodNutrition.carbs || 0) * ratio).toFixed(1)),
    fat: parseFloat(((foodNutrition.fat || 0) * ratio).toFixed(1)),
    fiber: parseFloat(((foodNutrition.fiber || 0) * ratio).toFixed(1)),
    sugar: parseFloat(((foodNutrition.sugar || 0) * ratio).toFixed(1)),
    sodium: Math.round((foodNutrition.sodium || 0) * ratio),
  };
};

/**
 * Calculates aggregated nutrition for a list of diary items
 */
const calculateDiaryTotals = (mealSections = {}) => {
  const initial = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  const totalsByMeal = {
    breakfast: { ...initial },
    lunch: { ...initial },
    dinner: { ...initial },
    snack: { ...initial },
  };

  const dailyTotal = { ...initial };

  CONSTANTS.MEAL_TYPES.forEach((mealType) => {
    const items = mealSections[mealType] || [];
    items.forEach((item) => {
      totalsByMeal[mealType].calories += item.calories || 0;
      totalsByMeal[mealType].protein += item.protein || 0;
      totalsByMeal[mealType].carbs += item.carbs || 0;
      totalsByMeal[mealType].fat += item.fat || 0;
      totalsByMeal[mealType].fiber += item.fiber || 0;
      totalsByMeal[mealType].sugar += item.sugar || 0;
      totalsByMeal[mealType].sodium += item.sodium || 0;

      dailyTotal.calories += item.calories || 0;
      dailyTotal.protein += item.protein || 0;
      dailyTotal.carbs += item.carbs || 0;
      dailyTotal.fat += item.fat || 0;
      dailyTotal.fiber += item.fiber || 0;
      dailyTotal.sugar += item.sugar || 0;
      dailyTotal.sodium += item.sodium || 0;
    });

    totalsByMeal[mealType].protein = parseFloat(totalsByMeal[mealType].protein.toFixed(1));
    totalsByMeal[mealType].carbs = parseFloat(totalsByMeal[mealType].carbs.toFixed(1));
    totalsByMeal[mealType].fat = parseFloat(totalsByMeal[mealType].fat.toFixed(1));
  });

  dailyTotal.protein = parseFloat(dailyTotal.protein.toFixed(1));
  dailyTotal.carbs = parseFloat(dailyTotal.carbs.toFixed(1));
  dailyTotal.fat = parseFloat(dailyTotal.fat.toFixed(1));

  return { totalsByMeal, dailyTotal };
};

/**
 * Calculates total and per-serving nutrition for a recipe
 */
const calculateRecipeNutrition = (ingredients = [], servings = 1) => {
  const validServings = Math.max(1, parseInt(servings, 10) || 1);
  const total = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  ingredients.forEach((ing) => {
    const qty = ing.quantity || 1;
    const nut = ing.nutrition || {};
    total.calories += (nut.calories || 0) * qty;
    total.protein += (nut.protein || 0) * qty;
    total.carbs += (nut.carbs || 0) * qty;
    total.fat += (nut.fat || 0) * qty;
    total.fiber += (nut.fiber || 0) * qty;
    total.sugar += (nut.sugar || 0) * qty;
    total.sodium += (nut.sodium || 0) * qty;
  });

  const perServing = {
    calories: Math.round(total.calories / validServings),
    protein: parseFloat((total.protein / validServings).toFixed(1)),
    carbs: parseFloat((total.carbs / validServings).toFixed(1)),
    fat: parseFloat((total.fat / validServings).toFixed(1)),
    fiber: parseFloat((total.fiber / validServings).toFixed(1)),
    sugar: parseFloat((total.sugar / validServings).toFixed(1)),
    sodium: Math.round(total.sodium / validServings),
  };

  return { total, perServing, servings: validServings };
};

/**
 * Calculates total nutrition for a saved meal bundle
 */
const calculateMealNutrition = (items = []) => {
  const total = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  items.forEach((item) => {
    total.calories += item.calories || 0;
    total.protein += item.protein || 0;
    total.carbs += item.carbs || 0;
    total.fat += item.fat || 0;
    total.fiber += item.fiber || 0;
    total.sugar += item.sugar || 0;
    total.sodium += item.sodium || 0;
  });

  total.protein = parseFloat(total.protein.toFixed(1));
  total.carbs = parseFloat(total.carbs.toFixed(1));
  total.fat = parseFloat(total.fat.toFixed(1));

  return total;
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacroTargets,
  calculateItemNutrition,
  calculateDiaryTotals,
  calculateRecipeNutrition,
  calculateMealNutrition,
};
