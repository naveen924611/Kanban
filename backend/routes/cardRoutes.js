const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Comment = require('../models/Comment');
const { verifyToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

router.use(verifyToken);

// Create card
router.post('/', async (req, res) => {
  try {
    const { title, description, list, board, labels, assignees, dueDate, position } = req.body;
    
    // Calculate position if not provided
    let newPosition = position || 1024;
    if (!position) {
      const lastCard = await Card.findOne({ list }).sort({ position: -1 });
      if (lastCard) {
        newPosition = lastCard.position + 1024;
      }
    }
    
    const card = new Card({
      title,
      description,
      list,
      board,
      labels: labels || [],
      assignees: assignees || [],
      dueDate,
      position: newPosition
    });
    
    await card.save();
    await card.populate('assignees', 'name email avatar');
    
    await logActivity(board, 'card_created', req.userId, { cardTitle: title });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(board).emit('card-created', card);
    
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single card with comments
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('assignees', 'name email avatar');
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const comments = await Comment.find({ card: card._id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });
    
    res.json({ ...card.toObject(), comments });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, list, position, labels, assignees, dueDate, isCompleted } = req.body;
    
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const oldList = card.list.toString();
    
    if (title) card.title = title;
    if (description !== undefined) card.description = description;
    if (labels) card.labels = labels;
    if (assignees) card.assignees = assignees;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (position !== undefined) card.position = position;
    if (list) card.list = list;
    if (isCompleted !== undefined) card.isCompleted = isCompleted;  // Add this line
    
    await card.save();
    await card.populate('assignees', 'name email avatar');
    
    // Log activity
    if (list && oldList !== list) {
      await logActivity(card.board, 'card_moved', req.userId, { 
        cardTitle: card.title,
        fromList: oldList,
        toList: list
      });
    } else if (isCompleted !== undefined) {
      await logActivity(card.board, isCompleted ? 'card_completed' : 'card_reopened', req.userId, { 
        cardTitle: card.title 
      });
    } else {
      await logActivity(card.board, 'card_updated', req.userId, { cardTitle: card.title });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(card.board.toString()).emit('card-updated', card);
    
    res.json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete card
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Delete all comments
    await Comment.deleteMany({ card: card._id });
    
    await card.deleteOne();
    
    await logActivity(card.board, 'card_deleted', req.userId, { cardTitle: card.title });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(card.board.toString()).emit('card-deleted', { cardId: card._id });
    
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search cards in a board
router.get('/search/:boardId', async (req, res) => {
  try {
    const { q, label, assignee } = req.query;
    const { boardId } = req.params;
    
    let query = { board: boardId };
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Filter by label
    if (label) {
      query.labels = label;
    }
    
    // Filter by assignee
    if (assignee) {
      query.assignees = assignee;
    }
    
    const cards = await Card.find(query)
      .populate('assignees', 'name email avatar')
      .limit(50);
      console.log("cardRoute");
      
  console.log(cards);
    
    res.json(cards);

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;