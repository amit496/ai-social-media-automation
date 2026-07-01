import { SocialMediaContent, SocialMediaPlatform, PublishedPost, ScheduledPost } from '../types/domain';
import { logger } from '../utils/logger';
import { storageService } from './storageService';
import { metaPublisherService } from './metaPublisherService';

export default class PublisherService {
  public async publishContent(
    topic: string,
    content: SocialMediaContent,
    platform: SocialMediaPlatform,
  ): Promise<PublishedPost> {
    logger.info(`Publishing content to ${platform} for topic: ${topic}`);

    const publishResult = await metaPublisherService.publishContent(platform, content);

    const publishedPost: PublishedPost = {
      id: `${Date.now()}-${platform}`,
      topic,
      platform,
      content,
      publishedAt: new Date().toISOString(),
      status: 'published',
      externalId: publishResult.externalId,
      publishMessage: publishResult.message,
    };

    return storageService.savePublishedPost(publishedPost);
  }

  public async scheduleContent(
    topic: string,
    content: SocialMediaContent,
    platform: SocialMediaPlatform,
    scheduledFor: string,
  ): Promise<ScheduledPost> {
    logger.info(`Scheduling content for ${platform} at ${scheduledFor} for topic: ${topic}`);
    return storageService.saveScheduledPost({
      topic,
      content,
      platform,
      scheduledFor,
    });
  }

  public getPublishedPosts(): PublishedPost[] {
    return storageService.getPublishedPosts();
  }

  public getScheduledPosts(): ScheduledPost[] {
    return storageService.getScheduledPosts();
  }
}
