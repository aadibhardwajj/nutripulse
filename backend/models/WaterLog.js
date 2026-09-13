const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    amountMl: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

waterLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
