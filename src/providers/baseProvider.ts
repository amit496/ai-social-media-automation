import { TrendingTopic } from '../types/domain';
import { TrendProvider, TrendSource } from './provider';

export abstract class BaseProvider implements TrendProvider {
  abstract sourceName: TrendSource;

  public abstract fetchTopics(): Promise<TrendingTopic[]>;

  protected buildTopic(title: string): TrendingTopic {
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
