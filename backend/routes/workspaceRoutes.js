const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Create workspace
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    const workspace = new Workspace({
      name,
      owner: req.userId,
      members: [req.userId]
    });
    console.log("workspace");
    
    console.log(workspace);
    
    await workspace.save();
    await workspace.populate('owner members', 'name email avatar');
    
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    }).populate('owner members', 'name email avatar');
    
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner members', 'name email avatar');
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (workspace.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only owner can update workspace' });
    }
    
    workspace.name = name || workspace.name;
    await workspace.save();
    await workspace.populate('owner members', 'name email avatar');
    
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;