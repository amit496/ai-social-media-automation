import mongoose from 'mongoose';
import { appConfig } from './appConfig';
import { logger } from '../utils/logger';

export const connectMongo = async (): Promise<void> => {
  if (!appConfig.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(appConfig.mongodbUri, {
    dbName: 'ai_social_media_automation',
  });

  logger.info('Connected to MongoDB');
};
