import { Router } from 'express'
import type { Request, Response } from 'express'
import { arxivService } from '../services/arxiv/index.js'
import { llmService } from '../services/llm/index.js'
import { logger } from '../utils/logger.js'
import type { Paper } from '../types/index.js'

const router = Router()

// In-memory cache for papers (simple for MVP, can be replaced with DB)
let cachedPapers: Paper[] = []
let lastFetchTime: Date | null = null

// GET /api/papers/status - Get cache status (must be before /:id route)
router.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      cachedPapers: cachedPapers.length,
      lastFetchTime: lastFetchTime?.toISOString() || null,
    })
  } catch (error) {
    logger.error('Error getting status:', error)
    res.status(500).json({ error: 'Failed to get status' })
  }
})

// GET /api/papers/today - Get today's papers with summaries
router.get('/today', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching today\'s papers')

    // Fetch papers from arXiv RSS (last 7 days, limit to 10 papers)
    const arxivPapers = await arxivService.fetchPapers(7, 10)

    if (arxivPapers.length === 0) {
      return res.json({
        papers: [],
        count: 0,
        lastUpdated: new Date().toISOString(),
      })
    }

    logger.info(`Fetched ${arxivPapers.length} papers from arXiv`)

    // Analyze papers with LLM (batch processing with cache)
    const summaries = await llmService.analyzePapersBatch(arxivPapers, 1)

    // Combine papers with summaries
    const papers: Paper[] = arxivPapers.map((arxivPaper) => {
      const summary = summaries.get(arxivPaper.id)

      return {
        id: arxivPaper.id,
        title: arxivPaper.title,
        authors: arxivPaper.authors.map((a) => a.name),
        abstract: arxivPaper.summary,
        arxivId: arxivPaper.id,
        publishedDate: arxivPaper.published,
        categories: arxivPaper.categories,
        pdfUrl: arxivPaper.pdfUrl,
        summary: summary || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    // Update cache
    cachedPapers = papers
    lastFetchTime = new Date()

    logger.info(`Returning ${papers.length} papers with summaries`)

    res.json({
      papers,
      count: papers.length,
      lastUpdated: lastFetchTime.toISOString(),
    })
  } catch (error) {
    logger.error('Error fetching today\'s papers:', error)
    res.status(500).json({ error: 'Failed to fetch papers' })
  }
})

// GET /api/papers/:id - Get paper by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    logger.info(`Fetching paper: ${id}`)

    // Look in cache first
    const paper = cachedPapers.find((p) => p.id === id || p.arxivId === id)

    if (paper) {
      return res.json(paper)
    }

    // If not in cache, return 404
    res.status(404).json({ error: 'Paper not found' })
  } catch (error) {
    logger.error('Error fetching paper:', error)
    res.status(500).json({ error: 'Failed to fetch paper' })
  }
})

// POST /api/refresh - Manually refresh papers
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    logger.info('Manual refresh triggered')

    // Clear cache and re-fetch (last 7 days)
    cachedPapers = []
    lastFetchTime = null

    // Redirect to /today endpoint
    const arxivPapers = await arxivService.fetchPapers(7, 30)

    if (arxivPapers.length === 0) {
      return res.json({
        papers: [],
        count: 0,
        lastUpdated: new Date().toISOString(),
      })
    }

    const summaries = await llmService.analyzePapersBatch(arxivPapers, 5)

    const papers: Paper[] = arxivPapers.map((arxivPaper) => {
      const summary = summaries.get(arxivPaper.id)

      return {
        id: arxivPaper.id,
        title: arxivPaper.title,
        authors: arxivPaper.authors.map((a) => a.name),
        abstract: arxivPaper.summary,
        arxivId: arxivPaper.id,
        publishedDate: arxivPaper.published,
        categories: arxivPaper.categories,
        pdfUrl: arxivPaper.pdfUrl,
        summary: summary || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    cachedPapers = papers
    lastFetchTime = new Date()

    logger.info(`Refresh complete: ${papers.length} papers`)

    res.json({
      papers,
      count: papers.length,
      lastUpdated: lastFetchTime.toISOString(),
    })
  } catch (error) {
    logger.error('Error refreshing papers:', error)
    res.status(500).json({ error: 'Failed to refresh papers' })
  }
})

export default router
