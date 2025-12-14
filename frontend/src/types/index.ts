export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  arxivId: string
  publishedDate: string
  categories: string[]
  pdfUrl: string
  summary?: PaperSummary
}

export interface PaperSummary {
  hook: string
  why: string
  what: string
  howItFits: string
  motivation: string
  keyContributions: string[]
  relevanceScore: number
}

export interface FilterOptions {
  categories?: string[]
  dateRange?: {
    start: string
    end: string
  }
  searchQuery?: string
}

// External Signal Types (Phase 3)
export interface ExternalSignal {
  id: string
  type: 'twitter' | 'news' | 'youtube' | 'hackernews' | 'stackoverflow'
  title: string
  content: string
  author: string
  authorHandle?: string
  url: string
  publishedDate: string
  engagement: EngagementMetrics
  normalizedScore: number
  relevanceScore: number
  relatedPapers?: string[]
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
  normalized: number
}

export interface SignalSummary {
  hook: string
  whyMatters: string
  relatedToPapers: string[]
  relevanceScore: number
}
