import axios from 'axios';
import { appConfig } from '../config/appConfig';
import { SocialMediaContent } from '../types/domain';
import { logger } from '../utils/logger';

export default class AIGeneratorService {
  private apiKey: string;

  constructor() {
    this.apiKey = appConfig.geminiApiKey;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
  }

  public async generateSocialMediaContent(topic: string): Promise<SocialMediaContent> {
    const prompt = this.buildPrompt(topic);
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    try {
      const response = await axios.post(
        geminiEndpoint,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
            maxOutputTokens: 1200,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );

      const content = this.extractText(response.data);
      const parsed = this.parseResponse(content);

      return {
        topic,
        facebookPost: parsed.facebookPost,
        instagramCaption: parsed.instagramCaption,
        imageCaption: parsed.imageCaption,
        imageAltText: parsed.imageAltText,
        seoDescription: parsed.seoDescription,
        hashtags: parsed.hashtags,
      };
    } catch (error) {
      const err = error as any;
      const statusCode = err?.response?.status || 500;
      const message = err?.response?.data?.error?.message || err?.message || 'Failed to generate content';

      logger.warn(`Gemini fallback engaged (${statusCode}): ${message}`);
      return this.buildFallbackContent(topic);
    }
  }

  private buildPrompt(topic: string): string {
    return `Create a professional, engaging, easy-to-read social media package for the topic "${topic}".

Include concise output only, with short copy for each field.
- A Facebook post in 2-3 sentences
- An Instagram caption in 1-2 sentences
- A single sentence image caption
- A single sentence image alt text
- A short SEO-friendly description
- Exactly 5 to 7 relevant hashtags

Requirements:
- Use only valid JSON
- Do not add markdown, code fences, or extra text outside the JSON object
- Keep all string values compact and easy to read
- If the response would be too long, shorten the copy so the output stays valid JSON

Return this exact JSON structure only:
{
  "facebookPost": "...",
  "instagramCaption": "...",
  "imageCaption": "...",
  "imageAltText": "...",
  "seoDescription": "...",
  "hashtags": ["#...", "#...", ...]
}
`;
  }

  private extractText(data: unknown): string {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid Gemini response');
    }

    const candidates = (data as Record<string, unknown>).candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error('Empty Gemini response');
    }

    const firstCandidate = candidates[0] as Record<string, unknown>;
    const contentObj = firstCandidate.content;

    if (!contentObj || typeof contentObj !== 'object') {
      throw new Error('Invalid Gemini response content');
    }

    const contentRecord = contentObj as Record<string, unknown>;
    if (typeof contentRecord.text === 'string') {
      return contentRecord.text;
    }

    const parts = contentRecord.parts;
    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error('Invalid Gemini response parts');
    }

    const text = parts
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (typeof part === 'object' && part !== null && typeof (part as Record<string, unknown>).text === 'string') {
          return (part as Record<string, unknown>).text;
        }
        return '';
      })
      .join('')
      .trim();

    if (!text) {
      throw new Error('Invalid Gemini response text');
    }

    return text;
  }

  private parseResponse(responseText: string): {
    facebookPost: string;
    instagramCaption: string;
    imageCaption: string;
    imageAltText: string;
    seoDescription: string;
    hashtags: string[];
  } {
    try {
      const jsonText = this.extractJsonObject(responseText);
      const parsed = JSON.parse(jsonText);
      const {
        facebookPost,
        instagramCaption,
        imageCaption,
        imageAltText,
        seoDescription,
        hashtags,
      } = parsed as {
        facebookPost: string;
        instagramCaption: string;
        imageCaption: string;
        imageAltText: string;
        seoDescription: string;
        hashtags: string[];
      };

      if (
        !facebookPost ||
        !instagramCaption ||
        !imageCaption ||
        !imageAltText ||
        !seoDescription ||
        !Array.isArray(hashtags)
      ) {
        throw new Error('Invalid Gemini JSON output - missing required fields');
      }

      return {
        facebookPost: facebookPost.trim(),
        instagramCaption: instagramCaption.trim(),
        imageCaption: imageCaption.trim(),
        imageAltText: imageAltText.trim(),
        seoDescription: seoDescription.trim(),
        hashtags: hashtags.map((hashtag) => hashtag.toString().trim()),
      };
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to parse Gemini response: ${err.message}`);
      logger.error(`Response text preview: ${responseText.substring(0, 200)}`);
      throw new Error('Failed to parse Gemini response as JSON');
    }
  }

  private extractJsonObject(rawText: string): string {
    let text = rawText.trim();

    // Remove markdown code block wrappers if present
    text = text.replace(/^```(?:json)?\s*/i, '');
    text = text.replace(/\s*```$/i, '');

    // Remove common leading/trailing text before JSON starts
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) {
      throw new Error('No JSON object found in Gemini response');
    }
    text = text.slice(firstBrace);

    // Find balanced JSON object boundaries.
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (char === '{') {
        depth += 1;
      }

      if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          return text.substring(0, i + 1).trim();
        }
      }
    }

    throw new Error('Could not extract a balanced JSON object from Gemini response');
  }

  private buildFallbackContent(topic: string): SocialMediaContent {
    return {
      topic,
      facebookPost: `Here is a concise update on ${topic} that is designed for social engagement while Gemini is temporarily unavailable. Discover what makes this topic important and why people are talking about it.`,
      instagramCaption: `A quick highlight on ${topic}: short, engaging, and ready for your audience. Stay tuned for more updates!`,
      imageCaption: `A clear social image caption for ${topic} that works across platforms.`,
      imageAltText: `Illustration representing ${topic} in a modern technology context.`,
      seoDescription: `Learn about ${topic} with a short summary crafted for SEO. This fallback description keeps your content flow moving while the AI service recovers.`,
      hashtags: ['#Trending', '#TechNews', '#SocialUpdate', '#AI', '#Innovation', '#ShortForm', '#Fallback'],
    };
  }
}

