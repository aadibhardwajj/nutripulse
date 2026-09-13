const Diary = require('../models/Diary');
const WeightLog = require('../models/WeightLog');
const WaterLog = require('../models/WaterLog');
const ExerciseLog = require('../models/ExerciseLog');
const UserGoal = require('../models/UserGoal');
const calculationService = require('../services/calculationService');
const { formatDateString, getPastDate, getDaysInRange } = require('../utils/dateHelper');
const { successResponse } = require('../utils/responseHandler');

// GET /api/progress?range=7d | 30d | 90d | 180d | 365d
const getProgressAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const range = req.query.range || '7d';

    let daysAgo = 7;
    switch (range) {
      case '30d':
        daysAgo = 30;
        break;
      case '90d':
      case '3m':
        daysAgo = 90;
        break;
      case '180d':
      case '6m':
        daysAgo = 180;
        break;
      case '365d':
      case '1y':
        daysAgo = 365;
        break;
      default:
        daysAgo = 7;
    }

    const todayStr = formatDateString(new Date());
    const startDateStr = getPastDate(daysAgo - 1);
    const dateList = getDaysInRange(startDateStr, todayStr);

    const goal = await UserGoal.findOne({ userId });
    const targetCalories = goal?.dailyCalories || 2000;
    const targetWater = goal?.targetWaterMl || 2500;

    // Fetch in parallel for the date range
    const [diaries, weightLogs, waterLogs, exerciseLogs] = await Promise.all([
      Diary.find({ userId, date: { $gte: startDateStr, $lte: todayStr } }),
      WeightLog.find({ userId, date: { $gte: startDateStr, $lte: todayStr } }),
      WaterLog.find({ userId, date: { $gte: startDateStr, $lte: todayStr } }),
      ExerciseLog.find({ userId, date: { $gte: startDateStr, $lte: todayStr } }),
    ]);

    // Map by date
    const diaryMap = {};
    diaries.forEach((d) => {
      const mealSections = { breakfast: [], lunch: [], dinner: [], snack: [] };
      d.items?.forEach((item) => {
        if (mealSections[item.mealType]) mealSections[item.mealType].push(item);
      });
      const { dailyTotal } = calculationService.calculateDiaryTotals(mealSections);
      diaryMap[d.date] = dailyTotal;
    });

    const weightMap = {};
    weightLogs.forEach((w) => {
      weightMap[w.date] = w.weightKg;
    });

    const waterMap = {};
    waterLogs.forEach((w) => {
      waterMap[w.date] = (waterMap[w.date] || 0) + w.amountMl;
    });

    const exerciseMap = {};
    exerciseLogs.forEach((e) => {
      if (!exerciseMap[e.date]) {
        exerciseMap[e.date] = { calories: 0, minutes: 0 };
      }
      exerciseMap[e.date].calories += e.caloriesBurned;
      exerciseMap[e.date].minutes += e.durationMinutes;
    });

    // Build unified series
    let lastKnownWeight = null;
    const chartData = dateList.map((dt) => {
      const nutrition = diaryMap[dt] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      if (weightMap[dt] !== undefined) {
        lastKnownWeight = weightMap[dt];
      }
      const water = waterMap[dt] || 0;
      const ex = exerciseMap[dt] || { calories: 0, minutes: 0 };

      return {
        date: dt,
        shortDate: dt.slice(5), // 'MM-DD'
        calories: nutrition.calories,
        targetCalories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        waterMl: water,
        targetWaterMl: targetWater,
        weightKg: lastKnownWeight,
        exerciseCalories: ex.calories,
        exerciseMinutes: ex.minutes,
      };
    });

    // Compute range averages
    const daysWithFood = chartData.filter((d) => d.calories > 0);
    const avgCalories = daysWithFood.length > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.calories, 0) / daysWithFood.length) : 0;
    const avgProtein = daysWithFood.length > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.protein, 0) / daysWithFood.length) : 0;
    const avgCarbs = daysWithFood.length > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.carbs, 0) / daysWithFood.length) : 0;
    const avgFat = daysWithFood.length > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.fat, 0) / daysWithFood.length) : 0;
    const avgWater = Math.round(chartData.reduce((s, d) => s + d.waterMl, 0) / chartData.length);
    const totalExerciseMinutes = chartData.reduce((s, d) => s + d.exerciseMinutes, 0);

    return successResponse(res, {
      range,
      daysCount: dateList.length,
      chartData,
      averages: {
        calories: avgCalories,
        protein: avgProtein,
        carbs: avgCarbs,
        fat: avgFat,
        waterMl: avgWater,
        totalExerciseMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgressAnalytics };
