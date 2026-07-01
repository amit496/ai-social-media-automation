import { logger } from '../utils/logger';
import { storageService } from './storageService';
import PublisherService from './publisherService';

const publisherService = new PublisherService();

export class SchedulerService {
  public async runPendingScheduledPosts(): Promise<void> {
    const pending = storageService.getPendingScheduledPosts();
    const now = new Date().toISOString();

    for (const schedule of pending) {
      if (schedule.scheduledFor <= now) {
        logger.info(`Executing scheduled post ${schedule.id}`);
        await publisherService.publishContent(schedule.topic, schedule.content, schedule.platform);
        storageService.updateScheduledPostStatus(schedule.id, 'published');
      }
    }
  }
}

export const schedulerService = new SchedulerService();
