import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectToDatabase } from './config/db.js';
import { logger } from './utils/logger.js';
import { validateEnv } from './config/validateEnv.js';

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    validateEnv();
    await connectToDatabase();
    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { 
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    });
    process.exit(1);
  }
}

startServer();


