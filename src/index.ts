import express, { Express } from 'express';
import { appConfig } from './config/appConfig';
import trendingRoutes from './routes/trendingRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { notFoundMiddleware } from './middleware/notFoundMiddleware';
import { logger } from './utils/logger';
import { schedulerService } from './services/schedulerService';

const app: Express = express();
const port = appConfig.port;

app.use(express.json());
app.use('/api', trendingRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`AI Social Media Automation API running on http://localhost:${port}`);

  setInterval(() => {
    schedulerService.runPendingScheduledPosts().catch((err) => {
      logger.error(`Scheduled post runner failed: ${err.message}`);
    });
  }, 60_000);
});
