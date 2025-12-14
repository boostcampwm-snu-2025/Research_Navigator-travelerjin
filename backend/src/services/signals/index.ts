import { promises as fs } from 'node:fs'
import path from 'node:path'
import { newsAPIService } from './newsapi.js'
import { twitterService } from './twitter.js'
import { hackerNewsService } from './hackernews.js'
import { stackExchangeService } from './stackexchange.js'
import { redditService } from './reddit.js'
import { youtubeService } from './youtube.js'
import { signalFilter } from './filter.js'
import { llmService } from '../llm/index.js'
import { ExternalSignal } from '../../types/index.js'
import { logger } from '../../utils/logger.js'

export class SignalService {
  // Research-related keywords for filtering
  // Using simpler keywords for better NewsAPI results
  private keywords = [
    'artificial intelligence',
    'machine learning',
    'deep learning',
    'AI research',
  ]

  private cacheFile = path.resolve(process.cwd(), 'data', 'signals-cache.json')

  private async loadCachedSignals(): Promise<ExternalSignal[] | null> {
    try {
      const raw = await fs.readFile(this.cacheFile, 'utf-8')
      const parsed = JSON.parse(raw)
      logger.info(`Loaded ${parsed?.length || 0} signals from cache`)
      return Array.isArray(parsed) ? parsed : null
    } catch (error: any) {
      logger.info('No cached signals found (DEV)')
      return null
    }
  }

  private async saveCachedSignals(signals: ExternalSignal[]): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cacheFile), { recursive: true })
      await fs.writeFile(this.cacheFile, JSON.stringify(signals, null, 2), 'utf-8')
      logger.info(`Saved ${signals.length} signals to cache (DEV) at ${this.cacheFile}`)
    } catch (error: any) {
      logger.warn(`Failed to save cache: ${error.message}`)
    }
  }

  // DEV: fetch only Hacker News (no LLM, minimal filtering) and cache
  async fetchSignalsDev(hoursBack: number = 24): Promise<ExternalSignal[]> {
    // Try cache first
    const cached = await this.loadCachedSignals()

    // If cache exists but has no NewsAPI items, backfill them once
    if (cached && cached.length) {
      const hasNews = cached.some(signal => signal.type === 'news')
      if (!hasNews) {
        try {
          const articles = await newsAPIService.fetchArticles(this.keywords, hoursBack)
          const newsSignals = articles.map(article => this.convertNewsToSignal(article))
          const merged = [...cached, ...newsSignals]
          await this.saveCachedSignals(merged)
          return merged
        } catch (error) {
          logger.error('DEV: Error backfilling News signals:', error)
          return cached
        }
      }

      return cached
    }

    const signals: ExternalSignal[] = []
    logger.info(`DEV: Fetching HN + News signals for last ${hoursBack} hours (no LLM)`)  // DEV

    // Hacker News
    try {
      const stories = await hackerNewsService.fetchStories(this.keywords, hoursBack)
      for (const story of stories) {
        const signal = this.convertHNToSignal(story)
        signals.push(signal)
      }
    } catch (error) {
      logger.error('DEV: Error fetching Hacker News signals:', error)
    }

    // NewsAPI
    try {
      const articles = await newsAPIService.fetchArticles(this.keywords, hoursBack)
      for (const article of articles) {
        const signal = this.convertNewsToSignal(article)
        signals.push(signal)
      }
    } catch (error) {
      logger.error('DEV: Error fetching News signals:', error)
    }

    // Persist cache
    await this.saveCachedSignals(signals)

    return signals
  }

  async fetchSignals(hoursBack: number = 24): Promise<ExternalSignal[]> {
    const signals: ExternalSignal[] = []

    logger.info(`Fetching external signals from last ${hoursBack} hours`)

    // Fetch from NewsAPI
    try {
      const articles = await newsAPIService.fetchArticles(this.keywords, hoursBack)

      for (const article of articles) {
        const signal = this.convertNewsToSignal(article)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.length} valid signals from ${articles.length} articles`)
    } catch (error) {
      logger.error('Error fetching news signals:', error)
    }

    // Fetch from Twitter
    try {
      const tweets = await twitterService.fetchTweets(this.keywords, hoursBack)

      for (const tweet of tweets) {
        const signal = this.convertTweetToSignal(tweet)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.filter(s => s.type === 'twitter').length} valid signals from ${tweets.length} tweets`)
    } catch (error) {
      logger.error('Error fetching Twitter signals:', error)
    }

    // Fetch from Hacker News
    try {
      const stories = await hackerNewsService.fetchStories(this.keywords, hoursBack)

      for (const story of stories) {
        const signal = this.convertHNToSignal(story)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.filter(s => s.type === 'hackernews').length} valid signals from ${stories.length} HN stories`)
    } catch (error) {
      logger.error('Error fetching Hacker News signals:', error)
    }

    // Fetch from Stack Overflow
    try {
      const questions = await stackExchangeService.fetchQuestions(this.keywords, hoursBack)

      for (const question of questions) {
        const signal = this.convertSOToSignal(question)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.filter(s => s.type === 'stackoverflow').length} valid signals from ${questions.length} SO questions`)
    } catch (error) {
      logger.error('Error fetching Stack Overflow signals:', error)
    }

    // Fetch from Reddit
    try {
      const posts = await redditService.fetchPosts(
        ['MachineLearning', 'learnmachinelearning'],
        hoursBack
      )

      for (const post of posts) {
        const signal = this.convertRedditToSignal(post)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.filter(s => s.type === 'reddit').length} valid signals from ${posts.length} Reddit posts`)
    } catch (error) {
      logger.error('Error fetching Reddit signals:', error)
    }

    // Fetch from YouTube
    try {
      const videos = await youtubeService.fetchVideos(
        'machine learning tutorial',
        hoursBack
      )

      for (const video of videos) {
        const signal = this.convertYouTubeToSignal(video)

        // Apply hard filters
        if (signalFilter.isValidSignal(signal)) {
          signals.push(signal)
        }
      }

      logger.info(`Processed ${signals.filter(s => s.type === 'youtube').length} valid signals from ${videos.length} YouTube videos`)
    } catch (error) {
      logger.error('Error fetching YouTube signals:', error)
    }

    return signals
  }

  private convertTweetToSignal(tweet: any): ExternalSignal {
    // Create a deterministic ID from tweet ID
    const id = Buffer.from(tweet.id).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        followers: tweet.author?.public_metrics?.followers_count || 0,
      },
      normalized: signalFilter.normalizeEngagement(
        {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          followers: tweet.author?.public_metrics?.followers_count || 0,
        },
        'twitter'
      ),
    }

    return {
      id,
      type: 'twitter',
      title: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
      content: tweet.text,
      author: tweet.author?.name || 'Unknown',
      authorHandle: tweet.author?.username ? `@${tweet.author.username}` : undefined,
      url: `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`,
      publishedDate: tweet.created_at,
      engagement,
      normalizedScore: 0,  // Will be calculated after relevance scoring
      relevanceScore: 0,   // Will be scored by LLM
      relatedPapers: [],
      tags: [],
      createdAt: new Date().toISOString(),
    }
  }

  private convertNewsToSignal(article: any): ExternalSignal {
    // Create a deterministic ID from URL
    const id = Buffer.from(article.url).toString('base64').substring(0, 32)

    const engagement = {
      raw: article,  // Store full article for engagement calculation
      normalized: signalFilter.normalizeEngagement(article, 'news'),
    }

    return {
      id,
      type: 'news',
      title: article.title || '',
      content: article.description || article.content || '',
      author: article.author || article.source?.name || 'Unknown',
      url: article.url,
      publishedDate: article.publishedAt,
      engagement,
      normalizedScore: 0,  // Will be calculated after relevance scoring
      relevanceScore: 0,   // Will be scored by LLM
      relatedPapers: [],
      tags: [],
      createdAt: new Date().toISOString(),
    }
  }

  private convertHNToSignal(story: any): ExternalSignal {
    // Create a deterministic ID from story ID
    const id = Buffer.from(story.id.toString()).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        points: story.points,
        num_comments: story.num_comments,
      },
      normalized: signalFilter.normalizeEngagement(
        {
          points: story.points,
          num_comments: story.num_comments,
        },
        'hackernews'
      ),
    }

    // HN stories often don't have body text, so use title + metadata as fallback
    // to meet the 50-char minimum content length filter
    const content = story.story_text
      ? story.story_text
      : `${story.title}. Hacker News discussion with ${story.num_comments} comments and ${story.points} points.`

    return {
      id,
      type: 'hackernews',
      title: story.title || '',
      content,
      author: story.author || 'Unknown',
      url: story.url,
      publishedDate: story.created_at,
      engagement,
      normalizedScore: 0,
      relevanceScore: 0,
      relatedPapers: [],
      tags: [],
      createdAt: new Date().toISOString(),
    }
  }

  private convertSOToSignal(question: any): ExternalSignal {
    // Create a deterministic ID from question ID
    const id = Buffer.from(question.id.toString()).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        score: question.score,
        answer_count: question.answer_count,
        view_count: question.view_count,
      },
      normalized: signalFilter.normalizeEngagement(
        {
          score: question.score,
          answer_count: question.answer_count,
          view_count: question.view_count,
        },
        'stackoverflow'
      ),
    }

    // SO questions have body, but sometimes it's short after HTML stripping
    // Ensure minimum length by including title + body
    const content = question.body
      ? `${question.title}. ${question.body}`.substring(0, 500)
      : `${question.title}. Stack Overflow question with ${question.answer_count} answers and score of ${question.score}.`

    return {
      id,
      type: 'stackoverflow',
      title: question.title || '',
      content,
      author: question.author || 'Unknown',
      url: question.url,
      publishedDate: question.created_at,
      engagement,
      normalizedScore: 0,
      relevanceScore: 0,
      relatedPapers: [],
      tags: question.tags || [],
      createdAt: new Date().toISOString(),
    }
  }

  private convertRedditToSignal(post: any): ExternalSignal {
    // Create a deterministic ID from post ID
    const id = Buffer.from(post.id.toString()).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        score: post.score,
        num_comments: post.num_comments,
        upvote_ratio: post.upvote_ratio,
      },
      normalized: signalFilter.normalizeEngagement(
        {
          score: post.score,
          num_comments: post.num_comments,
        },
        'reddit'
      ),
    }

    // Reddit posts use title + text content
    const content = post.text
      ? `${post.title}. ${post.text}`.substring(0, 500)
      : `${post.title}. Reddit post from r/${post.subreddit} with ${post.num_comments} comments and ${post.score} upvotes.`

    return {
      id,
      type: 'reddit',
      title: post.title || '',
      content,
      author: post.author || 'Unknown',
      url: post.url,
      publishedDate: post.created_at,
      engagement,
      normalizedScore: 0,
      relevanceScore: 0,
      relatedPapers: [],
      tags: [`r/${post.subreddit}`],
      createdAt: new Date().toISOString(),
    }
  }

  private convertYouTubeToSignal(video: any): ExternalSignal {
    // Create a deterministic ID from video ID
    const id = Buffer.from(video.id.toString()).toString('base64').substring(0, 32)

    const engagement = {
      raw: {
        channel_title: video.channel_title,
      },
      normalized: 0.5,  // YouTube doesn't provide view count in search results, use neutral
    }

    // YouTube videos use title + description
    const content = video.description
      ? `${video.title}. ${video.description}`.substring(0, 500)
      : video.title

    return {
      id,
      type: 'youtube',
      title: video.title || '',
      content,
      author: video.channel_title || 'Unknown',
      url: video.url,
      publishedDate: video.published_at,
      engagement,
      normalizedScore: 0,
      relevanceScore: 0,
      relatedPapers: [],
      tags: [],
      createdAt: new Date().toISOString(),
    }
  }

  async scoreRelevance(signal: ExternalSignal): Promise<number> {
    // Don't score if no LLM model available
    const model = llmService.getModel()
    if (!model) {
      logger.warn('LLM not available for relevance scoring')
      return 0.5  // Default neutral score
    }

    try {
      const prompt = `
You are evaluating whether this external signal is relevant to Deep Learning/Computer Vision research.

Title: ${signal.title}
Content: ${signal.content.substring(0, 500)}
Source: ${signal.author}

Is this content:
1. Related to recent DL/CV research developments?
2. Discussing technical advances (not just news/hype)?
3. Worth showing to a PhD researcher?

Respond with JSON only (no markdown):
{
  "relevant": true or false,
  "score": 0.0-1.0,
  "reason": "brief explanation"
}
      `.trim()

      logger.debug(`Scoring relevance for signal: ${signal.title.substring(0, 50)}...`)

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // Clean up response
      let jsonText = text.trim()
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(jsonText)

      const score = parsed.relevant ? (parsed.score || 0.5) : 0
      logger.debug(`Relevance score: ${score.toFixed(2)} - ${parsed.reason}`)

      return score
    } catch (error: any) {
      logger.error(`Error scoring signal relevance: ${error.message}`)
      return 0.5  // Default neutral score on error
    }
  }

  async processSignals(signals: ExternalSignal[]): Promise<ExternalSignal[]> {
    const processed: ExternalSignal[] = []

    logger.info(`Processing ${signals.length} signals...`)

    for (const signal of signals) {
      // Score relevance with LLM
      signal.relevanceScore = await this.scoreRelevance(signal)

      // Calculate normalized score (combination of engagement + relevance)
      // Weight: 30% engagement, 70% relevance (prioritize quality over popularity)
      signal.normalizedScore =
        (signal.engagement.normalized * 0.3) +
        (signal.relevanceScore * 0.7)

      // Apply soft filters
      if (signalFilter.shouldInclude(signal)) {
        processed.push(signal)
      }
    }

    // Sort by normalized score (highest first)
    processed.sort((a, b) => b.normalizedScore - a.normalizedScore)

    logger.info(`Filtered to ${processed.length} high-quality signals`)

    return processed
  }
}

export const signalService = new SignalService()
