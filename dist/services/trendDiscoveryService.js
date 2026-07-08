"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const devToProvider_1 = __importDefault(require("../providers/devToProvider"));
const githubTrendingProvider_1 = __importDefault(require("../providers/githubTrendingProvider"));
const hackerNewsProvider_1 = __importDefault(require("../providers/hackerNewsProvider"));
const redditProvider_1 = __importDefault(require("../providers/redditProvider"));
const techNewsProvider_1 = __importDefault(require("../providers/techNewsProvider"));
class TrendDiscoveryService {
    constructor(providers = []) {
        this.providers = providers.length
            ? providers
            : [
                new redditProvider_1.default(),
                new hackerNewsProvider_1.default(),
                new githubTrendingProvider_1.default(),
                new devToProvider_1.default(),
                new techNewsProvider_1.default(),
            ];
    }
    async discoverTrends() {
        const results = await Promise.allSettled(this.providers.map((provider) => provider.fetchTopics()));
        const allTopics = results
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
        if (allTopics.length === 0) {
            return [];
        }
        const dedupedTopics = this.deduplicateTopics(allTopics);
        return this.rankTopics(dedupedTopics).slice(0, 10);
    }
    deduplicateTopics(topics) {
        const normalized = new Map();
        topics.forEach((topic) => {
            const key = topic.title.trim().toLowerCase();
            const existing = normalized.get(key);
            if (!existing) {
                normalized.set(key, topic);
                return;
            }
            normalized.set(key, {
                ...existing,
                popularity: Math.max(existing.popularity, topic.popularity),
                freshness: Math.max(existing.freshness, topic.freshness),
                engagementPotential: Math.max(existing.engagementPotential, topic.engagementPotential),
                searchInterest: Math.max(existing.searchInterest, topic.searchInterest),
                trendScore: Math.max(existing.trendScore, topic.trendScore),
            });
        });
        return Array.from(normalized.values());
    }
    rankTopics(topics) {
        return topics
            .map((topic) => ({
            ...topic,
            trendScore: topic.popularity * 0.3 +
                topic.freshness * 0.25 +
                topic.engagementPotential * 0.25 +
                topic.searchInterest * 0.2,
        }))
            .sort((a, b) => b.trendScore - a.trendScore);
    }
}
exports.default = TrendDiscoveryService;
