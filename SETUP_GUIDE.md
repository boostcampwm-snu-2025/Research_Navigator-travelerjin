# Setup Guide - Research Signal Distillation Dashboard

This guide will help you set up and run the Research Signal Distillation Dashboard locally.

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Gemini API key** (from Google AI Studio)

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you'll need this for the `.env` file)

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and add your Gemini API key:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# API Keys
GEMINI_API_KEY=your_actual_gemini_api_key_here

# arXiv RSS Feeds
ARXIV_RSS_CS_LG=http://export.arxiv.org/rss/cs.LG
ARXIV_RSS_CS_CV=http://export.arxiv.org/rss/cs.CV

# Cache Directory
CACHE_DIR=./data/summaries

# Scheduler
FETCH_CRON_SCHEDULE=0 6 * * *
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Frontend Environment (Optional)

Create a `.env` file in the `frontend/` directory if you need to customize the API URL:

```bash
cd frontend
touch .env
```

Add this content (optional, defaults work fine):

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend Server

In one terminal:

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

You should see:
```
Server running on port 5000
Environment: development
```

### Start Frontend Dev Server

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

## How It Works

1. **First Load**: When you first open the dashboard, it will:
   - Fetch papers from arXiv RSS feeds (cs.LG and cs.CV)
   - Filter papers from the last 24 hours
   - Analyze each paper with Gemini AI
   - Cache the summaries locally (in `backend/data/summaries/`)

2. **Subsequent Loads**:
   - The backend uses cached summaries (no Gemini API calls)
   - Much faster response time

3. **Refresh Button**:
   - Clears the in-memory cache
   - Re-fetches papers from arXiv
   - Only generates new summaries for papers not in file cache

## API Endpoints

The backend exposes these endpoints:

- `GET /api/papers/today` - Get today's papers with AI summaries
- `GET /api/papers/:id` - Get a specific paper by ID
- `POST /api/refresh` - Manually refresh papers
- `GET /api/status` - Check cache status
- `GET /health` - Health check

## Troubleshooting

### "Gemini API not configured" Error

- Make sure you've added your API key to `backend/.env`
- Restart the backend server after adding the key

### No Papers Showing Up

- Check if arXiv RSS feeds are accessible
- Try manually visiting: http://export.arxiv.org/rss/cs.LG
- Check backend logs for errors

### Frontend Can't Connect to Backend

- Make sure backend is running on port 5000
- Check that frontend proxy is configured in `vite.config.ts`
- Try accessing `http://localhost:5000/health` directly

### Rate Limiting / API Errors

- Gemini has rate limits on free tier
- The backend processes 5 papers concurrently (configurable)
- Cached summaries help avoid repeat API calls

## File Structure

```
backend/
├── data/summaries/    # Cached AI summaries (auto-generated)
├── logs/              # Log files (auto-generated)
├── src/
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic
│   └── utils/         # Utilities
└── .env               # Your configuration (git-ignored)

frontend/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Page components
│   └── services/      # API client
└── .env               # Optional frontend config
```

## Next Steps

Once everything is running:

1. Open the dashboard at http://localhost:3000
2. Wait for papers to load (first time takes ~30-60 seconds)
3. Click on any paper card to see the detailed analysis
4. Use the "Refresh" button to get the latest papers

## Development Tips

- Backend auto-reloads on file changes (tsx watch)
- Frontend auto-reloads on file changes (Vite HMR)
- Check `backend/logs/` for detailed logs
- Summaries are cached in `backend/data/summaries/` as JSON files

## Cost Considerations

- **Gemini 1.5 Flash** is free tier eligible
- Each paper summary costs ~$0.001-0.002 (very cheap)
- Caching prevents repeated API calls
- ~30 papers/day = ~$0.03-0.06 per day

Enjoy your Research Signal Dashboard!
