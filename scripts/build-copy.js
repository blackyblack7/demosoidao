const fs = require('fs');
const path = require('path');

function copyDir(src, dest, skipDirs = []) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    // Skip directories that should be preserved (e.g., uploads symlink)
    if (entry.isDirectory() && skipDirs.includes(entry.name)) {
      console.log(`  Skipping directory: ${entry.name} (preserved)`);
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, skipDirs);
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
    console.log('✅ Copied .next/static');
  }
  
  // Copy public to standalone, but SKIP 'uploads' folder
  // to preserve the symlink created by the maintenance API
  if (fs.existsSync('public')) {
    copyDir('public', '.next/standalone/public', ['uploads']);
    console.log('✅ Copied public (skipped uploads to preserve symlink)');
  }
  
  console.log('--- Post-build: Done! ---');
} catch (err) {
  console.error('❌ Error during copy:', err.message);
  process.exit(1);
}
