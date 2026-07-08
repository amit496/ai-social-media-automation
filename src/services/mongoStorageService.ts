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
    if (!this.isMongoReady()) {
      this.inMemoryPublishedPosts.push(post);
      logger.warn('MongoDB not available; saved published post in memory');
      return post;
    }

    try {
      const publishedPost = new PublishedPostModel(post);
      await publishedPost.save();
      return post;
    } catch (error) {
      logger.warn(`MongoDB publish save failed; using in-memory fallback: ${(error as Error).message}`);
      this.inMemoryPublishedPosts.push(post);
      return post;
    }
  }

  public async getPublishedPosts(): Promise<PublishedPost[]> {
    if (!this.isMongoReady()) {
      return this.inMemoryPublishedPosts;
    }

    try {
      return PublishedPostModel.find().lean();
    } catch (error) {
      logger.warn(`MongoDB published posts read failed: ${(error as Error).message}`);
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
      return ScheduledPostModel.find().lean();
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
      return ScheduledPostModel.find({ status: 'scheduled' }).lean();
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
