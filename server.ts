import express from 'express';
import cors from 'cors';
import path from 'path';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { errorHandler } from './server/middlewares/errorHandler';
import { connectDatabase } from './server/config/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global middlewares
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes FIRST
  app.use('/api', apiRouter);

  // Global Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for development / Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✨ Planora LMS Platform v1.5.0 is running!`);
    console.log(`  ➜  Local:   http://localhost:${PORT}`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}`);
    console.log(`  ➜  Opening browser automatically at http://localhost:${PORT}...\n`);
    
    // Automatically open browser on local development machine
    if (process.env.NODE_ENV !== 'production' && !process.env.K_SERVICE) {
      const url = `http://localhost:${PORT}`;
      const platform = process.platform;
      try {
        if (platform === 'win32') {
          // On Windows, launch Chrome specifically, falling back to default browser
          exec(`start chrome "${url}" || start "" "${url}"`, () => {});
        } else if (platform === 'darwin') {
          // On macOS, launch Chrome specifically, falling back to default browser
          exec(`open -a "Google Chrome" "${url}" || open "${url}"`, () => {});
        } else if (process.env.DISPLAY) {
          // On Linux with active GUI display
          exec(`google-chrome "${url}" || xdg-open "${url}"`, () => {});
        }
      } catch {
        // Silently ignore if running in headless environment
      }
    }

    // Non-blocking database connection attempt after port 3000 is open
    connectDatabase().catch(() => {});
  });
}

startServer();
