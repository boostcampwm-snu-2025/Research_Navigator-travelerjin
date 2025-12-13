# Research Signal Distillation Dashboard

A lightweight web service for PhD researchers to quickly understand daily Deep Learning/Computer Vision papers from arXiv.

## Project Structure

```
research-dashboard/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Express + TypeScript API
└── README.md
```

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- React Router (navigation)

**Backend:**
- Node.js + Express with TypeScript
- PostgreSQL/SQLite (database)
- arXiv API integration
- LLM API integration (OpenAI/Anthropic)
- node-cron (scheduled jobs)

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

2. Install backend dependencies:
```bash
cd backend
npm install
```

### Development

1. Start backend server:
```bash
cd backend
npm run dev
```

2. Start frontend dev server:
```bash
cd frontend
npm run dev
```

## Features (MVP)

- [ ] Daily paper feed from arXiv (last 24h)
- [ ] AI-generated summaries (why, what, how it fits)
- [ ] Clean dashboard UI
- [ ] Basic filtering by topic/keyword
- [ ] Paper detail view

## License

MIT
