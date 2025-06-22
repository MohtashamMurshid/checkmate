# Checkmate 🔍

[🌐 Visit the Website](https://checkmate-imaginehack.vercel.app/)

_AI-Powered Misinformation Detection & Fact-Checking Platform_

> Combating digital misinformation in Malaysia through advanced AI, NLP, and crowd-sourced verification

---

## 🏆 ImagineHack Challenge & Our Approach

### The Problem We're Solving

In today's hyperconnected world, information travels faster than ever, but so does misinformation. From misleading headlines and manipulated images to fake news and deepfakes, Malaysia, like many countries, is grappling with the real-world consequences of digital falsehoods. These include public confusion, social unrest, and a decline in trust toward media, institutions, and even one another.

As digital citizens, we all play a role in upholding the truth. But the scale and speed of today's information environment demand technological solutions that can proactively detect, counter, and educate against misinformation, while preserving freedom of speech and access to information.

**Challenge Statement:**

> How can we harness technology to combat misinformation and promote digital integrity, truth, and accountability in Malaysia's online spaces?

### Our Solution & Approach

**Checkmate** addresses this challenge through a comprehensive AI-powered platform that:

1. **Proactively Detects** misinformation using advanced NLP and content analysis
2. **Verifies Claims** through automated fact-checking with credible sources
3. **Evaluates Creator Credibility** using data-driven scoring algorithms
4. **Empowers Users** with accessible tools for content verification
5. **Builds Community Trust** through crowd-sourced verification mechanisms

## 👥 Team Members

| Name                         | Role                                   | Contributions                                                                  |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| **Mohtasham Murshid Madani** | Team Leader / Full Stack Developer     | Project architecture, AI integration, frontend development, API design         |
| **Syed Amaan Geelani**       | Mobile + Extension + Backend Developer | Mobile app development, browser extension, backend services, API optimization  |
| **Ayaan Izhar**              | Backend + Documentation Specialist     | Backend infrastructure, AI model integration, technical documentation, testing |

## 🛠️ Technologies Used

### Frontend Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **React Hooks** - State management and side effects

### Backend & Database

- **Convex** - Real-time backend-as-a-service
- **Clerk** - Authentication and user management
- **PostgreSQL** - Structured data storage (via Convex)
- **Serverless Functions** - Auto-scaling API endpoints

### AI & Machine Learning

- **OpenAI GPT-4** - Large language model for analysis
- **OpenAI Whisper** - Speech-to-text transcription
- **Vercel AI SDK** - AI model integration
- **Natural Language Processing** - Content analysis and sentiment detection

### External APIs & Services

- **TikTok API** (`@tobyg74/tiktok-api-dl`) - Video content extraction
- **Twitter Scraper** (`@the-convocation/twitter-scraper`) - Social media analysis
- **Firecrawl** - Web content scraping and extraction
- **Web Search APIs** - Real-time fact verification

### Development & Deployment

- **Vercel** - Deployment and hosting
- **Git/GitHub** - Version control
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing

## 🚀 Key Features & Capabilities

### 🔍 Multi-Platform Content Analysis

- **TikTok Videos**: Extract metadata, transcribe audio, analyze claims
- **Twitter/X Posts**: Process tweets, images, and embedded media
- **Web Articles**: Scrape and analyze blog posts, news articles
- **Direct Media**: Upload videos, images, or audio files

### 🤖 AI-Powered Detection

- **Sentiment Analysis**: Detect manipulative language and bias
- **Claim Extraction**: Identify factual statements requiring verification
- **Pattern Recognition**: Spot common misinformation tactics
- **Language Processing**: Support for multiple languages (Malaysian context)

### ✅ Automated Fact-Checking

- **Real-time Verification**: Cross-reference claims with credible sources
- **Source Credibility**: Evaluate reliability of information sources
- **Confidence Scoring**: Provide certainty levels for fact-check results
- **Evidence Compilation**: Generate comprehensive verification reports

### 👤 Creator Credibility System

- **Historical Analysis**: Track creator's accuracy over time
- **Community Feedback**: Incorporate user ratings and comments
- **Cross-Platform Tracking**: Unified credibility across social platforms
- **Transparency**: Clear methodology for credibility calculations

### 🌐 Accessibility & Localization

- **Multilingual Support**: English, Bahasa Malaysia, and regional languages
- **Mobile-First Design**: Responsive across all devices
- **Dark/Light Mode**: User preference customization
- **Screen Reader Compatible**: WCAG accessibility standards

## 📱 Usage Instructions & Demo

### Getting Started

1. **Visit the Platform**: Navigate to [checkmate.demo.com] (placeholder)
2. **Sign Up/Login**: Create account using email or social login
3. **Paste Content URL**: Enter TikTok, Twitter, or web article URL
4. **Analyze Content**: Click "Analyze" to start fact-checking process
5. **Review Results**: Examine credibility scores, fact-check results, and sources

### Demo Screenshots

> **Note**: Screenshots will be added during demo preparation

#### 1. Landing Page & Hero Section

```
[Screenshot: Clean, modern landing page with clear value proposition]
- Hero section explaining the platform's mission
- Call-to-action buttons for getting started
- Feature highlights and statistics
```

#### 2. Content Analysis Interface

```
[Screenshot: Main analysis interface]
- URL input field with platform detection
- Real-time processing indicators
- Progress bars for different analysis stages
```

#### 3. Fact-Check Results Dashboard

```
[Screenshot: Comprehensive results display]
- Overall credibility score with visual indicators
- Detailed fact-check breakdown
- Source citations with credibility ratings
- Creator credibility profile
```

#### 4. Creator Credibility Profile

```
[Screenshot: Creator analysis page]
- Historical credibility trends
- Content analysis statistics
- Community feedback and comments
- Cross-platform credibility comparison
```

#### 5. Saved Analyses & History

```
[Screenshot: User dashboard]
- Personal analysis history
- Saved fact-checks and bookmarks
- Analytics on personal verification activity
```

### Video Demo

```
[Video Demo Link: 2-3 minute walkthrough]
- Live demonstration of analyzing a TikTok video
- Real-time fact-checking process
- Results interpretation and source verification
- Mobile responsiveness showcase
```

### Live Demo Access

**Demo Credentials** (for judges/reviewers):

```
URL: [Demo Platform URL]
Test Account: demo@checkmate.ai
Password: HackathonDemo2024
```

**Sample Content for Testing**:

- TikTok Video: [Sample URL with known misinformation]
- Twitter Post: [Sample tweet with factual claims]
- News Article: [Sample article for credibility testing]

## 🏗️ Technical Architecture

### System Overview

Checkmate follows a modern full-stack architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External APIs │
│   (Next.js)     │◄──►│   (Convex)      │◄──►│   (OpenAI, etc) │
│                 │    │                 │    │                 │
│ • React UI      │    │ • Database      │    │ • Whisper ASR   │
│ • TailwindCSS   │    │ • Auth (Clerk)  │    │ • GPT-4         │
│ • TypeScript    │    │ • Functions     │    │ • TikTok API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   AI Tools      │
                    │   (@/tools)     │
                    │                 │
                    │ • Content       │
                    │   Analysis      │
                    │ • Fact Checking │
                    │ • Transcription │
                    └─────────────────┘
```

### Database Schema (Convex)

Our data model consists of four main entities:

#### `users`

- Synchronized from Clerk authentication
- Stores user profile information and preferences

#### `contentCreators`

- Tracks credibility metrics for content creators across platforms
- Maintains credibility ratings (0-10 scale) based on analysis history
- Supports multi-platform creator identification

#### `tiktokAnalyses`

- Stores comprehensive analysis results for each processed content
- Links to users and content creators
- Contains transcription, metadata, news detection, and fact-check results

#### `creatorComments`

- Enables community feedback on creator credibility
- Supports crowd-sourced verification efforts

### AI/ML Tools Architecture (`@/tools`)

The `@/tools` directory contains the core AI-powered functionality, organized into modular components:

#### `helpers.ts` - Core Utilities

```typescript
// Video transcription using OpenAI Whisper
export async function transcribeVideoDirectly(videoUrl: string);

// Web content scraping using Firecrawl
export async function scrapeWebContent(url: string);
```

#### `tiktok-analysis.ts` - Platform-Specific Analysis

- **`analyzeTikTokVideo`**: Extracts metadata, download links, and video content from TikTok URLs
- **`transcribeTikTokVideo`**: Converts TikTok audio to text using OpenAI Whisper
- **`compareTikTokVideos`**: Analyzes multiple videos for trends and patterns

Key technologies:

- `@tobyg74/tiktok-api-dl` for TikTok video extraction
- OpenAI Whisper via `ai` SDK for speech-to-text
- Real-time video processing and analysis

#### `content-analysis.ts` - Content Intelligence

- **`analyzeContentSentiment`**: NLP-powered sentiment analysis and theme extraction
- **`extractHashtagsAndMentions`**: Social media element extraction using regex patterns
- **`generateContentInsights`**: AI-driven recommendations and quality scoring
- **`generateVideoSummary`**: Automated content summarization

Advanced features:

- Multi-dimensional sentiment analysis
- Viral potential prediction algorithms
- Accessibility compliance checking
- Engagement metric calculations

#### `fact-checking.ts` - Misinformation Detection

- **`detectNewsContent`**: Identifies content requiring fact-checking using NLP
- **`researchAndFactCheck`**: Cross-references claims with credible sources
- **`analyzeCreatorCredibility`**: Calculates creator trustworthiness scores

Sophisticated algorithms:

- Domain credibility evaluation using LLM reasoning
- Multi-source claim verification
- Confidence scoring with uncertainty quantification
- Automated source reliability assessment

#### `index.ts` - Tool Orchestration

Exports organized tool collections:

```typescript
export const allTiktokAnalysisTools = [...];
export const allFactCheckingTools = [...];
export const allTools = [...]; // Combined toolkit
```

### Data Flow & Processing Pipeline

1. **Content Ingestion**

   ```
   User Input (URL) → Platform Detection → Content Extraction
   ```

2. **Multi-Modal Analysis**

   ```
   Video/Audio → Whisper Transcription → Text Analysis
   Text Content → NLP Processing → Claim Extraction
   ```

3. **Fact-Checking Pipeline**

   ```
   Claims → Web Research → Source Verification → Credibility Scoring
   ```

4. **Result Synthesis**
   ```
   Individual Results → Comprehensive Analysis → User Dashboard
   ```

### API Architecture

#### `/api/transcribe` - Main Analysis Endpoint

Handles multi-platform content analysis:

```typescript
// Request types supported
interface RequestBody {
  tiktokUrl?: string; // TikTok video URLs
  twitterUrl?: string; // Twitter/X post URLs
  webUrl?: string; // General web content
  videoUrl?: string; // Direct video URLs
}

// Response structure
interface AnalysisResult {
  transcription: TranscriptionData;
  metadata: ContentMetadata;
  newsDetection: NewsDetectionResult;
  factCheck: FactCheckData;
  creatorCredibilityRating: number;
}
```

**Processing Flow:**

1. URL validation and platform detection
2. Content extraction (TikTok API, Twitter Scraper, or Firecrawl)
3. Transcription (if video content exists)
4. News content detection using AI
5. Fact-checking pipeline execution
6. Creator credibility calculation
7. Result compilation and return

### Frontend Architecture

#### Custom Hooks (`lib/hooks/`)

- **`use-tiktok-analysis.ts`**: Main analysis orchestration hook
- **`use-saved-analyses.ts`**: Database interaction for saved analyses
- **`use-credible-sources.ts`**: Credible source management
- **`use-all-analyses.ts`**: Comprehensive analysis data fetching

#### Component Structure

```
components/
├── ui/                    # Shadcn/UI base components
├── analysis-renderer.tsx  # Display analysis results
├── creator-credibility-display.tsx  # Credibility scoring UI
├── language-provider.tsx  # I18n support
└── theme-provider.tsx     # Dark/light mode
```

### Security & Performance

#### Authentication & Authorization

- **Clerk Integration**: Secure user authentication with social logins
- **Middleware Protection**: Route-level authentication enforcement
- **API Security**: Request validation and rate limiting

#### Performance Optimizations

- **Streaming Responses**: Real-time analysis result delivery
- **Caching Strategy**: Convex-powered efficient data caching
- **Lazy Loading**: Component-based code splitting
- **Image Optimization**: Next.js automatic image optimization

#### Error Handling

- **Graceful Degradation**: Fallback mechanisms for API failures
- **User Feedback**: Clear error messages and retry mechanisms
- **Logging**: Comprehensive error tracking and monitoring

### Scalability Considerations

#### Horizontal Scaling

- **Serverless Architecture**: Auto-scaling API routes
- **Database Sharding**: Convex handles automatic scaling
- **CDN Integration**: Global content delivery

#### Monitoring & Analytics

- **Performance Metrics**: Real-time application monitoring
- **Usage Analytics**: User behavior and feature adoption tracking
- **Error Tracking**: Automated error detection and alerting

## 🚀 Local Development Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/MohtashamMurshid/checkmate.git
cd checkmate
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

Create a `.env.local` file in the root of your project and add the following variables:

```env
VERCEL_URL=http://localhost:3000
OPENAI_API_KEY=sk-proj-FAKEKEYFORDEMO0987654321
CONVEX_DEPLOYMENT=dev:tidy-grouse-158 # team: mohtasham-murshid, project: checkmate-29f39
NEXT_PUBLIC_CONVEX_URL=https://tidy-grouse-158.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_FAKEPUBLISHABLEKEY
CLERK_SECRET_KEY=sk_test_FAKESECRETKEY
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://magical-marmot-34.clerk.accounts.dev
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/news
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/news
FIRECRAWL_API_KEY=fc-9e93ef8545954909a9cf4b9c83e4666b
```

## 🏆 Impact & Future Roadmap

### Addressing the Malaysian Context

- **Language Support**: Prioritizing Bahasa Malaysia and regional dialects
- **Cultural Sensitivity**: Understanding local misinformation patterns
- **Government Collaboration**: Potential integration with official fact-checking bodies
- **Educational Outreach**: Community programs for digital literacy

### Planned Enhancements

- **Browser Extension**: Real-time fact-checking while browsing
- **Mobile App**: Native iOS/Android applications
- **API for Partners**: Integration capabilities for news organizations
- **Advanced AI Models**: Custom-trained models for Malaysian content
- **Blockchain Verification**: Immutable fact-check records

## 📄 License

MIT License - Open source for educational and research purposes

---

_Built with ❤️ for the Malaysia Hackathon 2024 - Fighting misinformation through technology_
