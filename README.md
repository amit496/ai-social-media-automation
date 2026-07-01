# AI Social Media Automation - Phase 1

## Overview
A Node.js + TypeScript backend that fetches trending tech topics, ranks them, and generates AI social media content using the Gemini/OpenAI API.

## Run locally
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` in the project root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```
3. Start the dev server
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/health` - service health
- `GET /api/trending` - top 10 trending topics
- `GET /api/topic` - best single topic
- `POST /api/generate` - generate social content

### Example payload
```json
{
  "topic": "AI-powered developer tools"
}
```

### Example response
```json
{
  "success": true,
  "data": {
    "topic": "AI-powered developer tools",
    "facebookPost": "AI-powered developer tools are redefining productivity for engineering teams. Share this post if you want to stay ahead with smarter workflows, clean code, and faster release cycles.",
    "instagramCaption": "Boost your coding workflow with AI-powered developer tools 💡✨ #AI #DevTools #Productivity",
    "imageCaption": "A modern developer workspace with AI-powered tools visible on the screen",
    "imageAltText": "Developer using AI tools on a laptop",
    "seoDescription": "Discover how AI-powered developer tools streamline software development, improve productivity, and help engineering teams ship better products faster.",
    "hashtags": [
      "#AI",
      "#DeveloperTools",
      "#SoftwareDevelopment",
      "#MachineLearning",
      "#Productivity",
      "#CodingTips",
      "#WebDevelopment",
      "#TechNews",
      "#DevOps",
      "#OpenSource"
    ]
  }
}
```

## Notes
- Uses real sources: Google Trends, Hacker News, Reddit, GitHub Trending, Dev.to, TechCrunch RSS
- No auth, scheduling, database, or publishing in this phase
- `GEMINI_API_KEY` is required for content generation
- The project is built so future publishing modules for Facebook and Instagram can be added later
