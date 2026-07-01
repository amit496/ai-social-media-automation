import { PublishedPost, ScheduledPost, SocialMediaContent, SocialMediaPlatform } from '../types/domain';
import { logger } from '../utils/logger';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export class StorageService {
  private publishedPosts: PublishedPost[] = [];
  private scheduledPosts: ScheduledPost[] = [];

  public savePublishedPost(post: PublishedPost): PublishedPost {
    this.publishedPosts.push(post);
    return post;
  }

  public getPublishedPosts(): PublishedPost[] {
    return [...this.publishedPosts];
  }

  public saveScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): ScheduledPost {
    const scheduledPost: ScheduledPost = {
      id: createId(),
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      ...post,
    };
    this.scheduledPosts.push(scheduledPost);
    logger.info(`Scheduled post queued: ${scheduledPost.id}`);
    return scheduledPost;
  }

  public getScheduledPosts(): ScheduledPost[] {
    return [...this.scheduledPosts];
  }

  public getPendingScheduledPosts(): ScheduledPost[] {
    return this.scheduledPosts.filter((schedule) => schedule.status === 'scheduled');
  }

  public updateScheduledPostStatus(id: string, status: ScheduledPost['status']): ScheduledPost | undefined {
    const schedule = this.scheduledPosts.find((item) => item.id === id);
    if (!schedule) {
      return undefined;
    }

    schedule.status = status;
    return schedule;
  }
}

export const storageService = new StorageService();
