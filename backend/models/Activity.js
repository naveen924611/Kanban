const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  action: {
    type: String,
    required: true
    
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    
  }
}, {
  timestamps: true
});


activitySchema.index({ board: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);