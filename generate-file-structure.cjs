const fs = require('fs');
const path = require('path');

const rootDir = __dirname; // Scan entire project folder

function generateTree(dirPath, prefix = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // Optionally, sort directories first, then files
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const lastIndex = entries.length - 1;

  let treeString = '';
  entries.forEach((entry, index) => {
    // Ignore node_modules or other folders if you want
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) return;

    const isLast = index === lastIndex;
    treeString += prefix + (isLast ? '└── ' : '├── ') + entry.name + (entry.isDirectory() ? '/' : '') + '\n';

    if (entry.isDirectory()) {
      treeString += generateTree(
        path.join(dirPath, entry.name),
        prefix + (isLast ? '    ' : '│   ')
      );
    }
  });

  return treeString;
}

const projectName = path.basename(rootDir);

const tree = `${projectName}/\n${generateTree(rootDir)}`;

const mdContent = `# Complete Project File Structure\n\n\`\`\`\n${tree}\`\`\`\n`;

fs.writeFileSync('FULL_FILE_STRUCTURE.md', mdContent);

console.log('FULL_FILE_STRUCTURE.md generated successfully!');