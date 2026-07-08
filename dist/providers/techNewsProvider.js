"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const baseProvider_1 = require("./baseProvider");
const feedUrl = 'https://techcrunch.com/feed/';
class TechNewsProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'Tech News';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(feedUrl, { timeout: 15000 });
        const html = response.data;
        const $ = (0, cheerio_1.load)(html, { xmlMode: true });
        const items = $('item').slice(0, 12).toArray();
        return items.map((item, index) => {
            const title = $(item).find('title').first().text();
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: 74 - index * 2,
                popularity: 70 - index * 2,
                freshness: 88 - index * 2,
                engagementPotential: 76 - index * 2,
                searchInterest: 74 - index * 2,
            };
        });
    }
}
exports.default = TechNewsProvider;
