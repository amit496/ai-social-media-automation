import axios from 'axios';
import { load } from 'cheerio';
import { BaseProvider } from './baseProvider';
import { TrendingTopic } from '../types/domain';

const hackerNewsUrl = 'https://news.ycombinator.com/';

export default class HackerNewsProvider extends BaseProvider {
  public readonly sourceName = 'Hacker News';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(hackerNewsUrl, { timeout: 15000 });
    const html = response.data as string;
    const $ = load(html);
    const rows = $('.athing').slice(0, 15).toArray();

    return rows.map((row, index) => {
      const title = $(row).find('.titleline > a').text();
      const topic = this.buildTopic(title);
      return {
        ...topic,
        trendScore: 82 - index * 2,
        popularity: 80 - index * 2,
        freshness: 80 - index * 2,
        engagementPotential: 90 - index * 2,
        searchInterest: 70 - index * 2,
      };
    });
  }
}
