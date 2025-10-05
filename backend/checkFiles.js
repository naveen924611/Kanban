const fs = require('fs');
const path = require('path');

console.log('🔍 Checking backend file structure...\n');

const requiredFiles = [
  'models/User.js',
  'models/Workspace.js',
  'models/Board.js',
  'models/List.js',
  'models/Card.js',
  'models/Comment.js',
  'models/Activity.js',
  'routes/authRoutes.js',
  'routes/workspaceRoutes.js',
  'routes/boardRoutes.js',
  'routes/listRoutes.js',
  'routes/cardRoutes.js',
  'routes/commentRoutes.js',
  'routes/activityRoutes.js',
  'middleware/auth.js',
  'utils/activityLogger.js',
  'server.js',
  '.env'
];

let allGood = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allGood = false;
});

console.log('\n' + (allGood ? '✅ All files present!' : '❌ Some files missing!'));

// Check .env contents
if (fs.existsSync('.env')) {
  console.log('\n📄 .env file contents:');
  const env = fs.readFileSync('.env', 'utf8');
  console.log(env);
}