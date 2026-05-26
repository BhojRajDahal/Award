import 'dotenv/config';  // replaces require("dotenv").config()
import app from './src/app.js'; // updated path to actual location
import { logger } from './src/config/logger.js';
import { redisClient } from './src/services/cacheService.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server running');
});

const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(async () => {
        if (redisClient) {
            try {
                await redisClient.quit();
            } catch (_e) {}
        }
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
