import mongoose from 'mongoose';
import { appConfig } from './appConfig';
import { logger } from '../utils/logger';

let mongoConnectionAttempted = false;

export const connectMongo = async (): Promise<void> => {
  if (mongoConnectionAttempted) {
    return;
  }

  mongoConnectionAttempted = true;

  if (!appConfig.mongodbUri) {
    logger.warn('MONGODB_URI not configured; continuing without MongoDB');
    return;
  }

  try {
    await mongoose.connect(appConfig.mongodbUri, {
      dbName: 'ai_social_media_automation',
    });

    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.warn(`MongoDB connection skipped: ${(error as Error).message}`);
  }
};

export const isMongoAvailable = (): boolean => mongoose.connection.readyState === 1;
