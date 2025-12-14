# Research Navigator

**Research Navigator** helps you stay oriented in fast-moving research by turning new papers and community updates into **clear research flows**—so you can quickly see *what’s changing*, *why it matters*, and *where to explore next*.

## Demo
<video src="https://github.com/user-attachments/assets/daf18a63-e133-470b-90ca-537308bd628c" controls width="600"></video>

## What it does
- **Curates recent papers** with concise, context-aware summaries  
- **Builds a flow view** (timeline/graph) to show how ideas evolve  
- **Reduces noise** by ranking for novelty, relevance, and quality  
- **Adds ecosystem context** (talks, posts, articles) linked to research themes  
- **Generates interactive visuals** for intuitive method understanding (browser-ready)

## Features
- **Research Papers**: Daily arXiv papers with AI-generated summaries
- **External Feeds**: Curated signals from Hacker News and NewsAPI (to be added later)

## Philosophy
Not a paper dump. Not a social feed.  
A lightweight tool for **research direction and intuition**.

## Project Structure

```
research-dashboard/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Express + TypeScript API
└── README.md
```

## Tech Stack

**Frontend:** React 18 + TypeScript + Vite + TailwindCSS  
**Backend:** Express + TypeScript + arXiv API + NewsAPI + Hacker News API  
**LLM:** Gemini for paper summaries and signal scoring

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (optional, can use SQLite for MVP)

### Installation

1. Install frontend dependencies:
```bash
cd frontend
npm install
```
OpenAI or Anthropic API key
- NewsAPI key (optional, for news feeds)

### Setup

1. **Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Add your API keys
npm run dev           # Runs on :3001
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev           # Runs on :5173
```

### Environment Variables
```env
# backend/.env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
NEWSAPI_KEY=your_newsapi_key
PORT=3001
```

## DEV Mode
- Backend uses cached signals (HN + NewsAPI) from `backend/data/signals-cache.json`
- Delete cache file to refetch fresh data
- No LLM calls in DEV for faster iteration