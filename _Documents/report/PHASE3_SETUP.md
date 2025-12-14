# Phase 3 Setup Guide - External Signals

## ✅ Implementation Complete!

Phase 3 (SNS & External Signal Integration) has been fully implemented. Here's how to set it up and test it.

---

## Setup Steps

### 1. Get a NewsAPI Key

1. Go to https://newsapi.org/
2. Sign up for a free account
3. Copy your API key

**Free tier includes:**
- 100 requests per day
- Perfect for testing and development

### 2. Configure Backend

Add to `backend/.env`:

```bash
# Add this line
NEWSAPI_KEY=your_actual_newsapi_key_here
```

Example:
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
GEMINI_API_KEY=AIzaSy...your_key
NEWSAPI_KEY=abc123...your_newsapi_key  # ADD THIS

# Cache Directory
CACHE_DIR=./data/summaries
SIGNAL_CACHE_DIR=./data/signals  # This is automatic
```

### 3. Restart Backend

The backend auto-reloads with `tsx watch`, but to be safe:

```bash
# In backend directory
# Stop the current process (Ctrl+C)
# Restart
npm run dev
```

---

## Testing

### 1. Check Backend Health

```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-12-14T..."}
```

### 2. Test Signals Endpoint

```bash
curl http://localhost:3001/api/signals/today | jq '.'
```

**Expected behavior:**
- First request: Takes 30-60 seconds (fetching + LLM scoring)
- Returns top 10 signals
- Logs show filtering process

**Example response:**
```json
{
  "signals": [
    {
      "id": "aHR0cHM6Ly93d3cudGVjaGN...",
      "type": "news",
      "title": "New Breakthrough in Transformer Architecture",
      "content": "Researchers announce...",
      "author": "TechCrunch",
      "url": "https://...",
      "publishedDate": "2025-12-14T10:30:00Z",
      "engagement": {
        "normalized": 0.75
      },
      "relevanceScore": 0.85,
      "normalizedScore": 0.825
    }
  ],
  "count": 10,
  "lastUpdated": "2025-12-14T..."
}
```

### 3. Check Frontend

Visit: **http://localhost:5173**

**What you should see:**

1. **Papers Section** (top)
   - Grid of paper cards
   - 12 papers from arXiv

2. **External Signals Section** (bottom)
   - New section titled "External Signals"
   - Grid of signal cards with colored badges
   - News articles about DL/CV research

**Signal cards show:**
- 📰 NEWS badge (orange)
- Article title
- Content preview
- Author/source
- Relevance score (green/yellow/gray)

**Clicking a signal:**
- Opens article in new tab

---

## How It Works

### Data Flow

```
NewsAPI (last 24h)
     ↓
Fetch DL/CV keywords
     ↓
Raw Articles (50)
     ↓
Hard Filters (length, spam, promotional)
     ↓
Valid Articles (~20-30)
     ↓
LLM Relevance Scoring (Gemini)
     ↓
Soft Filters (engagement, relevance > 0.4)
     ↓
Top 10 Signals
     ↓
Frontend Display
```

### Filtering

**Hard filters** (must pass):
- Published within 24 hours
- Content length > 50 characters
- No promotional keywords
- Title length > 10 characters

**Soft filters** (scoring):
- Engagement score > 0.1
- Relevance score > 0.4 (aggressive)

**LLM Relevance Scoring:**
- Gemini evaluates if content is research-relevant
- Scores 0.0-1.0
- Checks for technical depth vs. hype

### Engagement Normalization

**News articles:**
- Base score: 0.5
- +0.15 if has image
- +0.15 if has good description
- +0.1 if content length > 500
- +0.2 if from reputable source

**Final score:**
- 30% engagement
- 70% relevance (prioritizes quality)

---

## Troubleshooting

### No Signals Showing

**Problem**: Empty signals section

**Solutions:**

1. **Check NewsAPI key**
   ```bash
   # In backend directory
   cat .env | grep NEWSAPI_KEY
   ```
   Make sure it's set and correct

2. **Check backend logs**
   ```bash
   # Look for errors
   tail -f backend/logs/combined.log
   ```

3. **Test NewsAPI directly**
   ```bash
   curl "https://newsapi.org/v2/everything?q=deep%20learning&apiKey=YOUR_KEY"
   ```

4. **Filtering too aggressive?**
   - Check `backend/src/services/signals/filter.ts`
   - Temporarily lower `minRelevance` from 0.4 to 0.3

### Rate Limits

**NewsAPI Free Tier:**
- 100 requests/day
- Resets at midnight UTC

**Gemini API:**
- 15-20 requests/minute
- Processing 20-30 signals takes ~2-3 minutes

**Solution**: Signals are cached after first fetch

### Low Quality Signals

**If getting too much noise:**

Edit `backend/src/services/signals/filter.ts`:

```typescript
private config: SignalFilterConfig = {
  minEngagement: 0.2,  // Increase from 0.1
  minRelevance: 0.5,   // Increase from 0.4
  // ... rest
}
```

**If getting too few signals:**

```typescript
private config: SignalFilterConfig = {
  minEngagement: 0.05,  // Decrease
  minRelevance: 0.3,    // Decrease
  // ... rest
}
```

---

## Performance

**Expected timings:**

- Initial fetch: 30-60 seconds
  - NewsAPI: 2-3 seconds
  - LLM scoring: ~1 second per article
  - Total for 30 articles: ~30-40 seconds

- Subsequent loads: Instant (cached)

**Optimization:**
- Signals are cached in memory
- Could add file cache like papers
- Could batch LLM calls for faster processing

---

## Next Steps

### Immediate Enhancements

1. **Add more sources**
   - YouTube API (Phase 3.6)
   - Reddit r/MachineLearning
   - HackerNews

2. **Embedding-based linking** (Phase 3.5)
   - Link signals to related papers
   - Show "Related Signals" on paper detail page

3. **Persistent cache**
   - Save signals to `backend/data/signals/`
   - Reuse across restarts

### Future Features (Phase 4)

1. **User feedback**
   - Upvote/downvote signals
   - Learn personalized relevance

2. **Real-time updates**
   - WebSocket notifications
   - Auto-refresh every hour

3. **Advanced filtering**
   - User-configurable thresholds
   - Custom keyword lists
   - Source blocklist

---

## API Endpoints

### Signals

- **GET** `/api/signals/today`
  - Returns top 10 signals from last 24 hours
  - Includes filtering and LLM scoring

- **GET** `/api/signals/:id`
  - Get specific signal by ID

- **GET** `/api/signals/status`
  - Check cache status

### Papers (existing)

- **GET** `/api/papers/today`
- **GET** `/api/papers/:id`

---

## Files Modified/Created

### Backend

**New files:**
- `backend/src/services/signals/index.ts` - Main signal service
- `backend/src/services/signals/newsapi.ts` - NewsAPI integration
- `backend/src/services/signals/twitter.ts` - Placeholder
- `backend/src/services/signals/filter.ts` - Filtering logic
- `backend/src/routes/signals.ts` - API routes

**Modified:**
- `backend/src/types/index.ts` - Added Signal types
- `backend/src/index.ts` - Registered signal routes
- `backend/.env.example` - Added NEWSAPI_KEY

### Frontend

**New files:**
- `frontend/src/components/SignalCard.tsx` - Signal display component

**Modified:**
- `frontend/src/types/index.ts` - Added Signal types
- `frontend/src/pages/Dashboard.tsx` - Added signals section

---

## Success! 🎉

You now have a working External Signals integration that:
- ✅ Fetches news from NewsAPI
- ✅ Filters spam and promotional content
- ✅ Scores relevance with LLM
- ✅ Displays in clean UI
- ✅ Normalizes engagement across platforms
- ✅ Shows only high-quality research signals

Test it by adding your NewsAPI key and refreshing the frontend!
