import axios from 'axios';
import { load } from 'cheerio';
import { BaseProvider } from './baseProvider';
import { TrendingTopic } from '../types/domain';

const githubUrl = 'https://github.com/trending';

export default class GitHubTrendingProvider extends BaseProvider {
  public readonly sourceName = 'GitHub Trending';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(githubUrl, { timeout: 15000, headers: { Accept: 'text/html' } });
    const html = response.data as string;
    const $ = load(html);
    const repos = $('article.Box-row').slice(0, 12).toArray();

    return repos.map((repo, index) => {
      const title = $(repo).find('h1 > a').text().replace(/\s+/g, ' ').trim();
      const topic = this.buildTopic(title);
      return {
        ...topic,
        trendScore: 78 - index * 2,
        popularity: 75 - index * 2,
        freshness: 80 - index * 2,
        engagementPotential: 78 - index * 2,
        searchInterest: 72 - index * 2,
      };
    });
  }
}
