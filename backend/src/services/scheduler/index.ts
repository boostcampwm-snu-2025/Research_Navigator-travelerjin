import cron from 'node-cron'
import { config } from '../../config/index.js'
import { logger } from '../../utils/logger.js'
import { arxivService } from '../arxiv/index.js'
import { llmService } from '../llm/index.js'

export class SchedulerService {
  private job: cron.ScheduledTask | null = null

  start() {
    if (this.job) {
      logger.warn('Scheduler is already running')
      return
    }

    logger.info(`Starting scheduler with schedule: ${config.fetchCronSchedule}`)

    this.job = cron.schedule(config.fetchCronSchedule, async () => {
      logger.info('Running scheduled paper fetch...')
      await this.fetchAndAnalyzePapers()
    })

    logger.info('Scheduler started successfully')
  }

  stop() {
    if (this.job) {
      this.job.stop()
      this.job = null
      logger.info('Scheduler stopped')
    }
  }

  async fetchAndAnalyzePapers() {
    try {
      const categories = ['cs.CV', 'cs.LG', 'cs.AI']

      for (const category of categories) {
        logger.info(`Fetching papers for category: ${category}`)
        const papers = await arxivService.fetchPapers(category, 50, 1)

        logger.info(`Found ${papers.length} papers for ${category}`)

        // TODO: Store papers in database and analyze with LLM
        // for (const paper of papers) {
        //   const summary = await llmService.analyzePaper(
        //     paper.title,
        //     paper.summary,
        //     paper.authors.map(a => a.name)
        //   )
        //   // Store in database
        // }
      }

      logger.info('Scheduled paper fetch completed')
    } catch (error) {
      logger.error('Error in scheduled paper fetch:', error)
    }
  }
}

export const schedulerService = new SchedulerService()
