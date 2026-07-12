"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.appConfig = {
    port: Number(process.env.PORT || 3000),
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    mongodbUri: process.env.MONGODB_URI || '',
    metaAccessToken: process.env.META_ACCESS_TOKEN || '',
    metaPageId: process.env.META_PAGE_ID || '',
    metaInstagramAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID || '',
    metaInstagramImageUrl: process.env.META_INSTAGRAM_IMAGE_URL || '',
    autoPostEnabled: process.env.AUTO_POST_ENABLED !== 'false',
};
