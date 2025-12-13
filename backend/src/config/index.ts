import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Database
  databaseUrl: process.env.DATABASE_URL || './data/papers.sqlite',

  // arXiv
  arxivBaseUrl: process.env.ARXIV_BASE_URL || 'http://export.arxiv.org/api/query',

  // Scheduler
  fetchCronSchedule: process.env.FETCH_CRON_SCHEDULE || '0 6 * * *',
}
