const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema(
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
    waistCm: { type: Number, min: 0 },
    chestCm: { type: Number, min: 0 },
    hipsCm: { type: Number, min: 0 },
    armsCm: { type: Number, min: 0 },
    thighsCm: { type: Number, min: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

measurementSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);
