export type TrendingTopic = {
  title: string;
  source: string;
  trendScore: number;
  popularity: number;
  engagementPotential: number;
  freshness: number;
  searchInterest: number;
};

export type SelectedTopic = TrendingTopic & {
  reason: string;
};

export type SocialMediaContent = {
  topic: string;
  facebookPost: string;
  instagramCaption: string;
  imageCaption: string;
  imageAltText: string;
  seoDescription: string;
  hashtags: string[];
};

export type SocialMediaPlatform = 'facebook' | 'instagram';

export type PublishedPost = {
  id: string;
  topic: string;
  platform: SocialMediaPlatform;
  content: SocialMediaContent;
  publishedAt: string;
  status: 'published';
  externalId?: string;
  publishMessage?: string;
};

export type ScheduledPost = {
  id: string;
  topic: string;
  platform: SocialMediaPlatform;
  content: SocialMediaContent;
  scheduledFor: string;
  createdAt: string;
  status: 'scheduled' | 'published';
};
