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
  why: string
  what: string
  howItFits: string
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
