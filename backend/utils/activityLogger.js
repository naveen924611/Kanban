const Activity = require('../models/Activity');


const logActivity = async (boardId, action, actorId, metadata = {}) => {
  try {
    const activity = new Activity({
      board: boardId,
      action,
      actor: actorId,
      metadata
    });
    console.log(activity);
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

module.exports = { logActivity };