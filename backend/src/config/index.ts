import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load backend .env even when process.cwd() is project root
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,

  // arXiv RSS Feeds
  arxivRssFeeds: {
    csLG: process.env.ARXIV_RSS_CS_LG || 'http://export.arxiv.org/rss/cs.LG',
    csCV: process.env.ARXIV_RSS_CS_CV || 'http://export.arxiv.org/rss/cs.CV',
  },

  // Cache
  cacheDir: process.env.CACHE_DIR || './data/summaries',

  // Scheduler
  fetchCronSchedule: process.env.FETCH_CRON_SCHEDULE || '0 6 * * *',
}
