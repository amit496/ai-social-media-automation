import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  port: Number(process.env.PORT || 3000),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || '',
  metaAccessToken: process.env.META_ACCESS_TOKEN || '',
  metaPageId: process.env.META_PAGE_ID || '',
  metaInstagramAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID || '',
  metaInstagramImageUrl: process.env.META_INSTAGRAM_IMAGE_URL || '',
  autoPostEnabled: process.env.AUTO_POST_ENABLED !== 'false',
};
