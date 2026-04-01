const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    domain: {
      type: String,
      trim: true,
    },
    favicon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: '',
      maxlength: 256,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

historySchema.index({ visitedAt: -1 });
historySchema.index({ domain: 1 });

const History = mongoose.model('History', historySchema);
module.exports = History;
