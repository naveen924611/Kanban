const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Board = require('./models/Board');
const List = require('./models/List');
const Card = require('./models/Card');
const Comment = require('./models/Comment');
const Activity = require('./models/Activity');

const seedDatabase = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Board.deleteMany({});
    await List.deleteMany({});
    await Card.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const user1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      avatar: 'https://i.pravatar.cc/150?img=1'
    });
    await user1.save();

    const user2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      avatar: 'https://i.pravatar.cc/150?img=2'
    });
    await user2.save();
    
    console.log('Created users');

    // Create workspace
    const workspace = new Workspace({
      name: 'My Company',
      owner: user1._id,
      members: [user1._id, user2._id]
    });
    await workspace.save();
    console.log('Created workspace');

    // Create board
    const board = new Board({
      title: 'Project Alpha',
      workspace: workspace._id,
      visibility: 'workspace',
      owner: user1._id,
      members: [user1._id, user2._id]
    });
    await board.save();
    console.log('Created board');

    // Create lists
    const backlog = new List({
      title: 'Backlog',
      board: board._id,
      position: 1024
    });
    await backlog.save();

    const inProgress = new List({
      title: 'In Progress',
      board: board._id,
      position: 2048
    });
    await inProgress.save();

    const done = new List({
      title: 'Done',
      board: board._id,
      position: 3072
    });
    await done.save();
    console.log('Created lists');

    // Create cards
    const card1 = new Card({
      title: 'Setup project repository',
      description: 'Initialize Git repo and add README',
      list: backlog._id,
      board: board._id,
      position: 1024,
      labels: ['setup', 'urgent'],
      assignees: [user1._id]
    });
    await card1.save();

    const card2 = new Card({
      title: 'Design database schema',
      description: 'Create ERD and define models',
      list: inProgress._id,
      board: board._id,
      position: 1024,
      labels: ['design'],
      assignees: [user1._id, user2._id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await card2.save();

    const card3 = new Card({
      title: 'Implement authentication',
      description: 'JWT-based auth with login and signup',
      list: inProgress._id,
      board: board._id,
      position: 2048,
      labels: ['backend'],
      assignees: [user2._id]
    });
    await card3.save();

    const card4 = new Card({
      title: 'Create landing page',
      description: 'Design and implement homepage',
      list: done._id,
      board: board._id,
      position: 1024,
      labels: ['frontend', 'design'],
      assignees: [user1._id]
    });
    await card4.save();
    console.log('Created cards');

    // Create comments
    const comment1 = new Comment({
      text: 'Started working on this. Should be done by EOD.',
      card: card2._id,
      author: user1._id
    });
    await comment1.save();

    const comment2 = new Comment({
      text: 'Added the User and Board models. Need feedback.',
      card: card2._id,
      author: user2._id
    });
    await comment2.save();
    console.log('Created comments');

    // Create activities
    const activity1 = new Activity({
      board: board._id,
      action: 'board_created',
      actor: user1._id,
      metadata: { title: board.title }
    });
    await activity1.save();

    const activity2 = new Activity({
      board: board._id,
      action: 'card_created',
      actor: user1._id,
      metadata: { cardTitle: card1.title }
    });
    await activity2.save();

    const activity3 = new Activity({
      board: board._id,
      action: 'card_moved',
      actor: user2._id,
      metadata: { 
        cardTitle: card4.title,
        fromList: inProgress._id,
        toList: done._id
      }
    });
    await activity3.save();
    console.log('Created activities');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest Users:');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();