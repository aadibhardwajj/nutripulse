const Workout = require('../models/Workout');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

// GET /api/workouts
const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [workouts, total] = await Promise.all([
      Workout.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Workout.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: {
        workouts,
      },
      workouts,
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

// POST /api/workouts
const createWorkout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, exercises, estimatedDurationMinutes } = req.body;

    const workout = await Workout.create({
      userId,
      name,
      description: description || '',
      exercises: exercises || [],
      estimatedDurationMinutes: estimatedDurationMinutes || 45,
    });

    return successResponse(res, { workout }, 'Workout routine created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/workouts/:id
const updateWorkout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, exercises, estimatedDurationMinutes } = req.body;

    const workout = await Workout.findOne({ _id: req.params.id, userId });
    if (!workout) {
      return errorResponse(res, 'Workout routine not found', 404, 'WORKOUT_NOT_FOUND');
    }

    if (name) workout.name = name;
    if (description !== undefined) workout.description = description;
    if (exercises) workout.exercises = exercises;
    if (estimatedDurationMinutes) workout.estimatedDurationMinutes = estimatedDurationMinutes;

    await workout.save();

    return successResponse(res, { workout }, 'Workout routine updated');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/workouts/:id
const deleteWorkout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId });
    if (!workout) {
      return errorResponse(res, 'Workout routine not found', 404, 'WORKOUT_NOT_FOUND');
    }
    return successResponse(res, {}, 'Workout routine removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
