import { Router } from 'express'
import type { Request, Response } from 'express'
import { signalService } from '../services/signals/index.js'
import { logger } from '../utils/logger.js'
import type { ExternalSignal } from '../types/index.js'

const router = Router()

// In-memory cache for signals
let cachedSignals: ExternalSignal[] = []
let lastSignalFetch: Date | null = null

// GET /api/signals/today - Get today's external signals
router.get('/today', async (req: Request, res: Response) => {
  try {
    logger.info('DEV: Fetching external signals (HN only, cached)')

    // DEV: fetch only HN and skip LLM scoring
    const signals = await signalService.fetchSignalsDev(72)

    cachedSignals = signals
    lastSignalFetch = new Date()

    res.json({
      signals,
      count: signals.length,
      lastUpdated: lastSignalFetch.toISOString(),
    })
  } catch (error) {
    logger.error('Error fetching signals:', error)
    res.status(500).json({ error: 'Failed to fetch signals' })
  }
})

// GET /api/signals/:id - Get signal by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    logger.info(`Fetching signal: ${id}`)

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

// GET /api/signals/status - Get cache status
router.get('/status', async (req: Request, res: Response) => {
  try {
    res.json({
      cachedSignals: cachedSignals.length,
      lastFetchTime: lastSignalFetch?.toISOString() || null,
    })
  } catch (error) {
    logger.error('Error getting signals status:', error)
    res.status(500).json({ error: 'Failed to get status' })
  }
})

export default router
