import { TrendingTopic } from '../types/domain';

export type TrendSource = 'Google Trends' | 'Hacker News' | 'Reddit' | 'GitHub Trending' | 'Dev.to' | 'Tech News';

export interface TrendProvider {
  sourceName: TrendSource;
  fetchTopics(): Promise<TrendingTopic[]>;
}
