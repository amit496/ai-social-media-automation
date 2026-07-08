"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const baseProvider_1 = require("./baseProvider");
const trendsUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';
class GoogleTrendsProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'Google Trends';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(trendsUrl, { timeout: 15000 });
        const html = response.data;
        const $ = (0, cheerio_1.load)(html, { xmlMode: true });
        const items = $('item').slice(0, 15).toArray();
        return items.map((item, index) => {
            const title = $(item).find('title').first().text();
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: 85 - index * 2,
                popularity: 90 - index * 3,
                freshness: 95 - index * 3,
                engagementPotential: 85 - index * 2,
                searchInterest: 90 - index * 3,
            };
        });
    }
}
exports.default = GoogleTrendsProvider;
