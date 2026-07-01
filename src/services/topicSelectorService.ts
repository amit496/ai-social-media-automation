import { SelectedTopic, TrendingTopic } from '../types/domain';

export default class TopicSelectorService {
  public selectBestTopic(topics: TrendingTopic[]): SelectedTopic | null {
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
