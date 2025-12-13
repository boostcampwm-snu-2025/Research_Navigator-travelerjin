# Research Dashboard - Frontend

React + TypeScript + Vite frontend for the Research Signal Distillation Dashboard.

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router
- Axios

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Dashboard, etc.)
├── hooks/          # Custom React hooks
├── services/       # API client and external services
├── types/          # TypeScript type definitions
├── styles/         # Global styles and Tailwind config
└── utils/          # Utility functions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `/api`)
