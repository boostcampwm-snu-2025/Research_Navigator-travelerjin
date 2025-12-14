import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config/index.js'
import { logger } from '../../utils/logger.js'
import { cacheService } from '../../utils/cache.js'
import type { LLMResponse } from '../../types/index.js'

export class LLMService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey)
      // Prefer an env override, otherwise use a broadly available model name
      // Default to Gemini 2.5 Flash; override via GEMINI_MODEL if needed
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      this.model = this.genAI.getGenerativeModel({ model: modelName })
    } else {
      logger.warn('Gemini API key not configured')
    }
  }

  getModel() {
    return this.model
  }

  async analyzePaper(
    paperId: string,
    title: string,
    abstract: string,
    authors: string[]
  ): Promise<LLMResponse> {
    try {
      // Check cache first
      const cached = await cacheService.get(paperId)
      if (cached) {
        logger.info(`Using cached summary for: ${title}`)
        return cached
      }

      if (!this.model) {
        throw new Error('Gemini API not configured')
      }

      logger.info(`Analyzing paper with Gemini: ${title}`)

      const prompt = this.buildPrompt(title, abstract, authors)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      let summary: LLMResponse
      try {
        summary = this.parseResponse(text)
      } catch (parseError) {
        // Retry with stricter instruction
        logger.warn('Failed to parse JSON, retrying with stricter prompt')
        const retryPrompt = this.buildPrompt(title, abstract, authors, true)
        const retryResult = await this.model.generateContent(retryPrompt)
        const retryResponse = await retryResult.response
        const retryText = retryResponse.text()
        summary = this.parseResponse(retryText)
      }

      // Cache the result
      await cacheService.set(paperId, summary)

      return summary
    } catch (error) {
      logger.error('Error analyzing paper with LLM:', error)
      throw error
    }
  }

  async analyzePapersBatch(
    papers: Array<{ id: string; title: string; summary: string; authors: Array<{ name: string }> }>,
    concurrency: number = 1
  ): Promise<Map<string, LLMResponse>> {
    const results = new Map<string, LLMResponse>()
    const queue = [...papers]

    logger.info(`Analyzing ${papers.length} papers with concurrency ${concurrency}`)

    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency)
      const promises = batch.map(async (paper) => {
        try {
          const authorNames = paper.authors.map((a) => a.name)
          const summary = await this.analyzePaper(
            paper.id,
            paper.title,
            paper.summary,
            authorNames
          )
          results.set(paper.id, summary)
        } catch (error) {
          logger.error(`Failed to analyze paper ${paper.id}:`, error)
        }
      })

      await Promise.all(promises)
    }

    return results
  }

  private buildPrompt(
    title: string,
    abstract: string,
    authors: string[],
    strict: boolean = false
  ): string {
    const strictInstruction = strict
      ? '\n\nIMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.'
      : ''

    return `
You are an expert research assistant helping a PhD researcher in Deep Learning and Computer Vision quickly understand new papers.

Analyze this paper and provide a concise, high-level summary:

Title: ${title}
Authors: ${authors.join(', ')}
Abstract: ${abstract}

Provide the following analysis:

1. **hook** (1-2 sentences MAX): A compelling, punchy reason to read this paper. Make it intriguing and casual - like you're telling a colleague why they should check this out. Focus on the "wow factor" or the key insight.

2. **whyRead** (2-3 sentences): A quick decision-maker - why should a DL/CV researcher read this paper? What makes it interesting or important?

3. **motivation** (2-3 sentences): What problem or limitation does this paper address? Why does this paper exist?

4. **contribution** (2-3 sentences): What is the main contribution or novelty? Explain the core idea at a high level, without mathematical details.

5. **context** (2-3 sentences): How does this fit into the current Deep Learning/Computer Vision research landscape? What trends or areas does it relate to?

6. **keyContributions** (array of 3-5 strings): List the key technical contributions as bullet points.

7. **relevanceScore** (number 0-1): How relevant is this to current DL/CV research? (0.0 = niche/incremental, 1.0 = breakthrough/highly relevant)

Respond in JSON format with these exact keys: hook, whyRead, motivation, contribution, context, keyContributions (array of strings), relevanceScore (number).${strictInstruction}
    `.trim()
  }

  private parseResponse(text: string): LLMResponse {
    // Try to extract JSON from the response
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '')
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText)

    // Validate required fields
    if (
      !parsed.hook ||
      !parsed.whyRead ||
      !parsed.motivation ||
      !parsed.contribution ||
      !parsed.context ||
      !Array.isArray(parsed.keyContributions) ||
      typeof parsed.relevanceScore !== 'number'
    ) {
      throw new Error('Invalid LLM response format')
    }

    return {
      hook: parsed.hook,
      why: parsed.whyRead,
      what: parsed.contribution,
      howItFits: parsed.context,
      keyContributions: parsed.keyContributions,
      relevanceScore: parsed.relevanceScore,
      motivation: parsed.motivation,
    }
  }
}

export const llmService = new LLMService()
