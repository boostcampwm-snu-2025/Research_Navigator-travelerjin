import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import { logger } from '../../utils/logger.js'
import type { ArxivPaper } from '../../types/index.js'

export class ArxivService {
  private parser: XMLParser
  private apiUrl = 'http://export.arxiv.org/api/query'

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })
  }

  async fetchPapers(daysBack: number = 7, maxResults: number = 30): Promise<ArxivPaper[]> {
    try {
      logger.info(`Fetching papers from arXiv API (last ${daysBack} days, max ${maxResults})`)

      // Calculate date range
      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - daysBack)

      // Format dates for arXiv API (YYYYMMDD)
      const toDateStr = this.formatDate(toDate)
      const fromDateStr = this.formatDate(fromDate)

      // Build search queries for cs.LG and cs.CV
      const categories = ['cs.LG', 'cs.CV']
      const allPapers: ArxivPaper[] = []

      for (const category of categories) {
        logger.info(`Fetching ${category} papers...`)
        const papers = await this.fetchCategory(category, fromDateStr, toDateStr, maxResults)
        allPapers.push(...papers)
      }

      // Deduplicate papers
      const uniquePapers = this.deduplicatePapers(allPapers)
      logger.info(`Total unique papers fetched: ${uniquePapers.length}`)

      // Sort by published date (descending)
      uniquePapers.sort(
        (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
      )

      // Limit results
      const limitedPapers = uniquePapers.slice(0, maxResults)
      logger.info(`Returning ${limitedPapers.length} papers`)

      return limitedPapers
    } catch (error) {
      logger.error('Error fetching papers from arXiv API:', error)
      throw error
    }
  }

  private async fetchCategory(
    category: string,
    fromDate: string,
    toDate: string,
    maxResults: number
  ): Promise<ArxivPaper[]> {
    try {
      // arXiv API query
      // Search for papers in category, sorted by lastUpdatedDate
      const searchQuery = `cat:${category}`
      const url = `${this.apiUrl}?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${maxResults}&sortBy=lastUpdatedDate&sortOrder=descending`

      logger.info(`Fetching from: ${url}`)

      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Research-Dashboard/1.0',
        },
      })

      // Parse XML response
      const xmlData = this.parser.parse(response.data)

      // arXiv API returns <feed> with <entry> elements
      const feed = xmlData.feed
      if (!feed || !feed.entry) {
        logger.warn(`No entries found for ${category}`)
        return []
      }

      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry]
      logger.info(`Found ${entries.length} entries for ${category}`)

      const papers: ArxivPaper[] = entries.map((entry: any) => {
        // Extract arXiv ID from id URL
        const id = entry.id || ''
        const arxivId = this.extractArxivId(id)

        // Parse authors
        const authorList = entry.author
        const authors = this.parseArxivAuthors(authorList)

        // Get categories
        const categories = this.parseCategories(entry.category, category)

        // Get published and updated dates
        const published = entry.published || new Date().toISOString()
        const updated = entry.updated || published

        return {
          id: arxivId,
          title: this.cleanText(entry.title || ''),
          summary: this.cleanText(entry.summary || ''),
          authors,
          published,
          updated,
          categories,
          pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        }
      })

      return papers
    } catch (error) {
      logger.error(`Error fetching ${category}:`, error instanceof Error ? error.message : error)
      return []
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  private extractArxivId(url: string): string {
    // Extract ID from URLs like: http://arxiv.org/abs/2312.12345v1
    const match = url.match(/arxiv\.org\/abs\/([0-9.]+(?:v[0-9]+)?)/)
    if (match) return match[1]

    // Sometimes the ID is just returned directly
    const directMatch = url.match(/([0-9.]+(?:v[0-9]+)?)$/)
    return directMatch ? directMatch[1] : url
  }

  private parseArxivAuthors(authorData: any): Array<{ name: string }> {
    if (!authorData) return []

    const authorList = Array.isArray(authorData) ? authorData : [authorData]

    return authorList.map((author: any) => ({
      name: author.name || 'Unknown Author',
    }))
  }

  private parseCategories(categoryData: any, defaultCategory: string): string[] {
    if (!categoryData) return [defaultCategory]

    const categories = Array.isArray(categoryData) ? categoryData : [categoryData]

    const categoryTerms = categories
      .map((cat: any) => cat['@_term'] || cat.term || '')
      .filter((term: string) => term.length > 0)

    return categoryTerms.length > 0 ? categoryTerms : [defaultCategory]
  }

  private cleanText(text: string): string {
    // Remove extra whitespace and newlines
    return text.replace(/\s+/g, ' ').trim()
  }

  private deduplicatePapers(papers: ArxivPaper[]): ArxivPaper[] {
    const seen = new Set<string>()
    const unique: ArxivPaper[] = []

    for (const paper of papers) {
      if (!seen.has(paper.id)) {
        seen.add(paper.id)
        unique.push(paper)
      }
    }

    return unique
  }
}

export const arxivService = new ArxivService()
