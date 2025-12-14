# Phase 3 Implementation Plan: SNS & External Signal Integration

**Last Updated**: December 14, 2025

## Design Decisions

### Core Choices
1. **SNS Source**: X/Twitter via NewsAPI
2. **Collection Window**: 24-hour rolling window
3. **Filtering Strategy**: Aggressive (heavy filtering initially)
4. **UI Integration**: Separate "External Signals" section on dashboard
5. **Embedding Model**: Same model as papers (reuse existing)
6. **Storage**: Same database, separate folder structure
7. **Engagement Metrics**: Normalized 0-1 score per platform

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  ┌──────────────┐        ┌──────────────┐          │
│  │   Papers     │        │   Signals    │          │
│  │   Section    │        │   Section    │          │
│  └──────────────┘        └──────────────┘          │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 Backend API                          │
│  /api/papers/today      /api/signals/today          │
│  /api/papers/:id        /api/signals/:id            │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│  Paper Service   │          │  Signal Service  │
│  - arXiv API     │          │  - NewsAPI       │
│  - Gemini LLM    │          │  - X/Twitter     │
│  - Cache         │          │  - Filter        │
└──────────────────┘          └──────────────────┘
        │                                 │
        ▼                                 ▼
┌─────────────────────────────────────────────────────┐
│              Shared Components                       │
│  - Embedding Service (same model)                   │
│  - LLM Service (relevance scoring)                  │
│  - Cache System (separate folders)                  │
└─────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── arxiv/           # Existing
│   │   ├── llm/             # Existing
│   │   ├── signals/         # NEW
│   │   │   ├── index.ts
│   │   │   ├── newsapi.ts
│   │   │   ├── twitter.ts
│   │   │   └── filter.ts
│   │   └── embeddings/      # NEW
│   │       └── index.ts
│   ├── routes/
│   │   ├── papers.ts        # Existing
│   │   └── signals.ts       # NEW
│   ├── types/
│   │   └── index.ts         # Extend with Signal types
│   └── utils/
│       └── cache.ts         # Extend for signals
├── data/
│   ├── summaries/           # Existing (papers)
│   └── signals/             # NEW (external signals)
└── .env                     # Add NEWSAPI_KEY

frontend/
├── src/
│   ├── components/
│   │   ├── PaperCard.tsx    # Existing
│   │   └── SignalCard.tsx   # NEW
│   ├── pages/
│   │   ├── Dashboard.tsx    # Update with signals section
│   │   ├── PaperDetail.tsx  # Existing
│   │   └── SignalDetail.tsx # NEW (optional)
│   └── types/
│       └── index.ts         # Extend with Signal types
```

---

## Implementation Tasks

### Phase 3.1: Foundation (Week 1)

#### Task 3.1.1: Type Definitions
**File**: `backend/src/types/index.ts`

```typescript
// Add to existing types
export interface ExternalSignal {
  id: string
  type: 'twitter' | 'news' | 'youtube'
  title: string
  content: string
  author: string
  authorHandle?: string
  url: string
  publishedDate: string
  engagement: EngagementMetrics
  normalizedScore: number
  relevanceScore: number
  relatedPapers?: string[]  // Paper IDs
  tags: string[]
  createdAt: string
  summary?: SignalSummary
}

export interface EngagementMetrics {
  raw: {
    likes?: number
    retweets?: number
    replies?: number
    views?: number
    followers?: number
  }
  normalized: number  // 0-1 score
}

export interface SignalSummary {
  hook: string
  whyMatters: string
  relatedToPapers: string[]
  relevanceScore: number
}

export interface SignalFilterConfig {
  minEngagement: number
  minRelevance: number
  maxAge: number  // hours
  requireAuthorFollowers: number
  blockPatterns: string[]  // Promotional keywords to filter
}
```

**Frontend types**: Mirror in `frontend/src/types/index.ts`

---

#### Task 3.1.2: NewsAPI Integration
**File**: `backend/src/services/signals/newsapi.ts`

```typescript
import axios from 'axios'
import { logger } from '../../utils/logger.js'

export class NewsAPIService {
  private apiKey: string
  private baseUrl = 'https://newsapi.org/v2'

  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY || ''
    if (!this.apiKey) {
      logger.warn('NewsAPI key not configured')
    }
  }

  async fetchArticles(
    keywords: string[],
    hoursBack: number = 24
  ): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('NewsAPI key not configured')
    }

    const from = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()
    const query = keywords.join(' OR ')

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          from,
          language: 'en',
          sortBy: 'relevancy',
          pageSize: 50,
          apiKey: this.apiKey,
        },
      })

      logger.info(`Fetched ${response.data.articles.length} articles from NewsAPI`)
      return response.data.articles
    } catch (error) {
      logger.error('Error fetching from NewsAPI:', error)
      throw error
    }
  }
}

export const newsAPIService = new NewsAPIService()
```

**Environment**: Add to `.env`
```bash
NEWSAPI_KEY=your_newsapi_key_here
```

---

#### Task 3.1.3: Twitter/X Integration Placeholder
**File**: `backend/src/services/signals/twitter.ts`

```typescript
import { logger } from '../../utils/logger.js'

export class TwitterService {
  // Placeholder for future Twitter API integration
  // NewsAPI can also fetch tweets via their sources

  async fetchTweets(
    keywords: string[],
    hoursBack: number = 24
  ): Promise<any[]> {
    logger.warn('Twitter direct integration not yet implemented')
    // For now, rely on NewsAPI which includes Twitter sources
    return []
  }
}

export const twitterService = new TwitterService()
```

---

### Phase 3.2: Signal Processing (Week 1-2)

#### Task 3.2.1: Signal Filter
**File**: `backend/src/services/signals/filter.ts`

```typescript
import { ExternalSignal, SignalFilterConfig } from '../../types/index.js'
import { logger } from '../../utils/logger.js'

export class SignalFilter {
  private config: SignalFilterConfig = {
    minEngagement: 0.1,  // Normalized score
    minRelevance: 0.4,   // LLM relevance score
    maxAge: 24,
    requireAuthorFollowers: 1000,
    blockPatterns: [
      'sponsored',
      'advertisement',
      'buy now',
      'click here',
      'limited offer',
      'subscribe to',
    ],
  }

  // Hard filters (must pass)
  isValidSignal(signal: ExternalSignal): boolean {
    // Check age
    const age = Date.now() - new Date(signal.publishedDate).getTime()
    if (age > this.config.maxAge * 60 * 60 * 1000) {
      logger.debug(`Filtered: too old (${signal.id})`)
      return false
    }

    // Check content length
    if (!signal.content || signal.content.length < 50) {
      logger.debug(`Filtered: content too short (${signal.id})`)
      return false
    }

    // Check for promotional patterns
    const contentLower = signal.content.toLowerCase()
    for (const pattern of this.config.blockPatterns) {
      if (contentLower.includes(pattern)) {
        logger.debug(`Filtered: promotional pattern "${pattern}" (${signal.id})`)
        return false
      }
    }

    return true
  }

  // Soft filters (scoring)
  shouldInclude(signal: ExternalSignal): boolean {
    if (!this.isValidSignal(signal)) {
      return false
    }

    // Engagement threshold
    if (signal.engagement.normalized < this.config.minEngagement) {
      logger.debug(`Filtered: low engagement (${signal.id})`)
      return false
    }

    // Relevance threshold (if already scored)
    if (signal.relevanceScore && signal.relevanceScore < this.config.minRelevance) {
      logger.debug(`Filtered: low relevance (${signal.id})`)
      return false
    }

    return true
  }

  // Normalize engagement metrics
  normalizeEngagement(
    raw: any,
    type: 'twitter' | 'news' | 'youtube'
  ): number {
    switch (type) {
      case 'twitter':
        // Twitter formula: weighted sum of engagement
        const likes = raw.likes || 0
        const retweets = (raw.retweets || 0) * 2  // Retweets worth more
        const replies = raw.replies || 0
        const followers = Math.log10(raw.followers || 1)

        const twitterScore = (likes + retweets + replies) / (1 + followers)
        return Math.min(1, twitterScore / 1000)  // Normalize to 0-1

      case 'news':
        // News formula: based on source reputation (if available)
        // For now, simple heuristic
        const hasImage = raw.urlToImage ? 0.2 : 0
        const hasDescription = raw.description && raw.description.length > 100 ? 0.3 : 0
        const sourceRank = raw.source?.rank || 0.5  // Default mid-range

        return Math.min(1, hasImage + hasDescription + sourceRank)

      case 'youtube':
        // YouTube formula: views + likes
        const views = Math.log10((raw.views || 0) + 1)
        const ytLikes = Math.log10((raw.likes || 0) + 1)

        return Math.min(1, (views + ytLikes) / 20)

      default:
        return 0.5
    }
  }
}

export const signalFilter = new SignalFilter()
```

---

#### Task 3.2.2: Main Signal Service
**File**: `backend/src/services/signals/index.ts`

```typescript
import { newsAPIService } from './newsapi.js'
import { twitterService } from './twitter.js'
import { signalFilter } from './filter.js'
import { llmService } from '../llm/index.js'
import { cacheService } from '../../utils/cache.js'
import { ExternalSignal } from '../../types/index.js'
import { logger } from '../../utils/logger.js'

export class SignalService {
  // Research-related keywords for filtering
  private keywords = [
    'deep learning',
    'machine learning',
    'computer vision',
    'natural language processing',
    'artificial intelligence',
    'neural network',
    'transformer',
    'diffusion model',
    'large language model',
    'LLM',
    'GPT',
    'arXiv',
    'research paper',
  ]

  async fetchSignals(hoursBack: number = 24): Promise<ExternalSignal[]> {
    const signals: ExternalSignal[] = []

    // Fetch from NewsAPI
    try {
      const articles = await newsAPIService.fetchArticles(this.keywords, hoursBack)

      for (const article of articles) {
        const signal = this.convertNewsToSignal(article)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }
    } catch (error) {
      logger.error('Error fetching news signals:', error)
    }

    logger.info(`Collected ${signals.length} valid signals`)
    return signals
  }

  private convertNewsToSignal(article: any): ExternalSignal {
    const id = Buffer.from(article.url).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        // NewsAPI doesn't provide engagement metrics
        // Use heuristics based on source and content quality
      },
      normalized: signalFilter.normalizeEngagement(article, 'news'),
    }

    return {
      id,
      type: 'news',
      title: article.title || '',
      content: article.description || article.content || '',
      author: article.author || article.source?.name || 'Unknown',
      url: article.url,
      publishedDate: article.publishedAt,
      engagement,
      normalizedScore: 0,  // Will be calculated
      relevanceScore: 0,   // Will be scored by LLM
      relatedPapers: [],
      tags: [],
      createdAt: new Date().toISOString(),
    }
  }

  async scoreRelevance(signal: ExternalSignal): Promise<number> {
    // Check cache first
    const cacheKey = `signal_relevance_${signal.id}`
    // Note: extend cache service to support signals

    try {
      const prompt = `
You are evaluating whether this external signal is relevant to Deep Learning/Computer Vision research.

Title: ${signal.title}
Content: ${signal.content.substring(0, 500)}
Source: ${signal.author}

Is this content:
1. Related to recent DL/CV research developments?
2. Discussing technical advances (not just news/hype)?
3. Worth showing to a PhD researcher?

Respond with JSON:
{
  "relevant": true/false,
  "score": 0.0-1.0,
  "reason": "brief explanation"
}
      `.trim()

      const result = await llmService.model?.generateContent(prompt)
      const text = result?.response?.text() || '{}'

      const parsed = JSON.parse(text.replace(/```json?/g, '').replace(/```/g, ''))

      return parsed.relevant ? parsed.score : 0
    } catch (error) {
      logger.error('Error scoring signal relevance:', error)
      return 0.5  // Default neutral score
    }
  }

  async processSignals(signals: ExternalSignal[]): Promise<ExternalSignal[]> {
    const processed: ExternalSignal[] = []

    for (const signal of signals) {
      // Score relevance
      signal.relevanceScore = await this.scoreRelevance(signal)

      // Calculate normalized score (combination of engagement + relevance)
      signal.normalizedScore =
        (signal.engagement.normalized * 0.3) +
        (signal.relevanceScore * 0.7)

      // Apply soft filters
      if (signalFilter.shouldInclude(signal)) {
        processed.push(signal)
      }
    }

    // Sort by normalized score
    processed.sort((a, b) => b.normalizedScore - a.normalizedScore)

    return processed
  }
}

export const signalService = new SignalService()
```

---

### Phase 3.3: API & Storage (Week 2)

#### Task 3.3.1: Cache Extension
**File**: `backend/src/utils/cache.ts` (extend existing)

```typescript
// Add to existing CacheService class

async getSignal(signalId: string): Promise<ExternalSignal | null> {
  try {
    const cachePath = path.join(this.signalCacheDir, `${signalId}.json`)
    const data = await fs.readFile(cachePath, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.signal
  } catch (error) {
    return null
  }
}

async setSignal(signalId: string, signal: ExternalSignal): Promise<void> {
  try {
    await fs.mkdir(this.signalCacheDir, { recursive: true })
    const cachePath = path.join(this.signalCacheDir, `${signalId}.json`)
    const data = {
      signalId,
      signal,
      cachedAt: new Date().toISOString(),
    }
    await fs.writeFile(cachePath, JSON.stringify(data, null, 2))
  } catch (error) {
    logger.error('Error caching signal:', error)
  }
}

private signalCacheDir = process.env.SIGNAL_CACHE_DIR || './data/signals'
```

---

#### Task 3.3.2: Signals API Route
**File**: `backend/src/routes/signals.ts`

```typescript
import { Router } from 'express'
import type { Request, Response } from 'express'
import { signalService } from '../services/signals/index.js'
import { logger } from '../utils/logger.js'
import type { ExternalSignal } from '../types/index.js'

const router = Router()

let cachedSignals: ExternalSignal[] = []
let lastSignalFetch: Date | null = null

// GET /api/signals/today
router.get('/today', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching today\'s external signals')

    // Fetch signals from last 24 hours
    const rawSignals = await signalService.fetchSignals(24)

    // Process and filter
    const signals = await signalService.processSignals(rawSignals)

    // Cache
    cachedSignals = signals
    lastSignalFetch = new Date()

    logger.info(`Returning ${signals.length} external signals`)

    res.json({
      signals: signals.slice(0, 10),  // Top 10
      count: signals.length,
      lastUpdated: lastSignalFetch.toISOString(),
    })
  } catch (error) {
    logger.error('Error fetching signals:', error)
    res.status(500).json({ error: 'Failed to fetch signals' })
  }
})

// GET /api/signals/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const signal = cachedSignals.find((s) => s.id === id)

    if (signal) {
      return res.json({ signal })
    }

    res.status(404).json({ error: 'Signal not found' })
  } catch (error) {
    logger.error('Error fetching signal:', error)
    res.status(500).json({ error: 'Failed to fetch signal' })
  }
})

export default router
```

**Register route** in `backend/src/index.ts`:
```typescript
import signalsRouter from './routes/signals.js'
app.use('/api/signals', signalsRouter)
```

---

### Phase 3.4: Frontend Integration (Week 2-3)

#### Task 3.4.1: SignalCard Component
**File**: `frontend/src/components/SignalCard.tsx`

```typescript
import { ExternalSignal } from '../types'

interface SignalCardProps {
  signal: ExternalSignal
  onClick?: () => void
}

function SignalCard({ signal, onClick }: SignalCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'twitter': return '#1DA1F2'
      case 'news': return '#FF6B35'
      case 'youtube': return '#FF0000'
      default: return '#6c757d'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'twitter': return '𝕏'
      case 'news': return '📰'
      case 'youtube': return '▶️'
      default: return '🔗'
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Type badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <span style={{
          backgroundColor: getTypeColor(signal.type),
          color: 'white',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {getTypeIcon(signal.type)} {signal.type.toUpperCase()}
        </span>
        <span style={{
          fontSize: '11px',
          color: '#999',
        }}>
          {new Date(signal.publishedDate).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a1a1a',
        lineHeight: '1.4',
      }}>
        {signal.title}
      </h4>

      {/* Content preview */}
      <p style={{
        fontSize: '13px',
        color: '#555',
        lineHeight: '1.5',
        marginBottom: '12px',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {signal.content}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0',
      }}>
        <span style={{
          fontSize: '12px',
          color: '#888',
        }}>
          {signal.author}
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: signal.relevanceScore > 0.7 ? '#28a745' : '#ffc107',
        }}>
          {(signal.relevanceScore * 100).toFixed(0)}% relevant
        </span>
      </div>
    </div>
  )
}

export default SignalCard
```

---

#### Task 3.4.2: Update Dashboard
**File**: `frontend/src/pages/Dashboard.tsx`

Add signals section:

```typescript
// Add state
const [signals, setSignals] = useState<ExternalSignal[]>([])
const [signalsLoading, setSignalsLoading] = useState(false)

// Add fetch function
const fetchSignals = async () => {
  try {
    setSignalsLoading(true)
    const response = await fetch('http://localhost:3001/api/signals/today')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    setSignals(data.signals || [])
  } catch (err) {
    console.error('Error fetching signals:', err)
  } finally {
    setSignalsLoading(false)
  }
}

// Fetch on mount
useEffect(() => {
  fetchPapers()
  fetchSignals()
}, [])

// Add signals section in JSX (after papers section)
{/* External Signals Section */}
<div style={{ marginTop: '60px' }}>
  <h2 style={{
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
  }}>
    External Signals
  </h2>

  {signalsLoading ? (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      Loading signals...
    </div>
  ) : (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
    }}>
      {signals.map((signal) => (
        <SignalCard
          key={signal.id}
          signal={signal}
          onClick={() => window.open(signal.url, '_blank')}
        />
      ))}
    </div>
  )}
</div>
```

---

## Testing Plan

### Week 3: Testing & Iteration

1. **Unit Tests**
   - Signal filter logic
   - Engagement normalization
   - NewsAPI integration

2. **Integration Tests**
   - End-to-end signal fetching
   - LLM relevance scoring
   - Cache functionality

3. **Manual Testing**
   - Verify signals appear on dashboard
   - Check filtering is working (no spam)
   - Validate relevance scores make sense

4. **Iteration**
   - Adjust filter thresholds based on results
   - Refine LLM prompts for better relevance
   - Add more keywords if needed

---

## Environment Setup

Add to `backend/.env`:
```bash
# NewsAPI
NEWSAPI_KEY=your_newsapi_key_here

# Signal Cache
SIGNAL_CACHE_DIR=./data/signals
```

---

## Success Metrics

- **Quality**: >80% of signals are actually research-relevant
- **Diversity**: Signals cover multiple DL/CV topics
- **Freshness**: All signals < 24 hours old
- **Volume**: 5-15 high-quality signals per day
- **Performance**: Signal fetching < 10 seconds

---

## Next Steps (Phase 3+)

1. **Embedding-based linking** (Phase 3.5)
   - Compute embeddings for signals
   - Link signals to related papers
   - Show "Related Signals" on paper detail page

2. **More sources** (Phase 3.6)
   - YouTube API integration
   - Reddit r/MachineLearning
   - HackerNews

3. **User feedback** (Phase 4)
   - Let users upvote/downvote signals
   - Learn personalized relevance
