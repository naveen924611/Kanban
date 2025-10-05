
const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const { verifyToken, isBoardMember } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

router.use(verifyToken);

// Create board
router.post('/', async (req, res) => {
  try {
    const { title, workspace, visibility, color } = req.body;
    
    console.log('Creating board with data:', { title, workspace, visibility, color, userId: req.userId });
    
    if (!title) {
      return res.status(400).json({ error: 'Board title is required' });
    }
    
    if (!workspace) {
      return res.status(400).json({ error: 'Workspace is required' });
    }
    
    const board = new Board({
      title,
      workspace,
      visibility: visibility || 'workspace',
      color: color || '#0079bf',
      owner: req.userId,
      members: [req.userId]
    });
    
    console.log('Board object before save:', board);
    
    await board.save();
    await board.populate('owner members', 'name email avatar');
    await board.populate('workspace', 'name');
    
    console.log('✅ Board created successfully:', board._id);
    
    await logActivity(board._id, 'board_created', req.userId, { title });
    
    res.status(201).json(board);
  } catch (error) {
    console.error('❌ Error creating board:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all user's boards
router.get('/', async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    })
    .populate('owner members', 'name email avatar')
    .populate('workspace', 'name');
    
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single board with lists and cards
router.get('/:id', verifyToken, isBoardMember, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner members', 'name email avatar')
      .populate('workspace', 'name');
    
    const lists = await List.find({ board: req.params.id })
      .sort({ position: 1 });
    
    const cards = await Card.find({ board: req.params.id })
      .populate('assignees', 'name email avatar')
      .sort({ position: 1 });
    
    res.json({
      ...board.toObject(),
      lists,
      cards
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update board
router.put('/:id', verifyToken, isBoardMember, async (req, res) => {
  try {
    const { title, visibility, color } = req.body;
    const board = req.board;
    
    // Check if user is owner
    if (board.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only board owner can update board' });
    }
    
    if (title) board.title = title;
    if (visibility) board.visibility = visibility;
    if (color) board.color = color;
    
    await board.save();
    await board.populate('owner members', 'name email avatar');
    
    await logActivity(board._id, 'board_updated', req.userId, { title, visibility, color });
    
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete board
router.delete('/:id', verifyToken, isBoardMember, async (req, res) => {
  try {
    const board = req.board;
    
    // Check if user is owner (only owner can delete)
    if (board.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Only board owner can delete the board' 
      });
    }

    console.log(`Deleting board ${board._id}: ${board.title}`);

    // Get all lists in this board
    const lists = await List.find({ board: board._id });
    const listIds = lists.map(list => list._id);

    console.log(`Found ${lists.length} lists to delete`);

    // Delete all cards in these lists
    const cardsResult = await Card.deleteMany({ list: { $in: listIds } });
    console.log(`Deleted ${cardsResult.deletedCount} cards`);

    // Get all card IDs for deleting comments
    const cards = await Card.find({ list: { $in: listIds } });
    const cardIds = cards.map(card => card._id);

    // Delete all comments on these cards
    const commentsResult = await Comment.deleteMany({ card: { $in: cardIds } });
    console.log(`Deleted ${commentsResult.deletedCount} comments`);

    // Delete all lists
    const listsResult = await List.deleteMany({ board: board._id });
    console.log(`Deleted ${listsResult.deletedCount} lists`);

    // Delete all activities
    const activitiesResult = await Activity.deleteMany({ board: board._id });
    console.log(`Deleted ${activitiesResult.deletedCount} activities`);

    // Delete the board itself
    await Board.findByIdAndDelete(board._id);
    
    console.log(`✅ Board ${board._id} deleted successfully`);

    res.json({ 
      success: true, 
      message: 'Board and all associated data deleted successfully',
      deleted: {
        cards: cardsResult.deletedCount,
        comments: commentsResult.deletedCount,
        lists: listsResult.deletedCount,
        activities: activitiesResult.deletedCount
      }
    });
  } catch (error) {
    console.error('❌ Error deleting board:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add member to board
router.post('/:id/members', verifyToken, isBoardMember, async (req, res) => {
  try {
    const { userId } = req.body;
    const board = req.board;
    
    if (board.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }
    
    if (!board.members.includes(userId)) {
      board.members.push(userId);
      await board.save();
      await logActivity(board._id, 'member_added', req.userId, { newMemberId: userId });
    }
    
    await board.populate('owner members', 'name email avatar');
    res.json(board);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from board
router.delete('/:id/members/:userId', verifyToken, isBoardMember, async (req, res) => {
  try {
    const board = req.board;
    
    if (board.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }
    
    board.members = board.members.filter(m => m.toString() !== req.params.userId);
    await board.save();
    await board.populate('owner members', 'name email avatar');
    
    await logActivity(board._id, 'member_removed', req.userId, { removedMemberId: req.params.userId });
    
    res.json(board);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;