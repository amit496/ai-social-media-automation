"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const baseProvider_1 = require("./baseProvider");
const redditUrl = 'https://www.reddit.com/r/programming/top.json?t=day&limit=12';
class RedditProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'Reddit';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(redditUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'AI-Social-Media-Automation/1.0',
            },
        });
        const data = response.data;
        const posts = Array.isArray(data.data?.children)
            ? data.data?.children
            : [];
        return posts.slice(0, 12).map((item, index) => {
            const postData = item.data;
            const title = String(postData.title || 'Untitled');
            const score = Number(postData.score || 0);
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: Math.min(90, 40 + Math.round(score / 40)),
                popularity: Math.min(90, 30 + Math.round(score / 50)),
                freshness: 85 - index * 2,
                engagementPotential: Math.min(90, 50 + Math.round(score / 50)),
                searchInterest: 70 + Math.round(Math.min(20, score / 30)),
            };
        });
    }
}
exports.default = RedditProvider;
