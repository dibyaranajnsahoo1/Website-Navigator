const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
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
    tags: [{ type: String, trim: true, maxlength: 64 }],
    notes: {
      type: String,
      default: '',
      maxlength: 1024,
    },
    sessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ url: 1, sessionId: 1 }, { unique: false });
bookmarkSchema.index({ domain: 1 });
bookmarkSchema.index({ createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
