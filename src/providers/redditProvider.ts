import axios from 'axios';
import { TrendingTopic } from '../types/domain';
import { BaseProvider } from './baseProvider';

const redditUrl = 'https://www.reddit.com/r/programming/top.json?t=day&limit=12';

export default class RedditProvider extends BaseProvider {
  public readonly sourceName = 'Reddit';

  public async fetchTopics(): Promise<TrendingTopic[]> {
    const response = await axios.get(redditUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AI-Social-Media-Automation/1.0',
      },
    });
    const data = response.data as Record<string, unknown>;
    const posts = Array.isArray((data.data as Record<string, unknown>)?.children)
      ? ((data.data as Record<string, unknown>)?.children as unknown[])
      : [];

    return posts.slice(0, 12).map((item, index) => {
      const postData = (item as Record<string, unknown>).data as Record<string, unknown>;
      const title = String(postData.title || 'Untitled');
      const score = Number(postData.score || 0);
      const topic = this.buildTopic(title);

      return {
        ...topic,
        trendScore: Math.min(90, 40 + Math.round(score / 40)),
        popularity: Math.min(90, 30 + Math.round(score / 50)),
        freshness: 85 - index * 2,
        engagementPotential: Math.min(90, 50 + Math.round(score / 50)),
        searchInterest: 70 + Math.round(Math.min(20, score / 30)),
      };
    });
  }
}
