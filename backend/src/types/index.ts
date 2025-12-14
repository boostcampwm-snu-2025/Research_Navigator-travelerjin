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
