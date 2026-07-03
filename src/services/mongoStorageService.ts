import { ScheduledPost, PublishedPost, SocialMediaContent } from '../types/domain';
import { ScheduledPostModel } from '../models/scheduledPostModel';
import { PublishedPostModel } from '../models/publishedPostModel';
import { logger } from '../utils/logger';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export class MongoStorageService {
  public async savePublishedPost(post: PublishedPost): Promise<PublishedPost> {
    const publishedPost = new PublishedPostModel(post);
    await publishedPost.save();
    return post;
  }

  public async getPublishedPosts(): Promise<PublishedPost[]> {
    return PublishedPostModel.find().lean();
  }

  public async saveScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): Promise<ScheduledPost> {
    const scheduledPost: ScheduledPost = {
      id: createId(),
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      ...post,
    };

    const scheduled = new ScheduledPostModel(scheduledPost);
    await scheduled.save();
    logger.info(`Scheduled post queued: ${scheduledPost.id}`);
    return scheduledPost;
  }

  public async getScheduledPosts(): Promise<ScheduledPost[]> {
    return ScheduledPostModel.find().lean();
  }

  public async getPendingScheduledPosts(): Promise<ScheduledPost[]> {
    return ScheduledPostModel.find({ status: 'scheduled' }).lean();
  }

  public async updateScheduledPostStatus(id: string, status: ScheduledPost['status']): Promise<ScheduledPost | null> {
    return ScheduledPostModel.findOneAndUpdate({ id }, { status }, { new: true }).lean();
  }
}

export const mongoStorageService = new MongoStorageService();
