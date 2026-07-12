import { logger } from '../utils/logger';
import AIGeneratorService from './aiGeneratorService';
import PublisherService from './publisherService';
import TopicSelectorService from './topicSelectorService';
import TrendDiscoveryService from './trendDiscoveryService';

const aiGeneratorService = new AIGeneratorService();
const publisherService = new PublisherService();
const trendDiscoveryService = new TrendDiscoveryService();
const topicSelectorService = new TopicSelectorService();

const AUTO_POST_TIMES = ['08:00', '14:00', '20:00'];
let intervalHandle: NodeJS.Timeout | null = null;

function nowHHMM(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function shouldRunNow(lastRunTimes: Set<string>): string | null {
    const current = nowHHMM();
    if (AUTO_POST_TIMES.includes(current) && !lastRunTimes.has(current)) {
        return current;
    }
    return null;
}

async function createAndPublish(): Promise<void> {
    try {
        const topics = await trendDiscoveryService.discoverTrends();
        const selectedTopic = topicSelectorService.selectBestTopic(topics);

        if (!selectedTopic) {
            logger.warn('Auto-post skipped: no trending topic available');
            return;
        }

        const socialContent = await aiGeneratorService.generateSocialMediaContent(selectedTopic.title);
        await publisherService.publishContent(selectedTopic.title, socialContent, 'facebook');
        logger.info(`Auto-post published for topic: ${selectedTopic.title}`);
    } catch (error: any) {
        logger.error(`Auto-post failed: ${error?.message || error}`);
    }
}

export const autoPostService = {
    start(): void {
        logger.info('Auto-post service started. Scheduling 3 posts per day.');

        const lastRunTimes = new Set<string>();

        intervalHandle = setInterval(async () => {
            const current = shouldRunNow(lastRunTimes);
            if (!current) {
                return;
            }

            lastRunTimes.add(current);
            setTimeout(() => lastRunTimes.delete(current), 2 * 60 * 1000);

            await createAndPublish();
        }, 30_000);
    },

    stop(): void {
        if (intervalHandle) {
            clearInterval(intervalHandle);
            intervalHandle = null;
        }
    },
};
