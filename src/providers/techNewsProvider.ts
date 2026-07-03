import axios from 'axios';
import { load } from 'cheerio';
import { TrendingTopic } from '../types/domain';
import { BaseProvider } from './baseProvider';

const feedUrl = 'https://techcrunch.com/feed/';

export default class TechNewsProvider extends BaseProvider {
  public readonly sourceName = 'Tech News';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(feedUrl, { timeout: 15000 });
    const html = response.data as string;
    const $ = load(html, { xmlMode: true });
    const items = $('item').slice(0, 12).toArray();

    return items.map((item, index) => {
      const title = $(item).find('title').first().text();
      const topic = this.buildTopic(title);
      return {
        ...topic,
        trendScore: 74 - index * 2,
        popularity: 70 - index * 2,
        freshness: 88 - index * 2,
        engagementPotential: 76 - index * 2,
        searchInterest: 74 - index * 2,
      };
    });
  }
}
