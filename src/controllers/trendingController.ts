import { Request, Response } from 'express';
import AIGeneratorService from '../services/aiGeneratorService';
import TopicSelectorService from '../services/topicSelectorService';
import TrendDiscoveryService from '../services/trendDiscoveryService';
import { ApiResponse, SuccessResponse } from '../types/api';
import { SelectedTopic, SocialMediaContent, TrendingTopic } from '../types/domain';

const trendDiscoveryService = new TrendDiscoveryService();
const topicSelectorService = new TopicSelectorService();
const aiGeneratorService = new AIGeneratorService();

export const getTrendingTopics = async (req: Request, res: Response): Promise<Response<ApiResponse<TrendingTopic[]>>> => {
  const topics = await trendDiscoveryService.discoverTrends();
  return res.json({ success: true, data: topics });
};

export const getBestTopic = async (req: Request, res: Response): Promise<Response<ApiResponse<SelectedTopic | null>>> => {
  const topics = await trendDiscoveryService.discoverTrends();
  const selectedTopic = topicSelectorService.selectBestTopic(topics);
  return res.json({ success: true, data: selectedTopic });
};

export const getHealth = async (req: Request, res: Response): Promise<Response<ApiResponse<{ status: string; uptime: number }>>> => {
  return res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
};

export const generateContent = async (req: Request, res: Response): Promise<Response<ApiResponse<SocialMediaContent>>> => {
  try {
    const topic = req.body.topic as string | undefined;
    const finalTopic = topic || (await topicSelectorService.selectBestTopic(await trendDiscoveryService.discoverTrends()))?.title;

    if (!finalTopic) {
      return res.status(400).json({ success: false, error: 'Unable to select a topic for content generation' });
    }

    const result = await aiGeneratorService.generateSocialMediaContent(finalTopic);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    const statusCode = error?.statusCode || 500;
    const message = error?.message || 'Failed to generate content';
    
    if (statusCode === 503) {
      return res.status(503).json({ 
        success: false, 
        error: 'Gemini API is temporarily unavailable. Please try again in a moment.' 
      });
    }
    
    return res.status(statusCode).json({ success: false, error: message });
  }
};
