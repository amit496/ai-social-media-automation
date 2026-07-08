import { Request, Response } from 'express';
import AIGeneratorService from '../services/aiGeneratorService';
import PublisherService from '../services/publisherService';
import { ApiResponse } from '../types/api';
import { SocialMediaPlatform } from '../types/domain';

const publisherService = new PublisherService();
const aiGeneratorService = new AIGeneratorService();

export const publishContent = async (req: Request, res: Response): Promise<Response<ApiResponse<unknown>>> => {
  try {
    const { topic, platform, scheduleFor, daily } = req.body as {
      topic: string;
      platform: SocialMediaPlatform;
      scheduleFor?: string;
      daily?: boolean;
    };

    if (!topic || !platform) {
      return res.status(400).json({ success: false, error: 'topic and platform are required' });
    }

    const socialContent = await aiGeneratorService.generateSocialMediaContent(topic);

    if (scheduleFor || daily) {
      const scheduledForValue = scheduleFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const scheduledPost = await publisherService.scheduleContent(topic, socialContent, platform, scheduledForValue);
      return res.json({ success: true, data: scheduledPost });
    }

    const publishedPost = await publisherService.publishContent(topic, socialContent, platform);
    return res.json({ success: true, data: publishedPost });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed to publish content' });
  }
};

export const getScheduledPosts = async (req: Request, res: Response): Promise<Response<ApiResponse<unknown>>> => {
  const scheduledPosts = await publisherService.getScheduledPosts();
  return res.json({ success: true, data: scheduledPosts });
};

export const getPublishedPosts = async (req: Request, res: Response): Promise<Response<ApiResponse<unknown>>> => {
  const publishedPosts = await publisherService.getPublishedPosts();
  return res.json({ success: true, data: publishedPosts });
};
