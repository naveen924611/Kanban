const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Card = require('../models/Card');
const { verifyToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

router.use(verifyToken);


router.post('/', async (req, res) => {
  try {
    const { text, card } = req.body;
    
    const cardDoc = await Card.findById(card);
    if (!cardDoc) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const comment = new Comment({
      text,
      card,
      author: req.userId
    });
    
    await comment.save();
    await comment.populate('author', 'name email avatar');
    
    await logActivity(cardDoc.board, 'comment_added', req.userId, { 
      cardTitle: cardDoc.title 
    });
    
    
    const io = req.app.get('io');
    io.to(cardDoc.board.toString()).emit('comment-added', comment);
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/card/:cardId', async (req, res) => {
  try {
    const comments = await Comment.find({ card: req.params.cardId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;