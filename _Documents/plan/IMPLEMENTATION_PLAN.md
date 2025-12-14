# Implementation Plan - Research Signal Distillation Dashboard

## Design Decisions
- **LLM**: Google Gemini API
- **Storage**: JSON file-based cache (no database overhead)
- **Stack**: React + Express (TypeScript)
- **Data Source**: arXiv RSS feeds (cs.LG, cs.CV)
- **Deployment**: Local only (MVP)

---

## Phase 1: Backend Data Pipeline

### Task 1.1: arXiv RSS Parser
- [ ] Install XML parser library (`fast-xml-parser` or `xml2js`)
- [ ] Implement RSS fetcher for cs.LG and cs.CV categories
- [ ] Parse RSS XML to extract:
  - arXiv ID
  - Title
  - Authors
  - Abstract
  - Published date
  - Categories
  - PDF URL
- [ ] Merge multiple RSS feeds into single list
- [ ] Filter papers from last 24 hours
- [ ] Sort by published date (descending)
- [ ] Limit to max 30 papers

**Deliverable**: `arxivService.fetchPapers()` returns clean Paper[] array

### Task 1.2: JSON Cache System
- [ ] Create `backend/data/` directory for cache
- [ ] Implement cache utilities:
  - `readCache(paperId)` - read summary from JSON
  - `writeCache(paperId, summary)` - write summary to JSON
  - `cacheExists(paperId)` - check if summary cached
- [ ] Use paper arXiv ID as cache key
- [ ] Cache format: `data/summaries/{arxivId}.json`

**Deliverable**: Simple file-based cache working

### Task 1.3: Gemini API Integration
- [ ] Install `@google/generative-ai` package
- [ ] Add `GEMINI_API_KEY` to `.env`
- [ ] Create prompt template for paper summarization:
  - Input: title, abstract, authors
  - Output: JSON with `motivation`, `contribution`, `context`, `whyRead`
- [ ] Implement `llmService.analyzePaper()`:
  - Check cache first
  - If not cached, call Gemini
  - Parse JSON response
  - Handle errors (retry once if JSON invalid)
  - Save to cache
- [ ] Add concurrency control (process 5 papers at a time)

**Deliverable**: `llmService.analyzePaper()` returns PaperSummary

### Task 1.4: Complete Backend Pipeline
- [ ] Implement `/api/papers/today` endpoint:
  - Fetch from arXiv RSS
  - Filter last 24h
  - Get summaries (from cache or generate)
  - Return `PaperWithSummary[]`
- [ ] Implement `/api/papers/:id` endpoint for single paper
- [ ] Add refresh endpoint `/api/refresh`:
  - Re-fetch RSS
  - Regenerate summaries only for new papers
- [ ] Add error handling and logging

**Deliverable**: Backend API working end-to-end

---

## Phase 2: Frontend UI

### Task 2.1: API Integration
- [ ] Update `frontend/src/services/api.ts` with real endpoints
- [ ] Create React Query hooks:
  - `useTodaysPapers()` - fetch today's papers
  - `usePaper(id)` - fetch single paper
  - `useRefreshPapers()` - trigger refresh
- [ ] Add loading/error states

**Deliverable**: Frontend can fetch data from backend

### Task 2.2: Paper Card Component
- [ ] Create `components/PaperCard.tsx`:
  - Display title
  - Show `whyRead` (2-3 lines)
  - Show tags (cs.LG → "ML", cs.CV → "CV")
  - Show published time (relative: "3h ago")
  - Click to navigate to detail
- [ ] Add hover effects and styling

**Deliverable**: Reusable PaperCard component

### Task 2.3: Dashboard Page
- [ ] Update `pages/Dashboard.tsx`:
  - Add "Refresh" button (triggers re-fetch)
  - Display grid/list of PaperCard components
  - Show "Last updated at" timestamp
  - Show loading spinner while fetching
  - Show error message if fetch fails
  - Handle empty state (no papers)
- [ ] Add header with title and description

**Deliverable**: Working dashboard showing today's papers

### Task 2.4: Paper Detail View
- [ ] Create `pages/PaperDetail.tsx`:
  - Display full title and authors
  - Show published date
  - Display sections:
    - "Why Read This?" (`whyRead`)
    - "Motivation" (`motivation`)
    - "Key Contribution" (`contribution`)
    - "Research Context" (`context`)
  - Add "View on arXiv" button (links to PDF)
  - Add "Back to Dashboard" navigation
- [ ] Update router in `App.tsx` for `/paper/:id` route
- [ ] Style for readability

**Deliverable**: Clicking card shows detailed summary

---

## Phase 3: Polish & Testing

### Task 3.1: UI/UX Improvements
- [ ] Add responsive design (mobile-friendly)
- [ ] Improve typography and spacing
- [ ] Add dark/light mode toggle (optional)
- [ ] Add filtering by category (ML/CV)
- [ ] Add search functionality (client-side filter)

### Task 3.2: Error Handling & Edge Cases
- [ ] Handle arXiv RSS unavailable
- [ ] Handle Gemini API rate limits
- [ ] Handle malformed RSS data
- [ ] Add retry logic for failed requests
- [ ] Add user-friendly error messages

### Task 3.3: Documentation & Setup
- [ ] Update README with:
  - Setup instructions
  - Environment variables needed
  - How to get Gemini API key
  - How to run locally
- [ ] Add comments to complex code
- [ ] Create `.env.example` for frontend

### Task 3.4: Testing
- [ ] Test with real arXiv RSS feeds
- [ ] Test with multiple papers
- [ ] Test cache hit/miss scenarios
- [ ] Test error scenarios
- [ ] Test UI on different screen sizes

**Deliverable**: Production-ready MVP

---

## Implementation Order

1. **Start with Backend** (Phase 1):
   - Task 1.1 → 1.2 → 1.3 → 1.4
   - Test each task independently

2. **Then Frontend** (Phase 2):
   - Task 2.1 → 2.2 → 2.3 → 2.4
   - Use backend API for real data

3. **Finally Polish** (Phase 3):
   - Tasks 3.1-3.4 in parallel

---

## Expected Timeline Milestones

- **Milestone 1**: Backend can fetch and summarize papers
- **Milestone 2**: Frontend can display paper cards
- **Milestone 3**: Full click-through flow works
- **Milestone 4**: MVP complete and usable

---

## Notes

- **arXiv RSS URLs**:
  - cs.LG: `http://export.arxiv.org/rss/cs.LG`
  - cs.CV: `http://export.arxiv.org/rss/cs.CV`

- **Gemini API**:
  - Model: `gemini-1.5-flash` (fast and cheap for summaries)
  - Docs: https://ai.google.dev/docs

- **Future Extensions** (not in MVP):
  - SNS integration (X, LinkedIn)
  - Scheduled daily refresh (cron job)
  - Email digest
  - Personalization
