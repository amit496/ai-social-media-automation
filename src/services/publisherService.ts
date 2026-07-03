import { SocialMediaContent, SocialMediaPlatform, PublishedPost, ScheduledPost } from '../types/domain';
import { logger } from '../utils/logger';
import { metaPublisherService } from './metaPublisherService';
import { mongoStorageService } from './mongoStorageService';

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

    await mongoStorageService.savePublishedPost(publishedPost);
    return publishedPost;
  }

  public async scheduleContent(
    topic: string,
    content: SocialMediaContent,
    platform: SocialMediaPlatform,
    scheduledFor: string,
  ): Promise<ScheduledPost> {
    logger.info(`Scheduling content for ${platform} at ${scheduledFor} for topic: ${topic}`);
    return mongoStorageService.saveScheduledPost({
      topic,
      content,
      platform,
      scheduledFor,
    });
  }

  public async getPublishedPosts(): Promise<PublishedPost[]> {
    return mongoStorageService.getPublishedPosts();
  }

  public async getScheduledPosts(): Promise<ScheduledPost[]> {
    return mongoStorageService.getScheduledPosts();
  }
}
