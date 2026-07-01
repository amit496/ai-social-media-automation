import express from 'express';
import { getTrendingTopics, getBestTopic, getHealth, generateContent } from '../controllers/trendingController';
import { publishContent, getPublishedPosts, getScheduledPosts } from '../controllers/publisherController';
import { validateGeneratePayload, validatePublishPayload } from '../middleware/requestValidation';

const router = express.Router();

router.get('/health', getHealth);
router.get('/trending', getTrendingTopics);
router.get('/topic', getBestTopic);
router.post('/generate', validateGeneratePayload, generateContent);
router.post('/publish', validatePublishPayload, publishContent);
router.get('/published', getPublishedPosts);
router.get('/scheduled', getScheduledPosts);

export default router;
