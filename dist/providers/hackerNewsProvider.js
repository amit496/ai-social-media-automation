"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const baseProvider_1 = require("./baseProvider");
const hackerNewsUrl = 'https://news.ycombinator.com/';
class HackerNewsProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'Hacker News';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(hackerNewsUrl, { timeout: 15000 });
        const html = response.data;
        const $ = (0, cheerio_1.load)(html);
        const rows = $('.athing').slice(0, 15).toArray();
        return rows.map((row, index) => {
            const title = $(row).find('.titleline > a').text();
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: 82 - index * 2,
                popularity: 80 - index * 2,
                freshness: 80 - index * 2,
                engagementPotential: 90 - index * 2,
                searchInterest: 70 - index * 2,
            };
        });
    }
}
exports.default = HackerNewsProvider;
