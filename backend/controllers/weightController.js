const WeightLog = require('../models/WeightLog');
const Measurement = require('../models/Measurement');
const UserProfile = require('../models/UserProfile');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/weight (Get weight history)
const getWeightLogs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 60));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total, profile] = await Promise.all([
      WeightLog.find({ userId }).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      WeightLog.countDocuments({ userId }),
      UserProfile.findOne({ userId }),
    ]);

    const chronologicalLogs = [...logs].reverse();

    return res.status(200).json({
      success: true,
      message: 'Weight logs retrieved successfully',
      data: {
        logs: chronologicalLogs,
        currentWeightKg: profile?.currentWeightKg || (logs.length > 0 ? logs[0].weightKg : 70),
        targetWeightKg: profile?.targetWeightKg || 70,
      },
      logs: chronologicalLogs,
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

// POST /api/weight
const logWeight = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, weightKg, notes } = req.body;

    const normalizedDate = formatDateString(date || new Date());

    // Upsert weight log for the given date
    const log = await WeightLog.findOneAndUpdate(
      { userId, date: normalizedDate },
      { weightKg, notes: notes || '' },
      { new: true, upsert: true }
    );

    // Also update currentWeightKg in profile
    await UserProfile.findOneAndUpdate({ userId }, { currentWeightKg: weightKg });

    return successResponse(res, { log }, 'Weight logged successfully', 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/weight/measurements
const getMeasurements = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const measurements = await Measurement.find({ userId }).sort({ date: -1 }).limit(30);
    return successResponse(res, { measurements: measurements.reverse() });
  } catch (error) {
    next(error);
  }
};

// POST /api/weight/measurements
const logMeasurement = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, waistCm, chestCm, hipsCm, armsCm, thighsCm, notes } = req.body;

    const normalizedDate = formatDateString(date || new Date());
    const measurement = await Measurement.findOneAndUpdate(
      { userId, date: normalizedDate },
      { waistCm, chestCm, hipsCm, armsCm, thighsCm, notes: notes || '' },
      { new: true, upsert: true }
    );

    return successResponse(res, { measurement }, 'Body measurements recorded', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeightLogs,
  logWeight,
  getMeasurements,
  logMeasurement,
};
