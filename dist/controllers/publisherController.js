"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedPosts = exports.getScheduledPosts = exports.publishContent = void 0;
const aiGeneratorService_1 = __importDefault(require("../services/aiGeneratorService"));
const publisherService_1 = __importDefault(require("../services/publisherService"));
const publisherService = new publisherService_1.default();
const aiGeneratorService = new aiGeneratorService_1.default();
const publishContent = async (req, res) => {
    try {
        const { topic, platform, scheduleFor, daily } = req.body;
        if (!topic || !platform) {
            return res.status(400).json({ success: false, error: 'topic and platform are required' });
        }
        const socialContent = await aiGeneratorService.generateSocialMediaContent(topic);
        if (scheduleFor || daily) {
            const scheduledForValue = scheduleFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const scheduledPost = await publisherService.scheduleContent(topic, socialContent, platform, scheduledForValue);
            return res.json({ success: true, data: scheduledPost });
        }
        const publishedPost = await publisherService.publishContent(topic, socialContent, platform);
        return res.json({ success: true, data: publishedPost });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error?.message || 'Failed to publish content' });
    }
};
exports.publishContent = publishContent;
const getScheduledPosts = async (req, res) => {
    const scheduledPosts = await publisherService.getScheduledPosts();
    return res.json({ success: true, data: scheduledPosts });
};
exports.getScheduledPosts = getScheduledPosts;
const getPublishedPosts = async (req, res) => {
    const publishedPosts = await publisherService.getPublishedPosts();
    return res.json({ success: true, data: publishedPosts });
};
exports.getPublishedPosts = getPublishedPosts;
