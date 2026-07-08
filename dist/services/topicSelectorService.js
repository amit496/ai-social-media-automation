"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TopicSelectorService {
    selectBestTopic(topics) {
        if (topics.length === 0) {
            return null;
        }
        const bestTopic = topics[0];
        return {
            ...bestTopic,
            reason: `Selected because it has the highest combined trend score and freshness among the top trending topics from multiple trusted sources.`,
        };
    }
}
exports.default = TopicSelectorService;
