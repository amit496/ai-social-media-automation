"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const logger_1 = require("../utils/logger");
function createId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}
class StorageService {
    constructor() {
        this.publishedPosts = [];
        this.scheduledPosts = [];
    }
    savePublishedPost(post) {
        this.publishedPosts.push(post);
        return post;
    }
    getPublishedPosts() {
        return [...this.publishedPosts];
    }
    saveScheduledPost(post) {
        const scheduledPost = {
            id: createId(),
            createdAt: new Date().toISOString(),
            status: 'scheduled',
            ...post,
        };
        this.scheduledPosts.push(scheduledPost);
        logger_1.logger.info(`Scheduled post queued: ${scheduledPost.id}`);
        return scheduledPost;
    }
    getScheduledPosts() {
        return [...this.scheduledPosts];
    }
    getPendingScheduledPosts() {
        return this.scheduledPosts.filter((schedule) => schedule.status === 'scheduled');
    }
    updateScheduledPostStatus(id, status) {
        const schedule = this.scheduledPosts.find((item) => item.id === id);
        if (!schedule) {
            return undefined;
        }
        schedule.status = status;
        return schedule;
    }
}
exports.StorageService = StorageService;
exports.storageService = new StorageService();
