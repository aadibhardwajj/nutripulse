const WaterLog = require('../models/WaterLog');
const UserGoal = require('../models/UserGoal');
const { formatDateString } = require('../utils/dateHelper');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/water?date=YYYY-MM-DD
const getWaterByDate = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const date = formatDateString(req.query.date || new Date());

    const logs = await WaterLog.find({ userId, date }).sort({ loggedAt: 1 });
    const totalMl = logs.reduce((sum, item) => sum + item.amountMl, 0);

    const goal = await UserGoal.findOne({ userId });
    const targetMl = goal?.targetWaterMl || 2500;

    return successResponse(res, {
      date,
      totalMl,
      targetMl,
      percentage: Math.min(100, Math.round((totalMl / targetMl) * 100)),
      remainingMl: Math.max(0, targetMl - totalMl),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/water
const addWater = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { date, amountMl } = req.body;

    const normalizedDate = formatDateString(date || new Date());
    const log = await WaterLog.create({
      userId,
      date: normalizedDate,
      amountMl: parseInt(amountMl, 10),
    });

    const allLogs = await WaterLog.find({ userId, date: normalizedDate });
    const totalMl = allLogs.reduce((sum, item) => sum + item.amountMl, 0);

    return successResponse(res, { log, totalMl }, `${amountMl}ml of water logged successfully`, 201);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/water/:id
const deleteWaterLog = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const log = await WaterLog.findOneAndDelete({ _id: req.params.id, userId });
    if (!log) {
      return errorResponse(res, 'Water log not found', 404, 'LOG_NOT_FOUND');
    }
    return successResponse(res, {}, 'Water entry deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWaterByDate,
  addWater,
  deleteWaterLog,
};
