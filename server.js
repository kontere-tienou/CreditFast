import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildIndexHtml } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build index.html from modular views on server start
try {
  buildIndexHtml();
} catch (err) {
  console.error('Error compiling index.html from views:', err);
}

const app = express();
const PORT = 3000;

// Serve static assets from root directory
app.use(express.static(__dirname));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CreditFast server running at http://0.0.0.0:${PORT}`);
});

