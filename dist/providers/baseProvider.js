"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
class BaseProvider {
    buildTopic(title) {
        const normalizedTitle = title.trim();
        return {
            title: normalizedTitle,
            source: this.sourceName,
            trendScore: 0,
            popularity: 0,
            engagementPotential: 0,
            freshness: 0,
            searchInterest: 0,
        };
    }
}
exports.BaseProvider = BaseProvider;
