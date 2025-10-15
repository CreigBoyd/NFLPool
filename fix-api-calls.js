import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  'src/pages/PoolsPage.jsx',
  'src/pages/PicksPage.jsx',
  'src/pages/MyPicksPage.jsx',
  'src/pages/AdminPage.jsx',
  'src/pages/LeaderboardPage.jsx',
  'src/pages/LiveScoresPage.jsx',
  'src/pages/ProfilePage.jsx',
  'src/pages/ContactPage.jsx',
  'src/pages/ForgotPasswordPage.jsx',
  'src/pages/ResetPasswordPage.jsx',
  'src/pages/SideBetsPage.jsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all variations of fetch('/api/
    content = content.replace(
      /fetch\(\s*'\/api\//g,
      'fetch(`${API_BASE_URL}/'
    );
    
    content = content.replace(
      /fetch\(\s*"\/api\//g,
      'fetch(`${API_BASE_URL}/'
    );
    
    content = content.replace(
      /fetch\(\s*`\/api\//g,
      'fetch(`${API_BASE_URL}/'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n🎉 All files fixed!');
console.log('📝 Next: Commit and push to GitHub\n');