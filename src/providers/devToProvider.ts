import axios from 'axios';
import { TrendingTopic } from '../types/domain';
import { BaseProvider } from './baseProvider';

const devToUrl = 'https://dev.to/api/articles?top=1&page=1&per_page=12';

export default class DevToProvider extends BaseProvider {
  public readonly sourceName = 'Dev.to';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(devToUrl, { timeout: 15000 });
    const articles = Array.isArray(response.data) ? (response.data as unknown[]) : [];

    return articles.slice(0, 12).map((article, index) => {
      const record = article as Record<string, unknown>;
      const title = String(record.title || 'Dev.to Trend');
      const reactionsCount = Number(record.positive_reactions_count || 0);
      const topic = this.buildTopic(title);

      return {
        ...topic,
        trendScore: Math.min(85, 45 + Math.round(reactionsCount / 5)),
        popularity: Math.min(85, 40 + Math.round(reactionsCount / 5)),
        freshness: 80 - index * 2,
        engagementPotential: Math.min(85, 45 + Math.round(reactionsCount / 4)),
        searchInterest: 70 + Math.round(Math.min(15, reactionsCount / 6)),
      };
    });
  }
}
