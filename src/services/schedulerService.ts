import { logger } from '../utils/logger';
import PublisherService from './publisherService';
import { mongoStorageService } from './mongoStorageService';

const publisherService = new PublisherService();

export class SchedulerService {
  public async runPendingScheduledPosts(): Promise<void> {
    const pending = await mongoStorageService.getPendingScheduledPosts();
    const now = new Date().toISOString();

    for (const schedule of pending) {
      if (schedule.scheduledFor <= now) {
        logger.info(`Executing scheduled post ${schedule.id}`);
        await publisherService.publishContent(schedule.topic, schedule.content, schedule.platform);
        await mongoStorageService.updateScheduledPostStatus(schedule.id, 'published');
      }
    }
  }
}

export const schedulerService = new SchedulerService();
