import fs from 'fs/promises'
import path from 'path'
import { config } from '../config/index.js'
import { logger } from './logger.js'
import type { PaperSummary } from '../types/index.js'

export class CacheService {
  private cacheDir: string

  constructor() {
    this.cacheDir = config.cacheDir
    this.ensureCacheDir()
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
    } catch (error) {
      logger.error('Error creating cache directory:', error)
    }
  }

  private getCachePath(paperId: string): string {
    // Sanitize paper ID for filename (replace / and special chars)
    const sanitized = paperId.replace(/[/\\?%*:|"<>]/g, '_')
    return path.join(this.cacheDir, `${sanitized}.json`)
  }

  async get(paperId: string): Promise<PaperSummary | null> {
    try {
      const cachePath = this.getCachePath(paperId)
      const data = await fs.readFile(cachePath, 'utf-8')
      const cached = JSON.parse(data)

      logger.debug(`Cache hit for paper: ${paperId}`)
      return cached.summary
    } catch (error) {
      // Cache miss or read error
      logger.debug(`Cache miss for paper: ${paperId}`)
      return null
    }
  }

  async set(paperId: string, summary: PaperSummary): Promise<void> {
    try {
      const cachePath = this.getCachePath(paperId)
      const data = {
        paperId,
        summary,
        cachedAt: new Date().toISOString(),
      }

      await fs.writeFile(cachePath, JSON.stringify(data, null, 2), 'utf-8')
      logger.debug(`Cached summary for paper: ${paperId}`)
    } catch (error) {
      logger.error(`Error writing cache for paper ${paperId}:`, error)
    }
  }

  async exists(paperId: string): Promise<boolean> {
    try {
      const cachePath = this.getCachePath(paperId)
      await fs.access(cachePath)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      await Promise.all(
        files.map((file) => fs.unlink(path.join(this.cacheDir, file)))
      )
      logger.info('Cache cleared')
    } catch (error) {
      logger.error('Error clearing cache:', error)
    }
  }

  async getCacheStats(): Promise<{ count: number; size: number }> {
    try {
      const files = await fs.readdir(this.cacheDir)
      let totalSize = 0

      for (const file of files) {
        const stats = await fs.stat(path.join(this.cacheDir, file))
        totalSize += stats.size
      }

      return {
        count: files.length,
        size: totalSize,
      }
    } catch (error) {
      logger.error('Error getting cache stats:', error)
      return { count: 0, size: 0 }
    }
  }
}

export const cacheService = new CacheService()
