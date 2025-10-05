const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Board = require('../models/Board');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is board member or owner
const isBoardMember = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id || req.body.board;
    
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const isMember = board.members.some(m => m.toString() === req.userId.toString());
    const isOwner = board.owner.toString() === req.userId.toString();
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.board = board;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { verifyToken, isBoardMember };