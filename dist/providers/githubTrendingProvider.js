"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const baseProvider_1 = require("./baseProvider");
const githubUrl = 'https://github.com/trending';
class GitHubTrendingProvider extends baseProvider_1.BaseProvider {
    constructor() {
        super(...arguments);
        this.sourceName = 'GitHub Trending';
    }
    async fetchTopics() {
        const response = await axios_1.default.get(githubUrl, { timeout: 15000, headers: { Accept: 'text/html' } });
        const html = response.data;
        const $ = (0, cheerio_1.load)(html);
        const repos = $('article.Box-row').slice(0, 12).toArray();
        return repos.map((repo, index) => {
            const title = $(repo).find('h1 > a').text().replace(/\s+/g, ' ').trim();
            const topic = this.buildTopic(title);
            return {
                ...topic,
                trendScore: 78 - index * 2,
                popularity: 75 - index * 2,
                freshness: 80 - index * 2,
                engagementPotential: 78 - index * 2,
                searchInterest: 72 - index * 2,
            };
        });
    }
}
exports.default = GitHubTrendingProvider;
