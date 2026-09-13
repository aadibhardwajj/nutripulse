const Diary = require('../models/Diary');
const UserGoal = require('../models/UserGoal');
const UserProfile = require('../models/UserProfile');
const ExerciseLog = require('../models/ExerciseLog');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const calculationService = require('../services/calculationService');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse } = require('../utils/responseHandler');

// GET /api/dashboard?date=YYYY-MM-DD
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const date = formatDateString(req.query.date || new Date());

    // 1. Fetch Goals & Profile
    let goal = await UserGoal.findOne({ userId });
    if (!goal) {
      goal = await UserGoal.create({ userId });
    }

    const profile = await UserProfile.findOne({ userId });

    // 2. Fetch Diary for the day
    const diary = await Diary.findOne({ userId, date });
    const mealSections = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    if (diary && diary.items) {
      diary.items.forEach((item) => {
        if (mealSections[item.mealType]) {
          mealSections[item.mealType].push(item);
        }
      });
    }

    const { totalsByMeal, dailyTotal } = calculationService.calculateDiaryTotals(mealSections);

    // 3. Fetch Exercise Logs for the day
    const exerciseLogs = await ExerciseLog.find({ userId, date });
    const totalExerciseCalories = exerciseLogs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
    const totalExerciseMinutes = exerciseLogs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);

    // 4. Fetch Water for the day
    const waterLogs = await WaterLog.find({ userId, date });
    const totalWaterMl = waterLogs.reduce((sum, item) => sum + (item.amountMl || 0), 0);

    // 5. Fetch latest Weight Log
    const latestWeight = await WeightLog.findOne({ userId }).sort({ date: -1 });
    const currentWeight = latestWeight ? latestWeight.weightKg : profile?.currentWeightKg || 70;
    const targetWeight = profile?.targetWeightKg || 70;

    // 6. Compute Calorie Budget: Remaining = Goal - Consumed + Burned
    const targetCalories = goal.dailyCalories || 2000;
    const caloriesConsumed = dailyTotal.calories || 0;
    const caloriesBurned = totalExerciseCalories;
    const caloriesRemaining = Math.max(0, targetCalories - caloriesConsumed + caloriesBurned);

    // 7. Compute Macro Percentages & Progress
    const macroTargets = {
      carbs: goal.targetCarbsGrams || 250,
      protein: goal.targetProteinGrams || 125,
      fat: goal.targetFatGrams || 55,
    };

    const macroProgress = {
      carbs: {
        consumed: dailyTotal.carbs,
        target: macroTargets.carbs,
        percentage: Math.min(100, Math.round((dailyTotal.carbs / macroTargets.carbs) * 100)),
      },
      protein: {
        consumed: dailyTotal.protein,
        target: macroTargets.protein,
        percentage: Math.min(100, Math.round((dailyTotal.protein / macroTargets.protein) * 100)),
      },
      fat: {
        consumed: dailyTotal.fat,
        target: macroTargets.fat,
        percentage: Math.min(100, Math.round((dailyTotal.fat / macroTargets.fat) * 100)),
      },
    };

    // 8. Water Progress
    const waterTarget = goal.targetWaterMl || 2500;
    const waterPercentage = Math.min(100, Math.round((totalWaterMl / waterTarget) * 100));

    // 9. Weight Progress toward goal
    const weightRemainingToGoal = parseFloat(Math.abs(currentWeight - targetWeight).toFixed(1));

    return successResponse(res, {
      date,
      calories: {
        target: targetCalories,
        consumed: caloriesConsumed,
        burned: caloriesBurned,
        remaining: caloriesRemaining,
        percentReached: Math.min(100, Math.round((caloriesConsumed / targetCalories) * 100)),
      },
      macros: macroProgress,
      water: {
        consumedMl: totalWaterMl,
        targetMl: waterTarget,
        percentage: waterPercentage,
      },
      exercise: {
        caloriesBurned: totalExerciseCalories,
        durationMinutes: totalExerciseMinutes,
        logsCount: exerciseLogs.length,
      },
      weight: {
        currentKg: currentWeight,
        targetKg: targetWeight,
        remainingKg: weightRemainingToGoal,
      },
      totalsByMeal,
      mealItemCounts: {
        breakfast: mealSections.breakfast.length,
        lunch: mealSections.lunch.length,
        dinner: mealSections.dinner.length,
        snack: mealSections.snack.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
