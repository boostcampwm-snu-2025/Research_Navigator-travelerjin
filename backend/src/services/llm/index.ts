import { config } from '../../config/index.js'
import { logger } from '../../utils/logger.js'
import type { LLMResponse } from '../../types/index.js'

export class LLMService {
  async analyzePaper(
    title: string,
    abstract: string,
    authors: string[]
  ): Promise<LLMResponse> {
    try {
      logger.info(`Analyzing paper: ${title}`)

      // TODO: Implement LLM API call (OpenAI or Anthropic)
      // For now, return a placeholder
      const response: LLMResponse = {
        why: 'Placeholder: Why this paper exists',
        what: 'Placeholder: What this paper contributes',
        howItFits: 'Placeholder: How this fits into the research landscape',
        keyContributions: ['Placeholder contribution 1', 'Placeholder contribution 2'],
        relevanceScore: 0.5,
      }

      return response
    } catch (error) {
      logger.error('Error analyzing paper with LLM:', error)
      throw error
    }
  }

  private buildPrompt(title: string, abstract: string, authors: string[]): string {
    return `
Analyze this research paper and provide a concise summary for a PhD researcher.

Title: ${title}
Authors: ${authors.join(', ')}
Abstract: ${abstract}

Please provide:
1. WHY: Why does this paper exist? What problem or gap does it address?
2. WHAT: What are the key contributions and methods?
3. HOW IT FITS: How does this fit into the current research landscape?
4. Key contributions as a list
5. Relevance score (0-1) for Deep Learning/Computer Vision researchers

Respond in JSON format with keys: why, what, howItFits, keyContributions (array), relevanceScore (number).
    `.trim()
  }
}

export const llmService = new LLMService()
