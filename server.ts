import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { errorHandler } from './server/middlewares/errorHandler';
import { connectDatabase } from './server/config/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global middlewares
  app.use(cors());
  app.use(express.json());

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
    console.log(`[Personal LMS Server] listening at http://0.0.0.0:${PORT}`);
    // Non-blocking database connection attempt after port 3000 is open
    connectDatabase().catch(() => {});
  });
}

startServer();
