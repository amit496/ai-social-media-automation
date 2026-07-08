"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMongoAvailable = exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appConfig_1 = require("./appConfig");
const logger_1 = require("../utils/logger");
let mongoConnectionAttempted = false;
const connectMongo = async () => {
    if (mongoConnectionAttempted) {
        return;
    }
    mongoConnectionAttempted = true;
    if (!appConfig_1.appConfig.mongodbUri) {
        logger_1.logger.warn('MONGODB_URI not configured; continuing without MongoDB');
        return;
    }
    try {
        await mongoose_1.default.connect(appConfig_1.appConfig.mongodbUri, {
            dbName: 'ai_social_media_automation',
        });
        logger_1.logger.info('Connected to MongoDB');
    }
    catch (error) {
        logger_1.logger.warn(`MongoDB connection skipped: ${error.message}`);
    }
};
exports.connectMongo = connectMongo;
const isMongoAvailable = () => mongoose_1.default.connection.readyState === 1;
exports.isMongoAvailable = isMongoAvailable;
