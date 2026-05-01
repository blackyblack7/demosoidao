const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Post-build: Copying files to standalone ---');
try {
  // Copy .next/static to standalone
  if (fs.existsSync('.next/static')) {
    copyDir('.next/static', '.next/standalone/.next/static');
  }
  
  // Copy public to standalone
  if (fs.existsSync('public')) {
    copyDir('public', '.next/standalone/public');
  }
  
  console.log('✅ Successfully copied static and public folders.');
} catch (err) {
  console.error('❌ Error during copy:', err.message);
  process.exit(1);
}
