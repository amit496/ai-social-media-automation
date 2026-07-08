"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const metaPublisherService_1 = require("./metaPublisherService");
const mongoStorageService_1 = require("./mongoStorageService");
class PublisherService {
    async publishContent(topic, content, platform) {
        logger_1.logger.info(`Publishing content to ${platform} for topic: ${topic}`);
        const publishResult = await metaPublisherService_1.metaPublisherService.publishContent(platform, content);
        const publishedPost = {
            id: `${Date.now()}-${platform}`,
            topic,
            platform,
            content,
            publishedAt: new Date().toISOString(),
            status: 'published',
            externalId: publishResult.externalId,
            publishMessage: publishResult.message,
        };
        await mongoStorageService_1.mongoStorageService.savePublishedPost(publishedPost);
        return publishedPost;
    }
    async scheduleContent(topic, content, platform, scheduledFor) {
        logger_1.logger.info(`Scheduling content for ${platform} at ${scheduledFor} for topic: ${topic}`);
        return mongoStorageService_1.mongoStorageService.saveScheduledPost({
            topic,
            content,
            platform,
            scheduledFor,
        });
    }
    async getPublishedPosts() {
        return mongoStorageService_1.mongoStorageService.getPublishedPosts();
    }
    async getScheduledPosts() {
        return mongoStorageService_1.mongoStorageService.getScheduledPosts();
    }
}
exports.default = PublisherService;
