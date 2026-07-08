"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaPublisherService = exports.MetaPublisherService = void 0;
const axios_1 = __importDefault(require("axios"));
const appConfig_1 = require("../config/appConfig");
const logger_1 = require("../utils/logger");
class MetaPublisherService {
    constructor() {
        this.graphApiBaseUrl = 'https://graph.facebook.com/v21.0';
    }
    async publishContent(platform, content) {
        if (platform === 'facebook') {
            return this.publishToFacebook(content);
        }
        return this.publishToInstagram(content);
    }
    async publishToFacebook(content) {
        const { metaPageId, metaAccessToken } = appConfig_1.appConfig;
        if (!metaPageId || !metaAccessToken) {
            logger_1.logger.warn('Meta Facebook publish skipped: missing META_PAGE_ID or META_ACCESS_TOKEN');
            return {
                success: false,
                message: 'Facebook credentials are not configured yet. Post was stored locally only.',
            };
        }
        const message = `${content.facebookPost}\n\n${content.hashtags.join(' ')}`.trim();
        try {
            const response = await axios_1.default.post(`${this.graphApiBaseUrl}/${metaPageId}/feed`, {
                message,
                access_token: metaAccessToken,
            }, {
                timeout: 30000,
            });
            return {
                success: true,
                externalId: response.data?.id,
                message: 'Published to Facebook successfully.',
            };
        }
        catch (error) {
            const message = error?.response?.data?.error?.message || error?.message || 'Facebook publish failed';
            logger_1.logger.error(`Facebook publish failed: ${message}`);
            return {
                success: false,
                message,
            };
        }
    }
    async publishToInstagram(content) {
        const { metaAccessToken, metaInstagramAccountId, metaInstagramImageUrl } = appConfig_1.appConfig;
        if (!metaAccessToken || !metaInstagramAccountId) {
            logger_1.logger.warn('Meta Instagram publish skipped: missing META_ACCESS_TOKEN or META_INSTAGRAM_ACCOUNT_ID');
            return {
                success: false,
                message: 'Instagram credentials are not configured yet. Post was stored locally only.',
            };
        }
        try {
            const imageUrl = metaInstagramImageUrl || 'https://placehold.co/1200x630/png?text=AI+Social+Media';
            const caption = `${content.instagramCaption}\n\n${content.hashtags.join(' ')}`.trim();
            const containerResponse = await axios_1.default.post(`${this.graphApiBaseUrl}/${metaInstagramAccountId}/media`, {
                image_url: imageUrl,
                caption,
                access_token: metaAccessToken,
                media_type: 'IMAGE',
            }, {
                timeout: 30000,
            });
            const creationId = containerResponse.data?.id;
            if (!creationId) {
                throw new Error('Instagram media container creation did not return an id');
            }
            await axios_1.default.post(`${this.graphApiBaseUrl}/${metaInstagramAccountId}/media_publish`, {
                creation_id: creationId,
                access_token: metaAccessToken,
            }, {
                timeout: 30000,
            });
            return {
                success: true,
                externalId: creationId,
                message: 'Published to Instagram successfully.',
            };
        }
        catch (error) {
            const message = error?.response?.data?.error?.message || error?.message || 'Instagram publish failed';
            logger_1.logger.error(`Instagram publish failed: ${message}`);
            return {
                success: false,
                message,
            };
        }
    }
}
exports.MetaPublisherService = MetaPublisherService;
exports.metaPublisherService = new MetaPublisherService();
