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
  createdAt: string
  updatedAt: string
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

export interface ArxivPaper {
  id: string
  title: string
  summary: string
  authors: Array<{ name: string }>
  published: string
  updated: string
  categories: string[]
  pdfUrl: string
}

export interface LLMResponse {
  hook: string
  why: string
  what: string
  howItFits: string
  motivation: string
  keyContributions: string[]
  relevanceScore: number
}

// External Signal Types (Phase 3)
export interface ExternalSignal {
  id: string
  type: 'twitter' | 'news' | 'youtube' | 'hackernews' | 'stackoverflow' | 'reddit'
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
  raw: any  // Allow any structure for different platforms
  normalized: number
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
  maxAge: number
  requireAuthorFollowers: number
  blockPatterns: string[]
}
