const ExerciseLog = require('../models/ExerciseLog');
const UserProfile = require('../models/UserProfile');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Catalog of exercises with estimated MET values
const EXERCISE_CATALOG = [
  { id: 'walk_brisk', name: 'Walking (Brisk, 5.5 km/h)', category: 'walking', met: 3.8 },
  { id: 'walk_casual', name: 'Walking (Casual, 3.5 km/h)', category: 'walking', met: 2.8 },
  { id: 'run_jog', name: 'Running / Jogging (8 km/h)', category: 'running', met: 8.3 },
  { id: 'run_fast', name: 'Running (Fast, 11 km/h)', category: 'running', met: 11.5 },
  { id: 'cycling_mod', name: 'Cycling (Moderate, 15-18 km/h)', category: 'cycling', met: 6.8 },
  { id: 'cycling_vigor', name: 'Cycling (Vigorous, >20 km/h)', category: 'cycling', met: 10.0 },
  { id: 'swim_laps', name: 'Swimming (Freestyle Laps, Moderate)', category: 'swimming', met: 7.0 },
  { id: 'strength_mod', name: 'Weight Training (Moderate Effort)', category: 'strength', met: 4.0 },
  { id: 'strength_heavy', name: 'Strength / Powerlifting (Vigorous)', category: 'strength', met: 6.0 },
  { id: 'hiit', name: 'HIIT / Circuit Training', category: 'cardio', met: 8.5 },
  { id: 'yoga', name: 'Yoga / Pilates / Stretching', category: 'flexibility', met: 3.0 },
  { id: 'basketball', name: 'Basketball / Soccer / Tennis', category: 'sports', met: 7.5 },
];

// GET /api/exercises/catalog
const getExerciseCatalog = async (req, res) => {
  return successResponse(res, { exercises: EXERCISE_CATALOG });
};

// GET /api/exercises?date=YYYY-MM-DD
const getExerciseLogs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const query = { userId };
    if (req.query.date) {
      query.date = formatDateString(req.query.date);
    }
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || (req.query.date ? 50 : 20)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      ExerciseLog.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ExerciseLog.countDocuments(query),
    ]);

    const totalCaloriesBurned = logs.reduce((sum, item) => sum + item.caloriesBurned, 0);
    const totalMinutes = logs.reduce((sum, item) => sum + item.durationMinutes, 0);

    return res.status(200).json({
      success: true,
      message: 'Exercise logs retrieved successfully',
      data: {
        logs,
        summary: {
          totalCaloriesBurned,
          totalMinutes,
          count: logs.length,
        },
      },
      logs,
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

// POST /api/exercises/log
const logExercise = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, exerciseName, category, durationMinutes, distanceKm, caloriesBurned, notes } = req.body;

    let burned = caloriesBurned;

    // If calories not provided or 0, estimate using MET and user's weight
    if (!burned || burned <= 0) {
      const profile = await UserProfile.findOne({ userId });
      const weightKg = profile?.currentWeightKg || 70;
      // Find matching catalog item MET or fallback to 5.0
      const matched = EXERCISE_CATALOG.find((e) => e.name.toLowerCase().includes(exerciseName.toLowerCase()));
      const met = matched ? matched.met : 5.0;
      // Formula: Calories = MET * weight(kg) * duration(hours)
      burned = Math.round(met * weightKg * (durationMinutes / 60));
    }

    const log = await ExerciseLog.create({
      userId,
      date: formatDateString(date || new Date()),
      exerciseName,
      category: category || 'cardio',
      durationMinutes,
      distanceKm: distanceKm || 0,
      caloriesBurned: burned,
      notes: notes || '',
    });

    return successResponse(res, { log }, 'Exercise logged successfully', 201);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/exercises/log/:id
const deleteExerciseLog = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const log = await ExerciseLog.findOneAndDelete({ _id: req.params.id, userId });
    if (!log) {
      return errorResponse(res, 'Exercise log not found', 404, 'LOG_NOT_FOUND');
    }
    return successResponse(res, {}, 'Exercise log removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExerciseCatalog,
  getExerciseLogs,
  logExercise,
  deleteExerciseLog,
};
