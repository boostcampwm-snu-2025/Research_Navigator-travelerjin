# Research Dashboard - Backend

Express + TypeScript API server for the Research Signal Distillation Dashboard.

## Tech Stack

- Node.js 18+
- Express
- TypeScript
- Winston (logging)
- node-cron (scheduled jobs)
- Axios (HTTP client)

## Project Structure

```
src/
├── routes/          # API route handlers
├── services/        # Business logic
│   ├── arxiv/       # arXiv API integration
│   ├── llm/         # LLM analysis (OpenAI/Anthropic)
│   └── scheduler/   # Cron jobs for daily paper fetching
├── models/          # Database models
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── config/          # Configuration
└── types/           # TypeScript type definitions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_key_here
# OR
ANTHROPIC_API_KEY=your_key_here
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## API Endpoints

### Papers

- `GET /api/papers/today` - Get today's papers (last 24h)
  - Query params: `categories`, `searchQuery`

- `GET /api/papers/:id` - Get paper by ID

- `GET /api/papers/search` - Search papers
  - Query params: `q` (search query)

### Health Check

- `GET /health` - Server health status

## Scheduled Jobs

The scheduler runs daily at 6:00 AM (configurable) to:
1. Fetch new papers from arXiv (cs.CV, cs.LG, cs.AI)
2. Analyze papers with LLM
3. Store results in database

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `DATABASE_URL` - Database file path
- `ARXIV_BASE_URL` - arXiv API URL
- `FETCH_CRON_SCHEDULE` - Cron schedule for paper fetching

## TODO

- [ ] Implement database models (SQLite/PostgreSQL)
- [ ] Complete arXiv XML parsing
- [ ] Implement LLM API integration
- [ ] Add authentication/rate limiting
- [ ] Add tests
