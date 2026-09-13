const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
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
    weightKg: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

weightLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
