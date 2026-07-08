"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerService = exports.SchedulerService = void 0;
const logger_1 = require("../utils/logger");
const publisherService_1 = __importDefault(require("./publisherService"));
const mongoStorageService_1 = require("./mongoStorageService");
const publisherService = new publisherService_1.default();
class SchedulerService {
    async runPendingScheduledPosts() {
        const pending = await mongoStorageService_1.mongoStorageService.getPendingScheduledPosts();
        const now = new Date().toISOString();
        for (const schedule of pending) {
            if (schedule.scheduledFor <= now) {
                logger_1.logger.info(`Executing scheduled post ${schedule.id}`);
                await publisherService.publishContent(schedule.topic, schedule.content, schedule.platform);
                await mongoStorageService_1.mongoStorageService.updateScheduledPostStatus(schedule.id, 'published');
            }
        }
    }
}
exports.SchedulerService = SchedulerService;
exports.schedulerService = new SchedulerService();
