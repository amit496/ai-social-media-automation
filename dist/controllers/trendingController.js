"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = exports.getHealth = exports.getBestTopic = exports.getTrendingTopics = void 0;
const aiGeneratorService_1 = __importDefault(require("../services/aiGeneratorService"));
const topicSelectorService_1 = __importDefault(require("../services/topicSelectorService"));
const trendDiscoveryService_1 = __importDefault(require("../services/trendDiscoveryService"));
const trendDiscoveryService = new trendDiscoveryService_1.default();
const topicSelectorService = new topicSelectorService_1.default();
const aiGeneratorService = new aiGeneratorService_1.default();
const getTrendingTopics = async (req, res) => {
    const topics = await trendDiscoveryService.discoverTrends();
    return res.json({ success: true, data: topics });
};
exports.getTrendingTopics = getTrendingTopics;
const getBestTopic = async (req, res) => {
    const topics = await trendDiscoveryService.discoverTrends();
    const selectedTopic = topicSelectorService.selectBestTopic(topics);
    return res.json({ success: true, data: selectedTopic });
};
exports.getBestTopic = getBestTopic;
const getHealth = async (req, res) => {
    return res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
};
exports.getHealth = getHealth;
const generateContent = async (req, res) => {
    try {
        const topic = req.body.topic;
        const finalTopic = topic || (await topicSelectorService.selectBestTopic(await trendDiscoveryService.discoverTrends()))?.title;
        if (!finalTopic) {
            return res.status(400).json({ success: false, error: 'Unable to select a topic for content generation' });
        }
        const result = await aiGeneratorService.generateSocialMediaContent(finalTopic);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        const statusCode = error?.statusCode || 500;
        const message = error?.message || 'Failed to generate content';
        if (statusCode === 503) {
            return res.status(503).json({
                success: false,
                error: 'Gemini API is temporarily unavailable. Please try again in a moment.'
            });
        }
        return res.status(statusCode).json({ success: false, error: message });
    }
};
exports.generateContent = generateContent;
