import axios from 'axios';
import { load } from 'cheerio';
import { BaseProvider } from './baseProvider';
import { TrendingTopic } from '../types/domain';

const trendsUrl = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';

export default class GoogleTrendsProvider extends BaseProvider {
  public readonly sourceName = 'Google Trends';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(trendsUrl, { timeout: 15000 });
    const html = response.data as string;
    const $ = load(html, { xmlMode: true });
    const items = $('item').slice(0, 15).toArray();

    return items.map((item, index) => {
      const title = $(item).find('title').first().text();
      const topic = this.buildTopic(title);
      return {
        ...topic,
        trendScore: 85 - index * 2,
        popularity: 90 - index * 3,
        freshness: 95 - index * 3,
        engagementPotential: 85 - index * 2,
        searchInterest: 90 - index * 3,
      };
    });
  }
}
