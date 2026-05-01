// Custom server file for Plesk Node.js (Phusion Passenger)
// This wrapper ensures that uploaded files are served directly from disk
// bypassing Next.js static file caching which often requires a rebuild on Plesk.

const http = require('http');
const path = require('path');
const fs = require('fs');

const standaloneDir = path.join(__dirname, '.next', 'standalone');
const serverPath = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('Next.js standalone server not found. Run "npm run build" first.');
  process.exit(1);
}

// Import the standalone server handler
const nextHandler = require(serverPath).handler;

if (!nextHandler) {
  console.log('Using default Next.js standalone runner...');
  require(serverPath);
} else {
  const server = http.createServer((req, res) => {
    // Intercept /uploads/ requests to serve them directly from the root public folder
    if (req.url.startsWith('/uploads/')) {
      const decodedUrl = decodeURIComponent(req.url);
      // IMPORTANT for Linux: remove leading slash to avoid path.join treating it as absolute
      const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl;
      const filePath = path.join(__dirname, 'public', relativePath);
      
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.webp': 'image/webp',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        
        res.writeHead(200, { 
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600' 
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // Hand over everything else to Next.js
    nextHandler(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port} (serving uploads directly from disk)`);
  });
}
