
const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Card = require('../models/Card');
const Board = require('../models/Board');
const { verifyToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

router.use(verifyToken);


router.post('/', async (req, res) => {
  try {
    const { title, board, position } = req.body;
    
   
    const boardDoc = await Board.findById(board);
    if (!boardDoc) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const isMember = boardDoc.members.some(m => m.toString() === req.userId.toString());
    const isOwner = boardDoc.owner.toString() === req.userId.toString();
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
   
    let newPosition = position || 1024;
    if (!position) {
      const lastList = await List.findOne({ board }).sort({ position: -1 });
      if (lastList) {
        newPosition = lastList.position + 1024;
      }
    }
    
    const list = new List({
      title,
      board,
      position: newPosition
    });
    
    console.log(list);
    
    await list.save();
    
    await logActivity(board, 'list_created', req.userId, { title });
    
   
    const io = req.app.get('io');
    io.to(board).emit('list-created', list);
    
    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update list
router.put('/:id', async (req, res) => {
  try {
    const { title, position } = req.body;
    
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    if (title) list.title = title;
    if (position !== undefined) list.position = position;
    
    await list.save();
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(list.board.toString()).emit('list-updated', list);
    
    res.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete list
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    // Delete all cards in this list
    await Card.deleteMany({ list: list._id });
    
    await list.deleteOne();
    
    await logActivity(list.board, 'list_deleted', req.userId, { title: list.title });
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(list.board.toString()).emit('list-deleted', { listId: list._id });
    
    res.json({ message: 'List deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;