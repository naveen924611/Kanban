const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 1024
  }
}, {
  timestamps: true
});

// Index for faster sorting
listSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);