import DevToProvider from '../providers/devToProvider';
import GitHubTrendingProvider from '../providers/githubTrendingProvider';
import HackerNewsProvider from '../providers/hackerNewsProvider';
import { TrendProvider } from '../providers/provider';
import RedditProvider from '../providers/redditProvider';
import TechNewsProvider from '../providers/techNewsProvider';
import { TrendingTopic } from '../types/domain';

export default class TrendDiscoveryService {
  private readonly providers: TrendProvider[];

  constructor(providers: TrendProvider[] = []) {
    this.providers = providers.length
      ? providers
      : [
          new RedditProvider(),
          new HackerNewsProvider(),
          new GitHubTrendingProvider(),
          new DevToProvider(),
          new TechNewsProvider(),
        ];
  }

  public async discoverTrends(): Promise<TrendingTopic[]> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.fetchTopics()),
    );

    const allTopics = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

    if (allTopics.length === 0) {
      return [];
    }

    const dedupedTopics = this.deduplicateTopics(allTopics);
    return this.rankTopics(dedupedTopics).slice(0, 10);
  }

  private deduplicateTopics(topics: TrendingTopic[]): TrendingTopic[] {
    const normalized = new Map<string, TrendingTopic>();

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

  private rankTopics(topics: TrendingTopic[]): TrendingTopic[] {
    return topics
      .map((topic) => ({
        ...topic,
        trendScore:
          topic.popularity * 0.3 +
          topic.freshness * 0.25 +
          topic.engagementPotential * 0.25 +
          topic.searchInterest * 0.2,
      }))
      .sort((a, b) => b.trendScore - a.trendScore);
  }
}
