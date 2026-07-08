"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoStorageService = exports.MongoStorageService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const scheduledPostModel_1 = require("../models/scheduledPostModel");
const publishedPostModel_1 = require("../models/publishedPostModel");
const logger_1 = require("../utils/logger");
const appConfig_1 = require("../config/appConfig");
function createId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}
class MongoStorageService {
    constructor() {
        this.inMemoryPublishedPosts = [];
        this.inMemoryScheduledPosts = [];
    }
    isMongoReady() {
        return Boolean(appConfig_1.appConfig.mongodbUri) && mongoose_1.default.connection.readyState === 1;
    }
    async savePublishedPost(post) {
        const mongoReady = this.isMongoReady();
        logger_1.logger.info(`[DEBUG] savePublishedPost - MongoDB Ready: ${mongoReady}, URI: ${appConfig_1.appConfig.mongodbUri ? 'set' : 'not set'}, Connection State: ${mongoose_1.default.connection.readyState}`);
        if (!mongoReady) {
            this.inMemoryPublishedPosts.push(post);
            logger_1.logger.warn(`[DEBUG] MongoDB not available; saved to in-memory. In-memory count: ${this.inMemoryPublishedPosts.length}`);
            return post;
        }
        try {
            const publishedPost = new publishedPostModel_1.PublishedPostModel(post);
            await publishedPost.save();
            logger_1.logger.info(`[DEBUG] Successfully saved to MongoDB: ${post.id}`);
            return post;
        }
        catch (error) {
            logger_1.logger.warn(`[DEBUG] MongoDB publish save failed; using in-memory fallback: ${error.message}`);
            this.inMemoryPublishedPosts.push(post);
            logger_1.logger.warn(`[DEBUG] In-memory count after fallback: ${this.inMemoryPublishedPosts.length}`);
            return post;
        }
    }
    async getPublishedPosts() {
        const mongoReady = this.isMongoReady();
        logger_1.logger.info(`[DEBUG] getPublishedPosts - MongoDB Ready: ${mongoReady}, Connection State: ${mongoose_1.default.connection.readyState}`);
        if (!mongoReady) {
            logger_1.logger.info(`[DEBUG] Returning in-memory posts: ${this.inMemoryPublishedPosts.length} posts`);
            return this.inMemoryPublishedPosts;
        }
        try {
            const posts = await publishedPostModel_1.PublishedPostModel.find().lean();
            logger_1.logger.info(`[DEBUG] MongoDB find() returned: ${posts.length} posts`);
            return posts;
        }
        catch (error) {
            logger_1.logger.warn(`[DEBUG] MongoDB published posts read failed: ${error.message}`);
            logger_1.logger.info(`[DEBUG] Falling back to in-memory: ${this.inMemoryPublishedPosts.length} posts`);
            return this.inMemoryPublishedPosts;
        }
    }
    async saveScheduledPost(post) {
        const scheduledPost = {
            id: createId(),
            createdAt: new Date().toISOString(),
            status: 'scheduled',
            ...post,
        };
        if (!this.isMongoReady()) {
            this.inMemoryScheduledPosts.push(scheduledPost);
            logger_1.logger.warn('MongoDB not available; saved scheduled post in memory');
            return scheduledPost;
        }
        try {
            const scheduled = new scheduledPostModel_1.ScheduledPostModel(scheduledPost);
            await scheduled.save();
            logger_1.logger.info(`Scheduled post queued: ${scheduledPost.id}`);
            return scheduledPost;
        }
        catch (error) {
            logger_1.logger.warn(`MongoDB scheduled save failed; using in-memory fallback: ${error.message}`);
            this.inMemoryScheduledPosts.push(scheduledPost);
            return scheduledPost;
        }
    }
    async getScheduledPosts() {
        if (!this.isMongoReady()) {
            return this.inMemoryScheduledPosts;
        }
        try {
            return await scheduledPostModel_1.ScheduledPostModel.find().lean();
        }
        catch (error) {
            logger_1.logger.warn(`MongoDB scheduled posts read failed: ${error.message}`);
            return this.inMemoryScheduledPosts;
        }
    }
    async getPendingScheduledPosts() {
        if (!this.isMongoReady()) {
            return this.inMemoryScheduledPosts.filter((post) => post.status === 'scheduled');
        }
        try {
            return await scheduledPostModel_1.ScheduledPostModel.find({ status: 'scheduled' }).lean();
        }
        catch (error) {
            logger_1.logger.warn(`MongoDB pending scheduled posts read failed: ${error.message}`);
            return this.inMemoryScheduledPosts.filter((post) => post.status === 'scheduled');
        }
    }
    async updateScheduledPostStatus(id, status) {
        if (!this.isMongoReady()) {
            const target = this.inMemoryScheduledPosts.find((post) => post.id === id);
            if (!target) {
                return null;
            }
            target.status = status;
            return target;
        }
        try {
            return scheduledPostModel_1.ScheduledPostModel.findOneAndUpdate({ id }, { status }, { new: true }).lean();
        }
        catch (error) {
            logger_1.logger.warn(`MongoDB scheduled status update failed: ${error.message}`);
            const target = this.inMemoryScheduledPosts.find((post) => post.id === id);
            if (!target) {
                return null;
            }
            target.status = status;
            return target;
        }
    }
}
exports.MongoStorageService = MongoStorageService;
exports.mongoStorageService = new MongoStorageService();
