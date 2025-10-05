const express = require('express');
const router = express.Router();
// const Activity = require('../models/Activity');
const Activity = require('../models/Activity');

const { verifyToken, isBoardMember } = require('../middleware/auth');

router.use(verifyToken);


router.get('/board/:boardId', isBoardMember, async (req, res) => {
  try {
    const activities = await Activity.find({ board: req.params.boardId })
      .populate('actor', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(20);
      console.log("act_route");
        console.log(activities);
        
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;