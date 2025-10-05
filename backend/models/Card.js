const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
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
  },
  labels: [{
    type: String,
    trim: true
  }],
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: {
    type: Date
  },
  attachments: [
    {
      name: String,
      url: String,
      type: String,
      size: Number,
    },
  ],
}, {
  timestamps: true
});

// Text index for search
cardSchema.index({ title: 'text' });
// Index for filtering
cardSchema.index({ board: 1, list: 1, position: 1 });

module.exports = mongoose.model('Card', cardSchema);