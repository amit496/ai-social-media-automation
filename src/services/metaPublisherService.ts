import axios from 'axios';
import { SocialMediaContent, SocialMediaPlatform } from '../types/domain';
import { logger } from '../utils/logger';
import { appConfig } from '../config/appConfig';

export interface MetaPublishResult {
  success: boolean;
  externalId?: string;
  message: string;
}

export class MetaPublisherService {
  private readonly graphApiBaseUrl = 'https://graph.facebook.com/v21.0';

  public async publishContent(platform: SocialMediaPlatform, content: SocialMediaContent): Promise<MetaPublishResult> {
    if (platform === 'facebook') {
      return this.publishToFacebook(content);
    }

    return this.publishToInstagram(content);
  }

  private async publishToFacebook(content: SocialMediaContent): Promise<MetaPublishResult> {
    const { metaPageId, metaAccessToken } = appConfig;

    if (!metaPageId || !metaAccessToken) {
      logger.warn('Meta Facebook publish skipped: missing META_PAGE_ID or META_ACCESS_TOKEN');
      return {
        success: false,
        message: 'Facebook credentials are not configured yet. Post was stored locally only.',
      };
    }

    const message = `${content.facebookPost}\n\n${content.hashtags.join(' ')}`.trim();

    try {
      const response = await axios.post(
        `${this.graphApiBaseUrl}/${metaPageId}/feed`,
        {
          message,
          access_token: metaAccessToken,
        },
        {
          timeout: 30000,
        },
      );

      return {
        success: true,
        externalId: response.data?.id,
        message: 'Published to Facebook successfully.',
      };
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || 'Facebook publish failed';
      logger.error(`Facebook publish failed: ${message}`);
      return {
        success: false,
        message,
      };
    }
  }

  private async publishToInstagram(content: SocialMediaContent): Promise<MetaPublishResult> {
    const { metaAccessToken, metaInstagramAccountId, metaInstagramImageUrl } = appConfig;

    if (!metaAccessToken || !metaInstagramAccountId) {
      logger.warn('Meta Instagram publish skipped: missing META_ACCESS_TOKEN or META_INSTAGRAM_ACCOUNT_ID');
      return {
        success: false,
        message: 'Instagram credentials are not configured yet. Post was stored locally only.',
      };
    }

    try {
      const imageUrl = metaInstagramImageUrl || 'https://placehold.co/1200x630/png?text=AI+Social+Media';
      const caption = `${content.instagramCaption}\n\n${content.hashtags.join(' ')}`.trim();

      const containerResponse = await axios.post(
        `${this.graphApiBaseUrl}/${metaInstagramAccountId}/media`,
        {
          image_url: imageUrl,
          caption,
          access_token: metaAccessToken,
          media_type: 'IMAGE',
        },
        {
          timeout: 30000,
        },
      );

      const creationId = containerResponse.data?.id;
      if (!creationId) {
        throw new Error('Instagram media container creation did not return an id');
      }

      await axios.post(
        `${this.graphApiBaseUrl}/${metaInstagramAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: metaAccessToken,
        },
        {
          timeout: 30000,
        },
      );

      return {
        success: true,
        externalId: creationId,
        message: 'Published to Instagram successfully.',
      };
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || 'Instagram publish failed';
      logger.error(`Instagram publish failed: ${message}`);
      return {
        success: false,
        message,
      };
    }
  }
}

export const metaPublisherService = new MetaPublisherService();
