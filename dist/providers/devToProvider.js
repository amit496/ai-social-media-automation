"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const baseProvider_1 = require("./baseProvider");
const devToUrl = 'https://dev.to/api/articles?top=1&page=1&per_page=12';
class DevToProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'Dev.to';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(devToUrl, { timeout: 15000 });
        const articles = Array.isArray(response.data) ? response.data : [];
        return articles.slice(0, 12).map((article, index) => {
            const record = article;
            const title = String(record.title || 'Dev.to Trend');
            const reactionsCount = Number(record.positive_reactions_count || 0);
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: Math.min(85, 45 + Math.round(reactionsCount / 5)),
                popularity: Math.min(85, 40 + Math.round(reactionsCount / 5)),
                freshness: 80 - index * 2,
                engagementPotential: Math.min(85, 45 + Math.round(reactionsCount / 4)),
                searchInterest: 70 + Math.round(Math.min(15, reactionsCount / 6)),
            };
        });
    }
}
exports.default = DevToProvider;
