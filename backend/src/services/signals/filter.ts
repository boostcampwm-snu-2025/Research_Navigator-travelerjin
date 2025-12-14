import { ExternalSignal, SignalFilterConfig } from '../../types/index.js'
import { logger } from '../../utils/logger.js'

// AI/ML/DL keywords for filtering across all APIs (from testapis.py)
export const AI_ML_DL_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'neural',
  'neural network',
  'llm',
  'large language model',
  'gpt',
  'transformer',
  'nlp',
  'natural language processing',
  'computer vision',
  'model',
  'algorithm',
  'tensorflow',
  'pytorch',
  'keras',
  'attention',
  'bert',
  'diffusion',
  'generative',
  'reinforcement learning',
  'classification',
  'clustering',
  'regression',
  'embedding',
  'optimization',
  'gradient',
  'backprop',
  'convolutional',
  'recurrent',
  'fine-tuning',
  'pretraining',
  'inference',
]

export class SignalFilter {
  // DEV MODE: Relaxed filters to show signals from all sources
  private config: SignalFilterConfig = {
    minEngagement: 0.0,  // Accept all engagement levels (DEV)
    minRelevance: 0.0,   // Accept all relevance scores (DEV)
    maxAge: 168,         // 7 days (relaxed for DEV)
    requireAuthorFollowers: 0,  // No follower requirement (DEV)
    blockPatterns: [
      // Minimal blocking for DEV
      'sponsored',
      'advertisement',
    ],
  }

  // Hard filters (must pass)
  isValidSignal(signal: ExternalSignal): boolean {
    // Check age
    const age = Date.now() - new Date(signal.publishedDate).getTime()
    if (age > this.config.maxAge * 60 * 60 * 1000) {
      logger.info(`Filtered ${signal.type} signal "${signal.title.substring(0, 40)}": too old (${Math.floor(age / 3600000)}h)`)
      return false
    }

    // Check content length
    if (!signal.content || signal.content.length < 50) {
      logger.info(`Filtered ${signal.type} signal "${signal.title.substring(0, 40)}": content too short (${signal.content?.length || 0} chars)`)
      return false
    }

    // Check for promotional patterns (case-insensitive)
    const contentLower = `${signal.title} ${signal.content}`.toLowerCase()
    for (const pattern of this.config.blockPatterns) {
      if (contentLower.includes(pattern.toLowerCase())) {
        logger.info(`Filtered ${signal.type} signal "${signal.title.substring(0, 40)}": promotional pattern "${pattern}"`)
        return false
      }
    }

    // Check for basic quality markers
    if (!signal.title || signal.title.length < 10) {
      logger.info(`Filtered ${signal.type} signal: title too short (${signal.title?.length || 0} chars)`)
      return false
    }

    return true
  }

  // Soft filters (scoring)
  shouldInclude(signal: ExternalSignal): boolean {
    if (!this.isValidSignal(signal)) {
      return false
    }

    // Engagement threshold
    if (signal.engagement.normalized < this.config.minEngagement) {
      logger.debug(`Filtered: low engagement ${signal.engagement.normalized.toFixed(2)} (${signal.id})`)
      return false
    }

    // Relevance threshold (if already scored)
    if (signal.relevanceScore && signal.relevanceScore < this.config.minRelevance) {
      logger.debug(`Filtered: low relevance ${signal.relevanceScore.toFixed(2)} (${signal.id})`)
      return false
    }

    return true
  }

  // Normalize engagement metrics across platforms
  normalizeEngagement(
    raw: any,
    type: 'twitter' | 'news' | 'youtube' | 'hackernews' | 'stackoverflow' | 'reddit'
  ): number {
    switch (type) {
      case 'twitter':
        // Twitter formula: weighted sum of engagement
        const likes = raw.likes || 0
        const retweets = (raw.retweets || 0) * 2  // Retweets worth more
        const replies = raw.replies || 0
        const followers = Math.log10(raw.followers || 1)

        const twitterScore = (likes + retweets + replies) / (1 + followers)
        return Math.min(1, twitterScore / 1000)  // Normalize to 0-1

      case 'news':
        // News formula: based on source reputation and content quality
        let score = 0.5  // Base score

        // Has image
        if (raw.urlToImage) {
          score += 0.15
        }

        // Has good description
        if (raw.description && raw.description.length > 100) {
          score += 0.15
        }

        // Content length
        if (raw.content && raw.content.length > 500) {
          score += 0.1
        }

        // Source appears reputable (simple heuristic)
        const sourceName = raw.source?.name?.toLowerCase() || ''
        const reputableSources = ['techcrunch', 'venturebeat', 'mit technology review', 'wired', 'the verge', 'ars technica']
        if (reputableSources.some(s => sourceName.includes(s))) {
          score += 0.2
        }

        return Math.min(1, score)

      case 'youtube':
        // YouTube formula: views + likes
        const views = Math.log10((raw.views || 0) + 1)
        const ytLikes = Math.log10((raw.likes || 0) + 1)

        return Math.min(1, (views + ytLikes) / 20)

      case 'hackernews':
        // HN formula: points + comments with decay
        const points = raw.points || 0
        const comments = (raw.num_comments || 0) * 0.5  // Comments worth less than points

        // HN posts with 100+ points are considered high engagement
        const hnScore = (points + comments) / 150
        return Math.min(1, hnScore)

      case 'stackoverflow':
        // Stack Overflow formula: score + answers + views
        const soScore = raw.score || 0
        const answers = (raw.answer_count || 0) * 2  // Answers are valuable
        const soViews = Math.log10((raw.view_count || 0) + 1) / 5

        // Questions with 10+ score are considered high quality
        const stackScore = (soScore + answers + soViews) / 20
        return Math.min(1, stackScore)

      case 'reddit':
        // Reddit formula: upvotes + comments
        const redditScore = (raw.score || 0) + (raw.num_comments || 0) * 0.5
        return Math.min(1, redditScore / 500)

      default:
        return 0.5
    }
  }

  /**
   * Check if text contains AI/ML/DL keywords
   */
  containsAIMLKeywords(text: string, keywords: string[] = AI_ML_DL_KEYWORDS): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some((keyword) => lowerText.includes(keyword))
  }

  /**
   * Filter content by AI/ML/DL keyword relevance
   */
  filterByAIMLKeywords(text: string, keywords: string[] = AI_ML_DL_KEYWORDS): boolean {
    return this.containsAIMLKeywords(text, keywords)
  }

  /**
   * Count matched keywords in text
   */
  countKeywordMatches(text: string, keywords: string[] = AI_ML_DL_KEYWORDS): number {
    const lowerText = text.toLowerCase()
    return keywords.filter((keyword) => lowerText.includes(keyword)).length
  }
}

export const signalFilter = new SignalFilter()
