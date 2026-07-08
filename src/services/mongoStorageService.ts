import mongoose from 'mongoose';
import { ScheduledPost, PublishedPost } from '../types/domain';
import { ScheduledPostModel } from '../models/scheduledPostModel';
import { PublishedPostModel } from '../models/publishedPostModel';
import { logger } from '../utils/logger';
import { appConfig } from '../config/appConfig';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export class MongoStorageService {
  private readonly inMemoryPublishedPosts: PublishedPost[] = [];
  private readonly inMemoryScheduledPosts: ScheduledPost[] = [];

  private isMongoReady(): boolean {
    return Boolean(appConfig.mongodbUri) && mongoose.connection.readyState === 1;
  }

  public async savePublishedPost(post: PublishedPost): Promise<PublishedPost> {
    const mongoReady = this.isMongoReady();
    logger.info(`[DEBUG] savePublishedPost - MongoDB Ready: ${mongoReady}, URI: ${appConfig.mongodbUri ? 'set' : 'not set'}, Connection State: ${mongoose.connection.readyState}`);

    if (!mongoReady) {
      this.inMemoryPublishedPosts.push(post);
      logger.warn(`[DEBUG] MongoDB not available; saved to in-memory. In-memory count: ${this.inMemoryPublishedPosts.length}`);
      return post;
    }

    try {
      const publishedPost = new PublishedPostModel(post);
      await publishedPost.save();
      logger.info(`[DEBUG] Successfully saved to MongoDB: ${post.id}`);
      return post;
    } catch (error) {
      logger.warn(`[DEBUG] MongoDB publish save failed; using in-memory fallback: ${(error as Error).message}`);
      this.inMemoryPublishedPosts.push(post);
      logger.warn(`[DEBUG] In-memory count after fallback: ${this.inMemoryPublishedPosts.length}`);
      return post;
    }
  }

  public async getPublishedPosts(): Promise<PublishedPost[]> {
    const mongoReady = this.isMongoReady();
    logger.info(`[DEBUG] getPublishedPosts - MongoDB Ready: ${mongoReady}, Connection State: ${mongoose.connection.readyState}`);

    if (!mongoReady) {
      logger.info(`[DEBUG] Returning in-memory posts: ${this.inMemoryPublishedPosts.length} posts`);
      return this.inMemoryPublishedPosts;
    }

    try {
      const posts = await PublishedPostModel.find().lean();
      logger.info(`[DEBUG] MongoDB find() returned: ${posts.length} posts`);
      return posts;
    } catch (error) {
      logger.warn(`[DEBUG] MongoDB published posts read failed: ${(error as Error).message}`);
      logger.info(`[DEBUG] Falling back to in-memory: ${this.inMemoryPublishedPosts.length} posts`);
      return this.inMemoryPublishedPosts;
    }
  }

  public async saveScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): Promise<ScheduledPost> {
    const scheduledPost: ScheduledPost = {
      id: createId(),
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      ...post,
    };

    if (!this.isMongoReady()) {
      this.inMemoryScheduledPosts.push(scheduledPost);
      logger.warn('MongoDB not available; saved scheduled post in memory');
      return scheduledPost;
    }

    try {
      const scheduled = new ScheduledPostModel(scheduledPost);
      await scheduled.save();
      logger.info(`Scheduled post queued: ${scheduledPost.id}`);
      return scheduledPost;
    } catch (error) {
      logger.warn(`MongoDB scheduled save failed; using in-memory fallback: ${(error as Error).message}`);
      this.inMemoryScheduledPosts.push(scheduledPost);
      return scheduledPost;
    }
  }

  public async getScheduledPosts(): Promise<ScheduledPost[]> {
    if (!this.isMongoReady()) {
      return this.inMemoryScheduledPosts;
    }

    try {
      return await ScheduledPostModel.find().lean();
    } catch (error) {
      logger.warn(`MongoDB scheduled posts read failed: ${(error as Error).message}`);
      return this.inMemoryScheduledPosts;
    }
  }

  public async getPendingScheduledPosts(): Promise<ScheduledPost[]> {
    if (!this.isMongoReady()) {
      return this.inMemoryScheduledPosts.filter((post) => post.status === 'scheduled');
    }

    try {
      return await ScheduledPostModel.find({ status: 'scheduled' }).lean();
    } catch (error) {
      logger.warn(`MongoDB pending scheduled posts read failed: ${(error as Error).message}`);
      return this.inMemoryScheduledPosts.filter((post) => post.status === 'scheduled');
    }
  }

  public async updateScheduledPostStatus(id: string, status: ScheduledPost['status']): Promise<ScheduledPost | null> {
    if (!this.isMongoReady()) {
      const target = this.inMemoryScheduledPosts.find((post) => post.id === id);
      if (!target) {
        return null;
      }

      target.status = status;
      return target;
    }

    try {
      return ScheduledPostModel.findOneAndUpdate({ id }, { status }, { new: true }).lean();
    } catch (error) {
      logger.warn(`MongoDB scheduled status update failed: ${(error as Error).message}`);
      const target = this.inMemoryScheduledPosts.find((post) => post.id === id);
      if (!target) {
        return null;
      }

      target.status = status;
      return target;
    }
  }
}

export const mongoStorageService = new MongoStorageService();
