import express, { Express } from 'express';
import { appConfig } from './config/appConfig';
import { connectMongo } from './config/mongo';
import { errorMiddleware } from './middleware/errorMiddleware';
import { notFoundMiddleware } from './middleware/notFoundMiddleware';
import trendingRoutes from './routes/trendingRoutes';
import { schedulerService } from './services/schedulerService';
import { autoPostService } from './services/autoPostService';
import { logger } from './utils/logger';

export const createApp = (): Express => {
  const app: Express = express();

  app.use(express.json());
  app.use('/api', trendingRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

export const startServer = async (): Promise<void> => {
  await connectMongo();

  const app = createApp();
  const port = appConfig.port;

  app.listen(port, () => {
    logger.info(`AI Social Media Automation API running on http://localhost:${port}`);

    setInterval(() => {
      schedulerService.runPendingScheduledPosts().catch((err) => {
        logger.error(`Scheduled post runner failed: ${err.message}`);
      });
    }, 60_000);

    if (appConfig.autoPostEnabled) {
      autoPostService.start();
    } else {
      logger.info('Auto-posting is disabled via AUTO_POST_ENABLED=false');
    }
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    logger.error(`Server failed to start: ${err.message}`);
    process.exit(1);
  });
}
